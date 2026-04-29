import { slugify, generateEndpoint, stageLabel, formatKickoff } from '@/lib/matchUtils';
import type { Match } from '@/types/match';

const groupMatch: Match = {
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

const knockoutMatch: Match = {
  ...groupMatch,
  id: 'test-2',
  stage: 'semi-final',
  group: null,
  matchday: null,
};

describe('slugify', () => {
  it('lowercases and replaces spaces', () => {
    expect(slugify('New Zealand')).toBe('new-zealand');
  });

  it('strips diacritics', () => {
    expect(slugify('Côte d\'Ivoire')).toBe('cote-d-ivoire');
  });

  it('collapses multiple non-alphanumeric chars', () => {
    expect(slugify('São Paulo FC')).toBe('sao-paulo-fc');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('-test-')).toBe('test');
  });

  it('handles already-clean strings', () => {
    expect(slugify('france')).toBe('france');
  });
});

describe('generateEndpoint', () => {
  it('builds a group stage endpoint', () => {
    const ep = generateEndpoint(groupMatch, 'http://api.example.com');
    expect(ep).toBe(
      'http://api.example.com/api/v1/matches/olympics-football-men/2024/group-a-matchday-1/france-vs-usa'
    );
  });

  it('builds a knockout stage endpoint', () => {
    const ep = generateEndpoint(knockoutMatch, 'http://api.example.com');
    expect(ep).toBe(
      'http://api.example.com/api/v1/matches/olympics-football-men/2024/semi-final/france-vs-usa'
    );
  });

  it('uses empty string as default base', () => {
    const ep = generateEndpoint(groupMatch);
    expect(ep).toBe('/api/v1/matches/olympics-football-men/2024/group-a-matchday-1/france-vs-usa');
  });

  it('handles women gender', () => {
    const ep = generateEndpoint({ ...groupMatch, gender: 'women' });
    expect(ep).toContain('olympics-football-women');
  });

  it('slugifies team names with special characters', () => {
    const ep = generateEndpoint({ ...groupMatch, home: 'Côte d\'Ivoire', away: 'New Zealand' });
    expect(ep).toContain('cote-d-ivoire-vs-new-zealand');
  });
});

describe('stageLabel', () => {
  it('returns group label with matchday', () => {
    expect(stageLabel(groupMatch)).toBe('Group A · MD1');
  });

  it('returns formatted knockout label', () => {
    expect(stageLabel(knockoutMatch)).toBe('Semi Final');
  });

  it('capitalizes gold-medal correctly', () => {
    expect(stageLabel({ ...knockoutMatch, stage: 'gold-medal' })).toBe('Gold Medal');
  });

  it('capitalizes bronze-medal correctly', () => {
    expect(stageLabel({ ...knockoutMatch, stage: 'bronze-medal' })).toBe('Bronze Medal');
  });

  it('capitalizes quarter-final correctly', () => {
    expect(stageLabel({ ...knockoutMatch, stage: 'quarter-final' })).toBe('Quarter Final');
  });
});

describe('formatKickoff', () => {
  it('returns date and time strings', () => {
    const result = formatKickoff('2024-07-25T09:00:00Z');
    expect(result).toHaveProperty('date');
    expect(result).toHaveProperty('time');
  });

  it('formats time in HH:MM format', () => {
    const { time } = formatKickoff('2024-07-25T09:00:00Z');
    expect(time).toMatch(/^\d{2}:\d{2}$/);
  });

  it('includes year in date', () => {
    const { date } = formatKickoff('2024-07-25T09:00:00Z');
    expect(date).toContain('2024');
  });
});
