import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderGit2, Star, ExternalLink, Github, Plus, Search, Trash2, Edit2, X, Save, Heart, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProjects, Project } from '@/contexts/ProjectContext';

type Mode = 'list' | 'edit';

const emptyForm = { title: '', description: '', tagsRaw: '', githubUrl: '', liveUrl: '', featured: false };

export const ProjectsManager = () => {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<Mode>('list');
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: projects.length,
    featured: projects.filter((p) => p.featured).length,
    likes: projects.reduce((a, p) => a + p.likes, 0),
    reviews: projects.reduce((a, p) => a + p.reviews.length, 0),
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setMode('edit'); };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description, tagsRaw: p.tags.join(', '),
      githubUrl: p.githubUrl ?? '', liveUrl: p.liveUrl ?? '', featured: !!p.featured,
    });
    setMode('edit');
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      tags: form.tagsRaw.split(',').map((t) => t.trim()).filter(Boolean),
      githubUrl: form.githubUrl.trim() || undefined,
      liveUrl: form.liveUrl.trim() || undefined,
      featured: form.featured,
    };
    if (editing) await updateProject(editing.id, payload);
    else await createProject(payload);
    setSaving(false);
    setMode('list');
    setEditing(null);
  };

  const handleDelete = async (p: Project) => {
    if (confirm(`Delete project "${p.title}"?`)) await deleteProject(p.id);
  };

  if (mode === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-primary" />
            {editing ? 'Edit Project' : 'New Project'}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setMode('list')}><X className="w-4 h-4 mr-1" />Cancel</Button>
        </div>
        <div className="space-y-3 max-w-2xl">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input placeholder="Tags (comma separated)" value={form.tagsRaw} onChange={(e) => setForm({ ...form, tagsRaw: e.target.value })} />
          <Input placeholder="GitHub URL" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
          <Input placeholder="Live demo URL" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured
          </label>
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-primary" />
            <span className="text-secondary">{'>'}</span> Projects
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your portfolio projects</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />Add Project
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Featured', value: stats.featured, color: 'text-primary', icon: Star },
          { label: 'Likes', value: stats.likes, color: 'text-pink-500', icon: Heart },
          { label: 'Reviews', value: stats.reviews, color: 'text-cyan-400', icon: MessageSquare },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-card/50 border border-border/50">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn('text-2xl font-bold font-mono flex items-center gap-1', s.color)}>
              {s.icon && <s.icon className="w-4 h-4" />}{s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-foreground group-hover:text-primary">{p.title}</h3>
                  {p.featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.tags.slice(0, 4).map((t) => (
                    <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground">#{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{p.likes}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{p.reviews.length}</span>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"><Github className="w-3 h-3" />Source</a>}
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-primary"><ExternalLink className="w-3 h-3" />Demo</a>}
                  <div className="ml-auto flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="h-7 w-7 p-0"><Edit2 className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p)} className="h-7 w-7 p-0 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <FolderGit2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No projects found</p>
        </div>
      )}
    </div>
  );
};
