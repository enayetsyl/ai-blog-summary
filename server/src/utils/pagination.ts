export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function paginateArray<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: items.slice(start, end),
    total,
    page,
    pageSize
  };
}

export function normalizePagination(page?: number, pageSize?: number): { page: number; pageSize: number } {
  const safePage = !page || page < 1 ? 1 : page;
  const safePageSize = !pageSize || pageSize < 1 ? 20 : Math.min(pageSize, 100);
  return { page: safePage, pageSize: safePageSize };
}
