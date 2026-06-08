import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  FolderGit2,
  Settings,
  Terminal,
  Activity,
  Bell,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Users,
  BarChart3,
  Briefcase,
  Sparkles,
  Award,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  unreadNotifications: number;
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'blog', label: 'Blog Posts', icon: FileText },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'bio', label: 'Bio / About', icon: User },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'activity', label: 'Activity Log', icon: Activity },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
];

const bottomItems = [
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const DashboardSidebar = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  onLogout,
  unreadNotifications,
}: SidebarProps) => {
  const MenuItem = ({ item, showBadge = false }: { item: typeof menuItems[0]; showBadge?: boolean }) => {
    const isActive = activeTab === item.id;
    const content = (
      <button
        onClick={() => onTabChange(item.id)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
          isActive
            ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(0,255,65,0.15)]'
            : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
        )}
      >
        <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary')} />
        {!isCollapsed && (
          <span className="font-medium text-sm truncate">{item.label}</span>
        )}
        {showBadge && unreadNotifications > 0 && (
          <span className={cn(
            'absolute flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground',
            isCollapsed ? 'top-0 right-0' : 'ml-auto'
          )}>
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </span>
        )}
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
          />
        )}
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-card border-border">
            <span>{item.label}</span>
            {showBadge && unreadNotifications > 0 && (
              <span className="ml-2 text-destructive">({unreadNotifications})</span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ duration: 0.2 }}
      className="h-screen sticky top-0 flex flex-col border-r border-border/50 bg-card/30 backdrop-blur-sm"
    >
      {/* Header */}
      <div className={cn(
        'flex items-center h-14 border-b border-border/50 px-3',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm text-primary">Admin Panel</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </nav>

      {/* Keyboard Shortcut Hint */}
      {!isCollapsed && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 text-muted-foreground text-xs">
            <Keyboard className="w-4 h-4" />
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px]">⌘K</kbd>
            <span>for commands</span>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="p-3 space-y-1 border-t border-border/50">
        {bottomItems.map((item) => (
          <MenuItem 
            key={item.id} 
            item={item} 
            showBadge={item.id === 'notifications'}
          />
        ))}
        
        {/* Logout */}
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-card border-border">
              Logout
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        )}
      </div>

      {/* Back to site link */}
      <div className="p-3 border-t border-border/50">
        <Link href="/">
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card border-border">
                Back to Site
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors text-sm">
              <ChevronLeft className="w-4 h-4" />
              Back to Site
            </div>
          )}
        </Link>
      </div>
    </motion.aside>
  );
};
