'use client';

import { useState } from 'react';
import { Match } from '@/types/match';
import { generateEndpoint, stageLabel, formatKickoff } from '@/lib/matchUtils';
import { API_BASE_URL } from '@/lib/apiConfig';
import { diffJson, DiffNode } from '@/lib/diffJson';
import { Badge } from './Badge';

interface Props {
  match: Match;
  onClose: () => void;
}

function buildExpectedResponse(match: Match): Record<string, unknown> {
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
      halfTime: { home: null, away: null },
    },
    scorers: [],
    lineups: {
      home: { team: match.home, formation: null, coach: null, startingXI: [], bench: [] },
      away: { team: match.away, formation: null, coach: null, startingXI: [], bench: [] },
    },
  };
}

const statusColor: Record<string, string> = {
  match: 'text-green',
  mismatch: 'text-red',
  missing: 'text-orange',
  extra: 'text-blue',
};

const statusIcon: Record<string, string> = {
  match: '✓',
  mismatch: '✗',
  missing: '?',
  extra: '+',
};

function DiffTree({ nodes, depth = 0 }: { nodes: DiffNode[]; depth?: number }) {
  return (
    <div style={{ paddingLeft: depth > 0 ? '14px' : 0 }}>
      {nodes.map((node) => (
        <div key={node.key}>
          <div className="flex items-start gap-1.5 py-[2px]">
            <span className={`text-[10px] font-bold shrink-0 w-3 ${statusColor[node.status]}`}>
              {statusIcon[node.status]}
            </span>
            <span className="font-mono text-[10.5px] text-dim shrink-0">{node.key}:</span>
            {node.children ? null : (
              <span className="font-mono text-[10.5px] flex-1 break-all">
                {node.status === 'mismatch' ? (
                  <>
                    <span className="text-red line-through opacity-60">
                      {JSON.stringify(node.expectedValue)}
                    </span>
                    <span className="text-green ml-1">
                      {JSON.stringify(node.actualValue)}
                    </span>
                  </>
                ) : node.status === 'missing' ? (
                  <span className="text-orange">{JSON.stringify(node.expectedValue)}</span>
                ) : node.status === 'extra' ? (
                  <span className="text-blue">{JSON.stringify(node.actualValue)}</span>
                ) : (
                  <span className="text-content">{JSON.stringify(node.actualValue)}</span>
                )}
              </span>
            )}
          </div>
          {node.children && <DiffTree nodes={node.children} depth={depth + 1} />}
        </div>
      ))}
    </div>
  );
}

type CompareState = 'idle' | 'loading' | 'done' | 'error';

export function EndpointPanel({ match, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [compareState, setCompareState] = useState<CompareState>('idle');
  const [compareError, setCompareError] = useState<string | null>(null);
  const [diffNodes, setDiffNodes] = useState<DiffNode[] | null>(null);

  const endpoint = generateEndpoint(match, API_BASE_URL);
  const endpointPath = generateEndpoint(match);
  const kf = formatKickoff(match.kickoff);
  const expected = buildExpectedResponse(match);

  function handleCopy() {
    navigator.clipboard.writeText(endpoint).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  async function handleCompare() {
    setCompareState('loading');
    setCompareError(null);
    setDiffNodes(null);
    try {
      const res = await fetch(`/api/compare?path=${encodeURIComponent(endpointPath)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const actual = await res.json();
      setDiffNodes(diffJson(expected, actual));
      setCompareState('done');
    } catch (err) {
      setCompareError(err instanceof Error ? err.message : 'Comparison failed');
      setCompareState('error');
    }
  }

  const matchCount = diffNodes?.filter((n) => n.status === 'match').length ?? 0;
  const totalCount = diffNodes?.length ?? 0;

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
            <span className="text-dim">{API_BASE_URL}</span>
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
        <div className="px-4 pt-4 pb-3 border-b border-line shrink-0">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-dim mb-2">
            Expected Response Structure
          </div>
          <pre className="bg-surface-2 border border-line rounded-[5px] p-3 font-mono text-[10.5px] leading-relaxed overflow-x-auto text-content whitespace-pre-wrap break-words">
            {JSON.stringify(expected, null, 2)}
          </pre>
        </div>

        {/* JSON Comparison */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-dim">
              API Comparison
            </div>
            {compareState === 'done' && diffNodes && (
              <span className={`text-[10.5px] font-semibold ${matchCount === totalCount ? 'text-green' : 'text-orange'}`}>
                {matchCount}/{totalCount} fields match
              </span>
            )}
          </div>

          {compareState === 'idle' && (
            <button
              onClick={handleCompare}
              className="w-full py-2 rounded-[5px] bg-surface-2 border border-line-hi text-[12px] font-semibold text-content cursor-pointer hover:bg-surface-3 transition-all"
            >
              ⚡ Run Comparison
            </button>
          )}

          {compareState === 'loading' && (
            <div className="flex items-center gap-2 py-2 text-dim text-[12px]">
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0 anim-spin"
                style={{ border: '2px solid var(--color-line-hi)', borderTopColor: 'var(--color-green)' }}
              />
              Fetching from API…
            </div>
          )}

          {compareState === 'error' && (
            <div className="flex flex-col gap-2">
              <div className="px-3 py-2 bg-red-subtle border border-[rgba(255,80,80,0.3)] rounded-[5px] text-red text-[11.5px]">
                {compareError}
              </div>
              <button
                onClick={handleCompare}
                className="w-full py-2 rounded-[5px] bg-surface-2 border border-line-hi text-[12px] font-semibold text-dim cursor-pointer hover:bg-surface-3 transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {compareState === 'done' && diffNodes && (
            <div className="flex flex-col gap-2">
              <div className="bg-surface-2 border border-line rounded-[5px] p-3">
                <DiffTree nodes={diffNodes} />
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
                <span className="text-green">✓ match</span>
                <span className="text-red">✗ mismatch</span>
                <span className="text-orange">? missing in actual</span>
                <span className="text-blue">+ extra in actual</span>
              </div>
              <button
                onClick={handleCompare}
                className="w-full py-1.5 rounded-[5px] bg-surface-2 border border-line-hi text-[11px] font-semibold text-dim cursor-pointer hover:bg-surface-3 transition-all"
              >
                Re-run
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
