import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Eye, Heart, Trash2, Edit, Plus, LogIn, Settings, Send,
  CheckCircle, AlertCircle, Clock, Mail, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string | null;
  created_at: string;
}

const iconMap: Record<string, React.ElementType> = {
  create: Plus, edit: Edit, delete: Trash2, publish: Send,
  view: Eye, like: Heart, login: LogIn, settings: Settings,
  comment: FileText, contact: Mail, review: FileText,
};

const colorMap: Record<string, string> = {
  create: 'text-primary bg-primary/20',
  edit: 'text-cyan-400 bg-cyan-400/20',
  delete: 'text-destructive bg-destructive/20',
  publish: 'text-primary bg-primary/20',
  view: 'text-blue-400 bg-blue-400/20',
  like: 'text-pink-500 bg-pink-500/20',
  login: 'text-yellow-500 bg-yellow-500/20',
  settings: 'text-muted-foreground bg-muted',
  comment: 'text-purple-400 bg-purple-400/20',
  contact: 'text-cyan-400 bg-cyan-400/20',
  review: 'text-purple-400 bg-purple-400/20',
};

const statusIconMap: Record<string, React.ElementType> = {
  success: CheckCircle, pending: Clock, error: AlertCircle,
};
const statusColorMap: Record<string, string> = {
  success: 'text-primary', pending: 'text-yellow-500', error: 'text-destructive',
};

const formatTimeAgo = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

export const ActivityLog = () => {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setItems((data ?? []) as ActivityItem[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const clearAll = async () => {
    if (!confirm('Clear the entire activity log?')) return;
    const { error } = await supabase.from('activity_log').delete().not('id', 'is', null);
    if (error) return toast.error(error.message);
    setItems([]);
    toast.success('Activity log cleared');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-secondary">{'>'}</span> Activity Log
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Recent events on your portfolio (live data)
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          {items.length > 0 && (
            <Button size="sm" variant="outline" className="text-destructive border-destructive/40 hover:bg-destructive/10" onClick={clearAll}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground font-mono">Loading activity…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No activity yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Contacts, likes, and reviews will show up here as they happen.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a, index) => {
            const Icon = iconMap[a.type] ?? FileText;
            const StatusIcon = a.status ? statusIconMap[a.status] : null;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index, 20) * 0.03 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', colorMap[a.type] ?? 'text-muted-foreground bg-muted')}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{a.title}</h3>
                    {StatusIcon && a.status && (
                      <StatusIcon className={cn('w-4 h-4', statusColorMap[a.status])} />
                    )}
                  </div>
                  {a.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{a.description}</p>
                  )}
                </div>
                <div className="flex-shrink-0 text-xs text-muted-foreground font-mono">
                  {formatTimeAgo(a.created_at)}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
