import { describe, expect, it } from 'vitest';

import { normalizePagination, paginateArray } from '../utils/pagination';

describe('pagination utilities', () => {
  it('normalizes invalid values', () => {
    expect(normalizePagination(-1, -5)).toEqual({ page: 1, pageSize: 20 });
  });

  it('caps page size at 100', () => {
    expect(normalizePagination(2, 1000)).toEqual({ page: 2, pageSize: 100 });
  });

  it('paginates an array slice', () => {
    const result = paginateArray([1, 2, 3, 4, 5], 2, 2);
    expect(result.items).toEqual([3, 4]);
    expect(result.total).toBe(5);
  });
});
