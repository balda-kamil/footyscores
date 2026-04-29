import { RawStartListItem } from './fetchOlympicSchedule';

export function filterFootballMatches(items: RawStartListItem[]): RawStartListItem[] {
  return items.filter((item) => {
    if (!item.code || !item.startDate) return false;
    const teams = item.start?.filter(
      (s) => s.participant?.name && s.participant.name.trim() !== ''
    );
    return teams?.length === 2;
  });
}
