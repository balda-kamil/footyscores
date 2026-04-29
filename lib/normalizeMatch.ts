import { Match, Stage, Gender } from '@/types/match';
import { RawStartListItem } from './fetchOlympicSchedule';

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

  if (phase === 'GPA-') return { stage: 'group', group: 'A', matchday: Math.ceil(seq / 2) };
  if (phase === 'GPB-') return { stage: 'group', group: 'B', matchday: Math.ceil(seq / 2) };
  if (phase === 'GPC-') return { stage: 'group', group: 'C', matchday: Math.ceil(seq / 2) };
  if (phase === 'GPD-') return { stage: 'group', group: 'D', matchday: Math.ceil(seq / 2) };
  if (phase === 'QFNL') return { stage: 'quarter-final', group: null, matchday: null };
  if (phase === 'SFNL') return { stage: 'semi-final', group: null, matchday: null };
  if (phase === 'FNL-') {
    return seq === 1
      ? { stage: 'gold-medal', group: null, matchday: null }
      : { stage: 'bronze-medal', group: null, matchday: null };
  }

  return { stage: 'group', group: null, matchday: seq };
}

function parseCity(location: string): string {
  const parts = location.split(',');
  return parts.length > 1 ? parts[parts.length - 1].trim() : location.trim();
}

export function normalizeMatch(item: RawStartListItem): Match {
  const sorted = [...item.start].sort((a, b) => a.sortOrder - b.sortOrder);
  const home = sorted[0].participant.name;
  const away = sorted[1].participant.name;

  const gender = parseGender(item.code);
  const { stage, group, matchday } = parsePhase(item.code);

  return {
    id: item.code,
    gender,
    stage,
    group,
    matchday,
    home,
    away,
    kickoff: item.startDate,
    venue: item.venue.description,
    city: parseCity(item.location.description),
  };
}
