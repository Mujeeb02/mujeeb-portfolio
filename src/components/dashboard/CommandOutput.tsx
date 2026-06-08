import { motion } from 'framer-motion';

export interface OutputLine {
  type: 'command' | 'output' | 'error' | 'success' | 'info' | 'warning' | 'table' | 'ascii';
  content: string;
  timestamp?: Date;
}

interface CommandOutputProps {
  lines: OutputLine[];
}

export const CommandOutput = ({ lines }: CommandOutputProps) => {
  const getLineStyle = (type: OutputLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-foreground';
      case 'error':
        return 'text-destructive';
      case 'success':
        return 'text-primary';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-cyan-400';
      case 'table':
        return 'text-muted-foreground font-mono text-xs';
      case 'ascii':
        return 'text-primary font-mono text-xs whitespace-pre';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-1 font-mono text-sm">
      {lines.map((line, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.1, delay: index * 0.02 }}
          className={getLineStyle(line.type)}
        >
          {line.type === 'command' && (
            <span className="text-muted-foreground mr-2">
              [{line.timestamp?.toLocaleTimeString() || '00:00:00'}]
            </span>
          )}
          {line.type === 'ascii' ? (
            <pre className="text-primary text-xs">{line.content}</pre>
          ) : (
            <span className="whitespace-pre-wrap">{line.content}</span>
          )}
        </motion.div>
      ))}
    </div>
  );
};
