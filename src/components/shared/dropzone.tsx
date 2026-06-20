import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropzoneProps {
  onFilesDropped: (files: File[]) => void;
  className?: string;
  children?: React.ReactNode;
  title?: string;
  description?: string;
}

export function Dropzone({
  onFilesDropped,
  className,
  children,
  title = 'Upload PDF documents',
  description = 'Drag & drop your files here, or click to browse',
}: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesDropped(filesArray);
    }
  }, [onFilesDropped]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesDropped(filesArray);
      // Reset input value so same files can be selected again
      e.target.value = '';
    }
  }, [onFilesDropped]);

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={cn(
        'relative w-full rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center transition-all duration-200 outline-none',
        isDragActive && 'border-foreground bg-muted/50 ring-2 ring-ring/25 scale-[0.995]',
        !children && 'py-16 cursor-pointer hover:bg-muted/30 hover:border-border-hover',
        className
      )}
      onClick={!children ? onButtonClick : undefined}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {children ? (
        <>
          {children}
          {isDragActive && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl bg-background/90 border-2 border-dashed border-foreground p-6 backdrop-blur-sm pointer-events-none">
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-foreground text-background">
                  <UploadCloud className="size-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Drop to upload files</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Release mouse to add your PDFs to queue</p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground shadow-sm">
            <FileUp className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {description}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-4 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              onButtonClick();
            }}
          >
            Select Files
          </button>
        </div>
      )}
    </div>
  );
}
