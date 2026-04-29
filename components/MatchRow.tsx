'use client';

import { useState } from 'react';
import { Match } from '@/types/match';
import { generateEndpoint, formatKickoff, stageLabel } from '@/lib/matchUtils';
import { Badge } from './Badge';

interface Props {
  match: Match;
  idx: number;
  baseUrl?: string;
  endpointsVisible: boolean;
  onInspect: (match: Match) => void;
}

const cell = 'flex items-center overflow-hidden px-2 py-2.5';

export function MatchRow({ match, idx, baseUrl = '', endpointsVisible, onInspect }: Props) {
  const [copied, setCopied] = useState(false);
  const endpoint = generateEndpoint(match, baseUrl);
  const kf = formatKickoff(match.kickoff);

  function handleCopy(e: MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(endpoint).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className="table-grid border-b border-line last:border-b-0 hover:bg-surface-2 transition-colors cursor-default"
      role="row"
    >
      {/* # */}
      <div className={`${cell} text-muted text-[11.5px] tabular-nums`}>{idx + 1}</div>

      {/* Date / Time */}
      <div className={`${cell} flex-col items-start justify-center`}>
        <span className="text-[12px] text-dim whitespace-nowrap">{kf.date}</span>
        <span className="text-[11px] text-muted">{kf.time}</span>
      </div>

      {/* Gender */}
      <div className={cell}>
        <Badge variant={match.gender === 'men' ? 'blue' : 'purple'} className="text-[10px]">
          {match.gender === 'men' ? 'M' : 'W'}
        </Badge>
      </div>

      {/* Stage */}
      <div className={`${cell} flex-col items-start justify-center`}>
        <span className="text-[11.5px] text-dim leading-snug">{stageLabel(match)}</span>
        {match.stage === 'group' && (
          <span className="text-[10.5px] text-muted">Group {match.group}</span>
        )}
      </div>

      {/* Teams */}
      <div className={`${cell} flex-col items-start justify-center gap-px`}>
        <div className="team-home flex items-center font-medium text-[13px]">{match.home}</div>
        <div className="text-[10px] text-muted pl-[22px] my-px">vs</div>
        <div className="team-away flex items-center font-medium text-[13px]">{match.away}</div>
      </div>

      {/* Venue */}
      <div className={`${cell} flex-col items-start justify-center`}>
        <span className="text-[12px] text-dim leading-snug">{match.venue}</span>
        <span className="text-[11px] text-muted">{match.city}</span>
      </div>

      {/* Endpoint */}
      <div className={`${cell} gap-1.5 col-endpoint`}>
        {endpointsVisible ? (
          <>
            <span
              className="font-mono text-[10.5px] text-blue whitespace-nowrap overflow-hidden text-ellipsis flex-1"
              title={endpoint}
            >
              {endpoint}
            </span>
            <button
              onClick={handleCopy}
              className={`shrink-0 px-[7px] py-[3px] text-[10px] font-semibold rounded cursor-pointer transition-all whitespace-nowrap border ${
                copied
                  ? 'bg-green-subtle text-green border-[rgba(0,232,122,0.3)]'
                  : 'bg-surface-3 text-dim border-line-hi hover:bg-blue-subtle hover:text-blue hover:border-[rgba(77,184,255,0.3)]'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </>
        ) : (
          <span className="text-muted text-[11px] italic">— not generated</span>
        )}
      </div>

      {/* Actions */}
      <div className={`${cell} gap-1 col-actions`}>
        <button
          className="px-2 py-1 rounded-[5px] bg-surface-2 border border-line-hi cursor-pointer transition-all hover:bg-surface-3 active:scale-[0.97]"
          onClick={() => onInspect(match)}
          title="Inspect"
        >
          🔍
        </button>
      </div>
    </div>
  );
}
