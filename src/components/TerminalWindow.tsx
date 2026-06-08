import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TerminalWindowProps {
  title?: string;
  children: ReactNode;
  className?: string;
  showControls?: boolean;
}

export const TerminalWindow = ({
  title = 'terminal',
  children,
  className = '',
  showControls = true,
}: TerminalWindowProps) => {
  return (
    <div className={cn('terminal-window scanlines', className)}>
      {showControls && (
        <div className="terminal-header">
          <div className="flex gap-2">
            <div className="terminal-dot bg-destructive" />
            <div className="terminal-dot bg-yellow-500" />
            <div className="terminal-dot bg-primary" />
          </div>
          <span className="text-xs text-muted-foreground ml-4 font-mono">
            {title}
          </span>
        </div>
      )}
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
};
