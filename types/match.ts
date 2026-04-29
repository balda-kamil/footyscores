export type Stage = 'group' | 'quarter-final' | 'semi-final' | 'bronze-medal' | 'gold-medal';
export type Gender = 'men' | 'women';

export interface Match {
  id: string;
  gender: Gender;
  stage: Stage;
  group: string | null;
  matchday: number | null;
  home: string;
  away: string;
  kickoff: string;
  venue: string;
  city: string;
}
