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
| `.github/workflows/` | CI (typecheck, lint, tests, build) and Pages preview deployment |
| `vercel.json` | Vercel build settings, caching and security headers |
| `wrangler.toml` | Cloudflare Pages project configuration |

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

Vercel hosts the app; the database and login live in Supabase. Guest play and local saves work with no backend.
Accounts, cloud saves, achievements, entitlements and the admin area activate when these public build variables
exist (Vercel → Settings → Environment Variables, then redeploy):

```bash
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

Never put a service-role key in this project. See `DEPLOYMENT.md` and `SECURITY.md`.

## Make it a full app (Vercel + Supabase)

Vercel hosts the app; Supabase provides the database and login. `vercel.json` already configures the build, so
importing the repository is enough:

1. **Import** the repo at <https://vercel.com/new> (framework and output are detected).
2. **Create the database:** add Supabase from Vercel's Marketplace, or create a free project at supabase.com.
3. **Apply the schema:** `npx supabase link --project-ref <ref> && npx supabase db push`.
4. **Set env vars** in Vercel → Settings → Environment Variables for Production and Preview:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — then redeploy.
5. **Connect the domain:** already attached in Vercel; replace the GoDaddy parking records with the two A
   records in `DNS_CONFIGURATION.md` and Vercel issues the certificate.

Full runbook: `DEPLOYMENT.md`. DNS records and verification: `DNS_CONFIGURATION.md`.

## Where a game lives

Every game is its own GitHub Pages project site. Its repo publishes the playable build to `/play/`, its
subdomain CNAMEs to `jd4rider.github.io`, and the repo's Pages custom domain is set to that subdomain. So
`https://jewel-match.littlejoyarcade.site/play/` and `jd4rider.github.io/jewel-match/play/` are the same files,
with GitHub redirecting the second form to the first. `docs/SDK.md` has the full publishing contract.

## Routing

The portal uses hash routes (`/#/game/pipe-dreams`) so it works identically on GitHub Pages, Cloudflare Pages
and inside Electron without rewrite rules. Game pages themselves are served from each game's own origin.

## Status

Working and verified: the catalogue, search and filters, game detail pages, embedded play shell, guest
dashboard with local achievements and data export, responsive layout, CI, Pages deployment, the custom domain,
and the Supabase database with row level security.

Waiting on one dashboard setting: the Supabase Site URL and redirect allow-list, which email magic-link login
needs. Cloud saves, entitlements, the storefront and the owner admin area are built and will work once a player
can sign in.

Not started: per-game SDK wiring inside the eight game repos, payment provider checkout, AdSense units,
Capacitor mobile builds. `ROADMAP.md` lists the order.
