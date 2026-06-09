import { useMemo } from 'react';
import type { ContentHealth } from './useContentHealth';

interface SEOInput {
  title: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  content: ContentHealth;
}

interface SEOSuggestion {
  type: 'success' | 'warning' | 'error';
  message: string;
}

interface SEOResult {
  seoScore: number;
  readabilityScore: number;
  suggestions: SEOSuggestion[];
  grade: 'excellent' | 'good' | 'needs-improvement';
}

export function useSEOScore(input: SEOInput): SEOResult {
  return useMemo(() => {
    const suggestions: SEOSuggestion[] = [];
    let seoPoints = 0;
    const maxPoints = 100;

    // Title check (15 points)
    const titleLen = (input.seoTitle || input.title).length;
    if (titleLen >= 50 && titleLen <= 60) {
      seoPoints += 15;
      suggestions.push({ type: 'success', message: 'SEO title length is optimal (50-60 chars)' });
    } else if (titleLen >= 30 && titleLen < 50) {
      seoPoints += 10;
      suggestions.push({ type: 'warning', message: `SEO title is short (${titleLen} chars). Aim for 50-60.` });
    } else if (titleLen > 60) {
      seoPoints += 8;
      suggestions.push({ type: 'warning', message: `SEO title is too long (${titleLen} chars). Keep under 60.` });
    } else if (titleLen > 0) {
      seoPoints += 5;
      suggestions.push({ type: 'error', message: `SEO title is very short (${titleLen} chars). Aim for 50-60.` });
    } else {
      suggestions.push({ type: 'error', message: 'Missing SEO title' });
    }

    // Meta description (15 points)
    const descLen = input.metaDescription.length;
    if (descLen >= 120 && descLen <= 160) {
      seoPoints += 15;
      suggestions.push({ type: 'success', message: 'Meta description length is optimal' });
    } else if (descLen >= 80 && descLen < 120) {
      seoPoints += 10;
      suggestions.push({ type: 'warning', message: 'Meta description could be longer (aim for 120-160 chars)' });
    } else if (descLen > 160) {
      seoPoints += 8;
      suggestions.push({ type: 'warning', message: 'Meta description is too long (may be truncated)' });
    } else if (descLen > 0) {
      seoPoints += 5;
      suggestions.push({ type: 'error', message: 'Meta description is too short' });
    } else {
      suggestions.push({ type: 'error', message: 'Missing meta description' });
    }

    // Keywords (10 points)
    if (input.keywords.length >= 3) {
      seoPoints += 10;
      suggestions.push({ type: 'success', message: 'Good keyword coverage' });
    } else if (input.keywords.length >= 1) {
      seoPoints += 5;
      suggestions.push({ type: 'warning', message: 'Add more keywords (aim for 3+)' });
    } else {
      suggestions.push({ type: 'error', message: 'No keywords defined' });
    }

    // Content length (15 points)
    if (input.content.wordCount >= 1000) {
      seoPoints += 15;
      suggestions.push({ type: 'success', message: 'Content length is excellent for SEO' });
    } else if (input.content.wordCount >= 500) {
      seoPoints += 10;
      suggestions.push({ type: 'warning', message: 'Good content length. 1000+ words is better for SEO.' });
    } else if (input.content.wordCount >= 300) {
      seoPoints += 5;
      suggestions.push({ type: 'warning', message: 'Content is a bit short. Aim for 500+ words.' });
    } else {
      suggestions.push({ type: 'error', message: 'Content is too short for good SEO (300+ words recommended)' });
    }

    // Heading structure (15 points)
    const hasH1 = input.content.headings.some((h) => h.level === 1);
    const hasSubheadings = input.content.headings.some((h) => h.level >= 2);
    if (hasH1 && hasSubheadings) {
      seoPoints += 15;
      suggestions.push({ type: 'success', message: 'Good heading structure' });
    } else if (hasH1 || hasSubheadings) {
      seoPoints += 8;
      suggestions.push({ type: 'warning', message: 'Add more heading hierarchy (H1 + H2/H3)' });
    } else {
      suggestions.push({ type: 'error', message: 'No headings found. Add H1 and subheadings.' });
    }

    // Images (10 points)
    if (input.content.imageCount >= 2) {
      seoPoints += 10;
      suggestions.push({ type: 'success', message: 'Good use of images' });
    } else if (input.content.imageCount === 1) {
      seoPoints += 5;
      suggestions.push({ type: 'warning', message: 'Consider adding more images' });
    } else {
      suggestions.push({ type: 'error', message: 'No images found. Add images to improve engagement.' });
    }

    // Internal links (10 points)
    if (input.content.internalLinkCount >= 2) {
      seoPoints += 10;
      suggestions.push({ type: 'success', message: 'Good internal linking' });
    } else if (input.content.internalLinkCount === 1) {
      seoPoints += 5;
      suggestions.push({ type: 'warning', message: 'Add more internal links' });
    } else {
      suggestions.push({ type: 'warning', message: 'No internal links. Link to other posts.' });
    }

    // External links (10 points)
    if (input.content.externalLinkCount >= 1) {
      seoPoints += 10;
      suggestions.push({ type: 'success', message: 'External references found' });
    } else {
      suggestions.push({ type: 'warning', message: 'Consider adding external references' });
    }

    // Readability (simplified Flesch-like estimate)
    const avgWordsPerSentence = input.content.wordCount / Math.max(1, input.content.paragraphCount);
    let readabilityScore = 100;
    if (avgWordsPerSentence > 25) readabilityScore -= 30;
    else if (avgWordsPerSentence > 20) readabilityScore -= 15;
    if (input.content.wordCount < 100) readabilityScore -= 20;
    if (input.content.headings.length === 0) readabilityScore -= 15;
    if (input.content.paragraphCount < 3) readabilityScore -= 10;
    readabilityScore = Math.max(0, Math.min(100, readabilityScore));

    const seoScore = Math.round((seoPoints / maxPoints) * 100);

    const grade: SEOResult['grade'] =
      seoScore >= 80 ? 'excellent' : seoScore >= 50 ? 'good' : 'needs-improvement';

    return { seoScore, readabilityScore, suggestions, grade };
  }, [input.title, input.seoTitle, input.metaDescription, input.keywords, input.content]);
}
