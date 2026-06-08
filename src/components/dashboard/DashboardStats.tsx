import { motion } from 'framer-motion';
import { Eye, Heart, FileText, FolderGit2, Clock, Activity } from 'lucide-react';

interface StatsProps {
  stats: {
    totalViews: number;
    totalLikes: number;
    totalPosts: number;
    totalProjects: number;
    uptime: string;
    lastLogin: string;
  };
}

export const DashboardStats = ({ stats }: StatsProps) => {
  const statItems = [
    { icon: Eye, label: 'Total Views', value: stats.totalViews.toLocaleString(), color: 'text-cyan-400' },
    { icon: Heart, label: 'Total Likes', value: stats.totalLikes.toLocaleString(), color: 'text-pink-500' },
    { icon: FileText, label: 'Blog Posts', value: stats.totalPosts.toString(), color: 'text-primary' },
    { icon: FolderGit2, label: 'Projects', value: stats.totalProjects.toString(), color: 'text-yellow-500' },
    { icon: Clock, label: 'Uptime', value: stats.uptime, color: 'text-primary' },
    { icon: Activity, label: 'Last Login', value: stats.lastLogin, color: 'text-muted-foreground' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card/50 border border-border/50 rounded-lg p-3 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-xs text-muted-foreground truncate">{stat.label}</span>
          </div>
          <p className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
};
