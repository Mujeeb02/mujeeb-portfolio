import { useState } from 'react';
import { useSiteContent, Experience } from '@/contexts/SiteContentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Plus, Edit2, Trash2, X, Save, ChevronUp, ChevronDown } from 'lucide-react';

const empty = { title: '', company: '', period: '', description: '', techRaw: '', sort_order: 0 };

export const ExperienceManager = () => {
  const { experiences, createExperience, updateExperience, deleteExperience } = useSiteContent();
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  const startCreate = () => { setEditing(null); setForm({ ...empty, sort_order: (experiences[experiences.length-1]?.sort_order ?? 0) + 1 }); setOpen(true); };
  const startEdit = (e: Experience) => {
    setEditing(e);
    setForm({ title: e.title, company: e.company, period: e.period, description: e.description, techRaw: e.technologies.join(', '), sort_order: e.sort_order });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      title: form.title.trim(), company: form.company.trim(), period: form.period.trim(),
      description: form.description.trim(),
      technologies: form.techRaw.split(',').map(t => t.trim()).filter(Boolean),
      sort_order: Number(form.sort_order) || 0,
    };
    if (!payload.title || !payload.company) return;
    if (editing) await updateExperience(editing.id, payload);
    else await createExperience(payload);
    setOpen(false);
  };

  const reorder = async (e: Experience, dir: -1 | 1) => {
    await updateExperience(e.id, { sort_order: e.sort_order + dir });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" /> Experience
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your work history</p>
        </div>
        <Button onClick={startCreate} className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>

      {open && (
        <div className="rounded-lg border border-border p-4 bg-card/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{editing ? 'Edit experience' : 'New experience'}</h3>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <Input placeholder="Period (e.g. Jul 2024 - Present)" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
            <Input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </div>
          <Textarea placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input placeholder="Technologies (comma separated)" value={form.techRaw} onChange={(e) => setForm({ ...form, techRaw: e.target.value })} />
          <Button onClick={save} className="bg-primary text-primary-foreground"><Save className="w-4 h-4 mr-2" />Save</Button>
        </div>
      )}

      <div className="space-y-3">
        {experiences.map((e) => (
          <div key={e.id} className="p-4 rounded-lg bg-card/40 border border-border/50">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-foreground">{e.title}</h3>
                <p className="text-sm text-secondary">{e.company} · <span className="text-muted-foreground">{e.period}</span></p>
                <p className="text-sm text-muted-foreground mt-2">{e.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {e.technologies.map((t) => (
                    <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground">{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => reorder(e, -1)}><ChevronUp className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => reorder(e, 1)}><ChevronDown className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(e)}><Edit2 className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => confirm(`Delete "${e.title}"?`) && deleteExperience(e.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </div>
        ))}
        {experiences.length === 0 && <p className="text-muted-foreground text-center py-12">No experiences yet</p>}
      </div>
    </div>
  );
};
