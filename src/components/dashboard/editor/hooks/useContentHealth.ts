import { useMemo } from 'react';
import type { Editor } from '@tiptap/react';

export interface HeadingNode {
  level: number;
  text: string;
  pos: number;
}

export interface ContentHealth {
  wordCount: number;
  characterCount: number;
  readingTime: string;
  headings: HeadingNode[];
  imageCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  codeBlockCount: number;
  paragraphCount: number;
}

export function useContentHealth(editor: Editor | null): ContentHealth {
  return useMemo(() => {
    if (!editor) {
      return {
        wordCount: 0,
        characterCount: 0,
        readingTime: '0 min',
        headings: [],
        imageCount: 0,
        internalLinkCount: 0,
        externalLinkCount: 0,
        codeBlockCount: 0,
        paragraphCount: 0,
      };
    }

    const text = editor.getText();
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const characterCount = text.length;
    const minutes = Math.ceil(wordCount / 200);
    const readingTime = `${Math.max(1, minutes)} min`;

    // Extract headings
    const headings: HeadingNode[] = [];
    let imageCount = 0;
    let internalLinkCount = 0;
    let externalLinkCount = 0;
    let codeBlockCount = 0;
    let paragraphCount = 0;

    const json = editor.getJSON();

    const traverse = (node: Record<string, unknown>) => {
      if (node.type === 'heading') {
        const attrs = node.attrs as { level?: number } | undefined;
        const content = node.content as Array<{ text?: string }> | undefined;
        const headingText = content?.map((c) => c.text || '').join('') || '';
        headings.push({
          level: attrs?.level || 1,
          text: headingText,
          pos: headings.length,
        });
      }
      if (node.type === 'image') imageCount++;
      if (node.type === 'codeBlock') codeBlockCount++;
      if (node.type === 'paragraph') paragraphCount++;
      if (node.type === 'text') {
        const marks = node.marks as Array<{ type: string; attrs?: { href?: string } }> | undefined;
        marks?.forEach((mark) => {
          if (mark.type === 'link' && mark.attrs?.href) {
            if (mark.attrs.href.startsWith('/') || mark.attrs.href.includes(window.location.hostname)) {
              internalLinkCount++;
            } else {
              externalLinkCount++;
            }
          }
        });
      }
      if (node.content && Array.isArray(node.content)) {
        (node.content as Record<string, unknown>[]).forEach(traverse);
      }
    };

    traverse(json as Record<string, unknown>);

    return {
      wordCount,
      characterCount,
      readingTime,
      headings,
      imageCount,
      internalLinkCount,
      externalLinkCount,
      codeBlockCount,
      paragraphCount,
    };
  }, [editor, editor?.state.doc.content.size]); // eslint-disable-line react-hooks/exhaustive-deps
}
