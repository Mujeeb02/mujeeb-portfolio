import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, Eye, Tag, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlog } from '@/contexts/BlogContext';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  views?: number;
  likes?: number;
  tags: string[];
  featured?: boolean;
}

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

export const BlogCard = ({ post, index }: BlogCardProps) => {
  const { likePost, unlikePost, isLiked, posts } = useBlog();
  
  // Get real-time likes from context
  const currentPost = posts.find(p => p.id === post.id);
  const likes = currentPost?.likes ?? post.likes ?? 0;
  const liked = isLiked(post.id);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      className="group"
    >
      <div
        className={cn(
          'block p-6 border border-border bg-card/30 backdrop-blur-sm transition-all duration-500',
          'hover:border-primary hover:bg-card/50 hover:shadow-[0_0_30px_hsl(var(--neon-green)/0.15)]',
          post.featured && 'border-l-4 border-l-primary'
        )}
      >
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
          {post.views !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {post.views} views
            </span>
          )}
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1 transition-all duration-300 hover:scale-105',
              liked ? 'text-red-500' : 'hover:text-red-400'
            )}
          >
            <Heart className={cn('w-3 h-3 transition-transform', liked && 'fill-current')} />
            {likes} likes
          </button>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`} className="block">
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            <span className="text-secondary mr-2">❯</span>
            {post.title}
            <span className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
              _
            </span>
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="w-3 h-3 text-muted-foreground" />
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-muted-foreground hover:text-secondary transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Read more indicator */}
        <Link href={`/blog/${post.slug}`} className="block mt-4">
          <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            {'>'} cat article.md
          </span>
        </Link>
      </div>
    </motion.article>
  );
};
