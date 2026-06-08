import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Trash2, CheckCircle, Archive, Inbox, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const STATUS_FILTERS = ['all', 'new', 'read', 'archived'] as const;
type Filter = typeof STATUS_FILTERS[number];

const statusStyles: Record<string, string> = {
  new: 'bg-primary/20 text-primary',
  read: 'bg-cyan-400/20 text-cyan-400',
  archived: 'bg-muted text-muted-foreground',
};

const formatTimeAgo = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

export const ContactsManager = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Contact | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setContacts((data ?? []) as Contact[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('contacts').update({ status }).eq('id', id);
    if (error) return toast.error(error.message);
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) return toast.error(error.message);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success('Contact deleted');
  };

  const filtered = filter === 'all' ? contacts : contacts.filter((c) => c.status === filter);
  const counts = {
    all: contacts.length,
    new: contacts.filter((c) => c.status === 'new').length,
    read: contacts.filter((c) => c.status === 'read').length,
    archived: contacts.filter((c) => c.status === 'archived').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Inbox className="w-5 h-5 text-primary" />
            <span className="text-secondary">{'>'}</span> Contacts
            {counts.new > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-destructive text-destructive-foreground">
                {counts.new} new
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Messages submitted through your portfolio's contact form
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors',
              filter === f
                ? 'bg-primary/20 text-primary'
                : 'bg-muted/30 text-muted-foreground hover:text-foreground'
            )}
          >
            {f} <span className="ml-1 opacity-60">({counts[f]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground font-mono">Loading contacts…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No messages here yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Submissions from your /contact page will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {filtered.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  setSelected(c);
                  if (c.status === 'new') updateStatus(c.id, 'read');
                }}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all',
                  selected?.id === c.id
                    ? 'bg-primary/10 border-primary/40'
                    : c.status === 'new'
                      ? 'bg-card/50 border-primary/30 hover:border-primary/50'
                      : 'bg-card/30 border-border/40 hover:border-border'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                  </div>
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-mono', statusStyles[c.status])}>
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1">{c.subject || '(no subject)'}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">{formatTimeAgo(c.created_at)}</p>
              </motion.button>
            ))}
          </div>

          <div className="lg:col-span-3">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-lg bg-card/50 border border-border/50 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-foreground">{selected.subject || '(no subject)'}</h3>
                    <p className="text-sm text-muted-foreground">
                      From <span className="text-foreground">{selected.name}</span> ·{' '}
                      <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>
                    </p>
                    <p className="text-xs text-muted-foreground/70 font-mono mt-1">
                      {new Date(selected.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded text-xs font-mono', statusStyles[selected.status])}>
                    {selected.status}
                  </span>
                </div>

                <div className="p-4 rounded bg-muted/30 border border-border/30 whitespace-pre-wrap text-sm text-foreground">
                  {selected.message}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                  <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || 'your message')}`)}>
                    <ExternalLink className="w-3 h-3 mr-1" /> Reply
                  </Button>
                  {selected.status !== 'read' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'read')}>
                      <CheckCircle className="w-3 h-3 mr-1" /> Mark read
                    </Button>
                  )}
                  {selected.status !== 'archived' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'archived')}>
                      <Archive className="w-3 h-3 mr-1" /> Archive
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/40 hover:bg-destructive/10" onClick={() => remove(selected.id)}>
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[300px] flex items-center justify-center text-muted-foreground font-mono text-sm border border-dashed border-border/40 rounded-lg">
                Select a message to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
