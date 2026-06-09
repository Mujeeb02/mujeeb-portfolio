'use client';

import { type Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import {
  Bold, Italic, Underline, Strikethrough, Code, Link2, Highlighter,
  Heading1, Heading2, Heading3, ChevronDown,
  List, ListOrdered, ListChecks, Quote, CodeXml, Table2, Minus, ImagePlus, MessageSquareWarning,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo2, Redo2,
  Monitor, SplitSquareHorizontal, Eye,
  Maximize, Focus, TypeOutline,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';

type ViewMode = 'editor' | 'split' | 'preview';

interface EditorToolbarProps {
  editor: Editor | null;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  focusMode: boolean;
  onFocusModeToggle: () => void;
  fullscreenMode: boolean;
  onFullscreenToggle: () => void;
  typewriterMode: boolean;
  onTypewriterToggle: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton = ({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'p-1.5 rounded-md transition-all duration-200 relative',
      'hover:bg-primary/10 hover:text-primary',
      'disabled:opacity-30 disabled:cursor-not-allowed',
      isActive
        ? 'text-primary bg-primary/15 shadow-[0_0_12px_rgba(0,255,65,0.25)]'
        : 'text-muted-foreground'
    )}
  >
    {children}
    {isActive && (
      <motion.div
        layoutId="toolbar-active"
        className="absolute inset-0 rounded-md border border-primary/30"
        transition={{ duration: 0.15 }}
      />
    )}
  </button>
);

const ToolbarDivider = () => (
  <div className="w-px h-5 bg-border/50 mx-1" />
);

export default function EditorToolbar({
  editor,
  viewMode,
  onViewModeChange,
  focusMode,
  onFocusModeToggle,
  fullscreenMode,
  onFullscreenToggle,
  typewriterMode,
  onTypewriterToggle,
}: EditorToolbarProps) {
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/30">
      {/* Row 1: Inline formatting */}
      <div className="flex items-center gap-0.5 px-3 py-1.5 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={addLink}
          isActive={editor.isActive('link')}
          title="Link (Ctrl+K)"
        >
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
            isActive={
              editor.isActive('heading', { level: 4 }) ||
              editor.isActive('heading', { level: 5 }) ||
              editor.isActive('heading', { level: 6 })
            }
            title="More headings"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </ToolbarButton>
          {showHeadingDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 mt-1 bg-card border border-border/50 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              {([4, 5, 6] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level }).run();
                    setShowHeadingDropdown(false);
                  }}
                  className={cn(
                    'block w-full px-4 py-2 text-left text-sm transition-colors',
                    'hover:bg-primary/10 hover:text-primary',
                    editor.isActive('heading', { level }) && 'text-primary bg-primary/10'
                  )}
                >
                  H{level}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <ToolbarDivider />

        {/* Block elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          title="Task List"
        >
          <ListChecks className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <CodeXml className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addTable} title="Insert Table">
          <Table2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Insert Image">
          <ImagePlus className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            editor.chain().focus().insertContent({
              type: 'blockquote',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '💡 Callout: ' }] }],
            }).run();
          }}
          title="Callout"
        >
          <MessageSquareWarning className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Writing modes */}
        <ToolbarButton
          onClick={onFocusModeToggle}
          isActive={focusMode}
          title="Focus Mode"
        >
          <Focus className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={onTypewriterToggle}
          isActive={typewriterMode}
          title="Typewriter Mode"
        >
          <TypeOutline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={onFullscreenToggle}
          isActive={fullscreenMode}
          title="Fullscreen (F11)"
        >
          <Maximize className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* View mode toggle */}
        <div className="flex items-center bg-muted/30 rounded-lg p-0.5 border border-border/30">
          {([
            { mode: 'editor' as ViewMode, icon: Monitor, label: 'Editor' },
            { mode: 'split' as ViewMode, icon: SplitSquareHorizontal, label: 'Split' },
            { mode: 'preview' as ViewMode, icon: Eye, label: 'Preview' },
          ]).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              title={label}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200',
                viewMode === mode
                  ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,255,65,0.15)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
