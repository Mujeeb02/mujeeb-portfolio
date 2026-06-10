"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BlogCard, BlogPost } from '@/components/BlogCard';
import { AsciiDivider } from '@/components/AsciiDivider';
import { useBlog } from '@/contexts/BlogContext';
import { Search, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Blog = () => {
  const { posts } = useBlog();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Only show published posts to public
  const publishedPosts: BlogPost[] = posts
    .filter(p => p.status === 'published')
    .map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
      readTime: p.readTime,
      views: p.views,
      tags: p.tags,
      featured: p.featured,
    }));

  const allTags = Array.from(new Set(publishedPosts.flatMap((p) => p.tags)));

  const filteredPosts = publishedPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <section className="py-20 font-handwritten text-xl tracking-wide">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-secondary">$</span> cat /var/log/blog/*
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Technical articles about web development, security, and programming best practices.
          </p>
        </motion.div>

        <AsciiDivider className="mb-8" />

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mb-12"
        >
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="grep -r 'keyword' ./articles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border focus:border-primary font-mono"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <Button
              variant={selectedTag === null ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              All
            </Button>
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                #{tag}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Blog Posts */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              <p className="text-lg mb-2">No posts found</p>
              <p className="text-sm">
                <span className="text-secondary">$</span> grep returned 0 results
              </p>
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <AsciiDivider className="mb-8" variant="dots" />
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground">{publishedPosts.length}</span> articles ·{' '}
            <span className="text-foreground">
              {publishedPosts.reduce((acc, p) => acc + (p.views || 0), 0).toLocaleString()}
            </span>{' '}
            total views
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;
