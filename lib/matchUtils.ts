import { Match } from '@/types/match';

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateEndpoint(match: Match, baseUrl = ''): string {
  const comp = `olympics-football-${match.gender}`;
  const season = '2024';
  const round =
    match.stage === 'group'
      ? `group-${match.group!.toLowerCase()}-matchday-${match.matchday}`
      : match.stage;
  return `${baseUrl}/api/v1/matches/${comp}/${season}/${round}/${slugify(match.home)}-vs-${slugify(match.away)}`;
}

export function stageLabel(match: Match): string {
  if (match.stage === 'group') return `Group ${match.group} · MD${match.matchday}`;
  return match.stage.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatKickoff(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Europe/Paris',
    }),
    time: d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    }),
  };
}
