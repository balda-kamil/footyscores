import { isEqual, get } from 'lodash';

export const COMPARABLE_FIELDS = [
  'competition.name',
  'competition.season',
  'competition.round',
  'venue.name',
  'venue.city',
  'kickoff',
  'teams.home',
  'teams.away',
] as const;

export type DiffStatus = 'match' | 'mismatch' | 'missing';

export interface DiffNode {
  key: string;
  status: DiffStatus;
  expectedValue?: unknown;
  actualValue?: unknown;
  children?: DiffNode[];
}

export function diffJson(
  expected: Record<string, unknown>,
  actual: Record<string, unknown>,
  paths: readonly string[] = COMPARABLE_FIELDS
): DiffNode[] {
  const groups = new Map<string, string[]>();

  for (const path of paths) {
    const dot = path.indexOf('.');
    const top = dot === -1 ? path : path.slice(0, dot);
    const rest = dot === -1 ? '' : path.slice(dot + 1);
    if (!groups.has(top)) groups.set(top, []);
    if (rest) groups.get(top)!.push(rest);
  }

  return Array.from(groups.entries()).map(([topKey, subPaths]) => {
    if (subPaths.length === 0) {
      const expectedVal = get(expected, topKey);
      const actualVal = get(actual, topKey);
      const status =
        !(topKey in actual) ? 'missing'
        : isEqual(expectedVal, actualVal) ? 'match'
        : 'mismatch';
      return { key: topKey, status, expectedValue: expectedVal, actualValue: actualVal };
    }

    const expectedSub = (get(expected, topKey) ?? {}) as Record<string, unknown>;
    const actualSub = (get(actual, topKey) ?? {}) as Record<string, unknown>;
    const topMissing = !(topKey in actual);

    const children: DiffNode[] = subPaths.map((subKey) => {
      const expectedVal = get(expectedSub, subKey);
      const actualVal = get(actualSub, subKey);
      const status =
        topMissing || !(subKey in actualSub) ? 'missing'
        : isEqual(expectedVal, actualVal) ? 'match'
        : 'mismatch';
      return { key: subKey, status, expectedValue: expectedVal, actualValue: actualVal };
    });

    const parentStatus =
      children.every((c) => c.status === 'match') ? 'match'
      : children.some((c) => c.status === 'missing') ? 'missing'
      : 'mismatch';

    return { key: topKey, status: parentStatus, children };
  });
}
