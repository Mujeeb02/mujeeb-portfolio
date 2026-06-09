'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Sparkles, FileText, PenLine, CheckCheck, Minimize2,
  Wand2, Lightbulb, BookOpen, Search, Hash, Quote, HelpCircle,
  X,
} from 'lucide-react';

interface AIAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AI_ACTIONS: AIAction[] = [
  { id: 'intro', label: 'Generate Intro', description: 'Write an engaging introduction', icon: PenLine },
  { id: 'conclusion', label: 'Generate Conclusion', description: 'Wrap up your article', icon: BookOpen },
  { id: 'grammar', label: 'Improve Grammar', description: 'Fix grammar and spelling', icon: CheckCheck },
  { id: 'simplify', label: 'Simplify Text', description: 'Make text easier to read', icon: Minimize2 },
  { id: 'expand', label: 'Expand Content', description: 'Elaborate on selected text', icon: FileText },
  { id: 'summarize', label: 'Summarize Section', description: 'Create a brief summary', icon: Quote },
  { id: 'faq', label: 'Generate FAQ', description: 'Create frequently asked questions', icon: HelpCircle },
  { id: 'slug', label: 'Generate Slug', description: 'Create URL-friendly slug', icon: Hash },
  { id: 'excerpt', label: 'Generate Excerpt', description: 'Write a post excerpt', icon: Lightbulb },
  { id: 'seo', label: 'SEO Suggestions', description: 'Optimize for search engines', icon: Search },
];

interface AIAssistantProps {
  onAction: (actionId: string) => void;
  isProcessing?: boolean;
}

export default function AIAssistant({ onAction, isProcessing = false }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={cn(
              'absolute bottom-16 right-0 w-72',
              'bg-card/90 backdrop-blur-2xl border border-border/30 rounded-xl',
              'shadow-2xl shadow-primary/10 overflow-hidden'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 bg-primary/5">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">AI Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {isProcessing && (
                <div className="flex items-center gap-2 px-3 py-2 mb-1 text-xs text-primary">
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              )}
              {AI_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    onAction(action.id);
                  }}
                  disabled={isProcessing}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left',
                    'transition-all duration-200',
                    'hover:bg-primary/10 hover:text-primary',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    'group'
                  )}
                >
                  <action.icon className="w-4 h-4 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border/20 bg-muted/5">
              <p className="text-[10px] text-muted-foreground/40 text-center">
                AI suggestions are approximate. Always review.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center',
          'bg-gradient-to-br from-primary to-neon-cyan',
          'shadow-lg shadow-primary/30',
          'hover:shadow-xl hover:shadow-primary/40',
          'transition-shadow duration-300',
          isOpen && 'rotate-45'
        )}
        style={{ transition: 'transform 0.3s' }}
      >
        <Sparkles className="w-5 h-5 text-black" />
      </motion.button>
    </div>
  );
}
