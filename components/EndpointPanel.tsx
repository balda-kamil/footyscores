'use client';

import { useState } from 'react';
import { Match } from '@/types/match';
import { generateEndpoint, stageLabel, formatKickoff } from '@/lib/matchUtils';
import { Badge } from './Badge';

interface Props {
  match: Match;
  onClose: () => void;
}

function buildExpectedResponse(match: Match) {
  return {
    competition: {
      name: 'Paris 2024 Olympics Football',
      season: '2024',
      round: stageLabel(match),
    },
    venue: {
      name: match.venue,
      city: match.city,
    },
    kickoff: match.kickoff,
    status: 'FT',
    teams: {
      home: match.home,
      away: match.away,
    },
    score: {
      home: null,
      away: null,
      halfTime: {
        home: null,
        away: null,
      },
    },
    scorers: [],
    lineups: {
      home: {
        team: match.home,
        formation: null,
        coach: null,
        startingXI: [],
        bench: [],
      },
      away: {
        team: match.away,
        formation: null,
        coach: null,
        startingXI: [],
        bench: [],
      },
    },
  };
}

export function EndpointPanel({ match, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const endpoint = generateEndpoint(match, 'https://api.footyscores.com');
  const kf = formatKickoff(match.kickoff);
  const json = JSON.stringify(buildExpectedResponse(match), null, 2);

  function handleCopy() {
    navigator.clipboard.writeText(endpoint).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="w-[380px] shrink-0 border border-line rounded-lg flex flex-col bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-line bg-surface-2 flex items-center gap-2 shrink-0">
        <Badge variant={match.gender === 'men' ? 'blue' : 'purple'}>
          {match.gender === 'men' ? 'Men' : 'Women'}
        </Badge>
        <Badge variant={match.stage === 'group' ? 'muted' : 'orange'}>
          {stageLabel(match)}
        </Badge>
        <button
          onClick={onClose}
          className="ml-auto w-6 h-6 rounded flex items-center justify-center text-dim hover:text-content hover:bg-surface-3 transition-all cursor-pointer text-[16px] shrink-0"
        >
          ×
        </button>
      </div>

      <div className="overflow-y-auto flex-1 flex flex-col">
        {/* Match summary */}
        <div className="px-4 pt-4 pb-3 border-b border-line shrink-0">
          <div className="text-[15px] font-bold mb-0.5">
            {match.home} <span className="text-dim font-normal">vs</span> {match.away}
          </div>
          <div className="text-[11.5px] text-dim">
            {kf.date} · {kf.time} Paris · {match.city}
          </div>
        </div>

        {/* Endpoint URL */}
        <div className="px-4 pt-4 pb-3 border-b border-line shrink-0">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-dim mb-2">
            Generated Endpoint
          </div>
          <div className="relative bg-surface-2 border border-line rounded-[5px] p-3 pr-14 font-mono text-[10.5px] break-all leading-relaxed">
            <span className="text-dim">https://api.footyscores.com</span>
            <span className="text-green">/api/v1/matches/</span>
            <span className="text-blue">olympics-football-{match.gender}</span>
            <span className="text-dim">/2024/</span>
            <span className="text-orange">
              {match.stage === 'group'
                ? `group-${match.group!.toLowerCase()}-matchday-${match.matchday}`
                : match.stage}
            </span>
            <span className="text-dim">/</span>
            <span className="text-content">
              {match.home
                .toLowerCase()
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')}
              -vs-
              {match.away
                .toLowerCase()
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')}
            </span>
            <button
              onClick={handleCopy}
              className={`absolute top-2 right-2 px-[7px] py-[3px] text-[10px] font-semibold rounded cursor-pointer transition-all border ${
                copied
                  ? 'bg-green-subtle text-green border-[rgba(0,232,122,0.3)]'
                  : 'bg-surface-3 text-dim border-line-hi hover:bg-green-subtle hover:text-green'
              }`}
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Expected response structure */}
        <div className="px-4 pt-4 pb-4 flex-1">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-dim mb-2">
            Expected Response Structure
          </div>
          <pre className="bg-surface-2 border border-line rounded-[5px] p-3 font-mono text-[10.5px] leading-relaxed overflow-x-auto text-content whitespace-pre-wrap break-words">
            {json}
          </pre>
        </div>
      </div>
    </div>
  );
}
