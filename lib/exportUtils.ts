import { Match } from '@/types/match';
import { generateEndpoint } from './matchUtils';
import { API_BASE_URL } from './apiConfig';

export interface ExportEntry extends Match {
  endpoint: string;
}

export function buildExportPayload(matches: Match[]): ExportEntry[] {
  return matches.map((m) => ({ ...m, endpoint: generateEndpoint(m, API_BASE_URL) }));
}

export function createJsonBlob(data: unknown): Blob {
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
