import { useState, useCallback } from 'react';
import { renderPdfThumbnail } from '@/lib/pdf-render';
import { getPdfPageCount } from '@/lib/pdf-utils';
import { toast } from 'sonner';

export interface QueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number | null;
  thumbnail: string | null;
  status: 'loading' | 'ready' | 'error';
  errorMessage?: string;
}

export function usePdfQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const addFiles = useCallback(async (newFiles: File[]) => {
    const validPdfFiles = newFiles.filter((file) => {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        toast.error(`"${file.name}" is not a PDF file and was skipped.`);
        return false;
      }
      return true;
    });

    if (validPdfFiles.length === 0) return;

    // Create initial items with 'loading' status
    const itemsToAdd = validPdfFiles.map((file) => {
      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        id,
        file,
        name: file.name,
        size: file.size,
        pageCount: null,
        thumbnail: null,
        status: 'loading' as const,
      };
    });

    setQueue((prev) => [...prev, ...itemsToAdd]);

    // Process each file's page count and thumbnail asynchronously
    itemsToAdd.forEach(async (item) => {
      try {
        const pageCount = await getPdfPageCount(item.file);
        
        let thumbnail: string | null = null;
        try {
          thumbnail = await renderPdfThumbnail(item.file);
        } catch (thumbError) {
          console.error(`Failed to generate thumbnail for ${item.name}:`, thumbError);
          // Don't fail the whole item if just the thumbnail rendering fails (e.g. encrypted or complex pdf.js parse error)
        }

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  pageCount,
                  thumbnail,
                  status: 'ready',
                }
              : q
          )
        );
      } catch (error: any) {
        console.error(`Error loading PDF metadata for ${item.name}:`, error);
        toast.error(`Failed to read "${item.name}". It might be password-protected or corrupt.`);
        
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: 'error',
                  errorMessage: error?.message || 'Failed to read PDF file',
                }
              : q
          )
        );
      }
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const reorderQueue = useCallback((startIndex: number, endIndex: number) => {
    setQueue((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queue,
    addFiles,
    removeFile,
    reorderQueue,
    clearQueue,
    setQueue,
  };
}
