'use client';

import { motion } from 'framer-motion';
import {
  FileText, Clock, Hash, AlignLeft, Type, CircleDot,
  Download, Upload, Copy, Link2, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AutosaveStatus } from './hooks/useAutosave';
import type { ContentHealth, HeadingNode } from './hooks/useContentHealth';
import { formatDistanceToNow } from 'date-fns';

interface LeftSidebarProps {
  status: 'draft' | 'published';
  autosaveStatus: AutosaveStatus;
  lastSaved: Date | null;
  health: ContentHealth;
  onHeadingClick: (pos: number) => void;
  onExportMarkdown: () => void;
  onImportMarkdown: () => void;
  onDuplicate: () => void;
  onCopyUrl: () => void;
  className?: string;
}

export default function LeftSidebar({
  status,
  autosaveStatus,
  lastSaved,
  health,
  onHeadingClick,
  onExportMarkdown,
  onImportMarkdown,
  onDuplicate,
  onCopyUrl,
  className,
}: LeftSidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex flex-col gap-4 p-4 overflow-y-auto',
        'bg-card/20 backdrop-blur-xl border-r border-border/20',
        className
      )}
    >
      {/* Document Status */}
      <section>
        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
          Status
        </h4>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
              status === 'published'
                ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
            )}
          >
            {status === 'published' ? '● Published' : '○ Draft'}
          </span>
        </div>
      </section>

      {/* Autosave Status */}
      <section>
        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
          Autosave
        </h4>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              autosaveStatus === 'saved' && 'bg-green-400',
              autosaveStatus === 'saving' && 'bg-yellow-400 animate-pulse',
              autosaveStatus === 'unsaved' && 'bg-orange-400',
              autosaveStatus === 'error' && 'bg-red-400'
            )}
          />
          <span className="text-muted-foreground">
            {autosaveStatus === 'saved' && 'All changes saved'}
            {autosaveStatus === 'saving' && 'Saving...'}
            {autosaveStatus === 'unsaved' && 'Unsaved changes'}
            {autosaveStatus === 'error' && 'Save failed'}
          </span>
        </div>
        {lastSaved && (
          <p className="text-[10px] text-muted-foreground/60 mt-1 ml-4">
            {formatDistanceToNow(lastSaved, { addSuffix: true })}
          </p>
        )}
      </section>

      {/* Document Stats */}
      <section>
        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
          Statistics
        </h4>
        <div className="space-y-1.5">
          {[
            { icon: Type, label: 'Words', value: health.wordCount.toLocaleString() },
            { icon: Hash, label: 'Characters', value: health.characterCount.toLocaleString() },
            { icon: Clock, label: 'Reading time', value: health.readingTime },
            { icon: AlignLeft, label: 'Paragraphs', value: health.paragraphCount },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="w-3 h-3" />
                {label}
              </span>
              <span className="text-foreground font-mono text-[11px]">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Content Outline */}
      <section className="flex-1 min-h-0">
        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Outline
        </h4>
        <nav className="space-y-0.5 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
          {health.headings.length > 0 ? (
            health.headings.map((heading: HeadingNode, i: number) => (
              <button
                key={`${heading.text}-${i}`}
                onClick={() => onHeadingClick(heading.pos)}
                className={cn(
                  'w-full text-left text-xs py-1 px-2 rounded transition-colors truncate',
                  'text-muted-foreground hover:text-primary hover:bg-primary/5',
                  'flex items-center gap-1'
                )}
                style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
              >
                <ChevronRight className="w-2.5 h-2.5 flex-shrink-0 opacity-40" />
                <span className="truncate">{heading.text || `Heading ${heading.level}`}</span>
              </button>
            ))
          ) : (
            <p className="text-[10px] text-muted-foreground/50 italic px-2">
              Add headings to see outline
            </p>
          )}
        </nav>
      </section>

      {/* Quick Actions */}
      <section>
        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-1">
          {[
            { icon: Download, label: 'Export MD', onClick: onExportMarkdown },
            { icon: Upload, label: 'Import MD', onClick: onImportMarkdown },
            { icon: Copy, label: 'Duplicate', onClick: onDuplicate },
            { icon: Link2, label: 'Copy URL', onClick: onCopyUrl },
          ].map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-medium',
                'text-muted-foreground hover:text-primary hover:bg-primary/5',
                'border border-transparent hover:border-primary/20',
                'transition-all duration-200'
              )}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Keyboard Shortcuts Hint */}
      <section className="mt-auto pt-3 border-t border-border/20">
        <div className="space-y-1 text-[10px] text-muted-foreground/50">
          <div className="flex justify-between">
            <span>Save</span>
            <kbd className="px-1 py-0.5 bg-muted/30 rounded text-[9px] font-mono">Ctrl+S</kbd>
          </div>
          <div className="flex justify-between">
            <span>Publish</span>
            <kbd className="px-1 py-0.5 bg-muted/30 rounded text-[9px] font-mono">Ctrl+⇧+P</kbd>
          </div>
          <div className="flex justify-between">
            <span>Fullscreen</span>
            <kbd className="px-1 py-0.5 bg-muted/30 rounded text-[9px] font-mono">F11</kbd>
          </div>
        </div>
      </section>
    </motion.aside>
  );
}
