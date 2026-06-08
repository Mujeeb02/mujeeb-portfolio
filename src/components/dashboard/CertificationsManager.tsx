import { useState } from 'react';
import { useSiteContent, Certification } from '@/contexts/SiteContentContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Award, Plus, Edit2, Trash2, X, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';

const empty = { name: '', issuer: '', year: '', description: '', image_url: '', credential_url: '', sort_order: 0 };

export const CertificationsManager = () => {
  const { certifications, createCertification, updateCertification, deleteCertification } = useSiteContent();
  const [editing, setEditing] = useState<Certification | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const startCreate = () => { setEditing(null); setForm({ ...empty, sort_order: (certifications[certifications.length-1]?.sort_order ?? 0) + 1 }); setOpen(true); };
  const startEdit = (c: Certification) => {
    setEditing(c);
    setForm({ name: c.name, issuer: c.issuer, year: c.year, description: c.description, image_url: c.image_url ?? '', credential_url: c.credential_url ?? '', sort_order: c.sort_order });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const path = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage.from('certificates').upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from('certificates').getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
    toast.success('Image uploaded');
  };

  const save = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(), issuer: form.issuer.trim(), year: form.year.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim() || null,
      credential_url: form.credential_url.trim() || null,
      sort_order: Number(form.sort_order) || 0,
    };
    if (editing) await updateCertification(editing.id, payload as any);
    else await createCertification(payload as any);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Award className="w-5 h-5 text-primary" />Certifications</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your certifications and credentials</p>
        </div>
        <Button onClick={startCreate} className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>

      {open && (
        <div className="rounded-lg border border-border p-4 bg-card/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{editing ? 'Edit certification' : 'New certification'}</h3>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Issuer" value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
            <Input placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            <Input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </div>
          <Textarea placeholder="Description (optional)" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input placeholder="Credential URL (optional)" value={form.credential_url} onChange={(e) => setForm({ ...form, credential_url: e.target.value })} />
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground flex items-center gap-2">
              Certificate image / document
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  <Upload className="w-3.5 h-3.5 mr-1" />{uploading ? 'Uploading…' : 'Upload'}
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                </label>
              </Button>
            </label>
            <Input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            {form.image_url && <img src={form.image_url} alt="" className="h-32 rounded border border-border object-cover" />}
          </div>
          <Button onClick={save} className="bg-primary text-primary-foreground"><Save className="w-4 h-4 mr-2" />Save</Button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {certifications.map((c) => (
          <div key={c.id} className="p-4 rounded-lg bg-card/40 border border-border/50">
            {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-32 object-cover rounded mb-3" />}
            <h3 className="font-bold text-foreground">{c.name}</h3>
            <p className="text-sm text-secondary">{c.issuer}</p>
            <p className="text-xs text-muted-foreground">{c.year}</p>
            {c.description && <p className="text-sm text-muted-foreground mt-2">{c.description}</p>}
            <div className="flex gap-1 mt-3 justify-end">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(c)}><Edit2 className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => confirm(`Delete "${c.name}"?`) && deleteCertification(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
      {certifications.length === 0 && <p className="text-muted-foreground text-center py-12">No certifications yet</p>}
    </div>
  );
};
