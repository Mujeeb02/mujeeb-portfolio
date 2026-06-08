import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Check, X, MessageCircle, Heart, Eye, AlertTriangle,
  CheckCircle, Info, Trash2, Mail, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

const iconMap: Record<string, React.ElementType> = {
  comment: MessageCircle, like: Heart, view: Eye, system: Info,
  warning: AlertTriangle, success: CheckCircle, contact: Mail, review: MessageCircle,
};
const colorMap: Record<string, string> = {
  comment: 'text-purple-400 bg-purple-400/20',
  like: 'text-pink-500 bg-pink-500/20',
  view: 'text-cyan-400 bg-cyan-400/20',
  system: 'text-blue-400 bg-blue-400/20',
  warning: 'text-yellow-500 bg-yellow-500/20',
  success: 'text-primary bg-primary/20',
  contact: 'text-cyan-400 bg-cyan-400/20',
  review: 'text-purple-400 bg-purple-400/20',
};

const FILTERS = ['All', 'Unread', 'Contacts', 'Likes', 'Reviews'] as const;
type Filter = typeof FILTERS[number];

const formatTimeAgo = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

export const NotificationsPanel = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('All');

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setItems((data ?? []) as Notification[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const markAllRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    if (error) return toast.error(error.message);
    setItems((p) => p.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = async (n: Notification) => {
    const next = !n.read;
    const { error } = await supabase.from('notifications').update({ read: next }).eq('id', n.id);
    if (error) return toast.error(error.message);
    setItems((p) => p.map((x) => (x.id === n.id ? { ...x, read: next } : x)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) return toast.error(error.message);
    setItems((p) => p.filter((x) => x.id !== id));
  };

  const clearAll = async () => {
    if (!user || !confirm('Clear all notifications?')) return;
    const { error } = await supabase.from('notifications').delete().eq('user_id', user.id);
    if (error) return toast.error(error.message);
    setItems([]);
  };

  const filtered = items.filter((n) => {
    switch (filter) {
      case 'Unread': return !n.read;
      case 'Contacts': return n.type === 'contact';
      case 'Likes': return n.type === 'like';
      case 'Reviews': return n.type === 'comment' || n.type === 'review';
      default: return true;
    }
  });

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <span className="text-secondary">{'>'}</span> Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-destructive text-destructive-foreground">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time updates from your portfolio activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn('w-3 h-3 mr-1', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <Check className="w-3 h-3 mr-1" /> Mark all read
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clearAll} disabled={items.length === 0}>
            <Trash2 className="w-3 h-3 mr-1" /> Clear all
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              filter === f
                ? 'bg-primary/20 text-primary'
                : 'bg-muted/30 text-muted-foreground hover:text-foreground'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground font-mono">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No notifications</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            We'll let you know when something happens.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n, index) => {
            const Icon = iconMap[n.type] ?? Info;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index, 20) * 0.03 }}
                onClick={() => toggleRead(n)}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border transition-colors group cursor-pointer relative',
                  n.read
                    ? 'bg-card/30 border-border/30 hover:border-border/50'
                    : 'bg-card/50 border-primary/30 hover:border-primary/50'
                )}
              >
                <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', colorMap[n.type] ?? 'text-muted-foreground bg-muted')}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className={cn('font-medium', n.read ? 'text-muted-foreground' : 'text-foreground')}>
                        {n.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted/50 rounded transition-all"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-mono">{formatTimeAgo(n.created_at)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
