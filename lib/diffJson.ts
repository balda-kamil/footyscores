import { isEqual } from 'lodash';

export type DiffStatus = 'match' | 'mismatch' | 'missing' | 'extra';

export interface DiffNode {
  key: string;
  status: DiffStatus;
  expectedValue?: unknown;
  actualValue?: unknown;
  children?: DiffNode[];
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function diffValues(key: string, expected: unknown, actual: unknown): DiffNode {
  if (isObject(expected) && isObject(actual)) {
    const children = diffObjects(expected, actual);
    const allMatch = children.every((c) => c.status === 'match');
    return { key, status: allMatch ? 'match' : 'mismatch', children };
  }

  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (isEqual(expected, actual)) {
      return { key, status: 'match', expectedValue: expected, actualValue: actual };
    }
    return { key, status: 'mismatch', expectedValue: expected, actualValue: actual };
  }

  if (isEqual(expected, actual)) {
    return { key, status: 'match', expectedValue: expected, actualValue: actual };
  }

  return { key, status: 'mismatch', expectedValue: expected, actualValue: actual };
}

function diffObjects(
  expected: Record<string, unknown>,
  actual: Record<string, unknown>
): DiffNode[] {
  const nodes: DiffNode[] = [];

  for (const key of Object.keys(expected)) {
    if (!(key in actual)) {
      nodes.push({ key, status: 'missing', expectedValue: expected[key] });
    } else {
      nodes.push(diffValues(key, expected[key], actual[key]));
    }
  }

  for (const key of Object.keys(actual)) {
    if (!(key in expected)) {
      nodes.push({ key, status: 'extra', actualValue: actual[key] });
    }
  }

  return nodes;
}

export function diffJson(
  expected: Record<string, unknown>,
  actual: Record<string, unknown>
): DiffNode[] {
  return diffObjects(expected, actual);
}
