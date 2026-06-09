'use client';

import { cn } from '@/lib/utils';
import {
  Type, Clock, Heading, Image as ImageIcon, Link2, ExternalLink, Code2, BarChart3,
} from 'lucide-react';
import type { ContentHealth } from './hooks/useContentHealth';

interface ContentHealthPanelProps {
  health: ContentHealth;
  seoScore: number;
}

export default function ContentHealthPanel({ health, seoScore }: ContentHealthPanelProps) {
  const getHealthColor = (metric: string, value: number) => {
    switch (metric) {
      case 'words':
        if (value >= 1000) return 'text-green-400';
        if (value >= 300) return 'text-yellow-400';
        return 'text-red-400';
      case 'headings':
        if (value >= 3) return 'text-green-400';
        if (value >= 1) return 'text-yellow-400';
        return 'text-red-400';
      case 'images':
        if (value >= 2) return 'text-green-400';
        if (value >= 1) return 'text-yellow-400';
        return 'text-red-400';
      case 'seo':
        if (value >= 80) return 'text-green-400';
        if (value >= 50) return 'text-yellow-400';
        return 'text-red-400';
      default:
        return 'text-foreground';
    }
  };

  const stats = [
    {
      icon: Type,
      label: 'Word Count',
      value: health.wordCount.toLocaleString(),
      color: getHealthColor('words', health.wordCount),
    },
    {
      icon: Clock,
      label: 'Reading Time',
      value: health.readingTime,
      color: 'text-neon-cyan',
    },
    {
      icon: Heading,
      label: 'Headings',
      value: health.headings.length,
      color: getHealthColor('headings', health.headings.length),
    },
    {
      icon: ImageIcon,
      label: 'Images',
      value: health.imageCount,
      color: getHealthColor('images', health.imageCount),
    },
    {
      icon: Link2,
      label: 'Internal Links',
      value: health.internalLinkCount,
      color: health.internalLinkCount > 0 ? 'text-green-400' : 'text-muted-foreground',
    },
    {
      icon: ExternalLink,
      label: 'External Links',
      value: health.externalLinkCount,
      color: health.externalLinkCount > 0 ? 'text-green-400' : 'text-muted-foreground',
    },
    {
      icon: Code2,
      label: 'Code Blocks',
      value: health.codeBlockCount,
      color: 'text-neon-cyan',
    },
    {
      icon: BarChart3,
      label: 'SEO Score',
      value: `${seoScore}/100`,
      color: getHealthColor('seo', seoScore),
    },
  ];

  return (
    <div className="space-y-2">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div
          key={label}
          className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/10 transition-colors"
        >
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon className="w-3.5 h-3.5" />
            {label}
          </span>
          <span className={cn('text-xs font-mono font-semibold', color)}>
            {value}
          </span>
        </div>
      ))}

      {/* Heading Structure */}
      {health.headings.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/20">
          <h5 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
            Heading Structure
          </h5>
          <div className="space-y-0.5">
            {health.headings.map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
                style={{ paddingLeft: `${(h.level - 1) * 10}px` }}
              >
                <span className="text-primary/60 font-mono">H{h.level}</span>
                <span className="truncate">{h.text || '(empty)'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
