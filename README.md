# Little Joy Arcade

A small, polished home for hand-made casual games — plus the shared SDK, database schema and deployment
tooling that lets the collection grow without rebuilding the platform each time.

- **Hosting:** GitHub Pages for everything — the portal at <https://littlejoyarcade.site> and every game at
  `https://<game>.littlejoyarcade.site/play/` (`public/CNAME` + per-repo Pages custom domains)
- **Backend:** Supabase project `fqovramltegcfiyebyrt` — schema, RLS and the catalogue seed are applied; the two
  public keys are set as repository variables. Firebase is not used for the site or the games
- **DNS:** GoDaddy nameservers unchanged; apex A records point at GitHub Pages, `www` CNAMEs to the apex, and each
  game hostname CNAMEs to `jd4rider.github.io`
- **Games in the catalogue:** 11 (Bubble Wrap, Pipe Dreams, Jewel Match, Pixel Stitch, Sand Sort Studio,
  Lighthouse Keeper, Laser Logic, Circuit Crafter, Rumble Rally, Whisker Grid, Blocked In)

## What is here

| Path | What it is |
| --- | --- |
| `src/` | The portal: React 19 + TypeScript + Vite + Tailwind CSS 4 |
| `packages/sdk/` | `@littlejoyarcade/sdk` — auth, progress, achievements, entitlements, analytics, adapters |
| `supabase/migrations/` | PostgreSQL schema, row level security and seed data |
| `*.md` at the root | Architecture, inventory, database, deployment, DNS, SDK, monetization, security, roadmap |
| `.github/workflows/` | CI (typecheck, lint, tests, build), the Pages deploy and the nightly play-route probe |

Game repositories stay independent. The portal links to each game's existing deployment, so a new game
version ships from its own repo without touching this one.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run lint
npm test
npm run build
```

Node 20.19+ or 22+ is required by Vite 8 in the game repos; this repo pins Vite 6 so Node 20.18 works too.

## Backend (optional)

GitHub Pages hosts the app; the database and login live in Supabase. Guest play and local saves work with no
backend. Accounts, cloud saves, achievements, entitlements and the admin area activate when these public build
variables exist as repository variables (`gh variable set`), which the Pages workflow passes to the build:

```bash
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

Never put a service-role key in this project. See `DEPLOYMENT.md` and `SECURITY.md`.

## Make it a full app (Pages + Supabase)

GitHub Pages hosts the app; Supabase provides the database and login. `pages.yml` is the only deploy path:

1. **Apply the schema:** `npx supabase link --project-ref <ref> && npx supabase db push`.
2. **Set the build variables:** `gh variable set VITE_SUPABASE_URL --body '<url>'` and
   `gh variable set VITE_SUPABASE_ANON_KEY --body '<anon key>'`.
3. **Deploy:** push to `main`; the Pages workflow builds with those variables and publishes.
4. **Grant yourself admin:** `update public.profiles set role = 'admin' where id = '<auth uid>';`.

Full runbook: `DEPLOYMENT.md`. DNS records and verification: `DNS_CONFIGURATION.md`.

## Where a game lives

Every game is its own GitHub Pages project site. Its repo publishes the playable build to `/play/`, which is
public at `https://jd4rider.github.io/<game>/play/`. A Pages site has one canonical hostname, so a game repo must
not set a custom domain or ship `public/CNAME` — that would 301 the `github.io` URL to a hostname whose
certificate GitHub has not issued, and the embedded player would fail. The play page still prefers
`https://<game>.littlejoyarcade.site/play/` and silently falls back to `github.io` when that host is unreachable.
`docs/SDK.md` has the full publishing contract.

## Routing

The portal uses hash routes (`/#/game/pipe-dreams`) so it works identically on the Pages project path, the
custom domain and inside Electron without rewrite rules. Game pages themselves are served from each game's own origin.

## Status

Working and verified: the catalogue, search and filters, game detail pages, embedded play shell, guest
dashboard with local achievements and data export, responsive layout, CI, Pages deployment, the custom domain,
and the Supabase database with row level security.

Waiting on one dashboard setting: the Supabase Site URL and redirect allow-list, which email magic-link login
needs. Cloud saves, entitlements, the storefront and the owner admin area are built and will work once a player
can sign in.

Not started: per-game SDK wiring inside the eight game repos, payment provider checkout, AdSense units,
Capacitor mobile builds. `ROADMAP.md` lists the order.
