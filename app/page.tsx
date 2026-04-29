'use client';

import { useState, useMemo } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Toolbar } from '@/components/Toolbar';
import { StatsBar } from '@/components/StatsBar';
import { MatchesTable } from '@/components/MatchesTable';
import { InspectModal } from '@/components/InspectModal';
import { ExportToast } from '@/components/ExportToast';
import { mockMatches } from '@/lib/mockMatches';
import { Match } from '@/types/match';

export default function Home() {
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded'>('idle');
  const [generating, setGenerating] = useState(false);
  const [endpointsVisible, setEndpointsVisible] = useState(false);
  const [exported, setExported] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [inspectMatch, setInspectMatch] = useState<Match | null>(null);

  async function handleLoad() {
    setLoadState('loading');
    await new Promise((r) => setTimeout(r, 1000));
    setLoadState('loaded');
  }

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 600));
    setGenerating(false);
    setEndpointsVisible(true);
  }

  function handleExport() {
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  }

  function clearFilters() {
    setSearch('');
    setGenderFilter('all');
    setStageFilter('all');
  }

  const filtered = useMemo(() => {
    let ms = mockMatches;
    if (genderFilter !== 'all') ms = ms.filter((m) => m.gender === genderFilter);
    if (stageFilter !== 'all') ms = ms.filter((m) => m.stage === stageFilter);
    if (search) {
      const q = search.toLowerCase();
      ms = ms.filter(
        (m) =>
          m.home.toLowerCase().includes(q) ||
          m.away.toLowerCase().includes(q) ||
          m.venue.toLowerCase().includes(q) ||
          m.city.toLowerCase().includes(q)
      );
    }
    return ms;
  }, [genderFilter, stageFilter, search]);

  const isFiltered = genderFilter !== 'all' || stageFilter !== 'all' || search !== '';
  const exportCount = filtered.length > 0 ? filtered.length : mockMatches.length;

  return (
    <>
      <AppHeader
        loadState={loadState}
        endpointsVisible={endpointsVisible}
        matchCount={mockMatches.length}
      />

      <div className="flex-1 flex flex-col">
        <div className="px-4 sm:px-7 pt-6">
          <Toolbar
            loadState={loadState}
            generating={generating}
            endpointsVisible={endpointsVisible}
            exported={exported}
            genderFilter={genderFilter}
            stageFilter={stageFilter}
            search={search}
            onLoad={handleLoad}
            onGenerate={handleGenerate}
            onExport={handleExport}
            onGenderFilter={setGenderFilter}
            onStageFilter={setStageFilter}
            onSearch={setSearch}
          />

          {loadState === 'loaded' && (
            <StatsBar matches={mockMatches} endpointsVisible={endpointsVisible} />
          )}
        </div>

        <div className="px-4 sm:px-7 pt-4 pb-6 flex-1">
          <MatchesTable
            matches={filtered}
            loadState={loadState}
            endpointsVisible={endpointsVisible}
            baseUrl="https://api.footyscores.com"
            onLoad={handleLoad}
            onInspect={setInspectMatch}
            onClearFilters={clearFilters}
            isFiltered={isFiltered}
          />
        </div>
      </div>

      {inspectMatch && (
        <InspectModal match={inspectMatch} onClose={() => setInspectMatch(null)} />
      )}

      {exported && <ExportToast count={exportCount} />}
    </>
  );
}
