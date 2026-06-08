import { useState, useCallback } from 'react';
import { OutputLine } from '@/components/dashboard/CommandOutput';

interface BlogPost {
  id: string;
  title: string;
  status: 'published' | 'draft';
  views: number;
  likes: number;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  status: 'active' | 'archived';
  stars: number;
}

// Hardcoded data
const BLOG_POSTS: BlogPost[] = [
  { id: '1', title: 'Advanced React Patterns', status: 'published', views: 2847, likes: 156, createdAt: '2024-12-15' },
  { id: '2', title: 'Building Secure APIs', status: 'published', views: 1923, likes: 98, createdAt: '2024-12-10' },
  { id: '3', title: 'Terminal Aesthetics in Web', status: 'draft', views: 0, likes: 0, createdAt: '2024-12-20' },
  { id: '4', title: 'Cybersecurity Basics', status: 'published', views: 3421, likes: 234, createdAt: '2024-11-28' },
  { id: '5', title: 'Docker for Developers', status: 'published', views: 1567, likes: 87, createdAt: '2024-11-15' },
];

const PROJECTS: Project[] = [
  { id: '1', title: 'Neural Network Visualizer', status: 'active', stars: 342 },
  { id: '2', title: 'Crypto Portfolio Tracker', status: 'active', stars: 156 },
  { id: '3', title: 'Terminal CSS Framework', status: 'active', stars: 89 },
  { id: '4', title: 'API Security Scanner', status: 'archived', stars: 234 },
];

const HELP_TEXT = `
╔══════════════════════════════════════════════════════════════╗
║                    AVAILABLE COMMANDS                        ║
╠══════════════════════════════════════════════════════════════╣
║  help              - Show this help message                  ║
║  clear             - Clear terminal output                   ║
║  stats             - Display dashboard statistics            ║
║  whoami            - Display current user info               ║
║  uptime            - Show system uptime                      ║
║                                                              ║
║  BLOG MANAGEMENT:                                            ║
║  blog list         - List all blog posts                     ║
║  blog stats        - Show blog statistics                    ║
║  blog publish <id> - Publish a draft post                    ║
║  blog draft <id>   - Move post to draft                      ║
║  blog delete <id>  - Delete a blog post                      ║
║                                                              ║
║  PROJECT MANAGEMENT:                                         ║
║  project list      - List all projects                       ║
║  project stats     - Show project statistics                 ║
║                                                              ║
║  SYSTEM:                                                     ║
║  neofetch          - Display system info                     ║
║  matrix            - Toggle matrix rain effect               ║
║  theme             - Toggle dark/light theme                 ║
║  logout            - End current session                     ║
║  exit              - Same as logout                          ║
╚══════════════════════════════════════════════════════════════╝
`;

const NEOFETCH = `
       ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ 
       ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
       ███████║███████║██║     █████╔╝ █████╗  ██████╔╝
       ██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
       ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
                     PORTFOLIO DASHBOARD
       ─────────────────────────────────────────────────
       OS: HackerOS v3.1.4 (Terminal Edition)
       Shell: zsh 5.9
       Terminal: web-terminal
       Theme: Neon Cyber
       Resolution: Responsive
       CPU: Neural Processing Unit @ ∞ GHz
       Memory: 16GB DDR5 / Unlimited Cloud
       Uptime: 99.99%
       ─────────────────────────────────────────────────
`;

export const useTerminalCommands = (onLogout: () => void) => {
  const [output, setOutput] = useState<OutputLine[]>([
    { type: 'ascii', content: '  Welcome to the Portfolio Dashboard Terminal v2.0' },
    { type: 'info', content: '  Type "help" for available commands.' },
    { type: 'output', content: '' },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [blogPosts, setBlogPosts] = useState(BLOG_POSTS);

  const addOutput = useCallback((lines: OutputLine[]) => {
    setOutput(prev => [...prev, ...lines]);
  }, []);

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  const executeCommand = useCallback((command: string) => {
    const timestamp = new Date();
    setHistory(prev => [...prev, command]);
    
    addOutput([{ type: 'command', content: `$ ${command}`, timestamp }]);

    const parts = command.toLowerCase().trim().split(' ');
    const cmd = parts[0];
    const subCmd = parts[1];
    const arg = parts[2];

    switch (cmd) {
      case 'help':
        addOutput([{ type: 'ascii', content: HELP_TEXT }]);
        break;

      case 'clear':
        clearOutput();
        break;

      case 'whoami':
        addOutput([
          { type: 'success', content: '  User: admin' },
          { type: 'info', content: '  Role: Administrator' },
          { type: 'info', content: '  Permissions: FULL_ACCESS' },
          { type: 'output', content: `  Session started: ${timestamp.toLocaleString()}` },
        ]);
        break;

      case 'uptime':
        addOutput([
          { type: 'success', content: '  System Uptime: 99 days, 23 hours, 45 minutes' },
          { type: 'info', content: '  Last restart: 2024-09-15 03:00:00 UTC' },
        ]);
        break;

      case 'neofetch':
        addOutput([{ type: 'ascii', content: NEOFETCH }]);
        break;

      case 'stats': {
        const totalViews = blogPosts.reduce((sum, p) => sum + p.views, 0);
        const totalLikes = blogPosts.reduce((sum, p) => sum + p.likes, 0);
        addOutput([
          { type: 'success', content: '  ═══ DASHBOARD STATISTICS ═══' },
          { type: 'info', content: `  Total Blog Posts: ${blogPosts.length}` },
          { type: 'info', content: `  Published: ${blogPosts.filter(p => p.status === 'published').length}` },
          { type: 'info', content: `  Drafts: ${blogPosts.filter(p => p.status === 'draft').length}` },
          { type: 'info', content: `  Total Views: ${totalViews.toLocaleString()}` },
          { type: 'info', content: `  Total Likes: ${totalLikes.toLocaleString()}` },
          { type: 'info', content: `  Total Projects: ${PROJECTS.length}` },
          { type: 'success', content: '  ═══════════════════════════' },
        ]);
        break;
      }

      case 'blog':
        if (subCmd === 'list') {
          addOutput([
            { type: 'success', content: '  ┌────┬──────────────────────────────────┬───────────┬────────┬───────┐' },
            { type: 'success', content: '  │ ID │ Title                            │ Status    │ Views  │ Likes │' },
            { type: 'success', content: '  ├────┼──────────────────────────────────┼───────────┼────────┼───────┤' },
          ]);
          blogPosts.forEach(post => {
            const statusColor = post.status === 'published' ? '🟢' : '🟡';
            addOutput([{
              type: 'table',
              content: `  │ ${post.id.padEnd(2)} │ ${post.title.padEnd(32).slice(0, 32)} │ ${statusColor} ${post.status.padEnd(7)} │ ${post.views.toString().padStart(6)} │ ${post.likes.toString().padStart(5)} │`
            }]);
          });
          addOutput([{ type: 'success', content: '  └────┴──────────────────────────────────┴───────────┴────────┴───────┘' }]);
        } else if (subCmd === 'stats') {
          const published = blogPosts.filter(p => p.status === 'published');
          const avgViews = Math.round(published.reduce((s, p) => s + p.views, 0) / published.length);
          addOutput([
            { type: 'info', content: `  Published posts: ${published.length}` },
            { type: 'info', content: `  Draft posts: ${blogPosts.length - published.length}` },
            { type: 'info', content: `  Average views: ${avgViews.toLocaleString()}` },
            { type: 'success', content: `  Most viewed: "${published.sort((a, b) => b.views - a.views)[0]?.title}"` },
          ]);
        } else if (subCmd === 'publish' && arg) {
          const post = blogPosts.find(p => p.id === arg);
          if (post) {
            setBlogPosts(prev => prev.map(p => p.id === arg ? { ...p, status: 'published' } : p));
            addOutput([{ type: 'success', content: `  ✓ Post "${post.title}" has been published.` }]);
          } else {
            addOutput([{ type: 'error', content: `  ✗ Post with ID "${arg}" not found.` }]);
          }
        } else if (subCmd === 'draft' && arg) {
          const post = blogPosts.find(p => p.id === arg);
          if (post) {
            setBlogPosts(prev => prev.map(p => p.id === arg ? { ...p, status: 'draft' } : p));
            addOutput([{ type: 'warning', content: `  ⚠ Post "${post.title}" moved to drafts.` }]);
          } else {
            addOutput([{ type: 'error', content: `  ✗ Post with ID "${arg}" not found.` }]);
          }
        } else if (subCmd === 'delete' && arg) {
          const post = blogPosts.find(p => p.id === arg);
          if (post) {
            setBlogPosts(prev => prev.filter(p => p.id !== arg));
            addOutput([{ type: 'error', content: `  ✗ Post "${post.title}" has been deleted.` }]);
          } else {
            addOutput([{ type: 'error', content: `  ✗ Post with ID "${arg}" not found.` }]);
          }
        } else {
          addOutput([{ type: 'warning', content: '  Usage: blog [list|stats|publish|draft|delete] [id]' }]);
        }
        break;

      case 'project':
        if (subCmd === 'list') {
          addOutput([
            { type: 'success', content: '  ┌────┬────────────────────────────────┬──────────┬───────┐' },
            { type: 'success', content: '  │ ID │ Project Name                   │ Status   │ Stars │' },
            { type: 'success', content: '  ├────┼────────────────────────────────┼──────────┼───────┤' },
          ]);
          PROJECTS.forEach(project => {
            const statusColor = project.status === 'active' ? '🟢' : '⚪';
            addOutput([{
              type: 'table',
              content: `  │ ${project.id.padEnd(2)} │ ${project.title.padEnd(30).slice(0, 30)} │ ${statusColor} ${project.status.padEnd(6)} │ ${project.stars.toString().padStart(5)} │`
            }]);
          });
          addOutput([{ type: 'success', content: '  └────┴────────────────────────────────┴──────────┴───────┘' }]);
        } else if (subCmd === 'stats') {
          const totalStars = PROJECTS.reduce((s, p) => s + p.stars, 0);
          addOutput([
            { type: 'info', content: `  Total projects: ${PROJECTS.length}` },
            { type: 'info', content: `  Active: ${PROJECTS.filter(p => p.status === 'active').length}` },
            { type: 'info', content: `  Archived: ${PROJECTS.filter(p => p.status === 'archived').length}` },
            { type: 'success', content: `  Total stars: ⭐ ${totalStars}` },
          ]);
        } else {
          addOutput([{ type: 'warning', content: '  Usage: project [list|stats]' }]);
        }
        break;

      case 'matrix':
        addOutput([{ type: 'info', content: '  Matrix rain effect toggled. (Feature in development)' }]);
        break;

      case 'theme':
        addOutput([{ type: 'info', content: '  Theme toggle coming soon. Currently locked to dark mode.' }]);
        break;

      case 'logout':
      case 'exit':
        addOutput([
          { type: 'warning', content: '  Ending session...' },
          { type: 'info', content: '  Goodbye, admin. Stay secure. 🔒' },
        ]);
        setTimeout(onLogout, 1000);
        break;

      default:
        addOutput([
          { type: 'error', content: `  Command not found: ${cmd}` },
          { type: 'output', content: '  Type "help" for available commands.' },
        ]);
    }

    addOutput([{ type: 'output', content: '' }]);
  }, [addOutput, clearOutput, onLogout, blogPosts]);

  const suggestions = [
    'help', 'clear', 'stats', 'whoami', 'uptime', 'neofetch',
    'blog list', 'blog stats', 'blog publish', 'blog draft', 'blog delete',
    'project list', 'project stats',
    'matrix', 'theme', 'logout', 'exit',
  ];

  return {
    output,
    history,
    executeCommand,
    suggestions,
    blogPosts,
  };
};
