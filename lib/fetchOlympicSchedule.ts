const SCHEDULE_URL =
  'https://stacy.olympics.com/OG2024/data/SCH_StartList~comp=OG2024~disc=FBL~lang=ENG.json';

export interface RawStartListItem {
  code: string;
  startDate: string;
  start: Array<{ sortOrder: number; participant: { name: string } }>;
  venue: { description: string };
  location: { description: string };
}

interface RawSchedule {
  schedules?: RawStartListItem[];
  [key: string]: unknown;
}

export async function fetchOlympicSchedule(): Promise<RawStartListItem[]> {
  const proxyUrl = `/api/olympics?url=${encodeURIComponent(SCHEDULE_URL)}`;
  const res = await fetch(proxyUrl);

  if (!res.ok) {
    throw new Error(`Failed to fetch schedule: ${res.status}`);
  }

  const data: RawSchedule = await res.json();

  if (!Array.isArray(data.schedules)) {
    throw new Error('Unexpected schedule data format');
  }

  return data.schedules;
}
