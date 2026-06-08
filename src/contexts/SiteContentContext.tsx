import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Experience {
  id: string; title: string; company: string; period: string;
  description: string; technologies: string[]; sort_order: number;
}
export interface Skill {
  id: string; name: string; level: number; category: string; sort_order: number;
}
export interface Certification {
  id: string; name: string; issuer: string; year: string;
  description: string; image_url: string | null; credential_url: string | null; sort_order: number;
}
export interface SiteBio {
  id: string; headline: string; paragraphs: string[]; location: string; availability: string;
}

interface Ctx {
  experiences: Experience[];
  skills: Skill[];
  certifications: Certification[];
  bio: SiteBio | null;
  loading: boolean;
  refresh: () => Promise<void>;
  createExperience: (e: Omit<Experience, 'id'>) => Promise<void>;
  updateExperience: (id: string, e: Partial<Experience>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  createSkill: (s: Omit<Skill, 'id'>) => Promise<void>;
  updateSkill: (id: string, s: Partial<Skill>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  createCertification: (c: Omit<Certification, 'id'>) => Promise<void>;
  updateCertification: (id: string, c: Partial<Certification>) => Promise<void>;
  deleteCertification: (id: string) => Promise<void>;
  saveBio: (b: Partial<SiteBio>) => Promise<void>;
}

const SiteContentContext = createContext<Ctx | undefined>(undefined);
const db = supabase as any;

export const SiteContentProvider = ({ children }: { children: ReactNode }) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [bio, setBio] = useState<SiteBio | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [exp, sk, ce, bi] = await Promise.all([
      db.from('experiences').select('*').order('sort_order'),
      db.from('skills').select('*').order('sort_order'),
      db.from('certifications').select('*').order('sort_order'),
      db.from('site_bio').select('*').limit(1).maybeSingle(),
    ]);
    if (exp.data) setExperiences(exp.data);
    if (sk.data) setSkills(sk.data);
    if (ce.data) setCertifications(ce.data);
    if (bi.data) setBio(bi.data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const run = async (builder: any, ok: string) => {
    const { error } = await builder;
    if (error) { toast.error(error.message); return; }
    toast.success(ok);
    await refresh();
  };

  const value: Ctx = {
    experiences, skills, certifications, bio, loading, refresh,
    createExperience: (e) => run(db.from('experiences').insert(e), 'Experience added'),
    updateExperience: (id, e) => run(db.from('experiences').update(e).eq('id', id), 'Experience updated'),
    deleteExperience: (id) => run(db.from('experiences').delete().eq('id', id), 'Experience deleted'),
    createSkill: (s) => run(db.from('skills').insert(s), 'Skill added'),
    updateSkill: (id, s) => run(db.from('skills').update(s).eq('id', id), 'Skill updated'),
    deleteSkill: (id) => run(db.from('skills').delete().eq('id', id), 'Skill deleted'),
    createCertification: (c) => run(db.from('certifications').insert(c), 'Certification added'),
    updateCertification: (id, c) => run(db.from('certifications').update(c).eq('id', id), 'Certification updated'),
    deleteCertification: (id) => run(db.from('certifications').delete().eq('id', id), 'Certification deleted'),
    saveBio: async (b) => {
      if (bio) await run(db.from('site_bio').update(b).eq('id', bio.id), 'Bio saved');
      else await run(db.from('site_bio').insert(b), 'Bio saved');
    },
  };

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
};

export const useSiteContent = () => {
  const c = useContext(SiteContentContext);
  if (!c) throw new Error('useSiteContent must be inside SiteContentProvider');
  return c;
};
