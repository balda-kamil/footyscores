import { renderHook, act, waitFor } from '@testing-library/react';
import { useMatchLoader } from '@/hooks/useMatchLoader';
import type { RawStartListItem } from '@/lib/fetchOlympicSchedule';

jest.mock('@/lib/fetchOlympicSchedule', () => ({
  fetchOlympicSchedule: jest.fn(),
}));

import { fetchOlympicSchedule } from '@/lib/fetchOlympicSchedule';

const mockFetch = fetchOlympicSchedule as jest.MockedFunction<typeof fetchOlympicSchedule>;

// code[3]='M' (men), substring(22,26)='GPA-', substring(26,32)='000100'
const VALID_CODE = 'OG0M000000000000000000GPA-000100';

function makeRawItem(overrides?: Partial<RawStartListItem>): RawStartListItem {
  return {
    code: VALID_CODE,
    startDate: '2024-07-25T09:00:00Z',
    start: [
      { sortOrder: 1, participant: { name: 'France' } },
      { sortOrder: 2, participant: { name: 'USA' } },
    ],
    venue: { description: 'Parc des Princes' },
    location: { description: 'Paris, France' },
    ...overrides,
  };
}

describe('useMatchLoader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('starts in idle state with empty matches', () => {
    const { result } = renderHook(() => useMatchLoader());
    expect(result.current.loadState).toBe('idle');
    expect(result.current.matches).toEqual([]);
    expect(result.current.loadError).toBeNull();
  });

  it('transitions to loading when load() is called', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useMatchLoader());
    act(() => { result.current.load(); });
    expect(result.current.loadState).toBe('loading');
  });

  it('transitions to loaded with normalized matches on success', async () => {
    mockFetch.mockResolvedValue([makeRawItem()]);
    const { result } = renderHook(() => useMatchLoader());
    await act(async () => { await result.current.load(); });
    expect(result.current.loadState).toBe('loaded');
    expect(result.current.matches).toHaveLength(1);
  });

  it('normalizes match data correctly', async () => {
    mockFetch.mockResolvedValue([makeRawItem()]);
    const { result } = renderHook(() => useMatchLoader());
    await act(async () => { await result.current.load(); });
    const [m] = result.current.matches;
    expect(m.home).toBe('France');
    expect(m.away).toBe('USA');
    expect(m.gender).toBe('men');
    expect(m.stage).toBe('group');
  });

  it('filters out invalid items', async () => {
    const invalidItem: RawStartListItem = { ...makeRawItem(), code: '' };
    mockFetch.mockResolvedValue([makeRawItem(), invalidItem]);
    const { result } = renderHook(() => useMatchLoader());
    await act(async () => { await result.current.load(); });
    expect(result.current.matches).toHaveLength(1);
  });

  it('sorts loaded matches', async () => {
    const later: RawStartListItem = { ...makeRawItem(), startDate: '2024-07-26T09:00:00Z' };
    const earlier: RawStartListItem = { ...makeRawItem(), startDate: '2024-07-25T09:00:00Z' };
    mockFetch.mockResolvedValue([later, earlier]);
    const { result } = renderHook(() => useMatchLoader());
    await act(async () => { await result.current.load(); });
    expect(result.current.matches[0].kickoff).toBe('2024-07-25T09:00:00Z');
  });

  it('clears load error on new load attempt', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network error'));
    const { result } = renderHook(() => useMatchLoader());
    await act(async () => { await result.current.load(); });
    expect(result.current.loadError).not.toBeNull();

    mockFetch.mockResolvedValue([makeRawItem()]);
    await act(async () => { await result.current.load(); });
    expect(result.current.loadError).toBeNull();
  });

  it('sets loadError and reverts to idle on failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useMatchLoader());
    await act(async () => { await result.current.load(); });
    expect(result.current.loadState).toBe('idle');
    expect(result.current.loadError).toBe('Network error');
  });

  it('sets a fallback error message for non-Error rejections', async () => {
    mockFetch.mockRejectedValue('unexpected');
    const { result } = renderHook(() => useMatchLoader());
    await act(async () => { await result.current.load(); });
    expect(result.current.loadError).toBe('Failed to load matches');
  });
});
