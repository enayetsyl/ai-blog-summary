'use client';

import clsx from 'clsx';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, idx) => start + idx);

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages = range(1, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mt-6 flex flex-wrap items-center gap-2 text-sm">
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={clsx(
            'rounded-md border px-3 py-1.5 transition',
            p === page
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200'
              : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-500 hover:text-indigo-200'
          )}
        >
          {p}
        </button>
      ))}
    </nav>
  );
}
