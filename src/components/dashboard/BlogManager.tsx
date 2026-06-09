import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, List, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlogList } from './BlogList';
import BlogEditor from './editor/BlogEditor';

type TabType = 'list' | 'create' | 'edit';

export const BlogManager = () => {
    const [activeTab, setActiveTab] = useState<TabType>('list');
    const [editingPostId, setEditingPostId] = useState<string | null>(null);

    const handleEdit = (postId: string) => {
        setEditingPostId(postId);
        setActiveTab('edit');
    };

    const handleSave = () => {
        setActiveTab('list');
        setEditingPostId(null);
    };

    const handleCancel = () => {
        setActiveTab('list');
        setEditingPostId(null);
    };

    const tabs = [
        { id: 'list' as TabType, label: 'All Posts', icon: List, color: 'text-primary' },
        { id: 'create' as TabType, label: 'New Post', icon: Plus, color: 'text-cyan-400' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-secondary">{'>'}</span> Blog Manager
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Create, edit, and manage your blog posts</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1 rounded-lg bg-card/50 border border-border/50 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            if (tab.id === 'list') setEditingPostId(null);
                        }}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300',
                            activeTab === tab.id
                                ? 'bg-primary/20 text-primary shadow-[0_0_20px_rgba(0,255,65,0.2)]'
                                : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
                        )}
                    >
                        <tab.icon className={cn('w-4 h-4', activeTab === tab.id && tab.color)} />
                        {tab.label}
                    </button>
                ))}
                {activeTab === 'edit' && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-yellow-500/20 text-yellow-400">
                        <FileText className="w-4 h-4" />
                        Editing Post
                    </div>
                )}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'list' && (
                        <BlogList onEdit={handleEdit} />
                    )}
                    {activeTab === 'create' && (
                        <BlogEditor
                            mode="create"
                            onSave={handleSave}
                            onCancel={handleCancel}
                        />
                    )}
                    {activeTab === 'edit' && editingPostId && (
                        <BlogEditor
                            mode="edit"
                            postId={editingPostId}
                            onSave={handleSave}
                            onCancel={handleCancel}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
