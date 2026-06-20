"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Dropzone } from '@/components/shared/dropzone';
import { MergeList } from '@/components/merge/merge-list';
import { PageGrid } from '@/components/split/page-grid';
import { SplitControls } from '@/components/split/split-controls';
import { usePdfQueue } from '@/hooks/use-pdf-queue';
import { mergePdfFiles, splitPdfFile } from '@/lib/pdf-utils';
import { renderAllPdfPages, RenderedPage } from '@/lib/pdf-render';
import { formatBytes } from '@/components/merge/merge-item';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Files,
  Scissors,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  Loader2,
  FileCheck,
  ClipboardPaste,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WorkspacePage() {
  const [mode, setMode] = useState<'merge' | 'split'>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState('');

  // --- Merge Mode State (via hook) ---
  const { queue, addFiles, removeFile, reorderQueue, clearQueue } = usePdfQueue();

  // --- Split Mode State ---
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isRenderingPages, setIsRenderingPages] = useState(false);
  const [renderingProgress, setRenderingProgress] = useState(0);

  // --- Global Drag Overlay state ---
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const dragCounter = useRef(0);

  // Calculate totals for merge list
  const totalMergePages = queue.reduce((acc, item) => acc + (item.pageCount || 0), 0);
  const totalMergeSize = queue.reduce((acc, item) => acc + item.size, 0);

  // --- Split Mode Handlers ---
  const onSplitFileDrop = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast.error('Please upload a valid PDF document.');
      return;
    }

    setSplitFile(file);
    setIsRenderingPages(true);
    setRenderingProgress(0);
    setSelectedPages([]);
    setRenderedPages([]);

    try {
      const allPages = await renderAllPdfPages(file, 0.45, (progress) => {
        setRenderingProgress(Math.round(progress * 100));
      });
      setRenderedPages(allPages);
      // Select all pages by default
      setSelectedPages(allPages.map((p) => p.pageNumber));
      toast.success(`Loaded "${file.name}" with ${allPages.length} pages.`);
    } catch (error) {
      console.error('Error parsing PDF pages:', error);
      toast.error('Failed to read PDF. It might be password-protected or corrupt.');
      setSplitFile(null);
    } finally {
      setIsRenderingPages(false);
    }
  }, []);

  const handleToggleSplitPage = useCallback((pageNumber: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNumber)
        ? prev.filter((p) => p !== pageNumber)
        : [...prev, pageNumber].sort((a, b) => a - b)
    );
  }, []);

  const handleSelectionChange = useCallback((newSelection: number[]) => {
    setSelectedPages(newSelection);
  }, []);

  const resetSplitFile = useCallback(() => {
    setSplitFile(null);
    setRenderedPages([]);
    setSelectedPages([]);
  }, []);

  // --- PDF Processing Executions ---
  const handleExecuteMerge = useCallback(async () => {
    if (queue.length === 0) return;

    const loadingItems = queue.filter((item) => item.status === 'loading');
    if (loadingItems.length > 0) {
      toast.error('Wait until all file loading and rendering completes.');
      return;
    }

    const errorItems = queue.filter((item) => item.status === 'error');
    if (errorItems.length > 0) {
      toast.error('Remove any error-state files before merging.');
      return;
    }

    setIsProcessing(true);
    setProcessingLabel('Merging PDF documents...');
    const mergeToast = toast.loading('Merging documents...');

    try {
      const order = queue.map((_, index) => index);
      const data = await mergePdfFiles(queue.map((item) => item.file), order);

      // Trigger download
      const blob = new Blob([data as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Successfully merged PDFs!', { id: mergeToast });
    } catch (error: any) {
      console.error('Error merging files:', error);
      toast.error(error?.message || 'Failed to merge PDF files.', { id: mergeToast });
    } finally {
      setIsProcessing(false);
    }
  }, [queue]);

  const handleExecuteSplit = useCallback(async () => {
    if (!splitFile || selectedPages.length === 0) return;

    setIsProcessing(true);
    setProcessingLabel('Extracting selected pages...');
    const splitToast = toast.loading('Extracting pages...');

    try {
      const data = await splitPdfFile(splitFile, selectedPages);
      const baseName = splitFile.name.replace(/\.[^/.]+$/, '');
      const downloadName = `${baseName}-extracted.pdf`;

      // Trigger download
      const blob = new Blob([data as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Successfully extracted pages!', { id: splitToast });
    } catch (error: any) {
      console.error('Error splitting file:', error);
      toast.error(error?.message || 'Failed to extract PDF pages.', { id: splitToast });
    } finally {
      setIsProcessing(false);
    }
  }, [splitFile, selectedPages]);

  // --- Handcrafted UX features: Clipboard paste ---
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files = Array.from(e.clipboardData.files);
      const pdfs = files.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));

      if (pdfs.length > 0) {
        if (mode === 'merge') {
          addFiles(pdfs);
          toast.success(`Pasted ${pdfs.length} files from clipboard.`);
        } else {
          onSplitFileDrop([pdfs[0]]);
          toast.success(`Pasted "${pdfs[0].name}" from clipboard.`);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [mode, addFiles, onSplitFileDrop]);

  // --- Handcrafted UX features: Global Drag Overlays ---
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if dragging files
    if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
      dragCounter.current++;
      setIsGlobalDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsGlobalDragging(false);
      }
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsGlobalDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      if (mode === 'merge') {
        addFiles(files);
      } else {
        onSplitFileDrop([files[0]]);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [mode, addFiles, onSplitFileDrop]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto py-10 px-4 md:px-8">

        {/* Navigation & Product Introduction */}
        <div className="space-y-2 mb-8 border-b border-border pb-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground select-none">PDFNest Workspace</h1>
            <span className="text-xs text-muted-foreground font-mono">Environment: Client-Side Sandbox</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            Merge, split, and organize PDF files directly in your browser. No server uploads, complete privacy, and instant processing.
          </p>

          {/* Paste Helper Banner */}
          <div className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground/80 font-mono bg-muted/30 px-2 py-0.5 rounded border border-border/40 select-none">
            <ClipboardPaste className="size-3 text-muted-foreground" />
            <span>Tip: You can paste files directly from clipboard (Ctrl+V)</span>
          </div>
        </div>

        {/* Tool Selection (Segmented Tabs Switcher) */}
        <div className="flex justify-start mb-8">
          <div className="inline-flex rounded-lg bg-muted p-1 border border-border">
            <button
              onClick={() => { if (!isProcessing) setMode('merge'); }}
              disabled={isProcessing}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer select-none',
                mode === 'merge'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Files className="size-3.5" />
              Merge PDFs
            </button>
            <button
              onClick={() => { if (!isProcessing) setMode('split'); }}
              disabled={isProcessing}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer select-none',
                mode === 'split'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Scissors className="size-3.5" />
              Split PDFs
            </button>
          </div>
        </div>

        {/* Dynamic Tool Content Workspace */}
        {mode === 'merge' ? (
          /* ========================================== */
          /* MERGE PDF FUNCTIONAL WORKSPACE            */
          /* ========================================== */
          queue.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              <Dropzone
                onFilesDropped={addFiles}
                title="Assemble PDF documents"
                description="Drag & drop multiple PDFs here, or click to choose files"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

              {/* Left Canvas: Workspace Queue */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h2 className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    Queue list
                  </h2>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Drag handles to change compilation order
                  </span>
                </div>

                <Dropzone onFilesDropped={addFiles} className="border-none bg-transparent p-0">
                  <div className="space-y-3">
                    <MergeList
                      queue={queue}
                      removeFile={removeFile}
                      reorderQueue={reorderQueue}
                    />

                    {/* Dotted border trigger box */}
                    <div className="flex items-center justify-center p-5 border border-dashed border-border/80 rounded-lg bg-muted/10 text-xs text-muted-foreground/80 hover:bg-muted/20 transition-all cursor-pointer select-none">
                      Drag more documents onto workspace to append
                    </div>
                  </div>
                </Dropzone>
              </div>

              {/* Right Canvas: Action Panel */}
              <div className="border border-border bg-background/50 rounded-xl p-5 space-y-5">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <FileCheck className="size-4 text-muted-foreground" />
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Action Dashboard
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Files Queued</span>
                    <span className="font-mono font-semibold">{queue.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Combined Size</span>
                    <span className="font-mono font-semibold">{formatBytes(totalMergeSize)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Total Pages</span>
                    <span className="font-mono font-semibold">{totalMergePages}</span>
                  </div>
                </div>

                <hr className="border-border" />

                <div className="flex flex-col gap-2.5">
                  <Button
                    onClick={handleExecuteMerge}
                    disabled={isProcessing || queue.some(q => q.status === 'loading')}
                    className="w-full font-semibold text-xs"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Merging...
                      </>
                    ) : (
                      <>
                        <Download className="size-4 mr-2" />
                        Assemble & Download
                      </>
                    )}
                  </Button>

                  <div className="flex gap-2">
                    <Dropzone onFilesDropped={addFiles} className="border-none bg-transparent p-0 flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                        <Plus className="size-3.5 mr-1" />
                        Add Files
                      </Button>
                    </Dropzone>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearQueue}
                      className="flex-1 text-xs font-semibold text-muted-foreground"
                    >
                      <Trash2 className="size-3.5 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          /* ========================================== */
          /* SPLIT PDF FUNCTIONAL WORKSPACE            */
          /* ========================================== */
          !splitFile ? (
            <div className="max-w-2xl mx-auto">
              <Dropzone
                onFilesDropped={onSplitFileDrop}
                title="Extract pages from PDF"
                description="Drag & drop a single document here to start range slicing"
              />
            </div>
          ) : isRenderingPages ? (
            /* Analysis Progress Simulator */
            <div className="max-w-md mx-auto border border-border rounded-xl bg-background p-8 text-center space-y-5">
              <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-foreground mx-auto">
                <Loader2 className="size-6 animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold tracking-tight">Reading Page Layouts</h3>
                <p className="text-xs text-muted-foreground">
                  Simulating rendering pages: {renderingProgress}%...
                </p>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-foreground h-full transition-all duration-300"
                  style={{ width: `${renderingProgress}%` }}
                />
              </div>
            </div>
          ) : (
            /* Split Page Grid and Settings */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

              {/* Left Canvas: Custom Vector Page Grid */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase shrink-0">
                      Page Extractor
                    </h2>
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border truncate max-w-[200px]" title={splitFile.name}>
                      {splitFile.name}
                    </span>
                  </div>
                  <button
                    onClick={resetSplitFile}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer select-none"
                  >
                    <RefreshCw className="size-3" />
                    Reset Workspace
                  </button>
                </div>

                <PageGrid
                  pages={renderedPages}
                  selectedPages={selectedPages}
                  onTogglePage={handleToggleSplitPage}
                />
              </div>

              {/* Right Canvas: Split Config panel */}
              <div className="space-y-4">
                <SplitControls
                  maxPages={renderedPages.length}
                  selectedPages={selectedPages}
                  onSelectionChange={handleSelectionChange}
                  onExecuteSplit={handleExecuteSplit}
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          )
        )}
      </main>

      {/* Global Drag Overlay */}
      {isGlobalDragging && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 border-4 border-dashed border-foreground/50 p-6 backdrop-blur-sm pointer-events-none select-none">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-lg bg-foreground text-background">
              <Download className="size-7 animate-bounce" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-foreground">Drop anywhere to import</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Release mouse to parse PDF file structure</p>
            </div>
          </div>
        </div>
      )}

      {/* Local Loader Dialog when processing */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 border border-border bg-background p-6 rounded-lg shadow-xl max-w-xs text-center">
            <Loader2 className="size-6 animate-spin text-foreground" />
            <div>
              <p className="font-semibold text-sm">{processingLabel}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Please wait, saving results locally...</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
