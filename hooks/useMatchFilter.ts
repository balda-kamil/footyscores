import { useMemo, useState } from 'react';
import { Match } from '@/types/match';

interface Filters {
  gender: string;
  stage: string;
  search: string;
}

const INITIAL_FILTERS: Filters = { gender: 'all', stage: 'all', search: '' };

export function useMatchFilter(matches: Match[]) {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const filtered = useMemo(() => {
    let result = matches;
    if (filters.gender !== 'all') result = result.filter((m) => m.gender === filters.gender);
    if (filters.stage !== 'all') result = result.filter((m) => m.stage === filters.stage);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.home.toLowerCase().includes(q) ||
          m.away.toLowerCase().includes(q) ||
          m.venue.toLowerCase().includes(q) ||
          m.city.toLowerCase().includes(q)
      );
    }
    return result;
  }, [matches, filters]);

  const isFiltered =
    filters.gender !== 'all' || filters.stage !== 'all' || filters.search !== '';

  return {
    filters,
    filtered,
    isFiltered,
    setGender: (gender: string) => setFilters((f) => ({ ...f, gender })),
    setStage: (stage: string) => setFilters((f) => ({ ...f, stage })),
    setSearch: (search: string) => setFilters((f) => ({ ...f, search })),
    clearFilters: () => setFilters(INITIAL_FILTERS),
  };
}
