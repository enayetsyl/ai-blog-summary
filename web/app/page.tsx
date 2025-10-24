import { Suspense } from 'react';

import { fetchSources } from './api-client/client';
import { SummariesView } from './SummariesView';

async function SourcesLoader() {
  const sources = await fetchSources();
  return <SummariesView sources={sources} />;
}

export default async function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-300">Loading sources…</div>}>
      <SourcesLoader />
    </Suspense>
  );
}
