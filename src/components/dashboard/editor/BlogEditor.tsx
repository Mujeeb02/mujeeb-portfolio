'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Editor } from '@tiptap/react';
import { useBlog } from '@/contexts/BlogContext';
import { cn } from '@/lib/utils';
import {
  Save, Sparkles, X, PanelLeftClose, PanelRightClose,
  PanelLeftOpen, PanelRightOpen, Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Editor components
import TipTapEditor from './TipTapEditor';
import EditorToolbar from './EditorToolbar';
import EditorPreview from './EditorPreview';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import SlashCommandMenu from './SlashCommandMenu';
import AIAssistant from './AIAssistant';

// Hooks
import { useAutosave } from './hooks/useAutosave';
import { useEditorShortcuts } from './hooks/useEditorShortcuts';
import { useContentHealth } from './hooks/useContentHealth';
import { useSEOScore } from './hooks/useSEOScore';
import { useMarkdownSerializer } from './hooks/useMarkdownSerializer';

type ViewMode = 'editor' | 'split' | 'preview';

interface BlogEditorProps {
  mode: 'create' | 'edit';
  postId?: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function BlogEditor({ mode, postId, onSave, onCancel }: BlogEditorProps) {
  const { createPost, updatePost, getPost } = useBlog();
  const { htmlToMarkdown, markdownToHtml } = useMarkdownSerializer();

  // Editor instance ref
  const [editor, setEditor] = useState<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View states
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [typewriterMode, setTypewriterMode] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);

  // Form data
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [featured, setFeatured] = useState(false);
  const [publishDate, setPublishDate] = useState('');

  // SEO fields
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Content health
  const health = useContentHealth(editor);

  // SEO score
  const seoResult = useSEOScore({
    title,
    seoTitle,
    metaDescription,
    keywords,
    content: health,
  });

  // Auto-generate slug from title (create mode only)
  useEffect(() => {
    if (mode === 'create' && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  }, [title, mode]);

  // Load post for edit mode
  useEffect(() => {
    if (mode === 'edit' && postId) {
      const post = getPost(postId);
      if (post) {
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt);
        setTags(post.tags);
        setStatus(post.status);
        setFeatured(post.featured || false);
        // Convert markdown content to HTML for TipTap
        const html = markdownToHtml(post.content);
        setHtmlContent(html);
      }
    }
  }, [mode, postId, getPost, markdownToHtml]);

  // Autosave
  const handleAutosave = useCallback(async () => {
    if (mode === 'edit' && postId && title.trim()) {
      const content = htmlToMarkdown(htmlContent);
      await updatePost(postId, {
        title,
        slug,
        excerpt,
        content,
        tags,
        status,
        featured,
      });
    } else if (mode === 'create') {
      // Save draft to localStorage
      localStorage.setItem(
        'blog-editor-draft',
        JSON.stringify({ title, slug, excerpt, htmlContent, tags, featured, seoTitle, metaDescription, keywords })
      );
    }
  }, [mode, postId, title, slug, excerpt, htmlContent, tags, status, featured, htmlToMarkdown, updatePost, seoTitle, metaDescription, keywords]);

  const { status: autosaveStatus, lastSaved, markUnsaved, saveNow } = useAutosave({
    onSave: handleAutosave,
    interval: 15000,
    enabled: title.trim().length > 0,
  });

  // Mark unsaved on changes
  useEffect(() => {
    markUnsaved();
  }, [title, slug, excerpt, htmlContent, tags, featured, markUnsaved]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!htmlContent.trim() || htmlContent === '<p></p>') newErrors.content = 'Content is required';
    if (tags.length === 0) newErrors.tags = 'At least one tag is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = useCallback(async (submitStatus: 'draft' | 'published') => {
    if (!validate()) return;

    const content = htmlToMarkdown(htmlContent);
    const postData = {
      title,
      slug,
      excerpt,
      content,
      tags,
      status: submitStatus,
      featured,
      readTime: health.readingTime,
    };

    if (mode === 'create') {
      await createPost(postData);
      // Clear draft
      localStorage.removeItem('blog-editor-draft');
    } else if (postId) {
      await updatePost(postId, { ...postData, status: submitStatus });
    }

    onSave();
  }, [title, slug, excerpt, htmlContent, tags, featured, health.readingTime, mode, postId, createPost, updatePost, htmlToMarkdown, onSave]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEditorShortcuts({
    onSaveDraft: () => handleSubmit('draft'),
    onPublish: () => handleSubmit('published'),
    onToggleFocusMode: () => setFocusMode((v) => !v),
    onToggleFullscreen: () => setFullscreenMode((v) => !v),
  });

  // Focus mode — close sidebars
  useEffect(() => {
    if (focusMode) {
      setLeftSidebarOpen(false);
      setRightSidebarOpen(false);
    }
  }, [focusMode]);

  // Fullscreen
  useEffect(() => {
    if (fullscreenMode) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [fullscreenMode]);

  // Responsive — collapse sidebars on small screens
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      } else if (window.innerWidth < 1440) {
        setRightSidebarOpen(false);
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Navigate to heading
  const handleHeadingClick = useCallback(
    (pos: number) => {
      if (!editor) return;
      // Find the heading in the doc by index
      let headingIdx = 0;
      editor.state.doc.descendants((node, nodePos) => {
        if (node.type.name === 'heading') {
          if (headingIdx === pos) {
            editor.chain().focus().setTextSelection(nodePos + 1).run();
            // Scroll into view
            const coords = editor.view.coordsAtPos(nodePos);
            const container = editor.view.dom.closest('.tiptap-scroll-container');
            if (container && coords) {
              container.scrollTo({ top: coords.top - container.getBoundingClientRect().top + container.scrollTop - 100, behavior: 'smooth' });
            }
          }
          headingIdx++;
        }
      });
    },
    [editor]
  );

  // Export markdown
  const handleExportMarkdown = useCallback(() => {
    const md = htmlToMarkdown(htmlContent);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug || 'post'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Markdown exported');
  }, [htmlContent, slug, htmlToMarkdown]);

  // Import markdown
  const handleImportMarkdown = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const md = reader.result as string;
        const html = markdownToHtml(md);
        setHtmlContent(html);
        editor?.commands.setContent(html);
        toast.success('Markdown imported');
      };
      reader.readAsText(file);
      e.target.value = ''; // reset
    },
    [editor, markdownToHtml]
  );

  // Duplicate post
  const handleDuplicate = useCallback(() => {
    setTitle(title + ' (Copy)');
    setSlug(slug + '-copy');
    toast.success('Duplicated — save to create a new post');
  }, [title, slug]);

  // Copy URL
  const handleCopyUrl = useCallback(() => {
    const url = `${window.location.origin}/blog/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  }, [slug]);

  // AI Assistant handler (stubbed)
  const handleAIAction = useCallback(
    async (actionId: string) => {
      setAiProcessing(true);
      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const stubs: Record<string, string> = {
        intro: `<p>In this comprehensive guide, we'll explore the key concepts and practical applications that will transform your understanding of this topic. Whether you're a beginner or an experienced practitioner, you'll find valuable insights ahead.</p>`,
        conclusion: `<p>In conclusion, the principles we've discussed throughout this article provide a solid foundation for mastering this subject. Remember to practice consistently and stay curious as the field continues to evolve.</p>`,
        grammar: `<p><em>✅ Grammar check complete — your text looks great!</em></p>`,
        simplify: `<p><em>✅ Text has been simplified for better readability.</em></p>`,
        expand: `<p>Let's dive deeper into this topic. There are several important aspects worth exploring in more detail, each contributing to a richer understanding of the subject matter.</p>`,
        summarize: `<p><strong>Summary:</strong> This section covers the key points and main takeaways from the content above.</p>`,
        faq: `<h2>Frequently Asked Questions</h2><h3>What is the main topic?</h3><p>The main topic covers...</p><h3>How do I get started?</h3><p>Getting started is simple...</p><h3>What are the best practices?</h3><p>The best practices include...</p>`,
        slug: '',
        excerpt: '',
        seo: `<p><em>💡 SEO Tip: Make sure your title includes your primary keyword, and that your meta description is compelling and between 120-160 characters.</em></p>`,
      };

      if (actionId === 'slug') {
        const generated = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        setSlug(generated);
        toast.success('Slug generated');
      } else if (actionId === 'excerpt') {
        const text = editor?.getText().slice(0, 180) || '';
        setExcerpt(text + '...');
        toast.success('Excerpt generated');
      } else {
        // Insert into editor
        const stub = stubs[actionId] || '<p>AI content placeholder</p>';
        editor?.chain().focus().insertContent(stub).run();
        toast.success('AI content inserted');
      }

      setAiProcessing(false);
    },
    [editor, title]
  );

  return (
    <div
      className={cn(
        'flex flex-col h-[calc(100vh-8rem)] -mx-4 sm:-mx-6 -mt-4 sm:-mt-6',
        fullscreenMode && 'fixed inset-0 z-50 mx-0 mt-0 h-screen bg-background'
      )}
    >
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* Top header bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-card/30 backdrop-blur-xl border-b border-border/20 flex-shrink-0">
        {/* Left side — title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors lg:flex hidden"
            title="Toggle left sidebar"
          >
            {leftSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>

          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="Untitled Post"
            className={cn(
              'text-lg font-bold bg-transparent border-none shadow-none px-0 h-auto',
              'placeholder:text-muted-foreground/30 focus-visible:ring-0',
              'text-foreground',
              errors.title && 'placeholder:text-destructive'
            )}
          />
        </div>

        {/* Right side — actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status badge */}
          <span
            className={cn(
              'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide',
              autosaveStatus === 'saved' && 'bg-green-500/10 text-green-400',
              autosaveStatus === 'saving' && 'bg-yellow-500/10 text-yellow-400',
              autosaveStatus === 'unsaved' && 'bg-orange-500/10 text-orange-400',
              autosaveStatus === 'error' && 'bg-red-500/10 text-red-400'
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                autosaveStatus === 'saved' && 'bg-green-400',
                autosaveStatus === 'saving' && 'bg-yellow-400 animate-pulse',
                autosaveStatus === 'unsaved' && 'bg-orange-400',
                autosaveStatus === 'error' && 'bg-red-400'
              )}
            />
            {autosaveStatus === 'saved' && 'Saved'}
            {autosaveStatus === 'saving' && 'Saving...'}
            {autosaveStatus === 'unsaved' && 'Unsaved'}
            {autosaveStatus === 'error' && 'Error'}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground h-8"
          >
            <X className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Cancel</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit('draft')}
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 h-8"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Draft</span>
          </Button>
          <Button
            size="sm"
            onClick={() => handleSubmit('published')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,65,0.2)] h-8"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {mode === 'create' ? 'Publish' : 'Update'}
          </Button>

          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors lg:flex hidden"
            title="Toggle right sidebar"
          >
            {rightSidebarOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Error bar */}
      <AnimatePresence>
        {Object.keys(errors).length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 bg-destructive/10 border-b border-destructive/20 flex items-center gap-2 text-xs text-destructive flex-shrink-0"
          >
            {Object.values(errors).join(' • ')}
            <button onClick={() => setErrors({})} className="ml-auto">
              <Minimize2 className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main three-panel layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <AnimatePresence>
          {leftSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 overflow-hidden"
            >
              <LeftSidebar
                status={status}
                autosaveStatus={autosaveStatus}
                lastSaved={lastSaved}
                health={health}
                onHeadingClick={handleHeadingClick}
                onExportMarkdown={handleExportMarkdown}
                onImportMarkdown={handleImportMarkdown}
                onDuplicate={handleDuplicate}
                onCopyUrl={handleCopyUrl}
                className="h-full w-[260px]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Toolbar */}
          <EditorToolbar
            editor={editor}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            focusMode={focusMode}
            onFocusModeToggle={() => setFocusMode((v) => !v)}
            fullscreenMode={fullscreenMode}
            onFullscreenToggle={() => setFullscreenMode((v) => !v)}
            typewriterMode={typewriterMode}
            onTypewriterToggle={() => setTypewriterMode((v) => !v)}
          />

          {/* Editor / Preview Area */}
          <div className="flex-1 overflow-hidden relative">
            {viewMode === 'editor' && (
              <div className="h-full overflow-y-auto p-4 sm:p-8 relative">
                <div className="max-w-3xl mx-auto">
                  <TipTapEditor
                    content={htmlContent}
                    onChange={setHtmlContent}
                    onEditorReady={setEditor}
                    typewriterMode={typewriterMode}
                  />
                  <SlashCommandMenu editor={editor} />
                </div>
              </div>
            )}

            {viewMode === 'split' && (
              <div className="h-full flex">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 border-r border-border/20 relative">
                  <div className="max-w-none">
                    <TipTapEditor
                      content={htmlContent}
                      onChange={setHtmlContent}
                      onEditorReady={setEditor}
                      typewriterMode={typewriterMode}
                    />
                    <SlashCommandMenu editor={editor} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/5">
                  <EditorPreview html={htmlContent} />
                </div>
              </div>
            )}

            {viewMode === 'preview' && (
              <div className="h-full overflow-y-auto p-4 sm:p-8">
                <div className="max-w-3xl mx-auto">
                  <EditorPreview html={htmlContent} />
                </div>
              </div>
            )}

            {/* Focus mode overlay */}
            {focusMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-2 right-2 z-10"
              >
                <button
                  onClick={() => setFocusMode(false)}
                  className="px-2 py-1 rounded-md bg-card/50 backdrop-blur text-xs text-muted-foreground hover:text-foreground border border-border/20 transition-colors"
                >
                  Exit Focus
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <AnimatePresence>
          {rightSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 overflow-hidden"
            >
              <RightSidebar
                title={title}
                seoTitle={seoTitle}
                onSeoTitleChange={setSeoTitle}
                metaDescription={metaDescription}
                onMetaDescriptionChange={setMetaDescription}
                canonicalUrl={canonicalUrl}
                onCanonicalUrlChange={setCanonicalUrl}
                keywords={keywords}
                onKeywordsChange={setKeywords}
                tags={tags}
                onTagsChange={setTags}
                featured={featured}
                onFeaturedChange={setFeatured}
                publishDate={publishDate}
                onPublishDateChange={setPublishDate}
                excerpt={excerpt}
                onExcerptChange={setExcerpt}
                slug={slug}
                onSlugChange={setSlug}
                health={health}
                seoScore={seoResult.seoScore}
                className="h-full w-[320px]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Assistant */}
      <AIAssistant onAction={handleAIAction} isProcessing={aiProcessing} />
    </div>
  );
}
