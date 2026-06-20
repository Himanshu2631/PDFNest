import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="w-full border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 select-none">
          <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
            <Layers className="size-4" strokeWidth={2.5} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base tracking-tight">PDFNest</span>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">v1.0.0</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/30 border border-border/50 px-2.5 py-1 rounded-full">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>Secure & Private</span>
          </div>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex size-7 items-center justify-center rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
