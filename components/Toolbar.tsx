'use client';

interface Props {
  loadState: 'idle' | 'loading' | 'loaded';
  generating: boolean;
  endpointsVisible: boolean;
  exported: boolean;
  genderFilter: string;
  stageFilter: string;
  search: string;
  onLoad: () => void;
  onGenerate: () => void;
  onExport: () => void;
  onGenderFilter: (v: string) => void;
  onStageFilter: (v: string) => void;
  onSearch: (v: string) => void;
}

const btnBase =
  'inline-flex items-center gap-[7px] px-3.5 py-[7px] rounded-[5px] text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.97] whitespace-nowrap';

const btnPrimary = `${btnBase} bg-green text-[#04100d] border-0 hover:bg-[#33efaa] disabled:bg-muted disabled:text-dim disabled:cursor-not-allowed disabled:scale-100`;

const btnGhost = `${btnBase} bg-surface-2 text-content border border-line-hi hover:bg-surface-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100`;

const filterBtnBase =
  'px-3.5 py-[6px] font-sans text-[12.5px] font-medium cursor-pointer border-r border-line last:border-r-0 transition-all';

export function Toolbar({
  loadState,
  generating,
  endpointsVisible,
  exported,
  genderFilter,
  stageFilter,
  search,
  onLoad,
  onGenerate,
  onExport,
  onGenderFilter,
  onStageFilter,
  onSearch,
}: Props) {
  const loaded = loadState === 'loaded';

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {/* Load Matches */}
      <button
        className={btnPrimary}
        onClick={onLoad}
        disabled={loadState === 'loading' || loadState === 'loaded'}
      >
        {loadState === 'loaded'
          ? '✓ Matches Loaded'
          : loadState === 'loading'
            ? 'Loading…'
            : '⟳ Load Matches'}
      </button>

      {/* Generate Endpoints */}
      <button
        className={`${btnGhost} ${endpointsVisible ? 'border-[rgba(0,232,122,0.3)] text-green' : ''}`}
        onClick={onGenerate}
        disabled={!loaded || generating || endpointsVisible}
      >
        {endpointsVisible ? '✓ Endpoints Ready' : generating ? 'Generating…' : '⚡ Generate Endpoints'}
      </button>

      {/* Export JSON */}
      <button
        className={`${btnGhost} ${exported ? 'border-[rgba(0,232,122,0.3)] text-green' : ''}`}
        onClick={onExport}
        disabled={!endpointsVisible}
      >
        {exported ? '✓ Exported' : '⬇ Export JSON'}
      </button>

      {loaded && (
        <>
          {/* Divider */}
          <div className="w-px h-5 bg-line-hi" />

          {/* Gender filter */}
          <div className="flex border border-line-hi rounded-[5px] overflow-hidden">
            {(['all', 'men', 'women'] as const).map((g) => (
              <button
                key={g}
                onClick={() => onGenderFilter(g)}
                className={`${filterBtnBase} ${
                  genderFilter === g
                    ? 'bg-surface-3 text-content font-semibold'
                    : 'bg-surface-2 text-dim hover:bg-surface-3 hover:text-content'
                }`}
              >
                {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>

          {/* Stage filter */}
          <div className="flex border border-line-hi rounded-[5px] overflow-hidden">
            {(
              [
                ['all', 'All Stages'],
                ['group', 'Group'],
                ['quarter-final', 'QF'],
                ['semi-final', 'SF'],
                ['bronze-medal', 'Bronze'],
                ['gold-medal', 'Gold'],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                onClick={() => onStageFilter(v)}
                className={`${filterBtnBase} ${
                  stageFilter === v
                    ? 'bg-surface-3 text-content font-semibold'
                    : 'bg-surface-2 text-dim hover:bg-surface-3 hover:text-content'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none text-sm">
              ⌕
            </span>
            <input
              className="bg-surface-2 border border-line-hi text-content font-sans text-[13px] py-[7px] pl-[34px] pr-3 rounded-[5px] w-[220px] outline-none transition-[border-color] focus:border-blue placeholder:text-muted"
              placeholder="Search teams, venues…"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}
