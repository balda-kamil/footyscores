import { sortMatches } from '@/lib/sortMatches';
import type { Match } from '@/types/match';

function makeMatch(overrides: Partial<Match> & { id: string; kickoff: string; home: string; away: string }): Match {
  return {
    gender: 'men',
    stage: 'group',
    group: 'A',
    matchday: 1,
    venue: 'Test Venue',
    city: 'Paris',
    ...overrides,
  };
}

describe('sortMatches', () => {
  it('sorts by kickoff time ascending', () => {
    const matches = [
      makeMatch({ id: 'b', kickoff: '2024-07-25T15:00:00Z', home: 'USA', away: 'France' }),
      makeMatch({ id: 'a', kickoff: '2024-07-25T09:00:00Z', home: 'USA', away: 'France' }),
    ];
    const sorted = sortMatches(matches);
    expect(sorted[0].id).toBe('a');
    expect(sorted[1].id).toBe('b');
  });

  it('breaks kickoff ties by home team name', () => {
    const matches = [
      makeMatch({ id: 'b', kickoff: '2024-07-25T09:00:00Z', home: 'USA', away: 'Spain' }),
      makeMatch({ id: 'a', kickoff: '2024-07-25T09:00:00Z', home: 'Brazil', away: 'Spain' }),
    ];
    const sorted = sortMatches(matches);
    expect(sorted[0].id).toBe('a');
    expect(sorted[1].id).toBe('b');
  });

  it('breaks home-name ties by away team name', () => {
    const matches = [
      makeMatch({ id: 'b', kickoff: '2024-07-25T09:00:00Z', home: 'France', away: 'USA' }),
      makeMatch({ id: 'a', kickoff: '2024-07-25T09:00:00Z', home: 'France', away: 'Argentina' }),
    ];
    const sorted = sortMatches(matches);
    expect(sorted[0].id).toBe('a');
    expect(sorted[1].id).toBe('b');
  });

  it('returns a new array without mutating the original', () => {
    const matches = [
      makeMatch({ id: 'b', kickoff: '2024-07-26T09:00:00Z', home: 'France', away: 'USA' }),
      makeMatch({ id: 'a', kickoff: '2024-07-25T09:00:00Z', home: 'France', away: 'USA' }),
    ];
    const original = [...matches];
    sortMatches(matches);
    expect(matches[0].id).toBe(original[0].id);
  });

  it('handles an empty array', () => {
    expect(sortMatches([])).toEqual([]);
  });

  it('handles a single match', () => {
    const match = makeMatch({ id: 'a', kickoff: '2024-07-25T09:00:00Z', home: 'France', away: 'USA' });
    expect(sortMatches([match])).toEqual([match]);
  });

  it('sorts across multiple days', () => {
    const matches = [
      makeMatch({ id: 'c', kickoff: '2024-07-27T09:00:00Z', home: 'X', away: 'Y' }),
      makeMatch({ id: 'a', kickoff: '2024-07-25T09:00:00Z', home: 'X', away: 'Y' }),
      makeMatch({ id: 'b', kickoff: '2024-07-26T09:00:00Z', home: 'X', away: 'Y' }),
    ];
    const sorted = sortMatches(matches);
    expect(sorted.map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });
});
