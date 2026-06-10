"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AsciiDivider } from '@/components/AsciiDivider';
import { ArrowLeft, Calendar, Clock, Eye, Share2, Tag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlog } from '@/contexts/BlogContext';
import { cn } from '@/lib/utils';
import { BlogComments } from '@/components/BlogComments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMarkdownSerializer } from '@/components/dashboard/editor/hooks/useMarkdownSerializer';
import EditorPreview from '@/components/dashboard/editor/EditorPreview';

const BlogPostPage = ({ slug }: { slug?: string }) => {
  const { getPostBySlug, likePost, unlikePost, isLiked, incrementViews, refresh } = useBlog();
  const [hasIncrementedView, setHasIncrementedView] = useState(false);
  const { markdownToHtml } = useMarkdownSerializer();

  const post = slug ? getPostBySlug(slug) : null;
  const liked = post ? isLiked(post.id) : false;

  // Increment view count once per page visit
  useEffect(() => {
    if (post && !hasIncrementedView) {
      incrementViews(post.id);
      setHasIncrementedView(true);
    }
  }, [post, hasIncrementedView, incrementViews]);

  // Realtime: refresh likes when anyone likes/unlikes this post
  useEffect(() => {
    if (!post) return;
    const channel = supabase
      .channel(`blog-likes-${post.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_likes', filter: `post_id=eq.${post.id}` }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [post, refresh]);

  const handleLike = () => {
    if (!post) return;
    if (liked) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
      toast.success('Thanks for the like!');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (!post) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            <span className="text-destructive">ERROR 404:</span> Post not found
          </h1>
          <p className="text-muted-foreground mb-8">
            The requested article does not exist in our database.
          </p>
          <Button variant="outline" asChild>
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <article className="py-20 font-handwritten text-xl tracking-wide">
      <div className="container mx-auto px-4">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            cd ../blog
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {post.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.views.toLocaleString()} views
            </span>
            <span className={cn(
              'flex items-center gap-1 transition-colors',
              liked && 'text-red-500'
            )}>
              <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
              {post.likes} likes
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLike}
              className={cn(liked && 'border-red-500 text-red-500')}
            >
              <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
              {liked ? 'Liked' : 'Like'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </motion.header>

        <AsciiDivider className="mb-12" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <EditorPreview html={markdownToHtml(post.content)} className="!max-w-none text-muted-foreground prose-p:leading-relaxed prose-headings:text-foreground prose-code:text-primary" />
        </motion.div>

        <AsciiDivider className="my-12" variant="wave" />

        {/* Navigation */}
        <div className="max-w-3xl mx-auto">
          <Button variant="terminal" asChild>
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4" />
              Back to all posts
            </Link>
          </Button>
        </div>

        <BlogComments postId={post.id} />
      </div>
    </article>
  );
};

export default BlogPostPage;
