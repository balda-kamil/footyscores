'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Toolbar } from '@/components/Toolbar';
import { StatsBar } from '@/components/StatsBar';
import { MatchesTable } from '@/components/MatchesTable';
import { InspectModal } from '@/components/InspectModal';
import { EndpointPanel } from '@/components/EndpointPanel';
import { ExportToast } from '@/components/ExportToast';
import { useMatchLoader } from '@/hooks/useMatchLoader';
import { useMatchFilter } from '@/hooks/useMatchFilter';
import { buildExportPayload, createJsonBlob, downloadBlob } from '@/lib/exportUtils';
import { API_BASE_URL } from '@/lib/apiConfig';
import { Match } from '@/types/match';

export default function Home() {
  const { loadState, loadError, matches, load } = useMatchLoader();
  const { filters, filtered, isFiltered, setGender, setStage, setSearch, clearFilters } =
    useMatchFilter(matches);

  const [endpointsVisible, setEndpointsVisible] = useState(false);
  const [exported, setExported] = useState(false);
  const [inspectMatch, setInspectMatch] = useState<Match | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  function triggerExportFeedback() {
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  }

  function handleExport() {
    const payload = buildExportPayload(filtered);
    const blob = createJsonBlob(payload);
    downloadBlob(blob, 'olympics-football-endpoints.json');
    triggerExportFeedback();
  }

  function handleSelect(match: Match) {
    setSelectedMatch((prev) => (prev?.id === match.id ? null : match));
  }

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
            endpointsVisible={endpointsVisible}
            exported={exported}
            genderFilter={filters.gender}
            stageFilter={filters.stage}
            search={filters.search}
            onLoad={load}
            onGenerate={() => setEndpointsVisible((v) => !v)}
            onExport={handleExport}
            onGenderFilter={setGender}
            onStageFilter={setStage}
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

        <div className="px-4 sm:px-7 pt-4 pb-6 flex-1 flex gap-4 min-h-0">
          <div className="flex-1 min-w-0">
            <MatchesTable
              matches={filtered}
              loadState={loadState}
              endpointsVisible={endpointsVisible}
              baseUrl={API_BASE_URL}
              selectedId={selectedMatch?.id}
              onLoad={load}
              onSelect={handleSelect}
              onInspect={setInspectMatch}
              onClearFilters={clearFilters}
              isFiltered={isFiltered}
            />
          </div>

          {selectedMatch && (
            <EndpointPanel match={selectedMatch} onClose={() => setSelectedMatch(null)} />
          )}
        </div>
      </div>

      {inspectMatch && (
        <InspectModal match={inspectMatch} onClose={() => setInspectMatch(null)} />
      )}

      {exported && <ExportToast count={filtered.length} />}
    </>
  );
}
