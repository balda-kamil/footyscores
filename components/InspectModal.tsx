'use client';

import { Match } from '@/types/match';
import { generateEndpoint, slugify, stageLabel, formatKickoff } from '@/lib/matchUtils';
import { API_BASE_URL } from '@/lib/apiConfig';
import { useClipboard } from '@/hooks/useClipboard';
import { Badge } from './Badge';

interface Props {
  match: Match;
  onClose: () => void;
}

const infoCell = 'bg-surface-2 border border-line rounded-[5px] p-[12px_14px]';
const infoCellLabel = 'text-[10.5px] text-dim font-semibold uppercase tracking-[0.4px] mb-1';
const infoCellVal = 'text-[13.5px] font-semibold';
const sectionLabel = 'text-[11px] font-bold uppercase tracking-[0.7px] text-dim mb-2';

export function InspectModal({ match, onClose }: Props) {
  const { copied, copy } = useClipboard();
  const endpoint = generateEndpoint(match, API_BASE_URL);
  const kf = formatKickoff(match.kickoff);

  const round =
    match.stage === 'group'
      ? `group-${match.group!.toLowerCase()}-matchday-${match.matchday}`
      : match.stage;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-5 anim-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-line-hi rounded-xl w-[680px] max-w-full max-h-[85vh] flex flex-col anim-slide-up shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
        <div className="px-[22px] py-[18px] border-b border-line flex flex-wrap sm:flex-nowrap items-center gap-3">
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <Badge variant={match.gender === 'men' ? 'blue' : 'purple'}>
              {match.gender === 'men' ? 'Men' : 'Women'}
            </Badge>
            <Badge variant={match.stage === 'group' ? 'muted' : 'orange'}>
              {stageLabel(match)}
            </Badge>
          </div>
          <div className="text-[15px] font-bold flex-1 ml-1">
            {match.home} vs {match.away}
          </div>
          <button
            className="w-7 h-7 rounded-[6px] bg-surface-2 border border-line text-dim cursor-pointer text-base flex items-center justify-center transition-all hover:bg-red-subtle hover:text-red"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="p-[22px] overflow-y-auto flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className={infoCell}>
              <div className={infoCellLabel}>Kickoff</div>
              <div className={infoCellVal}>{kf.date}</div>
              <div className="text-[12px] text-dim">{kf.time} (Paris)</div>
            </div>
            <div className={infoCell}>
              <div className={infoCellLabel}>Venue</div>
              <div className={infoCellVal}>{match.venue}</div>
              <div className="text-[12px] text-dim">{match.city}</div>
            </div>
            <div className={infoCell}>
              <div className={infoCellLabel}>Home</div>
              <div className={infoCellVal}>{match.home}</div>
            </div>
            <div className={infoCell}>
              <div className={infoCellLabel}>Away</div>
              <div className={infoCellVal}>{match.away}</div>
            </div>
          </div>

          <div>
            <div className={sectionLabel}>Generated Endpoint</div>
            <div className="bg-surface-2 border border-line rounded-[5px] p-[12px_14px] font-mono text-[12px] break-all leading-relaxed relative">
              <span className="text-dim">{API_BASE_URL}</span>
              <span className="text-green">/api/v1/matches/</span>
              <span className="text-blue">olympics-football-{match.gender}</span>
              <span className="text-dim">/2024/</span>
              <span className="text-orange">{round}</span>
              <span className="text-dim">/</span>
              <span className="text-content">{slugify(match.home)}-vs-{slugify(match.away)}</span>
              <button
                className={`absolute top-2 right-2 px-[9px] py-[3px] text-[11px] font-semibold rounded cursor-pointer transition-all border ${
                  copied
                    ? 'bg-green-subtle text-green border-[rgba(0,232,122,0.3)]'
                    : 'bg-surface-3 text-dim border-line-hi hover:bg-green-subtle hover:text-green'
                }`}
                onClick={() => copy(endpoint)}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <div className={sectionLabel}>Match Details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className={infoCell}>
                <div className={infoCellLabel}>Competition</div>
                <div className="text-[12px] font-semibold">Paris 2024 Olympics Football</div>
                <div className="text-[12px] text-dim">
                  {match.gender === 'men' ? 'Men (U23)' : 'Women'}
                </div>
              </div>
              <div className={infoCell}>
                <div className={infoCellLabel}>Stage</div>
                <div className="text-[12px] font-semibold">{stageLabel(match)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
