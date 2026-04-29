import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_BASE = 'https://stacy.olympics.com/OG2024/data/';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url || !url.startsWith(ALLOWED_BASE)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const upstream = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Referer: 'https://stacy.olympics.com/',
    },
    next: { revalidate: 3600 },
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: upstream.status });
  }

  const data = await upstream.json();
  return NextResponse.json(data);
}
