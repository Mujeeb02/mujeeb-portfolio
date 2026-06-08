import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, Heart, FileText, FolderGit2, Zap, ArrowRight, Mail, Inbox,
  Activity, Clock, Plus, BarChart3, Sparkles as SparklesIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBlog } from '@/contexts/BlogContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';

interface OverviewPanelProps {
  onNavigate: (tab: string) => void;
}

const DAYS = 30;

const bucketByDay = (timestamps: string[]) => {
  const buckets = new Array<number>(DAYS).fill(0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = now.getTime() - (DAYS - 1) * 86400000;
  for (const t of timestamps) {
    const d = new Date(t).getTime();
    const idx = Math.floor((d - start) / 86400000);
    if (idx >= 0 && idx < DAYS) buckets[idx] += 1;
  }
  return buckets;
};

interface ActivityRow {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
}

export const OverviewPanel = ({ onNavigate }: OverviewPanelProps) => {
  const { posts } = useBlog();
  const { projects } = useProjects();
  const { user } = useAuth();
  const router = useRouter();

  const [contactsTotal, setContactsTotal] = useState(0);
  const [contactsNew, setContactsNew] = useState(0);
  const [viewsSeries, setViewsSeries] = useState<number[]>([]);
  const [likesSeries, setLikesSeries] = useState<number[]>([]);
  const [contactsSeries, setContactsSeries] = useState<number[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityRow[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - DAYS * 86400000).toISOString();
      const [contacts, contactsNewQ, blogLikes, projLikes, blogPostsRecent, activity] = await Promise.all([
        supabase.from('contacts').select('created_at').gte('created_at', since),
        supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('blog_likes').select('created_at').gte('created_at', since),
        supabase.from('project_likes').select('created_at').gte('created_at', since),
        supabase.from('blog_posts').select('created_at').gte('created_at', since),
        supabase.from('activity_log').select('id,type,title,description,created_at').order('created_at', { ascending: false }).limit(6),
      ]);

      setContactsTotal(contacts.data?.length ?? 0);
      setContactsNew(contactsNewQ.count ?? 0);
      setContactsSeries(bucketByDay((contacts.data ?? []).map((r) => r.created_at)));
      setLikesSeries(bucketByDay([
        ...(blogLikes.data ?? []).map((r) => r.created_at),
        ...(projLikes.data ?? []).map((r) => r.created_at),
      ]));
      // proxy for daily "engagement": new posts + likes as a stand-in for views by day
      setViewsSeries(bucketByDay([
        ...(blogPostsRecent.data ?? []).map((r) => r.created_at),
        ...(blogLikes.data ?? []).map((r) => r.created_at),
      ]));
      setRecentActivity((activity.data ?? []) as ActivityRow[]);
    })();
  }, []);

  const stats = {
    totalViews: posts.reduce((s, p) => s + p.views, 0),
    totalLikes: posts.reduce((s, p) => s + p.likes, 0) + projects.reduce((s, p) => s + p.likes, 0),
    totalPosts: posts.length,
    publishedPosts: posts.filter((p) => p.status === 'published').length,
    draftPosts: posts.filter((p) => p.status === 'draft').length,
    totalProjects: projects.length,
  };

  const displayName = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'admin';

  const sparkCards = [
    { label: 'Views (30d)', value: stats.totalViews.toLocaleString(), series: viewsSeries, icon: Eye, stroke: 'text-cyan-400', fill: 'text-cyan-400/15' },
    { label: 'Likes (30d)', value: stats.totalLikes.toLocaleString(), series: likesSeries, icon: Heart, stroke: 'text-pink-500', fill: 'text-pink-500/15' },
    { label: 'Contacts (30d)', value: contactsTotal.toLocaleString(), series: contactsSeries, icon: Mail, stroke: 'text-primary', fill: 'text-primary/15', sublabel: contactsNew > 0 ? `${contactsNew} new` : 'No new' },
  ];

  const counters = [
    { label: 'Blog Posts', value: stats.totalPosts, sublabel: `${stats.publishedPosts} published · ${stats.draftPosts} drafts`, icon: FileText, color: 'text-primary', onClick: () => onNavigate('blog') },
    { label: 'Projects', value: stats.totalProjects, sublabel: `${projects.filter((p) => p.featured).length} featured`, icon: FolderGit2, color: 'text-yellow-500', onClick: () => onNavigate('projects') },
  ];

  const quickActions = [
    { icon: Plus, label: 'New Post', onClick: () => onNavigate('blog'), color: 'bg-primary/20 text-primary' },
    { icon: FolderGit2, label: 'New Project', onClick: () => onNavigate('projects'), color: 'bg-yellow-500/20 text-yellow-500' },
    { icon: Inbox, label: contactsNew > 0 ? `Messages (${contactsNew})` : 'Messages', onClick: () => onNavigate('contacts'), color: 'bg-purple-400/20 text-purple-400' },
    { icon: BarChart3, label: 'Analytics', onClick: () => onNavigate('analytics'), color: 'bg-cyan-400/20 text-cyan-400' },
    { icon: Eye, label: 'View Site', onClick: () => window.open('/', '_blank'), color: 'bg-muted text-foreground' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20"
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-sm text-primary font-mono">Welcome back</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Hello, <span className="text-primary">{displayName}</span>!
        </h1>
        <p className="text-muted-foreground mt-1">Last 30 days at a glance.</p>
      </motion.div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all text-sm"
          >
            <span className={cn('p-1.5 rounded', a.color)}><a.icon className="w-3.5 h-3.5" /></span>
            <span className="text-foreground">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Sparkline trend cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sparkCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <s.icon className={cn('w-4 h-4', s.stroke)} />
                {s.label}
              </div>
              {s.sublabel && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.sublabel}</span>}
            </div>
            <div className="flex items-end justify-between gap-3">
              <p className={cn('text-2xl font-bold font-mono', s.stroke)}>{s.value}</p>
              <Sparkline data={s.series} strokeClass={s.stroke} fillClass={s.fill} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Counter cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {counters.map((c) => (
          <button
            key={c.label}
            onClick={c.onClick}
            className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 transition-all text-left"
          >
            <div className={cn('p-3 rounded-lg bg-card', c.color)}><c.icon className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-xl font-bold font-mono', c.color)}>{c.value}</p>
              <p className="text-xs text-muted-foreground truncate">{c.sublabel}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Recent activity stream */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Recent activity
          </h2>
          <button onClick={() => onNavigate('activity')} className="text-sm text-primary hover:text-primary/80 font-mono">
            View all →
          </button>
        </div>
        {recentActivity.length === 0 ? (
          <div className="p-8 rounded-lg bg-card/30 border border-dashed border-border/50 text-center">
            <SparklesIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No activity yet — likes, reviews and contacts will show up here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/40 border border-border/50">
                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate"><span className="text-primary">{a.title}</span> · <span className="text-muted-foreground">{a.description}</span></p>
                </div>
                <span className="text-xs text-muted-foreground font-mono flex-shrink-0">{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>Signed in as: {user?.email ?? '—'}</span>
          <button onClick={() => router.push('/')} className="hover:text-primary">View public site →</button>
        </div>
      </div>
    </div>
  );
};
