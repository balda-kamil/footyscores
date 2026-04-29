import { normalizeMatch } from '@/lib/normalizeMatch';
import type { RawStartListItem } from '@/lib/fetchOlympicSchedule';

// code layout: positions 0-21 = prefix, 22-25 = phase (4 chars), 26-31 = seq (6 chars)
// code[3] = gender char ('W' = women, else men)
function makeCode(gender: 'men' | 'women', phase: string, seq: string): string {
  const gChar = gender === 'women' ? 'W' : 'M';
  return 'OG0' + gChar + '0'.repeat(18) + phase + seq;
}

function makeItem(code: string, overrides?: Partial<RawStartListItem>): RawStartListItem {
  return {
    code,
    startDate: '2024-07-25T09:00:00Z',
    start: [
      { sortOrder: 1, participant: { name: 'Team A' } },
      { sortOrder: 2, participant: { name: 'Team B' } },
    ],
    venue: { description: 'Parc des Princes' },
    location: { description: 'Stade de Lyon, Lyon' },
    ...overrides,
  };
}

describe('normalizeMatch', () => {
  it('parses men gender', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'GPA-', '000100')));
    expect(m.gender).toBe('men');
  });

  it('parses women gender', () => {
    const m = normalizeMatch(makeItem(makeCode('women', 'GPA-', '000100')));
    expect(m.gender).toBe('women');
  });

  it('parses group A stage', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'GPA-', '000100')));
    expect(m.stage).toBe('group');
    expect(m.group).toBe('A');
  });

  it('parses group B stage', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'GPB-', '000100')));
    expect(m.group).toBe('B');
  });

  it('parses group C stage', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'GPC-', '000100')));
    expect(m.group).toBe('C');
  });

  it('parses group D stage', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'GPD-', '000100')));
    expect(m.group).toBe('D');
  });

  it('calculates matchday 1 from seq 000100', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'GPA-', '000100')));
    expect(m.matchday).toBe(1);
  });

  it('calculates matchday 1 from seq 000200', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'GPA-', '000200')));
    expect(m.matchday).toBe(1);
  });

  it('calculates matchday 2 from seq 000300', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'GPA-', '000300')));
    expect(m.matchday).toBe(2);
  });

  it('calculates matchday 3 from seq 000500', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'GPA-', '000500')));
    expect(m.matchday).toBe(3);
  });

  it('parses quarter-final stage', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'QFNL', '000100')));
    expect(m.stage).toBe('quarter-final');
    expect(m.group).toBeNull();
    expect(m.matchday).toBeNull();
  });

  it('parses semi-final stage', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'SFNL', '000100')));
    expect(m.stage).toBe('semi-final');
  });

  it('parses gold-medal from FNL- seq 000100', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'FNL-', '000100')));
    expect(m.stage).toBe('gold-medal');
  });

  it('parses bronze-medal from FNL- seq 000200', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'FNL-', '000200')));
    expect(m.stage).toBe('bronze-medal');
  });

  it('sets id to item code', () => {
    const code = makeCode('men', 'GPA-', '000100');
    const m = normalizeMatch(makeItem(code));
    expect(m.id).toBe(code);
  });

  it('assigns home to lower sortOrder participant', () => {
    const item = makeItem(makeCode('men', 'GPA-', '000100'), {
      start: [
        { sortOrder: 2, participant: { name: 'Away Team' } },
        { sortOrder: 1, participant: { name: 'Home Team' } },
      ],
    });
    const m = normalizeMatch(item);
    expect(m.home).toBe('Home Team');
    expect(m.away).toBe('Away Team');
  });

  it('parses city from location after last comma', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'GPA-', '000100'), {
      location: { description: 'Stade de France, Saint-Denis, Paris' },
    }));
    expect(m.city).toBe('Paris');
  });

  it('uses full location when no comma present', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'GPA-', '000100'), {
      location: { description: 'Paris' },
    }));
    expect(m.city).toBe('Paris');
  });

  it('maps venue description', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'GPA-', '000100'), {
      venue: { description: 'Stade Vélodrome' },
    }));
    expect(m.venue).toBe('Stade Vélodrome');
  });

  it('maps kickoff from startDate', () => {
    const m = normalizeMatch(makeItem(makeCode('men', 'GPA-', '000100'), {
      startDate: '2024-08-09T18:00:00Z',
    }));
    expect(m.kickoff).toBe('2024-08-09T18:00:00Z');
  });
});
