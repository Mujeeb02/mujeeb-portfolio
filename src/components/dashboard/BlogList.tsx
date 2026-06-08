import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlog, BlogPost } from '@/contexts/BlogContext';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
    Search,
    Eye,
    Heart,
    Edit2,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Calendar,
    Tag,
    FileText,
    Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BlogListProps {
    onEdit: (postId: string) => void;
}

export const BlogList = ({ onEdit }: BlogListProps) => {
    const { posts, deletePost, toggleStatus } = useBlog();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
    const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());

    const filteredPosts = posts.filter((post) => {
        if (pendingDeleteIds.has(post.id)) return false;
        const matchesSearch =
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDeleteClick = (post: BlogPost) => {
        setPostToDelete(post);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!postToDelete) return;
        const post = postToDelete;
        setDeleteModalOpen(false);
        setPostToDelete(null);

        // Optimistically hide
        setPendingDeleteIds(prev => new Set(prev).add(post.id));

        let cancelled = false;
        const timer = window.setTimeout(async () => {
            if (cancelled) return;
            await deletePost(post.id);
            setPendingDeleteIds(prev => { const n = new Set(prev); n.delete(post.id); return n; });
        }, 6000);

        toast(`Deleted "${post.title}"`, {
            description: 'Will be permanently removed in 6s',
            duration: 6000,
            action: {
                label: 'Undo',
                onClick: () => {
                    cancelled = true;
                    window.clearTimeout(timer);
                    setPendingDeleteIds(prev => { const n = new Set(prev); n.delete(post.id); return n; });
                    toast.success('Restored');
                },
            },
        });
    };

    const stats = {
        total: posts.length,
        published: posts.filter(p => p.status === 'published').length,
        drafts: posts.filter(p => p.status === 'draft').length,
        totalViews: posts.reduce((sum, p) => sum + p.views, 0),
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Posts', value: stats.total, icon: FileText, color: 'text-primary' },
                    { label: 'Published', value: stats.published, icon: Sparkles, color: 'text-green-400' },
                    { label: 'Drafts', value: stats.drafts, icon: Edit2, color: 'text-yellow-400' },
                    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-cyan-400' },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <stat.icon className={cn('w-4 h-4', stat.color)} />
                            <span className="text-xs text-muted-foreground">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search posts by title or tag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card/50 border-border/50 focus:border-primary"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'published', 'draft'] as const).map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? 'outline' : 'ghost'}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                statusFilter === status && 'border-primary text-primary'
                            )}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-3">
                <AnimatePresence>
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    'group relative p-4 rounded-lg border backdrop-blur-sm transition-all duration-300',
                                    'bg-card/40 hover:bg-card/60',
                                    post.status === 'published'
                                        ? 'border-border/50 hover:border-primary/50'
                                        : 'border-yellow-500/30 hover:border-yellow-500/50',
                                    post.featured && 'ring-1 ring-primary/30'
                                )}
                            >
                                {/* Featured Badge */}
                                {post.featured && (
                                    <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/50 text-[10px] text-primary font-bold">
                                        FEATURED
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {/* Status Badge */}
                                            <span className={cn(
                                                'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                                                post.status === 'published'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            )}>
                                                {post.status}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {post.date}
                                            </span>
                                        </div>

                                        <h3 className="text-foreground font-semibold truncate group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h3>

                                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                            {post.excerpt}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <Tag className="w-3 h-3 text-muted-foreground" />
                                            {post.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-xs text-muted-foreground hover:text-secondary">
                                                    #{tag}
                                                </span>
                                            ))}
                                            {post.tags.length > 3 && (
                                                <span className="text-xs text-muted-foreground">+{post.tags.length - 3}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats & Actions */}
                                    <div className="flex items-center gap-4">
                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {post.views}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-4 h-4" />
                                                {post.likes}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleStatus(post.id)}
                                                title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                                                className="h-8 w-8 p-0"
                                            >
                                                {post.status === 'published' ? (
                                                    <ToggleRight className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <ToggleLeft className="w-4 h-4 text-yellow-400" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEdit(post.id)}
                                                className="h-8 w-8 p-0 hover:text-cyan-400"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteClick(post)}
                                                className="h-8 w-8 p-0 hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="text-4xl mb-4">📭</div>
                            <p className="text-muted-foreground">No posts found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                <span className="text-secondary">$</span> grep returned 0 results
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Delete Modal */}
            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setPostToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                postTitle={postToDelete?.title || ''}
            />
        </div>
    );
};
