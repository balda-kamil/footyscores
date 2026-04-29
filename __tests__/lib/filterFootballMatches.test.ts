import { filterFootballMatches } from '@/lib/filterFootballMatches';
import type { RawStartListItem } from '@/lib/fetchOlympicSchedule';

function makeItem(overrides?: Partial<RawStartListItem>): RawStartListItem {
  return {
    code: 'VALID-CODE',
    startDate: '2024-07-25T09:00:00Z',
    start: [
      { sortOrder: 1, participant: { name: 'Team A' } },
      { sortOrder: 2, participant: { name: 'Team B' } },
    ],
    venue: { description: 'Test Venue' },
    location: { description: 'Paris, France' },
    ...overrides,
  };
}

describe('filterFootballMatches', () => {
  it('keeps items with valid code, date, and two named participants', () => {
    const result = filterFootballMatches([makeItem()]);
    expect(result).toHaveLength(1);
  });

  it('filters out items with missing code', () => {
    const result = filterFootballMatches([makeItem({ code: '' })]);
    expect(result).toHaveLength(0);
  });

  it('filters out items with missing startDate', () => {
    const result = filterFootballMatches([makeItem({ startDate: '' })]);
    expect(result).toHaveLength(0);
  });

  it('filters out items with fewer than 2 participants', () => {
    const result = filterFootballMatches([
      makeItem({ start: [{ sortOrder: 1, participant: { name: 'Team A' } }] }),
    ]);
    expect(result).toHaveLength(0);
  });

  it('filters out items with empty participant names', () => {
    const result = filterFootballMatches([
      makeItem({
        start: [
          { sortOrder: 1, participant: { name: '' } },
          { sortOrder: 2, participant: { name: 'Team B' } },
        ],
      }),
    ]);
    expect(result).toHaveLength(0);
  });

  it('filters out items with whitespace-only participant names', () => {
    const result = filterFootballMatches([
      makeItem({
        start: [
          { sortOrder: 1, participant: { name: '  ' } },
          { sortOrder: 2, participant: { name: 'Team B' } },
        ],
      }),
    ]);
    expect(result).toHaveLength(0);
  });

  it('filters out items with no start array', () => {
    const result = filterFootballMatches([makeItem({ start: [] })]);
    expect(result).toHaveLength(0);
  });

  it('handles a mixed array, keeping only valid items', () => {
    const items = [
      makeItem(),
      makeItem({ code: '' }),
      makeItem(),
      makeItem({ startDate: '' }),
    ];
    const result = filterFootballMatches(items);
    expect(result).toHaveLength(2);
  });

  it('returns an empty array for empty input', () => {
    expect(filterFootballMatches([])).toEqual([]);
  });
});
