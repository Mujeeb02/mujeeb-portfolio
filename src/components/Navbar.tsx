"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Terminal, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const navLinks = [
  { path: '/', label: 'home' },
  { path: '/about', label: 'about' },
  { path: '/projects', label: 'projects' },
  { path: '/blog', label: 'blog' },
  { path: '/contact', label: 'contact' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Terminal className="w-6 h-6 text-primary group-hover:animate-pulse-glow transition-all" />
            <span className="text-lg font-bold text-foreground">
              <span className="text-primary">$</span> mujeeb_dev
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  'px-4 py-2 text-sm font-mono transition-all duration-300 relative',
                  pathname === link.path
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="text-muted-foreground mr-1">[</span>
                {link.label}
                <span className="text-muted-foreground ml-1">]</span>
                {pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                  />
                )}
              </Link>
            ))}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="ml-2 p-2 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'block px-4 py-3 font-mono text-sm border border-border transition-all duration-300',
                      pathname === link.path
                        ? 'text-primary border-primary bg-primary/5'
                        : 'text-muted-foreground hover:text-foreground hover:border-foreground'
                    )}
                  >
                    <span className="text-secondary mr-2">❯</span>
                    ./{link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile theme toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-3 font-mono text-sm border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? './light_mode' : './dark_mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
