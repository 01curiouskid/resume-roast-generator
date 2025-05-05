
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  className?: string;
  children: ReactNode;
}

export function AppLayout({ className, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-roast-dark to-slate-900 flex flex-col">
      <header className="container py-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Roast<span className="text-roast-purple">My</span>Resume
          </h2>
        </div>
      </header>

      <main className={cn("flex-1 container flex flex-col items-center justify-center py-8", className)}>
        {children}
      </main>

      <footer className="container py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} RoastMyResume - For entertainment purposes only.</p>
      </footer>
    </div>
  );
}
