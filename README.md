# footy-scores-validator

A Next.js tool for validating football API endpoints against the Paris 2024 Olympic schedule.

---

## Install & run

```bash
npm install
cp .env.local.example .env.local   # or create manually
npm run dev                         # http://localhost:3000
```

**`.env.local`**
```
NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com
```

This is the base URL of the football API being tested. For local development set it to `http://localhost:3000` — the app includes a mock API at `/api/v1/matches/[...path]` that returns plausible fixture data with intentional mismatches for demo purposes.

---

## Deploy

```bash
npm run build
npm start
```

Standard Next.js deployment — works on Vercel, Fly.io, or any Node host. Set `NEXT_PUBLIC_API_BASE_URL` as an environment variable in your deployment target.

---

## How data is retrieved and parsed

1. **Fetch** — the browser calls `/api/olympics?url=...`, a Next.js server route that proxies the official Olympic schedule CDN (`stacy.olympics.com`). The proxy adds the required `Referer` header (the CDN blocks requests without it). The response is cached server-side for 1 hour.

2. **Filter** — `filterFootballMatches` keeps only items that have a non-empty `code`, a `startDate`, and exactly two participants with non-blank names. Everything else is dropped silently.

3. **Normalize** — `normalizeMatch` decodes each item's RSC event code:
   - `code[3]` → gender: `'W'` = women, anything else = men
   - `code.substring(22, 26)` → phase: `GPA-`/`GPB-`/`GPC-`/`GPD-` = group stages A–D, `QFNL` = quarter-final, `SFNL` = semi-final, `FNL-` = final
   - `code.substring(26, 32)` → sequence number (raw integer ÷ 100); used to derive matchday for group games and to distinguish gold vs bronze for finals

4. **Sort** — `sortMatches` orders by kickoff time ascending, then home team name, then away team name as tie-breakers.

---

## How endpoint ordering is determined

Each match produces one API endpoint with the following path structure:

```
/api/v1/matches/{competition}/{season}/{round}/{home}-vs-{away}
```

| Segment | Value |
|---|---|
| `competition` | `olympics-football-men` or `olympics-football-women` |
| `season` | always `2024` |
| `round` | group: `group-{a–d}-matchday-{1–3}` · knockouts: `quarter-final`, `semi-final`, `gold-medal`, `bronze-medal` |
| `{home}-vs-{away}` | team names run through `slugify`: lowercased, diacritics stripped (NFD), non-alphanumeric runs replaced with `-`, leading/trailing hyphens trimmed |

The display order in the table matches the sort order above (earliest kickoff first).

---

## Assumptions for missing or inconsistent schedule data

| Situation | Behaviour |
|---|---|
| Item missing `code` or `startDate` | Dropped by `filterFootballMatches` — not shown in the UI |
| Fewer than 2 named participants (TBD slots) | Dropped — no endpoint generated |
| Participant name is whitespace-only | Treated as missing — item dropped |
| Group letter outside `{A, B, C, D}` | Falls through to the default branch: rendered as a group match with `group: null` and `matchday` equal to the raw sequence number |
| `FNL-` with sequence = 1 | Gold medal match; sequence ≥ 2 → bronze medal |
| `location.description` contains commas | Everything after the **last** comma is used as the city name |
| `NEXT_PUBLIC_API_BASE_URL` not set | Defaults to `''` — endpoints are rendered as relative paths and comparison requests hit the same origin |
