'use client';

import { cn } from '@/lib/utils';

interface EditorPreviewProps {
  html: string;
  className?: string;
}

export default function EditorPreview({ html, className }: EditorPreviewProps) {
  return (
    <div
      className={cn(
        'editor-preview prose prose-invert max-w-none',
        'prose-headings:text-foreground prose-headings:font-bold',
        'prose-h1:text-3xl prose-h1:border-b prose-h1:border-border/30 prose-h1:pb-3 prose-h1:mb-6',
        'prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4',
        'prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3',
        'prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-4',
        'prose-a:text-neon-cyan prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-primary prose-strong:font-bold',
        'prose-code:text-neon-cyan prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
        'prose-pre:bg-terminal-black prose-pre:border prose-pre:border-border/30 prose-pre:rounded-lg',
        'prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1',
        'prose-img:rounded-lg prose-img:shadow-lg prose-img:border prose-img:border-border/20',
        'prose-hr:border-border/30',
        'prose-li:text-foreground/90',
        'prose-table:border-collapse',
        'prose-th:bg-muted/30 prose-th:border prose-th:border-border/30 prose-th:px-4 prose-th:py-2',
        'prose-td:border prose-td:border-border/30 prose-td:px-4 prose-td:py-2',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html || '<p class="text-muted-foreground italic">Nothing to preview yet. Start writing!</p>' }}
    />
  );
}
