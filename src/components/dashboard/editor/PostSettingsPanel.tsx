'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Tag, Calendar, Sparkles, Image as ImageIcon, X, Plus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PostSettingsPanelProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  featured: boolean;
  onFeaturedChange: (v: boolean) => void;
  publishDate: string;
  onPublishDateChange: (v: string) => void;
  excerpt: string;
  onExcerptChange: (v: string) => void;
  slug: string;
  onSlugChange: (v: string) => void;
}

export default function PostSettingsPanel({
  tags,
  onTagsChange,
  featured,
  onFeaturedChange,
  publishDate,
  onPublishDateChange,
  excerpt,
  onExcerptChange,
  slug,
  onSlugChange,
}: PostSettingsPanelProps) {
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      onTagsChange([...tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-4">
      {/* Slug */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
          URL Slug
        </label>
        <Input
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder="post-url-slug"
          className="bg-muted/10 border-border/30 text-sm h-8 font-mono focus:border-primary"
        />
        <p className="text-[10px] text-muted-foreground/50 mt-1 font-mono">
          /blog/{slug || 'your-post-slug'}
        </p>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
          Excerpt
          <span className="ml-1 font-mono text-muted-foreground/50">
            ({excerpt.length}/200)
          </span>
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          placeholder="Brief description of your post..."
          rows={3}
          maxLength={200}
          className={cn(
            'w-full px-3 py-2 rounded-md bg-muted/10 border border-border/30',
            'text-sm text-foreground placeholder:text-muted-foreground/50 resize-none',
            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30'
          )}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
          <Tag className="w-3 h-3" />
          Tags
        </label>
        <div className="flex gap-1.5">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add tag..."
            className="bg-muted/10 border-border/30 text-sm h-8 flex-1 focus:border-primary"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTag}
            className="h-8 w-8 p-0 border-primary/30 hover:border-primary"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan text-[10px] border border-neon-cyan/20"
              >
                #{tag}
                <button onClick={() => removeTag(tag)} className="opacity-60 hover:opacity-100">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Publish Date */}
      <div>
        <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
          <Calendar className="w-3 h-3" />
          Publish Date
        </label>
        <Input
          type="datetime-local"
          value={publishDate}
          onChange={(e) => onPublishDateChange(e.target.value)}
          className="bg-muted/10 border-border/30 text-sm h-8 focus:border-primary"
        />
      </div>

      {/* Featured Post Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/20">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className={cn('w-3.5 h-3.5', featured && 'text-primary')} />
          Featured Post
        </label>
        <button
          type="button"
          onClick={() => onFeaturedChange(!featured)}
          className={cn(
            'w-10 h-5 rounded-full transition-all duration-300 relative',
            featured
              ? 'bg-primary shadow-[0_0_12px_rgba(0,255,65,0.3)]'
              : 'bg-border/50'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300',
              featured ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>

      {/* Featured Image placeholder */}
      <div>
        <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
          <ImageIcon className="w-3 h-3" />
          Featured Image
        </label>
        <div className={cn(
          'border-2 border-dashed border-border/30 rounded-lg p-6 text-center',
          'hover:border-primary/30 transition-colors cursor-pointer'
        )}>
          <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-[10px] text-muted-foreground/50">
            Drag & drop or click to upload
          </p>
        </div>
      </div>
    </div>
  );
}
