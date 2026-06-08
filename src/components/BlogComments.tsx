import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Comment {
  id: string; post_id: string; author_id: string | null; author_name: string;
  content: string; created_at: string;
}

export const BlogComments = ({ postId }: { postId: string }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from('blog_comments' as any).select('*').eq('post_id', postId).order('created_at', { ascending: false });
      if (mounted && data) setComments(data as any);
    };
    load();
    const channel = supabase.channel(`comments-${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_comments', filter: `post_id=eq.${postId}` }, () => load())
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [postId]);

  useEffect(() => {
    if (user?.email) setAuthorName(user.email.split('@')[0]);
  }, [user]);

  const submit = async () => {
    if (!user) { toast.error('Sign in to comment'); return; }
    const trimmed = content.trim();
    if (trimmed.length < 2) { toast.error('Comment is too short'); return; }
    if (trimmed.length > 1000) { toast.error('Comment too long (max 1000)'); return; }
    setPosting(true);
    const { error } = await supabase.from('blog_comments' as any).insert({
      post_id: postId, author_id: user.id,
      author_name: authorName.trim() || user.email?.split('@')[0] || 'Anonymous',
      content: trimmed,
    } as any);
    setPosting(false);
    if (error) { toast.error(error.message); return; }
    setContent('');
    toast.success('Comment posted');
  };

  const remove = async (c: Comment) => {
    if (!confirm('Delete this comment?')) return;
    const { error } = await supabase.from('blog_comments' as any).delete().eq('id', c.id);
    if (error) toast.error(error.message);
  };

  return (
    <section className="max-w-3xl mx-auto mt-12">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-secondary" />
        Comments <span className="text-muted-foreground text-sm">({comments.length})</span>
      </h2>

      {user ? (
        <div className="space-y-3 p-4 rounded-lg border border-border bg-card/40 mb-6">
          <Input placeholder="Display name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} maxLength={60} />
          <Textarea placeholder="Share your thoughts..." rows={3} value={content} onChange={(e) => setContent(e.target.value)} maxLength={1000} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{content.length}/1000</span>
            <Button onClick={submit} disabled={posting} className="bg-primary text-primary-foreground">
              <Send className="w-4 h-4 mr-2" />{posting ? 'Posting…' : 'Post comment'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-border bg-card/40 mb-6 text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">Sign in</Link> to leave a comment.
        </div>
      )}

      <div className="space-y-3">
        {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Be the first to comment.</p>}
        {comments.map((c) => (
          <div key={c.id} className="p-4 rounded-lg border border-border bg-card/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-foreground">{c.author_name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
                {user && c.author_id === user.id && (
                  <button onClick={() => remove(c)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
