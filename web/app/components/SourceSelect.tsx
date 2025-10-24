'use client';

import { SourceResponse } from '../api-client/client';

interface SourceSelectProps {
  sources: SourceResponse[];
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SourceSelect({ sources, value, onChange, disabled }: SourceSelectProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-200">
      <span className="font-medium text-slate-300">Select a source</span>
      <select
        className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-base text-slate-50 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value="" disabled>
          Choose a source
        </option>
        {sources.map((source) => (
          <option key={source.key} value={source.key}>
            {source.name}
          </option>
        ))}
      </select>
    </label>
  );
}
