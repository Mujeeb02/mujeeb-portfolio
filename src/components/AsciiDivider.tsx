import { cn } from '@/lib/utils';

interface AsciiDividerProps {
  className?: string;
  variant?: 'line' | 'double' | 'wave' | 'dots';
}

const dividers = {
  line: '═══════════════════════════════════════════════════════════════',
  double: '╔════════════════════════════════════════════════════════════╗',
  wave: '~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~',
  dots: '• • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •',
};

export const AsciiDivider = ({ className = '', variant = 'line' }: AsciiDividerProps) => {
  return (
    <div
      className={cn(
        'text-center text-muted-foreground text-xs overflow-hidden whitespace-nowrap select-none',
        className
      )}
    >
      {dividers[variant]}
    </div>
  );
};
