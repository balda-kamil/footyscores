import { Match } from '@/types/match';

export function sortMatches(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    const timeDiff = new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
    if (timeDiff !== 0) return timeDiff;
    const homeDiff = a.home.localeCompare(b.home);
    if (homeDiff !== 0) return homeDiff;
    return a.away.localeCompare(b.away);
  });
}
