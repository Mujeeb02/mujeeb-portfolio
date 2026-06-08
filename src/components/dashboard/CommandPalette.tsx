import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  Search, FileText, FolderGit2, Settings, Terminal, Activity, Bell, LogOut,
  LayoutDashboard, Plus, Eye, BarChart3, Home, Mail, Briefcase, Sparkles, Award, User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlog } from '@/contexts/BlogContext';
import { useProjects } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'system' | 'content';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  onCreatePost: () => void;
}

export const CommandPalette = ({
  isOpen, onClose, onNavigate, onLogout, onCreatePost,
}: CommandPaletteProps) => {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { posts } = useBlog();
  const { projects } = useProjects();
  const [contacts, setContacts] = useState<{ id: string; name: string; email: string; subject: string }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    supabase.from('contacts').select('id,name,email,subject').order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => setContacts(data ?? []));
  }, [isOpen]);

  const staticCommands: Command[] = useMemo(() => [
    { id: 'overview', label: 'Go to Overview', icon: LayoutDashboard, shortcut: 'G O', action: () => onNavigate('overview'), category: 'navigation' },
    { id: 'blog', label: 'Go to Blog Posts', icon: FileText, shortcut: 'G B', action: () => onNavigate('blog'), category: 'navigation' },
    { id: 'projects', label: 'Go to Projects', icon: FolderGit2, shortcut: 'G P', action: () => onNavigate('projects'), category: 'navigation' },
    { id: 'experience', label: 'Go to Experience', icon: Briefcase, action: () => onNavigate('experience'), category: 'navigation' },
    { id: 'skills', label: 'Go to Skills', icon: Sparkles, action: () => onNavigate('skills'), category: 'navigation' },
    { id: 'certifications', label: 'Go to Certifications', icon: Award, action: () => onNavigate('certifications'), category: 'navigation' },
    { id: 'bio', label: 'Go to Bio', icon: User, action: () => onNavigate('bio'), category: 'navigation' },
    { id: 'contacts', label: 'Go to Contacts', icon: Mail, action: () => onNavigate('contacts'), category: 'navigation' },
    { id: 'analytics', label: 'Go to Analytics', icon: BarChart3, shortcut: 'G A', action: () => onNavigate('analytics'), category: 'navigation' },
    { id: 'activity', label: 'Go to Activity Log', icon: Activity, shortcut: 'G L', action: () => onNavigate('activity'), category: 'navigation' },
    { id: 'terminal', label: 'Open Terminal', icon: Terminal, shortcut: 'G T', action: () => onNavigate('terminal'), category: 'navigation' },
    { id: 'settings', label: 'Go to Settings', icon: Settings, shortcut: 'G S', action: () => onNavigate('settings'), category: 'navigation' },
    { id: 'notifications', label: 'View Notifications', icon: Bell, action: () => onNavigate('notifications'), category: 'navigation' },
    { id: 'new-post', label: 'Create New Post', description: 'Write a new blog post', icon: Plus, shortcut: 'N', action: onCreatePost, category: 'actions' },
    { id: 'preview', label: 'Preview Site', description: 'Open site in new tab', icon: Eye, action: () => window.open('/', '_blank'), category: 'actions' },
    { id: 'home', label: 'Go to Homepage', icon: Home, action: () => { window.location.href = '/'; }, category: 'actions' },
    { id: 'logout', label: 'Logout', description: 'End current session', icon: LogOut, shortcut: '⌘⇧L', action: onLogout, category: 'system' },
  ], [onNavigate, onCreatePost, onLogout]);

  const contentCommands: Command[] = useMemo(() => {
    const items: Command[] = [];
    posts.slice(0, 30).forEach((p) => items.push({
      id: `post-${p.id}`, label: p.title, description: `Post · ${p.status}`,
      icon: FileText, category: 'content',
      action: () => window.open(`/blog/${p.slug}`, '_blank'),
    }));
    projects.slice(0, 30).forEach((p) => items.push({
      id: `proj-${p.id}`, label: p.title, description: 'Project',
      icon: FolderGit2, category: 'content',
      action: () => { if (p.liveUrl) window.open(p.liveUrl, '_blank'); else onNavigate('projects'); },
    }));
    contacts.forEach((c) => items.push({
      id: `contact-${c.id}`, label: `${c.name} <${c.email}>`, description: c.subject || 'Contact message',
      icon: Mail, category: 'content',
      action: () => onNavigate('contacts'),
    }));
    return items;
  }, [posts, projects, contacts, onNavigate]);

  const allCommands = useMemo(() => [...staticCommands, ...contentCommands], [staticCommands, contentCommands]);

  const q = search.toLowerCase().trim();
  const filteredCommands = q
    ? allCommands.filter((c) => c.label.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
    : staticCommands;

  const groupedCommands = {
    navigation: filteredCommands.filter((c) => c.category === 'navigation'),
    actions: filteredCommands.filter((c) => c.category === 'actions'),
    content: filteredCommands.filter((c) => c.category === 'content'),
    system: filteredCommands.filter((c) => c.category === 'system'),
  };

  const flatCommands = [
    ...groupedCommands.content,
    ...groupedCommands.navigation,
    ...groupedCommands.actions,
    ...groupedCommands.system,
  ];

  const executeCommand = useCallback((command: Command) => {
    command.action();
    onClose();
    setSearch('');
    setSelectedIndex(0);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatCommands.length) % flatCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatCommands[selectedIndex]) {
          executeCommand(flatCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, flatCommands, executeCommand, onClose]);

  if (!mounted || !isOpen) return null;

  const CategorySection = ({ title, commands: cmds }: { title: string; commands: Command[] }) => {
    if (cmds.length === 0) return null;
    
    return (
      <div className="py-2">
        <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </div>
        {cmds.map((cmd) => {
          const globalIndex = flatCommands.indexOf(cmd);
          return (
            <button
              key={cmd.id}
              onClick={() => executeCommand(cmd)}
              onMouseEnter={() => setSelectedIndex(globalIndex)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 transition-colors',
                globalIndex === selectedIndex
                  ? 'bg-primary/20 text-primary'
                  : 'text-foreground hover:bg-muted/50'
              )}
            >
              <cmd.icon className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{cmd.label}</div>
                {cmd.description && (
                  <div className="text-xs text-muted-foreground">{cmd.description}</div>
                )}
              </div>
              {cmd.shortcut && (
                <div className="flex gap-1">
                  {cmd.shortcut.split(' ').map((key, i) => (
                    <kbd
                      key={i}
                      className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const content = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.15 }}
        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[10000]"
      >
        <div className="bg-card border border-border rounded-xl shadow-2xl shadow-primary/10 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-[400px] overflow-y-auto">
            {flatCommands.length > 0 ? (
              <>
                <CategorySection title="Results" commands={groupedCommands.content} />
                <CategorySection title="Navigation" commands={groupedCommands.navigation} />
                <CategorySection title="Actions" commands={groupedCommands.actions} />
                <CategorySection title="System" commands={groupedCommands.system} />
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No commands found for "{search}"</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">↵</kbd>
                select
              </span>
            </div>
            <span className="text-primary font-mono">v3.0</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
