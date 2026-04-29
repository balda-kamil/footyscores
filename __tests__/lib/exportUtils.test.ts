import { buildExportPayload, createJsonBlob, downloadBlob } from '@/lib/exportUtils';
import type { Match } from '@/types/match';

const match: Match = {
  id: 'test-1',
  gender: 'men',
  stage: 'group',
  group: 'A',
  matchday: 1,
  home: 'France',
  away: 'USA',
  kickoff: '2024-07-25T09:00:00Z',
  venue: 'Parc des Princes',
  city: 'Paris',
};

describe('buildExportPayload', () => {
  it('returns an entry for each match', () => {
    const payload = buildExportPayload([match]);
    expect(payload).toHaveLength(1);
  });

  it('spreads all match fields into the entry', () => {
    const [entry] = buildExportPayload([match]);
    expect(entry.id).toBe(match.id);
    expect(entry.home).toBe(match.home);
    expect(entry.away).toBe(match.away);
  });

  it('adds an endpoint string to each entry', () => {
    const [entry] = buildExportPayload([match]);
    expect(typeof entry.endpoint).toBe('string');
    expect(entry.endpoint).toContain('/api/v1/matches/');
    expect(entry.endpoint).toContain('france-vs-usa');
  });

  it('returns an empty array for empty input', () => {
    expect(buildExportPayload([])).toEqual([]);
  });

  it('handles multiple matches', () => {
    const second: Match = { ...match, id: 'test-2', home: 'Brazil', away: 'Spain' };
    const payload = buildExportPayload([match, second]);
    expect(payload).toHaveLength(2);
    expect(payload[1].endpoint).toContain('brazil-vs-spain');
  });
});

describe('createJsonBlob', () => {
  it('returns a Blob', () => {
    const blob = createJsonBlob({ key: 'value' });
    expect(blob).toBeInstanceOf(Blob);
  });

  it('has application/json type', () => {
    const blob = createJsonBlob([]);
    expect(blob.type).toBe('application/json');
  });

  it('has non-zero size', () => {
    const blob = createJsonBlob({ foo: 'bar' });
    expect(blob.size).toBeGreaterThan(0);
  });
});

describe('downloadBlob', () => {
  it('calls URL.createObjectURL', () => {
    const blob = new Blob(['{}'], { type: 'application/json' });
    downloadBlob(blob, 'test.json');
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
  });

  it('calls URL.revokeObjectURL after download', () => {
    const blob = new Blob(['{}'], { type: 'application/json' });
    downloadBlob(blob, 'test.json');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
