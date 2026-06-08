import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Eye, Heart, Users, Clock, BarChart3,
  Mail, Star, FolderGit2,
} from 'lucide-react';
import { useBlog } from '@/contexts/BlogContext';
import { useProjects } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const DAYS = 7;

export const AnalyticsDashboard = () => {
  const { posts } = useBlog();
  const { projects } = useProjects();
  const [contactsCount, setContactsCount] = useState(0);
  const [recentContacts, setRecentContacts] = useState<{ created_at: string }[]>([]);
  const [recentLikes, setRecentLikes] = useState<{ created_at: string }[]>([]);
  const [recentReviews, setRecentReviews] = useState<{ created_at: string; rating: number }[]>([]);

  useEffect(() => {
    (async () => {
      const sinceISO = new Date(Date.now() - DAYS * 86400000).toISOString();
      const [{ count: cTotal }, { data: cRecent }, { data: bLikes }, { data: pLikes }, { data: revs }] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }),
        supabase.from('contacts').select('created_at').gte('created_at', sinceISO),
        supabase.from('blog_likes').select('created_at').gte('created_at', sinceISO),
        supabase.from('project_likes').select('created_at').gte('created_at', sinceISO),
        supabase.from('project_reviews').select('created_at,rating'),
      ]);
      setContactsCount(cTotal ?? 0);
      setRecentContacts(cRecent ?? []);
      setRecentLikes([...(bLikes ?? []), ...(pLikes ?? [])]);
      setRecentReviews((revs ?? []) as { created_at: string; rating: number }[]);
    })();
  }, []);

  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const totalLikes = posts.reduce((s, p) => s + p.likes, 0)
                   + projects.reduce((s, p) => s + p.likes, 0);
  const avgRating = recentReviews.length
    ? (recentReviews.reduce((s, r) => s + r.rating, 0) / recentReviews.length).toFixed(1)
    : '—';

  // weekly likes bucket
  const weeklyLikes = useMemo(() => {
    const buckets: { day: string; views: number }[] = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      const day = d.toISOString().slice(0, 10);
      const count = recentLikes.filter((l) => l.created_at.startsWith(day)).length
                  + recentContacts.filter((l) => l.created_at.startsWith(day)).length;
      buckets.push({ day: label, views: count });
    }
    return buckets;
  }, [recentLikes, recentContacts]);
  const maxBucket = Math.max(1, ...weeklyLikes.map((d) => d.views));

  const topPosts = [...posts].sort((a, b) => b.views - a.views).slice(0, 5);
  const topProjects = [...projects].sort((a, b) => b.likes - a.likes).slice(0, 5);

  const trafficSources = [
    { source: 'Blog views', visitors: totalViews, percentage: 0 },
    { source: 'Likes (blog + projects)', visitors: totalLikes, percentage: 0 },
    { source: 'Contacts', visitors: contactsCount, percentage: 0 },
    { source: 'Reviews', visitors: recentReviews.length, percentage: 0 },
  ];
  const trafficTotal = trafficSources.reduce((s, x) => s + x.visitors, 0) || 1;
  trafficSources.forEach((s) => (s.percentage = Math.round((s.visitors / trafficTotal) * 100)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <span className="text-secondary">{'>'}</span> Analytics
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Live data from your blog posts, projects, likes, reviews, and contacts.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-cyan-400' },
          { label: 'Total Likes', value: totalLikes.toLocaleString(), icon: Heart, color: 'text-pink-500' },
          { label: 'Contacts', value: contactsCount.toLocaleString(), icon: Mail, color: 'text-yellow-500' },
          { label: 'Avg Rating', value: avgRating.toString(), icon: Star, color: 'text-primary' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg bg-card/50 border border-border/50"
          >
            <stat.icon className={cn('w-5 h-5 mb-2', stat.color)} />
            <p className={cn('text-2xl font-bold font-mono', stat.color)}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="p-4 rounded-lg bg-card/50 border border-border/50"
        >
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Engagement — last {DAYS} days
          </h3>
          <div className="space-y-2">
            {weeklyLikes.map((d) => (
              <div key={d.day + Math.random()} className="flex items-center gap-3">
                <span className="w-8 text-xs text-muted-foreground font-mono">{d.day}</span>
                <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(d.views / maxBucket) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary/50 to-primary rounded"
                  />
                </div>
                <span className="w-10 text-xs text-primary font-mono text-right">{d.views}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="p-4 rounded-lg bg-card/50 border border-border/50"
        >
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Engagement breakdown
          </h3>
          <div className="space-y-3">
            {trafficSources.map((s, index) => (
              <div key={s.source} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.source}</span>
                  <span className="text-foreground font-mono">{s.visitors} · {s.percentage}%</span>
                </div>
                <div className="h-2 bg-muted/30 rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={cn('h-full rounded',
                      index === 0 ? 'bg-primary' :
                      index === 1 ? 'bg-pink-500' :
                      index === 2 ? 'bg-yellow-500' : 'bg-cyan-400'
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-card/50 border border-border/50"
        >
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Top blog posts
          </h3>
          {topPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            <div className="space-y-3">
              {topPosts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <span className="w-6 h-6 rounded bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.views.toLocaleString()} views · {p.likes} likes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-card/50 border border-border/50"
        >
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-yellow-500" />
            Top projects
          </h3>
          {topProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            <div className="space-y-3">
              {topProjects.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <span className="w-6 h-6 rounded bg-yellow-500/20 text-yellow-500 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.likes} likes · {p.reviews.length} reviews</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
