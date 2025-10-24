import { describe, expect, it, vi } from 'vitest';

import { isWithinLast24Hours, fetchFeedItems } from '../rss/fetchFeed';

vi.mock('rss-parser', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      parseURL: vi.fn().mockResolvedValue({
        items: [
          { title: 'Recent', link: 'https://example.com/recent', isoDate: new Date().toISOString() },
          {
            title: 'Old',
            link: 'https://example.com/old',
            isoDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
          }
        ]
      })
    }))
  };
});

describe('isWithinLast24Hours', () => {
  it('returns true for recent dates', () => {
    expect(isWithinLast24Hours(new Date().toISOString())).toBe(true);
  });

  it('returns false for old dates', () => {
    expect(isWithinLast24Hours(new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())).toBe(false);
  });
});

describe('fetchFeedItems', () => {
  it('filters out old items', async () => {
    const items = await fetchFeedItems({ key: 'test', name: 'Test', url: 'https://example.com/feed' });
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Recent');
  });
});
