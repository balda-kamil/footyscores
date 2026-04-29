import { Match, Stage, Gender } from '@/types/match';
import { RawStartListItem } from './fetchOlympicSchedule';

const GROUP_LETTER: Record<string, string> = {
  'GPA-': 'A',
  'GPB-': 'B',
  'GPC-': 'C',
  'GPD-': 'D',
};

function parseGender(code: string): Gender {
  return code[3] === 'W' ? 'women' : 'men';
}

interface PhaseInfo {
  stage: Stage;
  group: string | null;
  matchday: number | null;
}

function parsePhase(code: string): PhaseInfo {
  const phase = code.substring(22, 26);
  const seq = Math.round(parseInt(code.substring(26, 32), 10) / 100);

  const group = GROUP_LETTER[phase];
  if (group) return { stage: 'group', group, matchday: Math.ceil(seq / 2) };
  if (phase === 'QFNL') return { stage: 'quarter-final', group: null, matchday: null };
  if (phase === 'SFNL') return { stage: 'semi-final', group: null, matchday: null };
  if (phase === 'FNL-') return { stage: seq === 1 ? 'gold-medal' : 'bronze-medal', group: null, matchday: null };
  return { stage: 'group', group: null, matchday: seq };
}

function parseCity(location: string): string {
  const comma = location.lastIndexOf(',');
  return comma !== -1 ? location.slice(comma + 1).trim() : location.trim();
}

export function normalizeMatch(item: RawStartListItem): Match {
  const [first, second] = [...item.start].sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: item.code,
    gender: parseGender(item.code),
    ...parsePhase(item.code),
    home: first.participant.name,
    away: second.participant.name,
    kickoff: item.startDate,
    venue: item.venue.description,
    city: parseCity(item.location.description),
  };
}
