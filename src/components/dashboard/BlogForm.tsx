import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBlog } from '@/contexts/BlogContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Save,
    X,
    FileText,
    Tag,
    Link2,
    Eye,
    Sparkles,
    PenLine,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogFormProps {
    mode: 'create' | 'edit';
    postId?: string;
    onSave: () => void;
    onCancel: () => void;
}

export const BlogForm = ({ mode, postId, onSave, onCancel }: BlogFormProps) => {
    const { createPost, updatePost, getPost } = useBlog();

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        tags: [] as string[],
        status: 'draft' as 'published' | 'draft',
        featured: false,
    });

    const [tagInput, setTagInput] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load post data for edit mode
    useEffect(() => {
        if (mode === 'edit' && postId) {
            const post = getPost(postId);
            if (post) {
                setFormData({
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt,
                    content: post.content,
                    tags: post.tags,
                    status: post.status,
                    featured: post.featured || false,
                });
            }
        }
    }, [mode, postId, getPost]);

    // Auto-generate slug from title
    useEffect(() => {
        if (mode === 'create' && formData.title) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.title, mode]);

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleAddTag = () => {
        const tag = tagInput.trim();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!formData.excerpt.trim()) {
            newErrors.excerpt = 'Excerpt is required';
        }
        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        }
        if (formData.tags.length === 0) {
            newErrors.tags = 'At least one tag is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (status: 'draft' | 'published') => {
        if (!validate()) return;

        const postData = {
            ...formData,
            status,
            readTime: '', // Will be calculated by context
        };

        if (mode === 'create') {
            createPost(postData);
        } else if (postId) {
            updatePost(postId, postData);
        }

        onSave();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Form Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    {mode === 'create' ? (
                        <>
                            <PenLine className="w-5 h-5 text-cyan-400" />
                            Create New Post
                        </>
                    ) : (
                        <>
                            <FileText className="w-5 h-5 text-yellow-400" />
                            Edit Post
                        </>
                    )}
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-muted-foreground"
                >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? 'Edit' : 'Preview'}
                </Button>
            </div>

            {/* Form Content */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Form Fields */}
                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Title
                        </label>
                        <Input
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Enter post title..."
                            className={cn(
                                'bg-card/50 border-border/50 focus:border-primary',
                                errors.title && 'border-destructive'
                            )}
                        />
                        {errors.title && (
                            <p className="text-xs text-destructive mt-1">{errors.title}</p>
                        )}
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            <Link2 className="w-4 h-4 inline mr-1" />
                            Slug
                        </label>
                        <Input
                            value={formData.slug}
                            onChange={(e) => handleChange('slug', e.target.value)}
                            placeholder="post-url-slug"
                            className="bg-card/50 border-border/50 focus:border-primary font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            URL: /blog/{formData.slug || 'your-post-slug'}
                        </p>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Excerpt
                        </label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => handleChange('excerpt', e.target.value)}
                            placeholder="Brief description of your post..."
                            rows={3}
                            className={cn(
                                'w-full px-3 py-2 rounded-md bg-card/50 border border-border/50',
                                'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                                'text-foreground placeholder:text-muted-foreground resize-none',
                                errors.excerpt && 'border-destructive'
                            )}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            {errors.excerpt && <span className="text-destructive">{errors.excerpt}</span>}
                            <span className="ml-auto">{formData.excerpt.length}/200</span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            <Tag className="w-4 h-4 inline mr-1" />
                            Tags
                        </label>
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Add tag..."
                                className={cn(
                                    'bg-card/50 border-border/50 focus:border-primary flex-1',
                                    errors.tags && formData.tags.length === 0 && 'border-destructive'
                                )}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddTag}
                                className="border-primary/50 hover:border-primary"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {errors.tags && formData.tags.length === 0 && (
                            <p className="text-xs text-destructive mt-1">{errors.tags}</p>
                        )}

                        {/* Tags Display */}
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="group flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs border border-primary/30"
                                    >
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="opacity-60 hover:opacity-100"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Featured Toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => handleChange('featured', !formData.featured)}
                            className={cn(
                                'w-12 h-6 rounded-full transition-colors duration-200 relative',
                                formData.featured ? 'bg-primary' : 'bg-border'
                            )}
                        >
                            <span
                                className={cn(
                                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200',
                                    formData.featured ? 'translate-x-7' : 'translate-x-1'
                                )}
                            />
                        </button>
                        <label className="text-sm text-muted-foreground flex items-center gap-2">
                            <Sparkles className={cn('w-4 h-4', formData.featured && 'text-primary')} />
                            Featured Post
                        </label>
                    </div>
                </div>

                {/* Content Editor / Preview */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        {showPreview ? 'Preview' : 'Content (Markdown)'}
                    </label>
                    {showPreview ? (
                        <div
                            className={cn(
                                'w-full h-[400px] p-4 rounded-md bg-card/50 border border-border/50',
                                'text-foreground overflow-y-auto prose prose-invert prose-sm max-w-none'
                            )}
                        >
                            {formData.content ? (
                                <pre className="whitespace-pre-wrap font-sans">{formData.content}</pre>
                            ) : (
                                <p className="text-muted-foreground italic">No content to preview</p>
                            )}
                        </div>
                    ) : (
                        <textarea
                            value={formData.content}
                            onChange={(e) => handleChange('content', e.target.value)}
                            placeholder="# Your Post Title&#10;&#10;Write your content here using Markdown..."
                            className={cn(
                                'w-full h-[400px] px-3 py-2 rounded-md bg-card/50 border border-border/50',
                                'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                                'text-foreground placeholder:text-muted-foreground resize-none font-mono text-sm',
                                errors.content && 'border-destructive'
                            )}
                        />
                    )}
                    {errors.content && !showPreview && (
                        <p className="text-xs text-destructive mt-1">{errors.content}</p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4 border-t border-border/50">
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="w-full sm:w-auto"
                >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                </Button>
                <div className="flex gap-3 w-full sm:w-auto sm:ml-auto">
                    <Button
                        variant="outline"
                        onClick={() => handleSubmit('draft')}
                        className="flex-1 sm:flex-none border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button
                        onClick={() => handleSubmit('published')}
                        className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {mode === 'create' ? 'Publish' : 'Update'}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};
