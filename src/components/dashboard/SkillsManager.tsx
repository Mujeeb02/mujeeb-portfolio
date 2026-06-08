import { useState } from 'react';
import { useSiteContent, Skill } from '@/contexts/SiteContentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Plus, Edit2, Trash2, X, Save } from 'lucide-react';

const empty = { name: '', level: 50, category: 'General', sort_order: 0 };

export const SkillsManager = () => {
  const { skills, createSkill, updateSkill, deleteSkill } = useSiteContent();
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  const startCreate = () => { setEditing(null); setForm({ ...empty, sort_order: (skills[skills.length-1]?.sort_order ?? 0) + 1 }); setOpen(true); };
  const startEdit = (s: Skill) => { setEditing(s); setForm({ name: s.name, level: s.level, category: s.category, sort_order: s.sort_order }); setOpen(true); };

  const save = async () => {
    if (!form.name.trim()) return;
    const payload = { ...form, name: form.name.trim(), category: form.category.trim() || 'General', level: Math.max(0, Math.min(100, Number(form.level))) };
    if (editing) await updateSkill(editing.id, payload);
    else await createSkill(payload);
    setOpen(false);
  };

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s); return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Skills</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your skill matrix</p>
        </div>
        <Button onClick={startCreate} className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>

      {open && (
        <div className="rounded-lg border border-border p-4 bg-card/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{editing ? 'Edit skill' : 'New skill'}</h3>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <div>
              <label className="text-xs text-muted-foreground">Level: {form.level}%</label>
              <input type="range" min={0} max={100} value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })} className="w-full" />
            </div>
            <Input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </div>
          <Button onClick={save} className="bg-primary text-primary-foreground"><Save className="w-4 h-4 mr-2" />Save</Button>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([cat, list]) => (
          <div key={cat}>
            <h3 className="text-sm font-bold text-secondary mb-2">{cat}</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {list.map((s) => (
                <div key={s.id} className="p-3 rounded-lg bg-card/40 border border-border/50 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-foreground truncate">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.level}%</span>
                    </div>
                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${s.level}%` }} />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(s)}><Edit2 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => confirm(`Delete "${s.name}"?`) && deleteSkill(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {skills.length === 0 && <p className="text-muted-foreground text-center py-12">No skills yet</p>}
      </div>
    </div>
  );
};
