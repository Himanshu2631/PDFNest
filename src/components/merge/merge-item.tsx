import React from 'react';
import { GripVertical, Trash2, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { QueueItem } from '@/hooks/use-pdf-queue';
import { cn } from '@/lib/utils';

interface MergeItemProps {
  item: QueueItem;
  index: number;
  removeFile: (id: string) => void;
  dragHandleProps?: any;
}

export function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function MergeItem({ item, removeFile, dragHandleProps }: MergeItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center justify-between border border-border bg-background/50 hover:bg-muted/10 p-3 rounded-lg transition-all',
        item.status === 'error' && 'border-destructive/20 bg-destructive/5'
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="flex cursor-grab items-center justify-center p-1 rounded hover:bg-muted text-muted-foreground transition-colors active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </div>

        {/* Thumbnail Preview / Placeholder */}
        <div className="relative flex size-12 shrink-0 items-center justify-center rounded border border-border bg-muted overflow-hidden select-none">
          {item.status === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-1">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {item.status === 'error' && (
            <AlertTriangle className="size-4 text-destructive" />
          )}

          {item.status === 'ready' && (
            item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={`Preview of ${item.name}`}
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              <FileText className="size-5 text-muted-foreground" />
            )
          )}
        </div>

        {/* Metadata Details */}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-foreground truncate select-none" title={item.name}>
            {item.name}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-mono">
            <span>{formatBytes(item.size)}</span>
            <span>•</span>
            {item.status === 'loading' && <span>Loading pages...</span>}
            {item.status === 'error' && <span className="text-destructive font-semibold">Error reading file</span>}
            {item.status === 'ready' && (
              <span>
                {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Control */}
      <button
        type="button"
        onClick={() => removeFile(item.id)}
        className="flex size-7 items-center justify-center rounded-md border border-transparent text-muted-foreground hover:text-destructive hover:border-destructive/10 hover:bg-destructive/5 transition-all outline-none focus-visible:border-destructive/20 focus-visible:ring-2 focus-visible:ring-destructive/10"
        aria-label={`Remove ${item.name} from merge list`}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
