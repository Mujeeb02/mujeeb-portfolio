'use client';

import { cn } from '@/lib/utils';
import { Search, TrendingUp, BookOpen, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import type { ContentHealth } from './hooks/useContentHealth';
import { useSEOScore } from './hooks/useSEOScore';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SEOPanelProps {
  title: string;
  seoTitle: string;
  onSeoTitleChange: (v: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (v: string) => void;
  canonicalUrl: string;
  onCanonicalUrlChange: (v: string) => void;
  keywords: string[];
  onKeywordsChange: (v: string[]) => void;
  health: ContentHealth;
}

export default function SEOPanel({
  title,
  seoTitle,
  onSeoTitleChange,
  metaDescription,
  onMetaDescriptionChange,
  canonicalUrl,
  onCanonicalUrlChange,
  keywords,
  onKeywordsChange,
  health,
}: SEOPanelProps) {
  const [keywordInput, setKeywordInput] = useState('');

  const seoResult = useSEOScore({
    title,
    seoTitle,
    metaDescription,
    keywords,
    content: health,
  });

  const addKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      onKeywordsChange([...keywords, kw]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    onKeywordsChange(keywords.filter((k) => k !== kw));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-400';
    if (score >= 50) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle2;
    if (score >= 50) return AlertCircle;
    return XCircle;
  };

  const ScoreIcon = getScoreIcon(seoResult.seoScore);

  return (
    <div className="space-y-4">
      {/* Score Overview */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-muted/10 border border-border/20 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Search className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">SEO</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <ScoreIcon className={cn('w-4 h-4', getScoreColor(seoResult.seoScore))} />
            <span className={cn('text-xl font-bold font-mono', getScoreColor(seoResult.seoScore))}>
              {seoResult.seoScore}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-muted/30 mt-2 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', getScoreBg(seoResult.seoScore))}
              style={{ width: `${seoResult.seoScore}%` }}
            />
          </div>
        </div>
        <div className="p-3 rounded-lg bg-muted/10 border border-border/20 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <BookOpen className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Readability</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            {(() => {
              const RIcon = getScoreIcon(seoResult.readabilityScore);
              return <RIcon className={cn('w-4 h-4', getScoreColor(seoResult.readabilityScore))} />;
            })()}
            <span className={cn('text-xl font-bold font-mono', getScoreColor(seoResult.readabilityScore))}>
              {seoResult.readabilityScore}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-muted/30 mt-2 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', getScoreBg(seoResult.readabilityScore))}
              style={{ width: `${seoResult.readabilityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* SEO Title */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
          SEO Title
          <span className={cn(
            'ml-1 font-mono',
            (seoTitle || title).length > 60 ? 'text-red-400' : 'text-muted-foreground/50'
          )}>
            ({(seoTitle || title).length}/60)
          </span>
        </label>
        <Input
          value={seoTitle}
          onChange={(e) => onSeoTitleChange(e.target.value)}
          placeholder={title || 'Enter SEO title...'}
          className="bg-muted/10 border-border/30 text-sm h-8 focus:border-primary"
        />
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
          Meta Description
          <span className={cn(
            'ml-1 font-mono',
            metaDescription.length > 160 ? 'text-red-400' : 'text-muted-foreground/50'
          )}>
            ({metaDescription.length}/160)
          </span>
        </label>
        <textarea
          value={metaDescription}
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
          placeholder="Compelling description for search results..."
          rows={3}
          className={cn(
            'w-full px-3 py-2 rounded-md bg-muted/10 border border-border/30',
            'text-sm text-foreground placeholder:text-muted-foreground/50 resize-none',
            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30'
          )}
        />
      </div>

      {/* Canonical URL */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
          Canonical URL
        </label>
        <Input
          value={canonicalUrl}
          onChange={(e) => onCanonicalUrlChange(e.target.value)}
          placeholder="https://..."
          className="bg-muted/10 border-border/30 text-sm h-8 font-mono focus:border-primary"
        />
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
          Keywords
        </label>
        <div className="flex gap-1.5">
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            placeholder="Add keyword..."
            className="bg-muted/10 border-border/30 text-sm h-8 flex-1 focus:border-primary"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addKeyword}
            className="h-8 w-8 p-0 border-primary/30 hover:border-primary"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] border border-primary/20"
              >
                {kw}
                <button onClick={() => removeKeyword(kw)} className="opacity-60 hover:opacity-100">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div>
        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Suggestions
        </h4>
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
          {seoResult.suggestions.map((s, i) => (
            <div
              key={i}
              className={cn(
                'flex items-start gap-2 px-2 py-1.5 rounded text-[11px]',
                s.type === 'success' && 'text-green-400/80',
                s.type === 'warning' && 'text-yellow-400/80',
                s.type === 'error' && 'text-red-400/80'
              )}
            >
              <span className="mt-0.5 flex-shrink-0">
                {s.type === 'success' && '🟢'}
                {s.type === 'warning' && '🟡'}
                {s.type === 'error' && '🔴'}
              </span>
              <span>{s.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
