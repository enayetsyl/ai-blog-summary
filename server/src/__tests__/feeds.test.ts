import { describe, expect, it } from 'vitest';

import { feedMap, feeds } from '../rss/feeds';

describe('feed map', () => {
  it('contains 20 feeds', () => {
    expect(feeds).toHaveLength(20);
  });

  it('maps keys to feed configs', () => {
    const openai = feedMap.get('openai');
    expect(openai?.name).toBe('OpenAI');
  });
});
