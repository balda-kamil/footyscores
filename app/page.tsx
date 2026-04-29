'use client';

import { useState, useMemo } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Toolbar } from '@/components/Toolbar';
import { StatsBar } from '@/components/StatsBar';
import { MatchesTable } from '@/components/MatchesTable';
import { InspectModal } from '@/components/InspectModal';
import { ExportToast } from '@/components/ExportToast';
import { fetchOlympicSchedule } from '@/lib/fetchOlympicSchedule';
import { filterFootballMatches } from '@/lib/filterFootballMatches';
import { normalizeMatch } from '@/lib/normalizeMatch';
import { sortMatches } from '@/lib/sortMatches';
import { generateEndpoint } from '@/lib/matchUtils';
import { Match } from '@/types/match';

export default function Home() {
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [generating, setGenerating] = useState(false);
  const [endpointsVisible, setEndpointsVisible] = useState(false);
  const [exported, setExported] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [inspectMatch, setInspectMatch] = useState<Match | null>(null);

  async function handleLoad() {
    setLoadState('loading');
    setLoadError(null);
    try {
      const raw = await fetchOlympicSchedule();
      const filtered = filterFootballMatches(raw);
      const normalized = filtered.map(normalizeMatch);
      const sorted = sortMatches(normalized);
      setMatches(sorted);
      setLoadState('loaded');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load matches');
      setLoadState('idle');
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 300));
    setGenerating(false);
    setEndpointsVisible(true);
  }

  function handleExport() {
    const source = filtered.length > 0 ? filtered : matches;
    const payload = source.map((m) => ({
      id: m.id,
      gender: m.gender,
      stage: m.stage,
      group: m.group,
      matchday: m.matchday,
      home: m.home,
      away: m.away,
      kickoff: m.kickoff,
      venue: m.venue,
      city: m.city,
      endpoint: generateEndpoint(m, 'https://api.footyscores.com'),
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'olympics-football-endpoints.json';
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  }

  function clearFilters() {
    setSearch('');
    setGenderFilter('all');
    setStageFilter('all');
  }

  const filtered = useMemo(() => {
    let ms = matches;
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
  }, [matches, genderFilter, stageFilter, search]);

  const isFiltered = genderFilter !== 'all' || stageFilter !== 'all' || search !== '';
  const exportCount = filtered.length > 0 ? filtered.length : matches.length;

  return (
    <>
      <AppHeader
        loadState={loadState}
        endpointsVisible={endpointsVisible}
        matchCount={matches.length}
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

          {loadError && (
            <div className="mt-4 px-4 py-3 bg-red-subtle border border-[rgba(255,80,80,0.3)] rounded-lg text-red text-[13px]">
              {loadError}
            </div>
          )}

          {loadState === 'loaded' && (
            <StatsBar matches={matches} endpointsVisible={endpointsVisible} />
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
