import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Calendar, Clock, Eye, Github, Heart, Sparkles, Star } from 'lucide-react';
import { useProjects } from '@/contexts/ProjectContext';
import { useBlog } from '@/contexts/BlogContext';
import { cn } from '@/lib/utils';

export const FeaturedShowcase = () => {
  const { projects } = useProjects();
  const { posts } = useBlog();

  const featuredProjects = projects
    .filter((p) => p.featured)
    .slice(0, 3);
  const fallbackProjects = featuredProjects.length
    ? featuredProjects
    : projects.slice(0, 3);

  const latestPosts = posts
    .filter((p) => p.status === 'published')
    .slice(0, 3);

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Featured Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="lg:col-span-3 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-primary font-mono text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            featured_projects.json
          </h3>
          <Link
            href="/projects"
            className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono inline-flex items-center gap-1"
          >
            ls ./projects <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {fallbackProjects.length === 0 && (
            <div className="p-6 rounded-lg border border-dashed border-border bg-card/30 text-center text-sm text-muted-foreground font-mono">
              {'>'} no projects yet — add some from the dashboard
            </div>
          )}

          {fallbackProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ x: 4 }}
              className="group relative overflow-hidden rounded-lg border border-border bg-card/40 backdrop-blur-sm hover:border-primary/60 transition-all duration-300"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-secondary font-mono text-xs">
                        {String(i + 1).padStart(2, '0')}.
                      </span>
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {project.title}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs shrink-0">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Heart className="w-3 h-3" /> {project.likes}
                    </span>
                    {project.reviews.length > 0 && (
                      <span className="flex items-center gap-1 text-secondary">
                        <Star className="w-3 h-3 fill-current" />
                        {(
                          project.reviews.reduce((a, r) => a + r.rating, 0) /
                          project.reviews.length
                        ).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {project.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-4">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 font-mono"
                    >
                      <Github className="w-3 h-3" /> source
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-secondary inline-flex items-center gap-1 font-mono"
                    >
                      <ArrowUpRight className="w-3 h-3" /> live
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Latest Articles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="lg:col-span-2 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-secondary font-mono text-sm">
            {'>'} latest_articles
          </h3>
          <Link
            href="/blog"
            className="text-xs text-muted-foreground hover:text-secondary transition-colors font-mono inline-flex items-center gap-1"
          >
            cat ./blog <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {latestPosts.length === 0 && (
            <div className="p-6 rounded-lg border border-dashed border-border bg-card/30 text-center text-sm text-muted-foreground font-mono">
              {'>'} no posts yet
            </div>
          )}

          {latestPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.08 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className={cn(
                  'group block p-4 rounded-lg border border-border bg-card/40 backdrop-blur-sm',
                  'hover:border-secondary/60 hover:bg-card/60 transition-all duration-300'
                )}
              >
                <h4 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {post.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className={cn('w-3 h-3', post.likes > 0 && 'text-red-400')} />
                    {post.likes}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
