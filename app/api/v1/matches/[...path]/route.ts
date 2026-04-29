import { NextRequest, NextResponse } from 'next/server';

function slugToName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function parseRound(roundSlug: string): string {
  if (roundSlug.startsWith('group-')) {
    // group-a-matchday-1 → "Group A · MD1"
    const match = roundSlug.match(/^group-([a-d])-matchday-(\d+)$/);
    if (match) return `Group ${match[1].toUpperCase()} · MD${match[2]}`;
  }
  return slugToName(roundSlug);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;
  // segments: ['olympics-football-men', '2024', 'group-a-matchday-1', 'france-vs-colombia']
  if (segments.length < 4) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const [competition, season, roundSlug, matchSlug] = segments;
  const gender = competition.includes('-women') ? 'Women' : 'Men (U23)';
  const round = parseRound(roundSlug);

  const teamSlugs = matchSlug.split('-vs-');
  const home = slugToName(teamSlugs[0] ?? 'Home');
  const away = slugToName(teamSlugs[1] ?? 'Away');

  // Intentionally return a slightly different competition name and a non-null score
  // so the comparison shows real mismatch/match results.
  return NextResponse.json({
    competition: {
      name: `Paris 2024 Olympics Football — ${gender}`,
      season,
      round,
    },
    venue: {
      name: 'Olympic Stadium',
      city: 'Paris',
    },
    kickoff: `2024-07-26T17:00:00+02:00`,
    status: 'FT',
    teams: {
      home,
      away,
    },
    score: {
      home: 2,
      away: 1,
      halfTime: {
        home: 1,
        away: 0,
      },
    },
    scorers: [
      { team: home, player: 'Player A', minute: 23, type: 'open_play' },
      { team: away, player: 'Player B', minute: 67, type: 'header' },
      { team: home, player: 'Player C', minute: 88, type: 'penalty' },
    ],
    lineups: {
      home: {
        team: home,
        formation: '4-3-3',
        coach: 'Coach A',
        startingXI: [],
        bench: [],
      },
      away: {
        team: away,
        formation: '4-4-2',
        coach: 'Coach B',
        startingXI: [],
        bench: [],
      },
    },
  });
}
