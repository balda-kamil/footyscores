import { renderHook, act } from '@testing-library/react';
import { useMatchFilter } from '@/hooks/useMatchFilter';
import type { Match } from '@/types/match';

function makeMatch(overrides: Partial<Match> & { id: string }): Match {
  return {
    gender: 'men',
    stage: 'group',
    group: 'A',
    matchday: 1,
    home: 'France',
    away: 'USA',
    kickoff: '2024-07-25T09:00:00Z',
    venue: 'Parc des Princes',
    city: 'Paris',
    ...overrides,
  };
}

const menGroupMatch = makeMatch({ id: 'm1', gender: 'men', stage: 'group' });
const womenGroupMatch = makeMatch({ id: 'w1', gender: 'women', stage: 'group' });
const menSFMatch = makeMatch({ id: 'm2', gender: 'men', stage: 'semi-final', group: null, matchday: null });
const matches: Match[] = [menGroupMatch, womenGroupMatch, menSFMatch];

describe('useMatchFilter', () => {
  it('returns all matches initially', () => {
    const { result } = renderHook(() => useMatchFilter(matches));
    expect(result.current.filtered).toHaveLength(3);
  });

  it('isFiltered is false initially', () => {
    const { result } = renderHook(() => useMatchFilter(matches));
    expect(result.current.isFiltered).toBe(false);
  });

  it('filters by gender=men', () => {
    const { result } = renderHook(() => useMatchFilter(matches));
    act(() => result.current.setGender('men'));
    expect(result.current.filtered.every((m) => m.gender === 'men')).toBe(true);
    expect(result.current.filtered).toHaveLength(2);
  });

  it('filters by gender=women', () => {
    const { result } = renderHook(() => useMatchFilter(matches));
    act(() => result.current.setGender('women'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('w1');
  });

  it('filters by stage', () => {
    const { result } = renderHook(() => useMatchFilter(matches));
    act(() => result.current.setStage('semi-final'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('m2');
  });

  it('filters by search on home team', () => {
    const { result } = renderHook(() => useMatchFilter(matches));
    act(() => result.current.setSearch('france'));
    expect(result.current.filtered.every((m) => m.home.toLowerCase().includes('france'))).toBe(true);
  });

  it('search is case-insensitive', () => {
    const { result } = renderHook(() => useMatchFilter(matches));
    act(() => result.current.setSearch('FRANCE'));
    expect(result.current.filtered.length).toBeGreaterThan(0);
  });

  it('filters by search on venue', () => {
    const localMatches: Match[] = [
      makeMatch({ id: 'v1', venue: 'Stade de Lyon' }),
      makeMatch({ id: 'v2', venue: 'Parc des Princes' }),
    ];
    const { result } = renderHook(() => useMatchFilter(localMatches));
    act(() => result.current.setSearch('lyon'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('v1');
  });

  it('filters by search on city', () => {
    const localMatches: Match[] = [
      makeMatch({ id: 'c1', city: 'Lyon' }),
      makeMatch({ id: 'c2', city: 'Paris' }),
    ];
    const { result } = renderHook(() => useMatchFilter(localMatches));
    act(() => result.current.setSearch('lyon'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('c1');
  });

  it('combines gender and stage filters', () => {
    const { result } = renderHook(() => useMatchFilter(matches));
    act(() => result.current.setGender('men'));
    act(() => result.current.setStage('group'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('m1');
  });

  it('marks isFiltered=true when gender is set', () => {
    const { result } = renderHook(() => useMatchFilter(matches));
    act(() => result.current.setGender('men'));
    expect(result.current.isFiltered).toBe(true);
  });

  it('marks isFiltered=true when search is set', () => {
    const { result } = renderHook(() => useMatchFilter(matches));
    act(() => result.current.setSearch('test'));
    expect(result.current.isFiltered).toBe(true);
  });

  it('clearFilters resets to all matches', () => {
    const { result } = renderHook(() => useMatchFilter(matches));
    act(() => result.current.setGender('men'));
    act(() => result.current.setSearch('france'));
    act(() => result.current.clearFilters());
    expect(result.current.filtered).toHaveLength(3);
    expect(result.current.isFiltered).toBe(false);
  });

  it('returns empty array when no matches pass the filter', () => {
    const { result } = renderHook(() => useMatchFilter(matches));
    act(() => result.current.setSearch('zzznomatch'));
    expect(result.current.filtered).toHaveLength(0);
  });

  it('reacts to new matches prop', () => {
    const { result, rerender } = renderHook(
      ({ m }: { m: Match[] }) => useMatchFilter(m),
      { initialProps: { m: matches } }
    );
    const newMatch = makeMatch({ id: 'new', home: 'Brazil', away: 'Argentina' });
    rerender({ m: [...matches, newMatch] });
    expect(result.current.filtered).toHaveLength(4);
  });
});
