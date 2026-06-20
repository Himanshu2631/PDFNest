import React from 'react';
import { Mail, Github, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background py-6 px-4 md:px-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Developer Info */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">Himanshu Sengar</div>
          <div className="hidden sm:block text-border">|</div>
          <a
            href="mailto:himanshusengar235@gmail.com"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Mail className="size-3.5" />
            himanshusengar235@gmail.com
          </a>
          <div className="hidden sm:block text-border">|</div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <a
              href="https://github.com/Himanshu2631/PDFNest"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Github className="size-3.5" />
              GitHub
            </a>
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Globe className="size-3.5" />
              Portfolio
            </a>
          </div>
        </div>

        {/* Right Side: Mandatory Button */}
        <div className="flex items-center">
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-muted hover:border-foreground/30 active:scale-[0.98] shadow-sm select-none"
          >
            Built for Digital Heroes
          </a>
        </div>
        
      </div>
    </footer>
  );
}
