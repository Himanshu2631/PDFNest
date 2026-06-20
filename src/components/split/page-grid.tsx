import React from 'react';
import { RenderedPage } from '@/lib/pdf-render';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PageGridProps {
  pages: RenderedPage[];
  selectedPages: number[];
  onTogglePage: (pageNumber: number) => void;
}

export function PageGrid({ pages, selectedPages, onTogglePage }: PageGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto max-h-[500px] p-1.5 select-none">
      {pages.map((page) => {
        const isSelected = selectedPages.includes(page.pageNumber);
        
        return (
          <div
            key={page.pageNumber}
            onClick={() => onTogglePage(page.pageNumber)}
            className={cn(
              'group relative flex flex-col items-center border border-border bg-background hover:bg-muted/10 p-2.5 rounded-lg cursor-pointer transition-all duration-150 select-none shadow-sm',
              isSelected && 'border-foreground ring-2 ring-ring/20 bg-muted/20'
            )}
          >
            {/* Page Canvas Preview */}
            <div className="relative w-full aspect-[1/1.414] rounded border border-border/60 bg-muted overflow-hidden flex items-center justify-center">
              <img
                src={page.dataUrl}
                alt={`Page ${page.pageNumber}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
              
              {/* Checkbox indicator */}
              <div
                className={cn(
                  'absolute top-2 right-2 flex size-5 items-center justify-center rounded border border-border bg-background text-transparent transition-all shadow-sm',
                  isSelected && 'bg-foreground border-foreground text-background'
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </div>
            </div>

            {/* Page number label */}
            <div className="mt-2 text-xs font-semibold font-mono text-muted-foreground group-hover:text-foreground transition-colors">
              Page {page.pageNumber}
            </div>
          </div>
        );
      })}
    </div>
  );
}
