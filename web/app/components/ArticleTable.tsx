'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { ArticleItem } from '../api-client/client';

interface ArticleTableProps {
  items: ArticleItem[];
  loading?: boolean;
}

export function ArticleTable({ items, loading }: ArticleTableProps) {
  if (loading) {
    return <div className="mt-8 text-sm text-slate-300">Loading articles…</div>;
  }

  if (!items.length) {
    return <div className="mt-8 text-sm text-slate-300">No articles found for this source.</div>;
  }

  return (
    <div className="mt-8 overflow-hidden rounded-lg border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800">
        <thead className="bg-slate-900/50 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Summary</th>
            <th className="px-4 py-3">Published</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 text-sm">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 align-top font-medium text-indigo-300">
                <Link href={item.url} target="_blank" rel="noreferrer">
                  {item.title}
                </Link>
              </td>
              <td className="px-4 py-3 align-top text-slate-200">{item.summary}</td>
              <td className="px-4 py-3 align-top text-slate-400">
                {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
