import Parser from 'rss-parser';
import { subHours } from 'date-fns';

import type { FeedConfig } from './feeds';

const parser = new Parser({
  customFields: {
    item: ['content:encoded']
  }
});

export interface FeedArticle {
  id: string;
  title: string;
  link: string;
  isoDate?: string;
  content?: string;
  contentSnippet?: string;
}

export function isWithinLast24Hours(date?: string): boolean {
  if (!date) return true;
  const published = new Date(date);
  if (Number.isNaN(published.getTime())) {
    return true;
  }
  const since = subHours(new Date(), 24);
  return published >= since;
}

export async function fetchFeedItems(feed: FeedConfig): Promise<FeedArticle[]> {
  const result = await parser.parseURL(feed.url);

  return (
    result.items
      ?.filter((item) => isWithinLast24Hours(item.isoDate))
      .map((item) => ({
        id: item.guid || item.link || `${feed.key}-${item.title}`,
        title: item.title ?? 'Untitled',
        link: item.link ?? '',
        isoDate: item.isoDate,
        content: (item as any)['content:encoded'] ?? item.content,
        contentSnippet: item.contentSnippet
      })) ?? []
  );
}
