'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, Settings2, BarChart3, ChevronDown } from 'lucide-react';
import SEOPanel from './SEOPanel';
import PostSettingsPanel from './PostSettingsPanel';
import ContentHealthPanel from './ContentHealthPanel';
import type { ContentHealth } from './hooks/useContentHealth';

interface AccordionItemProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AccordionItem = ({ title, icon: Icon, isOpen, onToggle, children }: AccordionItemProps) => (
  <div className="border-b border-border/10 last:border-b-0">
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3',
        'text-xs font-semibold uppercase tracking-wider',
        'transition-colors hover:bg-muted/10',
        isOpen ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <span className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        {title}
      </span>
      <ChevronDown
        className={cn(
          'w-3.5 h-3.5 transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
      />
    </button>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="px-4 pb-4"
      >
        {children}
      </motion.div>
    )}
  </div>
);

interface RightSidebarProps {
  // SEO
  title: string;
  seoTitle: string;
  onSeoTitleChange: (v: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (v: string) => void;
  canonicalUrl: string;
  onCanonicalUrlChange: (v: string) => void;
  keywords: string[];
  onKeywordsChange: (v: string[]) => void;
  // Post settings
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  featured: boolean;
  onFeaturedChange: (v: boolean) => void;
  publishDate: string;
  onPublishDateChange: (v: string) => void;
  excerpt: string;
  onExcerptChange: (v: string) => void;
  slug: string;
  onSlugChange: (v: string) => void;
  // Content health
  health: ContentHealth;
  seoScore: number;
  className?: string;
}

export default function RightSidebar(props: RightSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    seo: true,
    settings: true,
    health: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex flex-col overflow-y-auto',
        'bg-card/20 backdrop-blur-xl border-l border-border/20',
        props.className
      )}
    >
      <AccordionItem
        title="SEO"
        icon={Search}
        isOpen={openSections.seo}
        onToggle={() => toggleSection('seo')}
      >
        <SEOPanel
          title={props.title}
          seoTitle={props.seoTitle}
          onSeoTitleChange={props.onSeoTitleChange}
          metaDescription={props.metaDescription}
          onMetaDescriptionChange={props.onMetaDescriptionChange}
          canonicalUrl={props.canonicalUrl}
          onCanonicalUrlChange={props.onCanonicalUrlChange}
          keywords={props.keywords}
          onKeywordsChange={props.onKeywordsChange}
          health={props.health}
        />
      </AccordionItem>

      <AccordionItem
        title="Post Settings"
        icon={Settings2}
        isOpen={openSections.settings}
        onToggle={() => toggleSection('settings')}
      >
        <PostSettingsPanel
          tags={props.tags}
          onTagsChange={props.onTagsChange}
          featured={props.featured}
          onFeaturedChange={props.onFeaturedChange}
          publishDate={props.publishDate}
          onPublishDateChange={props.onPublishDateChange}
          excerpt={props.excerpt}
          onExcerptChange={props.onExcerptChange}
          slug={props.slug}
          onSlugChange={props.onSlugChange}
        />
      </AccordionItem>

      <AccordionItem
        title="Content Health"
        icon={BarChart3}
        isOpen={openSections.health}
        onToggle={() => toggleSection('health')}
      >
        <ContentHealthPanel health={props.health} seoScore={props.seoScore} />
      </AccordionItem>
    </motion.aside>
  );
}
