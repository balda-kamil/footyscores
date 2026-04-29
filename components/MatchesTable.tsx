'use client';

import { Match, LoadState } from '@/types/match';
import { MatchRow } from './MatchRow';

interface Props {
  matches: Match[];
  loadState: LoadState;
  endpointsVisible: boolean;
  baseUrl?: string;
  selectedId?: string;
  onLoad: () => void;
  onSelect: (match: Match) => void;
  onInspect: (match: Match) => void;
  onClearFilters: () => void;
  isFiltered: boolean;
}

const stateWrap = 'py-20 px-6 text-center flex flex-col items-center gap-3 bg-surface border border-line rounded-lg';

const btnPrimary =
  'inline-flex items-center gap-[7px] px-3.5 py-[7px] rounded-[5px] text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.97] bg-green text-[#04100d] border-0 hover:bg-[#33efaa] mt-1';

const btnGhostSm =
  'inline-flex items-center gap-[7px] px-2.5 py-1 rounded-[5px] text-[12px] font-medium cursor-pointer transition-all active:scale-[0.97] bg-surface-2 text-content border border-line-hi hover:bg-surface-3';

const headerCell =
  'bg-surface-2 flex items-center px-1 sm:px-2 py-[9px] text-[11px] font-semibold uppercase tracking-[0.6px] text-dim whitespace-nowrap';

export function MatchesTable({
  matches,
  loadState,
  endpointsVisible,
  baseUrl = '',
  selectedId,
  onLoad,
  onSelect,
  onInspect,
  onClearFilters,
  isFiltered,
}: Props) {
  if (loadState === 'idle') {
    return (
      <div className={stateWrap}>
        <div className="text-[40px] leading-none">🏟️</div>
        <div className="text-[17px] font-semibold">Ready to load matches</div>
        <div className="text-dim max-w-[380px] leading-relaxed">
          Click &quot;Load Matches&quot; to fetch the Paris 2024 Olympic football fixture list, then
          &quot;Generate Endpoints&quot; to build the API endpoint map.
        </div>
        <button className={btnPrimary} onClick={onLoad}>
          ⟳ Load Matches
        </button>
      </div>
    );
  }

  if (loadState === 'loading') {
    return (
      <div className={stateWrap}>
        <div
          className="w-8 h-8 rounded-full anim-spin"
          style={{ border: '3px solid var(--color-line-hi)', borderTopColor: 'var(--color-green)' }}
        />
        <div className="text-[17px] font-semibold">Loading matches…</div>
        <div className="w-60 h-[3px] bg-surface-3 rounded overflow-hidden">
          <div className="h-full bg-green rounded anim-progress" />
        </div>
        <div className="text-dim max-w-[380px] leading-relaxed text-[12px]">
          Fetching from official Olympic schedule · Filtering football fixtures
        </div>
      </div>
    );
  }

  if (loadState === 'loaded' && matches.length === 0 && isFiltered) {
    return (
      <div className={stateWrap}>
        <div className="text-[40px] leading-none">🔍</div>
        <div className="text-[17px] font-semibold">No matches found</div>
        <div className="text-dim max-w-[380px] leading-relaxed">
          No matches match the current filters. Try adjusting your search or filter settings.
        </div>
        <button className={btnGhostSm} onClick={onClearFilters}>
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="border border-line rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div className="table-grid bg-surface-2  border-b border-line sm:px-3" role="row">
          <div className={headerCell}>#</div>
          <div className={headerCell}>Date</div>
          <div className={headerCell}>Type</div>
          <div className={headerCell}>Stage</div>
          <div className={headerCell}>Match</div>
          <div className={headerCell}>Venue</div>
          <div className={headerCell}>Generated Endpoint</div>
          <div className={headerCell}>Actions</div>
        </div>
        <div>
          {matches.map((m, i) => (
            <MatchRow
              key={m.id}
              match={m}
              idx={i}
              baseUrl={baseUrl}
              endpointsVisible={endpointsVisible}
              selected={m.id === selectedId}
              onSelect={onSelect}
              onInspect={onInspect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
