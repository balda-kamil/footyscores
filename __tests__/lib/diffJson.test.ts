import { diffJson, COMPARABLE_FIELDS, DiffNode } from '@/lib/diffJson';

const expected = {
  competition: { name: 'Paris 2024 Olympics Football', season: '2024', round: 'Group A · MD1' },
  venue: { name: 'Parc des Princes', city: 'Paris' },
  kickoff: '2024-07-25T09:00:00Z',
  teams: { home: 'France', away: 'USA' },
};

describe('diffJson', () => {
  it('marks all nodes as match when data is identical', () => {
    const nodes = diffJson(expected, expected);
    const allMatch = nodes.every((n) =>
      n.children ? n.children.every((c) => c.status === 'match') : n.status === 'match'
    );
    expect(allMatch).toBe(true);
  });

  it('marks leaf as mismatch when value differs', () => {
    const actual = { ...expected, kickoff: '2024-07-25T10:00:00Z' };
    const nodes = diffJson(expected, actual);
    const kickoffNode = nodes.find((n) => n.key === 'kickoff');
    expect(kickoffNode?.status).toBe('mismatch');
    expect(kickoffNode?.expectedValue).toBe('2024-07-25T09:00:00Z');
    expect(kickoffNode?.actualValue).toBe('2024-07-25T10:00:00Z');
  });

  it('marks child as mismatch when nested value differs', () => {
    const actual = {
      ...expected,
      competition: { ...expected.competition, name: 'Wrong Name' },
    };
    const nodes = diffJson(expected, actual);
    const compNode = nodes.find((n) => n.key === 'competition');
    expect(compNode?.status).toBe('mismatch');
    const nameChild = compNode?.children?.find((c) => c.key === 'name');
    expect(nameChild?.status).toBe('mismatch');
  });

  it('marks parent as match when all children match', () => {
    const nodes = diffJson(expected, expected);
    const compNode = nodes.find((n) => n.key === 'competition');
    expect(compNode?.status).toBe('match');
  });

  it('marks node as missing when top-level key absent from actual', () => {
    const { kickoff: _k, ...actualWithoutKickoff } = expected as Record<string, unknown>;
    const nodes = diffJson(expected, actualWithoutKickoff);
    const kickoffNode = nodes.find((n) => n.key === 'kickoff');
    expect(kickoffNode?.status).toBe('missing');
  });

  it('marks children as missing when parent key absent from actual', () => {
    const { competition: _c, ...actualWithoutComp } = expected as Record<string, unknown>;
    const nodes = diffJson(expected, actualWithoutComp);
    const compNode = nodes.find((n) => n.key === 'competition');
    expect(compNode?.status).toBe('missing');
    compNode?.children?.forEach((child) => {
      expect(child.status).toBe('missing');
    });
  });

  it('only compares COMPARABLE_FIELDS and ignores other keys in actual', () => {
    const actualWithExtra = {
      ...expected,
      score: { home: 3, away: 1 },
      status: 'FT',
      scorers: ['Mbappe'],
    };
    const nodes = diffJson(expected, actualWithExtra);
    const keys = nodes.map((n) => n.key);
    expect(keys).not.toContain('score');
    expect(keys).not.toContain('status');
    expect(keys).not.toContain('scorers');
  });

  it('produces exactly one node per top-level group in COMPARABLE_FIELDS', () => {
    const nodes = diffJson(expected, expected);
    const topKeys = new Set(COMPARABLE_FIELDS.map((f) => f.split('.')[0]));
    expect(nodes.length).toBe(topKeys.size);
  });

  it('marks parent as missing when any child is missing', () => {
    const actualMissingCompField = {
      ...expected,
      competition: { name: 'Paris 2024 Olympics Football' },
    };
    const nodes = diffJson(expected, actualMissingCompField);
    const compNode = nodes.find((n) => n.key === 'competition');
    expect(compNode?.status).toBe('missing');
  });

  it('accepts custom paths', () => {
    const nodes = diffJson(expected, expected, ['kickoff']);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].key).toBe('kickoff');
    expect(nodes[0].status).toBe('match');
  });

  it('correctly identifies mismatch in teams', () => {
    const actual = { ...expected, teams: { home: 'Germany', away: 'USA' } };
    const nodes = diffJson(expected, actual);
    const teamsNode = nodes.find((n) => n.key === 'teams') as DiffNode;
    const homeChild = teamsNode.children?.find((c) => c.key === 'home');
    const awayChild = teamsNode.children?.find((c) => c.key === 'away');
    expect(homeChild?.status).toBe('mismatch');
    expect(awayChild?.status).toBe('match');
  });
});
