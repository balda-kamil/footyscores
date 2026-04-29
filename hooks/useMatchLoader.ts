import { useState } from 'react';
import { Match, LoadState } from '@/types/match';
import { fetchOlympicSchedule } from '@/lib/fetchOlympicSchedule';
import { filterFootballMatches } from '@/lib/filterFootballMatches';
import { normalizeMatch } from '@/lib/normalizeMatch';
import { sortMatches } from '@/lib/sortMatches';

export function useMatchLoader() {
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  async function load() {
    setLoadState('loading');
    setLoadError(null);
    try {
      const raw = await fetchOlympicSchedule();
      const valid = filterFootballMatches(raw);
      setMatches(sortMatches(valid.map(normalizeMatch)));
      setLoadState('loaded');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load matches');
      setLoadState('idle');
    }
  }

  return { loadState, loadError, matches, load };
}
