import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    readTime: string;
    views: number;
    likes: number;
    tags: string[];
    status: 'published' | 'draft';
    featured?: boolean;
}

interface BlogContextType {
    posts: BlogPost[];
    loading: boolean;
    refresh: () => Promise<void>;
    createPost: (post: Omit<BlogPost, 'id' | 'date' | 'views' | 'likes'>) => Promise<BlogPost | null>;
    updatePost: (id: string, updates: Partial<BlogPost>) => Promise<BlogPost | null>;
    deletePost: (id: string) => Promise<boolean>;
    getPost: (id: string) => BlogPost | undefined;
    getPostBySlug: (slug: string) => BlogPost | undefined;
    toggleStatus: (id: string) => Promise<void>;
    likePost: (id: string) => Promise<void>;
    unlikePost: (id: string) => Promise<void>;
    isLiked: (id: string) => boolean;
    incrementViews: (id: string) => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const slugify = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const calculateReadTime = (content: string) => {
    const minutes = Math.ceil(content.split(/\s+/).length / 200);
    return `${Math.max(1, minutes)} min read`;
};

type DbRow = {
    id: string; slug: string; title: string; excerpt: string; content: string;
    read_time: string; views: number; tags: string[]; status: 'published' | 'draft';
    featured: boolean; created_at: string;
};

const toBlogPost = (row: DbRow, likes: number): BlogPost => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    date: row.created_at.split('T')[0],
    readTime: row.read_time,
    views: row.views,
    likes,
    tags: row.tags,
    status: row.status,
    featured: row.featured,
});

export const BlogProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        const { data: postRows, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch posts:', error);
            setLoading(false);
            return;
        }

        const { data: likeRows } = await supabase.from('blog_likes').select('post_id');
        const counts = new Map<string, number>();
        (likeRows ?? []).forEach((r) => counts.set(r.post_id, (counts.get(r.post_id) ?? 0) + 1));

        setPosts((postRows ?? []).map((r) => toBlogPost(r as DbRow, counts.get(r.id) ?? 0)));
        setLoading(false);
    }, []);

    const fetchUserLikes = useCallback(async (userId: string) => {
        const { data } = await supabase.from('blog_likes').select('post_id').eq('user_id', userId);
        setLikedPosts(new Set((data ?? []).map((r) => r.post_id)));
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        if (user) fetchUserLikes(user.id);
        else setLikedPosts(new Set());
    }, [user, fetchUserLikes]);

    const createPost: BlogContextType['createPost'] = useCallback(async (postData) => {
        const slug = postData.slug || slugify(postData.title);
        const { data, error } = await supabase.from('blog_posts').insert({
            slug,
            title: postData.title,
            excerpt: postData.excerpt,
            content: postData.content,
            read_time: calculateReadTime(postData.content),
            tags: postData.tags,
            status: postData.status,
            featured: postData.featured ?? false,
            author_id: user?.id ?? null,
        }).select().single();
        if (error) { toast.error(error.message); return null; }
        const newPost = toBlogPost(data as DbRow, 0);
        setPosts((prev) => [newPost, ...prev]);
        toast.success('Post created');
        return newPost;
    }, [user]);

    const updatePost: BlogContextType['updatePost'] = useCallback(async (id, updates) => {
        const patch: Database['public']['Tables']['blog_posts']['Update'] = {};
        if (updates.title !== undefined) { patch.title = updates.title; patch.slug = updates.slug || slugify(updates.title); }
        if (updates.slug !== undefined) patch.slug = updates.slug;
        if (updates.excerpt !== undefined) patch.excerpt = updates.excerpt;
        if (updates.content !== undefined) { patch.content = updates.content; patch.read_time = calculateReadTime(updates.content); }
        if (updates.tags !== undefined) patch.tags = updates.tags;
        if (updates.status !== undefined) patch.status = updates.status;
        if (updates.featured !== undefined) patch.featured = updates.featured;

        const { data, error } = await supabase.from('blog_posts').update(patch).eq('id', id).select().single();
        if (error) { toast.error(error.message); return null; }
        const existing = posts.find((p) => p.id === id);
        const updated = toBlogPost(data as DbRow, existing?.likes ?? 0);
        setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        toast.success('Post updated');
        return updated;
    }, [posts]);

    const deletePost: BlogContextType['deletePost'] = useCallback(async (id) => {
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) { toast.error(error.message); return false; }
        setPosts((prev) => prev.filter((p) => p.id !== id));
        toast.success('Post deleted');
        return true;
    }, []);

    const toggleStatus: BlogContextType['toggleStatus'] = useCallback(async (id) => {
        const post = posts.find((p) => p.id === id);
        if (!post) return;
        const next = post.status === 'published' ? 'draft' : 'published';
        const { error } = await supabase.from('blog_posts').update({ status: next }).eq('id', id);
        if (error) { toast.error(error.message); return; }
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: next } : p)));
    }, [posts]);

    const likePost: BlogContextType['likePost'] = useCallback(async (id) => {
        if (!user) { toast.error('Sign in to like posts'); return; }
        if (likedPosts.has(id)) return;
        const { error } = await supabase.from('blog_likes').insert({ post_id: id, user_id: user.id });
        if (error) { toast.error(error.message); return; }
        setLikedPosts((prev) => new Set([...prev, id]));
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
    }, [user, likedPosts]);

    const unlikePost: BlogContextType['unlikePost'] = useCallback(async (id) => {
        if (!user) return;
        const { error } = await supabase.from('blog_likes').delete().eq('post_id', id).eq('user_id', user.id);
        if (error) { toast.error(error.message); return; }
        setLikedPosts((prev) => { const n = new Set(prev); n.delete(id); return n; });
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: Math.max(0, p.likes - 1) } : p)));
    }, [user]);

    const incrementViews: BlogContextType['incrementViews'] = useCallback(async (id) => {
        await supabase.rpc('increment_post_views', { _post_id: id });
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p)));
    }, []);

    return (
        <BlogContext.Provider value={{
            posts, loading, refresh: fetchPosts,
            createPost, updatePost, deletePost,
            getPost: (id) => posts.find((p) => p.id === id),
            getPostBySlug: (slug) => posts.find((p) => p.slug === slug),
            toggleStatus, likePost, unlikePost,
            isLiked: (id) => likedPosts.has(id),
            incrementViews,
        }}>
            {children}
        </BlogContext.Provider>
    );
};

export const useBlog = () => {
    const ctx = useContext(BlogContext);
    if (!ctx) throw new Error('useBlog must be used within a BlogProvider');
    return ctx;
};
