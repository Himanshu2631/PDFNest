import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Download, Trash2, ListChecks } from 'lucide-react';

interface SplitControlsProps {
  maxPages: number;
  selectedPages: number[];
  onSelectionChange: (pages: number[]) => void;
  onExecuteSplit: () => void;
  isProcessing: boolean;
}

// Parses string like "1-3, 5" to [1, 2, 3, 5]
export function parseRangeString(rangeStr: string, maxPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);

      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.min(start, end);
        const max = Math.min(Math.max(start, end), maxPages);
        for (let i = min; i <= max; i++) {
          if (i >= 1 && i <= maxPages) pages.add(i);
        }
      }
    } else {
      const page = parseInt(trimmed, 10);
      if (!isNaN(page) && page >= 1 && page <= maxPages) {
        pages.add(page);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

// Formats array like [1, 2, 3, 5] to "1-3, 5"
export function formatRangeString(pages: number[]): string {
  if (pages.length === 0) return '';
  const sorted = [...pages].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      if (start === end) {
        ranges.push(`${start}`);
      } else {
        ranges.push(`${start}-${end}`);
      }
      start = sorted[i];
      end = sorted[i];
    }
  }

  if (start === end) {
    ranges.push(`${start}`);
  } else {
    ranges.push(`${start}-${end}`);
  }

  return ranges.join(', ');
}

export function SplitControls({
  maxPages,
  selectedPages,
  onSelectionChange,
  onExecuteSplit,
  isProcessing,
}: SplitControlsProps) {
  const [inputValue, setInputValue] = useState('');

  // Sync range input with grid selection
  useEffect(() => {
    const formatted = formatRangeString(selectedPages);
    setInputValue(formatted);
  }, [selectedPages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Only parse if it ends with a digit or space to prevent jumping selection while typing "-"
    if (/[0-9]$/.test(val.trim())) {
      const parsed = parseRangeString(val, maxPages);
      onSelectionChange(parsed);
    } else if (val.trim() === '') {
      onSelectionChange([]);
    }
  };

  const handleSelectAll = () => {
    const all = Array.from({ length: maxPages }, (_, i) => i + 1);
    onSelectionChange(all);
  };

  const handleClearSelection = () => {
    onSelectionChange([]);
  };

  return (
    <div className="border border-border bg-background/50 rounded-xl p-5 space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-3.5">
        <Settings className="size-4 text-muted-foreground" />
        <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
          Extraction Settings
        </h3>
      </div>

      {/* Grid Selection Actions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Page Selection</span>
          <span className="font-mono bg-muted px-2 py-0.5 rounded text-[11px] font-semibold border border-border">
            {selectedPages.length} of {maxPages} selected
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="w-full text-xs font-semibold"
          >
            <ListChecks className="size-3.5 mr-1" />
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSelection}
            disabled={selectedPages.length === 0}
            className="w-full text-xs font-semibold text-muted-foreground"
          >
            <Trash2 className="size-3.5 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Range Input Field */}
      <div className="space-y-2">
        <Label htmlFor="range-input" className="text-xs font-semibold text-muted-foreground">
          Custom Page Ranges
        </Label>
        <Input
          id="range-input"
          placeholder="e.g. 1-3, 5-8"
          value={inputValue}
          onChange={handleInputChange}
          className="font-mono text-xs"
        />
        <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-sans mt-1">
          Type page numbers and ranges separated by commas (e.g. <span className="font-mono">1, 3-5, 8</span>). Selection updates on-the-fly.
        </p>
      </div>

      {/* Action Button */}
      <Button
        onClick={onExecuteSplit}
        disabled={selectedPages.length === 0 || isProcessing}
        className="w-full font-semibold text-xs"
        size="lg"
      >
        <Download className="size-4 mr-2" />
        {isProcessing ? 'Generating PDF...' : 'Extract Selected Pages'}
      </Button>
    </div>
  );
}
