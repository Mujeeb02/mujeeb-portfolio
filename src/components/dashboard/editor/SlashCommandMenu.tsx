'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { type Editor } from '@tiptap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Heading1, Heading2, Heading3,
  Image as ImageIcon, CodeXml, Quote, Table2, Minus, ListChecks,
  MessageSquareWarning,
} from 'lucide-react';

interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (editor: Editor) => void;
}

const COMMANDS: SlashCommand[] = [
  {
    id: 'h1',
    label: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    label: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    label: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Insert an image',
    icon: ImageIcon,
    action: (editor) => {
      const url = window.prompt('Enter image URL:');
      if (url) editor.chain().focus().setImage({ src: url }).run();
    },
  },
  {
    id: 'code',
    label: 'Code Block',
    description: 'Syntax-highlighted code',
    icon: CodeXml,
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'quote',
    label: 'Blockquote',
    description: 'Highlight a quote',
    icon: Quote,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'table',
    label: 'Table',
    description: 'Insert a table',
    icon: Table2,
    action: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    id: 'callout',
    label: 'Callout',
    description: 'Info or warning callout',
    icon: MessageSquareWarning,
    action: (editor) => {
      editor.chain().focus().insertContent({
        type: 'blockquote',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: '💡 Callout: ' }] }],
      }).run();
    },
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Horizontal line',
    icon: Minus,
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    id: 'tasklist',
    label: 'Task List',
    description: 'Checkable task list',
    icon: ListChecks,
    action: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
];

interface SlashCommandMenuProps {
  editor: Editor | null;
}

export default function SlashCommandMenu({ editor }: SlashCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const executeCommand = useCallback(
    (cmd: SlashCommand) => {
      if (!editor) return;
      // Delete the "/" and any query text
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - query.length - 1),
        from,
        ''
      );
      const slashPos = textBefore.lastIndexOf('/');
      if (slashPos !== -1) {
        const deleteFrom = from - query.length - 1;
        editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run();
      }
      cmd.action(editor);
      handleClose();
    },
    [editor, query, handleClose]
  );

  // Listen for "/" at start of line or after space
  useEffect(() => {
    if (!editor) return;

    const editorDom = editor.view.dom;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !isOpen) {
        const { from } = editor.state.selection;
        const textBefore = editor.state.doc.textBetween(Math.max(0, from - 1), from, '');
        // Only trigger at start of line or after space
        if (from === 1 || textBefore === '' || textBefore === ' ' || textBefore === '\n') {
          // Get cursor position for menu placement
          const coords = editor.view.coordsAtPos(from);
          const editorRect = editor.view.dom.getBoundingClientRect();
          setPosition({
            top: coords.bottom - editorRect.top + 8,
            left: coords.left - editorRect.left,
          });
          setIsOpen(true);
          setQuery('');
          setSelectedIndex(0);
        }
      }

      if (isOpen) {
        if (event.key === 'Escape') {
          event.preventDefault();
          handleClose();
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        }
        if (event.key === 'Enter' && filteredCommands[selectedIndex]) {
          event.preventDefault();
          executeCommand(filteredCommands[selectedIndex]);
        }
        if (event.key === 'Backspace' && query === '') {
          handleClose();
        }
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && event.key !== '/') {
          setQuery((prev) => prev + event.key);
          setSelectedIndex(0);
        }
        if (event.key === 'Backspace' && query.length > 0) {
          setQuery((prev) => prev.slice(0, -1));
          setSelectedIndex(0);
        }
      }
    };

    editorDom.addEventListener('keydown', handleKeyDown);
    return () => {
      editorDom.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, isOpen, query, selectedIndex, filteredCommands, handleClose, executeCommand]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, handleClose]);

  if (!editor) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.12 }}
          className={cn(
            'absolute z-50 w-64',
            'bg-card/95 backdrop-blur-2xl border border-border/30 rounded-xl',
            'shadow-2xl shadow-black/40 overflow-hidden'
          )}
          style={{
            top: `${position.top}px`,
            left: `${Math.min(position.left, 200)}px`,
          }}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-border/20">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {query ? `Filtering: "${query}"` : 'Type to filter commands'}
            </p>
          </div>

          {/* Commands */}
          <div className="max-h-[280px] overflow-y-auto py-1 custom-scrollbar">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                    idx === selectedIndex
                      ? 'bg-primary/15 text-primary'
                      : 'text-foreground hover:bg-muted/20'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    idx === selectedIndex ? 'bg-primary/20' : 'bg-muted/20'
                  )}>
                    <cmd.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{cmd.label}</p>
                    <p className="text-[10px] text-muted-foreground">{cmd.description}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">No matching commands</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
