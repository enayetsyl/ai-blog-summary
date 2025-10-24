'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { ArticleItem, fetchArticles, SourceResponse } from './api-client/client';
import { ArticleTable } from './components/ArticleTable';
import { Pagination } from './components/Pagination';
import { SourceSelect } from './components/SourceSelect';

interface SummariesViewProps {
  sources: SourceResponse[];
}

const PAGE_SIZE = 20;

export function SummariesView({ sources }: SummariesViewProps) {
  const [selectedSource, setSelectedSource] = useState<string | undefined>(sources[0]?.key);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [selectedSource]);

  const queryKey = useMemo(() => ['articles', selectedSource, page], [selectedSource, page]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey,
    enabled: Boolean(selectedSource),
    queryFn: async (): Promise<{ items: ArticleItem[]; page: number; pageSize: number; total: number }> => {
      if (!selectedSource) {
        return { items: [], page: 1, pageSize: PAGE_SIZE, total: 0 };
      }
      return fetchArticles({ source: selectedSource, page, pageSize: PAGE_SIZE });
    }
  });

  const hasSources = sources.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SourceSelect
          sources={sources}
          value={selectedSource}
          onChange={setSelectedSource}
          disabled={!hasSources}
        />
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex w-fit items-center justify-center rounded-md border border-indigo-500 px-4 py-2 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
          disabled={!selectedSource || isFetching}
        >
          Refresh
        </button>
      </div>

      {isError && <div className="text-sm text-red-400">Failed to load articles. Please try again.</div>}

      <ArticleTable items={data?.items ?? []} loading={isLoading} />

      {data && (
        <Pagination
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
