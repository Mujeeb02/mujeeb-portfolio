import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface ProjectReview {
  id: string;
  projectId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  stars?: number;
  forks?: number;
  featured?: boolean;
  likes: number;
  reviews: ProjectReview[];
}

interface ProjectInput {
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  refresh: () => Promise<void>;
  createProject: (data: ProjectInput) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<ProjectInput>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  likeProject: (id: string) => Promise<void>;
  unlikeProject: (id: string) => Promise<void>;
  isLiked: (id: string) => boolean;
  addReview: (projectId: string, rating: number, comment: string, author?: string) => Promise<void>;
  getProjectReviews: (projectId: string) => ProjectReview[];
  getAverageRating: (projectId: string) => number;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

type DbProject = {
  id: string; title: string; description: string; tags: string[];
  github_url: string | null; live_url: string | null; featured: boolean; created_at: string;
};

type DbReview = {
  id: string; project_id: string; author_name: string;
  rating: number; comment: string; created_at: string;
};

const toReview = (r: DbReview): ProjectReview => ({
  id: r.id,
  projectId: r.project_id,
  author: r.author_name,
  rating: r.rating,
  comment: r.comment,
  date: r.created_at.split('T')[0],
});

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const [{ data: projectRows, error }, { data: likeRows }, { data: reviewRows }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('project_likes').select('project_id'),
      supabase.from('project_reviews').select('*').order('created_at', { ascending: false }),
    ]);

    if (error) {
      console.error('Failed to fetch projects:', error);
      setLoading(false);
      return;
    }

    const likeCounts = new Map<string, number>();
    (likeRows ?? []).forEach((r) => likeCounts.set(r.project_id, (likeCounts.get(r.project_id) ?? 0) + 1));
    const reviewsByProject = new Map<string, ProjectReview[]>();
    (reviewRows ?? []).forEach((r) => {
      const list = reviewsByProject.get(r.project_id) ?? [];
      list.push(toReview(r as DbReview));
      reviewsByProject.set(r.project_id, list);
    });

    setProjects((projectRows ?? []).map((r) => {
      const row = r as DbProject;
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        tags: row.tags,
        githubUrl: row.github_url ?? undefined,
        liveUrl: row.live_url ?? undefined,
        featured: row.featured,
        likes: likeCounts.get(row.id) ?? 0,
        reviews: reviewsByProject.get(row.id) ?? [],
      };
    }));
    setLoading(false);
  }, []);

  const fetchUserLikes = useCallback(async (userId: string) => {
    const { data } = await supabase.from('project_likes').select('project_id').eq('user_id', userId);
    setLikedProjects(new Set((data ?? []).map((r) => r.project_id)));
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => {
    if (user) fetchUserLikes(user.id);
    else setLikedProjects(new Set());
  }, [user, fetchUserLikes]);

  const createProject: ProjectContextType['createProject'] = useCallback(async (input) => {
    const { data, error } = await supabase.from('projects').insert({
      title: input.title,
      description: input.description,
      tags: input.tags,
      github_url: input.githubUrl || null,
      live_url: input.liveUrl || null,
      featured: input.featured ?? false,
    }).select().single();
    if (error) { toast.error(error.message); return null; }
    const row = data as DbProject;
    const newProject: Project = {
      id: row.id, title: row.title, description: row.description, tags: row.tags,
      githubUrl: row.github_url ?? undefined, liveUrl: row.live_url ?? undefined,
      featured: row.featured, likes: 0, reviews: [],
    };
    setProjects((prev) => [newProject, ...prev]);
    toast.success('Project created');
    return newProject;
  }, []);

  const updateProject: ProjectContextType['updateProject'] = useCallback(async (id, input) => {
    const patch: Database['public']['Tables']['projects']['Update'] = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.description !== undefined) patch.description = input.description;
    if (input.tags !== undefined) patch.tags = input.tags;
    if (input.githubUrl !== undefined) patch.github_url = input.githubUrl || null;
    if (input.liveUrl !== undefined) patch.live_url = input.liveUrl || null;
    if (input.featured !== undefined) patch.featured = input.featured;
    const { error } = await supabase.from('projects').update(patch).eq('id', id);
    if (error) { toast.error(error.message); return null; }
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, ...input } : p));
    toast.success('Project updated');
    return projects.find((p) => p.id === id) ?? null;
  }, [projects]);

  const deleteProject: ProjectContextType['deleteProject'] = useCallback(async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { toast.error(error.message); return false; }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success('Project deleted');
    return true;
  }, []);

  const likeProject: ProjectContextType['likeProject'] = useCallback(async (id) => {
    if (!user) { toast.error('Sign in to like projects'); return; }
    if (likedProjects.has(id)) return;
    const { error } = await supabase.from('project_likes').insert({ project_id: id, user_id: user.id });
    if (error) { toast.error(error.message); return; }
    setLikedProjects((prev) => new Set([...prev, id]));
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  }, [user, likedProjects]);

  const unlikeProject: ProjectContextType['unlikeProject'] = useCallback(async (id) => {
    if (!user) return;
    const { error } = await supabase.from('project_likes').delete().eq('project_id', id).eq('user_id', user.id);
    if (error) { toast.error(error.message); return; }
    setLikedProjects((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
  }, [user]);

  const addReview: ProjectContextType['addReview'] = useCallback(async (projectId, rating, comment, author) => {
    if (!user) { toast.error('Sign in to leave a review'); return; }
    const authorName = author?.trim() || user.email?.split('@')[0] || 'Anonymous';
    const { data, error } = await supabase.from('project_reviews').insert({
      project_id: projectId,
      author_id: user.id,
      author_name: authorName,
      rating: Math.min(5, Math.max(1, rating)),
      comment,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    const review = toReview(data as DbReview);
    setProjects((prev) => prev.map((p) =>
      p.id === projectId ? { ...p, reviews: [review, ...p.reviews] } : p
    ));
    toast.success('Review posted');
  }, [user]);

  return (
    <ProjectContext.Provider value={{
      projects, loading, refresh: fetchProjects,
      createProject, updateProject, deleteProject,
      likeProject, unlikeProject,
      isLiked: (id) => likedProjects.has(id),
      addReview,
      getProjectReviews: (id) => projects.find((p) => p.id === id)?.reviews ?? [],
      getAverageRating: (id) => {
        const r = projects.find((p) => p.id === id)?.reviews ?? [];
        if (!r.length) return 0;
        return r.reduce((a, x) => a + x.rating, 0) / r.length;
      },
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within a ProjectProvider');
  return ctx;
};
