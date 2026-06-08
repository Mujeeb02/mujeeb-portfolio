import { cn } from '@/lib/utils';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export const GlitchText = ({ text, className = '', as: Component = 'span' }: GlitchTextProps) => {
  return (
    <Component
      className={cn('glitch relative inline-block', className)}
      data-text={text}
    >
      {text}
    </Component>
  );
};
