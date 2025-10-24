const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export interface SourceResponse {
  key: string;
  name: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchSources(): Promise<SourceResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/sources`, { next: { revalidate: 0 } });
  if (!response.ok) {
    throw new Error('Failed to fetch sources');
  }
  return response.json();
}

export async function fetchArticles(params: {
  source: string;
  page: number;
  pageSize: number;
}): Promise<PaginatedResponse<ArticleItem>> {
  const search = new URLSearchParams({
    source: params.source,
    page: params.page.toString(),
    pageSize: params.pageSize.toString()
  });
  const response = await fetch(`${API_BASE_URL}/api/articles?${search.toString()}`, {
    next: { revalidate: 0 }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  return response.json();
}
