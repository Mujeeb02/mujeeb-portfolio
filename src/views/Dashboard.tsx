"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sun, Moon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Dashboard Components
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { OverviewPanel } from '@/components/dashboard/OverviewPanel';
import { BlogManager } from '@/components/dashboard/BlogManager';
import { ProjectsManager } from '@/components/dashboard/ProjectsManager';
import { ContactsManager } from '@/components/dashboard/ContactsManager';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { ActivityLog } from '@/components/dashboard/ActivityLog';
import { TerminalPanel } from '@/components/dashboard/TerminalPanel';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { SettingsPanel } from '@/components/dashboard/SettingsPanel';
import { ExperienceManager } from '@/components/dashboard/ExperienceManager';
import { SkillsManager } from '@/components/dashboard/SkillsManager';
import { CertificationsManager } from '@/components/dashboard/CertificationsManager';
import { BioManager } from '@/components/dashboard/BioManager';

type TabType = 'overview' | 'blog' | 'projects' | 'contacts' | 'analytics' | 'activity' | 'terminal' | 'notifications' | 'settings' | 'experience' | 'skills' | 'certifications' | 'bio';

const Dashboard = () => {
  const { user, isAuthenticated, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [lightMode, setLightMode] = useState(false);

  // Read initial values after hydration
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarCollapsed(true);
    if (localStorage.getItem('dashboard-theme') === 'light') setLightMode(true);
  }, []);

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) setSidebarCollapsed(true);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Persist + apply light theme
  useEffect(() => {
    localStorage.setItem('dashboard-theme', lightMode ? 'light' : 'dark');
  }, [lightMode]);

  // load unread notification count
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      if (!cancelled) setUnreadNotifications(count ?? 0);
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [user, activeTab]);

  const handleLogout = useCallback(async () => {
    await signOut();
    router.push('/login');
  }, [signOut, router]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette (Cmd+K or Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      // Escape to close command palette
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
      // Quick navigation shortcuts (when command palette is closed)
      if (!commandPaletteOpen && e.key === 'g') {
        // Wait for next key
        const handleNextKey = (nextE: KeyboardEvent) => {
          const shortcuts: Record<string, TabType> = {
            'o': 'overview',
            'b': 'blog',
            'p': 'projects',
            'a': 'analytics',
            'l': 'activity',
            't': 'terminal',
            's': 'settings',
          };
          if (shortcuts[nextE.key]) {
            setActiveTab(shortcuts[nextE.key]);
          }
          window.removeEventListener('keydown', handleNextKey);
        };
        window.addEventListener('keydown', handleNextKey, { once: true });
        setTimeout(() => window.removeEventListener('keydown', handleNextKey), 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen]);

  if (loading) return null;
  if (!isAuthenticated || !user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <Shield className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Access denied</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Your account ({user.email}) does not have admin privileges. Ask the site owner to grant you the admin role.
        </p>
        <button onClick={handleLogout} className="text-primary hover:underline">Sign out</button>
      </div>
    );
  }

  const handleNavigate = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  const handleCreatePost = () => {
    setActiveTab('blog');
    // The BlogManager component handles the create flow internally
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPanel onNavigate={handleNavigate} />;
      case 'blog':
        return <BlogManager />;
      case 'projects':
        return <ProjectsManager />;
      case 'contacts':
        return <ContactsManager />;
      case 'experience':
        return <ExperienceManager />;
      case 'skills':
        return <SkillsManager />;
      case 'certifications':
        return <CertificationsManager />;
      case 'bio':
        return <BioManager />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'activity':
        return <ActivityLog />;
      case 'terminal':
        return <TerminalPanel onLogout={handleLogout} />;
      case 'notifications':
        return <NotificationsPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <OverviewPanel onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className={`min-h-screen bg-background flex ${lightMode ? 'dashboard-light' : ''}`}>
      {/* Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={handleNavigate}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        onLogout={handleLogout}
        unreadNotifications={unreadNotifications}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-muted-foreground font-mono truncate">/{activeTab}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-colors text-sm"
              >
                <span className="hidden sm:inline">Search</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">⌘K</kbd>
              </button>
              <button
                onClick={() => setLightMode((v) => !v)}
                className="p-1.5 rounded-lg bg-muted/30 border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                title={lightMode ? 'Switch to dark' : 'Switch to light'}
              >
                {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-primary font-mono truncate max-w-[180px]">{user.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/30 p-4 text-center text-xs text-muted-foreground font-mono">
          <p>Dashboard v3.0 | Session expires in 24 hours | All actions are logged</p>
        </footer>
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onCreatePost={handleCreatePost}
      />
    </div>
  );
};

export default Dashboard;
