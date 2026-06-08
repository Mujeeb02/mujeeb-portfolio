"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProjectCard } from '@/components/ProjectCard';
import { AsciiDivider } from '@/components/AsciiDivider';
import { Filter, Grid, List, Heart, MessageSquare, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProjects } from '@/contexts/ProjectContext';

const Projects = () => {
  const { projects, loading } = useProjects();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags)));

  const filteredProjects = selectedTag
    ? projects.filter((p) => p.tags.includes(selectedTag))
    : projects;

  const totalLikes = projects.reduce((acc, p) => acc + p.likes, 0);
  const totalReviews = projects.reduce((acc, p) => acc + p.reviews.length, 0);
  const avgRating = projects.reduce((acc, p) => {
    const reviews = p.reviews;
    if (reviews.length === 0) return acc;
    return acc + reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, 0) / (projects.filter(p => p.reviews.length > 0).length || 1);

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-primary font-mono"
          >
            Loading projects...
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-secondary">$</span> ls ./projects
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A collection of open source projects and experiments. Each one taught me something new.
          </p>
        </motion.div>

        <AsciiDivider className="mb-8" />

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Button
              variant={selectedTag === null ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              All
            </Button>
            {allTags.slice(0, 6).map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={cn(viewMode === 'grid' && 'text-primary')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={cn(viewMode === 'list' && 'text-primary')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div
          className={cn(
            'grid gap-6',
            viewMode === 'grid'
              ? 'md:grid-cols-2 lg:grid-cols-2'
              : 'grid-cols-1 max-w-3xl mx-auto'
          )}
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <AsciiDivider className="mb-8" variant="double" />
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div>
              <span className="text-2xl font-bold text-foreground block mb-1">
                {projects.length}
              </span>
              Projects
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-foreground flex items-center gap-2 mb-1">
                <Heart className="w-5 h-5 text-red-500" />
                {totalLikes}
              </span>
              Total Likes
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-foreground flex items-center gap-2 mb-1">
                <MessageSquare className="w-5 h-5 text-primary" />
                {totalReviews}
              </span>
              Reviews
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-foreground flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                {avgRating.toFixed(1)}
              </span>
              Avg Rating
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground block mb-1">
                {allTags.length}
              </span>
              Technologies
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
