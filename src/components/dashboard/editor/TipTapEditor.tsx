'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, forwardRef, useImperativeHandle } from 'react';

const lowlight = createLowlight(common);

export interface TipTapEditorRef {
  getEditor: () => ReturnType<typeof useEditor>;
}

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: NonNullable<ReturnType<typeof useEditor>>) => void;
  typewriterMode?: boolean;
  className?: string;
}

const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(
  ({ content, onChange, onEditorReady, typewriterMode = false, className = '' }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          codeBlock: false, // replaced by CodeBlockLowlight
          heading: { levels: [1, 2, 3, 4, 5, 6] },
        }),
        Placeholder.configure({
          placeholder: "Start writing or type '/' for commands...",
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-neon-cyan underline decoration-neon-cyan/50 hover:decoration-neon-cyan transition-colors',
          },
        }),
        Image.configure({
          HTMLAttributes: {
            class: 'rounded-lg max-w-full mx-auto my-4',
          },
          allowBase64: true,
        }),
        TaskList.configure({
          HTMLAttributes: {
            class: 'task-list',
          },
        }),
        TaskItem.configure({
          nested: true,
        }),
        Table.configure({
          resizable: true,
          HTMLAttributes: {
            class: 'editor-table',
          },
        }),
        TableRow,
        TableCell,
        TableHeader,
        Highlight.configure({
          multicolor: true,
          HTMLAttributes: {
            class: 'bg-neon-green/20 text-neon-green px-1 rounded',
          },
        }),
        Typography,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        CharacterCount,
        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            class: 'editor-code-block',
          },
        }),
      ],
      content: content || '<p></p>',
      editorProps: {
        attributes: {
          class: `tiptap-editor prose prose-invert max-w-none focus:outline-none min-h-[400px] ${className}`,
        },
        handleDrop: (view, event) => {
          const files = event.dataTransfer?.files;
          if (files && files.length > 0) {
            event.preventDefault();
            Array.from(files).forEach((file) => {
              if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                  const url = reader.result as string;
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.image.create({ src: url, alt: file.name })
                    )
                  );
                };
                reader.readAsDataURL(file);
              }
            });
            return true;
          }
          return false;
        },
        handlePaste: (view, event) => {
          const items = event.clipboardData?.items;
          if (items) {
            for (const item of Array.from(items)) {
              if (item.type.startsWith('image/')) {
                event.preventDefault();
                const file = item.getAsFile();
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const url = reader.result as string;
                    view.dispatch(
                      view.state.tr.replaceSelectionWith(
                        view.state.schema.nodes.image.create({ src: url, alt: 'Pasted image' })
                      )
                    );
                  };
                  reader.readAsDataURL(file);
                }
                return true;
              }
            }
          }
          return false;
        },
      },
      onUpdate: ({ editor: e }) => {
        onChange(e.getHTML());
      },
    });

    // Typewriter mode — scroll current line to center
    useEffect(() => {
      if (!editor || !typewriterMode) return;

      const handleTransaction = () => {
        const { from } = editor.state.selection;
        const coords = editor.view.coordsAtPos(from);
        const editorDom = editor.view.dom.closest('.tiptap-scroll-container');
        if (editorDom && coords) {
          const containerRect = editorDom.getBoundingClientRect();
          const centerY = containerRect.height / 2;
          const offsetY = coords.top - containerRect.top - centerY;
          editorDom.scrollBy({ top: offsetY, behavior: 'smooth' });
        }
      };

      editor.on('selectionUpdate', handleTransaction);
      return () => {
        editor.off('selectionUpdate', handleTransaction);
      };
    }, [editor, typewriterMode]);

    // Notify parent when editor is ready
    useEffect(() => {
      if (editor && onEditorReady) {
        onEditorReady(editor);
      }
    }, [editor, onEditorReady]);

    // Expose editor to parent via ref
    useImperativeHandle(ref, () => ({
      getEditor: () => editor,
    }), [editor]);

    // Sync content from parent (only when content differs significantly)
    useEffect(() => {
      if (editor && content && editor.getHTML() !== content) {
        // Only set content when loading (not on every keystroke)
        const currentText = editor.getText().trim();
        if (!currentText && content !== '<p></p>') {
          editor.commands.setContent(content);
        }
      }
    }, [editor, content]);

    if (!editor) return null;

    return (
      <div className="tiptap-scroll-container overflow-y-auto flex-1">
        <EditorContent editor={editor} />
      </div>
    );
  }
);

TipTapEditor.displayName = 'TipTapEditor';

export default TipTapEditor;
