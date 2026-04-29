import { Badge } from './Badge';

interface Props {
  loadState: 'idle' | 'loading' | 'loaded';
  endpointsVisible: boolean;
  matchCount: number;
}

export function AppHeader({ loadState, endpointsVisible, matchCount }: Props) {
  return (
    <header className="flex flex-wrap items-center gap-4 px-4 sm:px-7 py-6 border-b border-line bg-surface sticky top-0 z-50 sm:flex-nowrap">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-green-subtle border border-[rgba(0,232,122,0.25)] flex items-center justify-center text-base shrink-0">
          ⚽
        </div>
        <div className="font-bold text-[15px] tracking-[-0.3px]">
          Footy<span className="text-green">Scores</span>
        </div>
      </div>

      <div className="w-px h-5 bg-line-hi" />
      <div className="text-dim text-[12.5px]">
        QA Endpoint Generator · Paris 2024 Olympics
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {loadState === 'loaded' && (
          <>
            <Badge variant="green">{matchCount} matches</Badge>
            {endpointsVisible && (
              <Badge variant="blue">{matchCount} endpoints</Badge>
            )}
          </>
        )}
      </div>
    </header>
  );
}
