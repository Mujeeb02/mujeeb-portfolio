import { useRef, useEffect } from 'react';
import { TerminalWindow } from '@/components/TerminalWindow';
import { TerminalInput } from '@/components/dashboard/TerminalInput';
import { CommandOutput } from '@/components/dashboard/CommandOutput';
import { useTerminalCommands } from '@/hooks/useTerminalCommands';
import { Terminal } from 'lucide-react';

interface TerminalPanelProps {
  onLogout: () => void;
}

export const TerminalPanel = ({ onLogout }: TerminalPanelProps) => {
  const outputRef = useRef<HTMLDivElement>(null);
  const { output, history, executeCommand, suggestions, blogPosts } = useTerminalCommands(onLogout);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <span className="text-secondary">{'>'}</span> Terminal
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Execute commands and manage your portfolio ({blogPosts.length} posts available)
        </p>
      </div>

      {/* Terminal */}
      <TerminalWindow
        title="admin@portfolio:~"
        className="border-primary/30"
      >
        <div className="flex flex-col h-[500px]">
          {/* Output Area */}
          <div
            ref={outputRef}
            className="flex-1 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent"
          >
            <CommandOutput lines={output} />
          </div>

          {/* Input */}
          <div className="border-t border-border/30 pt-3">
            <TerminalInput
              onCommand={executeCommand}
              suggestions={suggestions}
              history={history}
            />
          </div>
        </div>
      </TerminalWindow>

      {/* Quick Commands */}
      <div className="flex flex-wrap gap-2">
        {['help', 'stats', 'blog list', 'project list', 'neofetch'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => executeCommand(cmd)}
            className="px-3 py-1.5 rounded-md text-xs font-mono bg-card/50 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
          >
            $ {cmd}
          </button>
        ))}
      </div>
    </div>
  );
};
