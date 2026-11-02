# Deployment

## GitHub Pages is the only deployment

Nothing else deploys this project. There is one workflow that publishes
(`.github/workflows/pages.yml`), one host (`jd4rider.github.io`), and one custom
domain (`littlejoyarcade.site`). Firebase, Netlify, Cloudflare Pages and Vercel
were evaluated during setup and are no longer configured — their workflows and
config files have been removed, so a push can never publish a second copy that
drifts from the live site.

| Piece | Where it runs |
| --- | --- |
| Portal | GitHub Pages project site `jd4rider/littlejoyarcade`, custom domain `littlejoyarcade.site` |
| Games | One GitHub Pages project site per game repo, playable build published to `/play/` |
| Game URLs | `https://jd4rider.github.io/<game>/play/` — no custom domain on the game repos |
| Database + login | Supabase project `fqovramltegcfiyebyrt` |
| Builds | GitHub Actions: `pages.yml` deploys, `ci.yml` checks, `check-play-routes.yml` probes the live URLs |

```bash
git push origin main        # CI runs typecheck/lint/tests/build, then Pages deploys
gh run list --repo jd4rider/littlejoyarcade --limit 5
```

`public/CNAME` holds `littlejoyarcade.site`, the HashRouter keeps deep links
working on the project path, and `base: './'` keeps the assets portable.

## The one-canonical-hostname rule

GitHub gives each Pages site exactly one canonical hostname. If a game repo sets
a custom domain (or ships a `public/CNAME`), `jd4rider.github.io/<game>/` 301s to
that hostname instead of serving the game. That is what broke the embedded
player: the redirect landed on a subdomain whose certificate had never been
issued, so the iframe failed and showed a black screen. The game repos therefore
carry no `public/CNAME` and no Pages custom domain, and the catalogue links the
`github.io` build. See `DNS_CONFIGURATION.md` for the subdomain state.

## Play route resolution and health checks

A catalogue entry carries two URLs: `playUrl` (the canonical Pages build) and an
optional `preferredPlayUrl` (`https://<game>.littlejoyarcade.site/play/`). At
play time `src/lib/playUrl.ts` probes the preferred host with a 2.5 s `no-cors`
fetch — which only resolves when DNS and TLS both work — and falls back to
`playUrl` when the probe fails. The verdict is cached in `sessionStorage` for ten
minutes, so a host that recovers or breaks is picked up without a redeploy.

```bash
node scripts/check-play-routes.mjs          # table; exits 1 only if a canonical URL is down
node scripts/check-play-routes.mjs --strict # also fails while any subdomain is unreachable
```

`.github/workflows/check-play-routes.yml` runs that probe nightly, on catalogue
changes and on demand, and opens (or comments on) a single GitHub issue titled
*Play route health: a game is unreachable*.

## Environment variables

The backend is optional. These are repository **variables**, injected into the
build by `pages.yml`; without them the site is guest-only and still works:

```bash
gh variable set VITE_SUPABASE_URL --body 'https://<project>.supabase.co'
gh variable set VITE_SUPABASE_ANON_KEY --body '<anon key>'
```

Vite inlines `VITE_*` at build time, so changing a variable only takes effect
after the next deploy. Never put a service-role key in a `VITE_*` variable.

## Supabase

Migrations live in `supabase/migrations/` and are applied with the Supabase CLI:

```bash
npx supabase link --project-ref fqovramltegcfiyebyrt
npx supabase db push
npx supabase secrets set GODADDY_PAT=gd_pat_...   # only for register-subdomain
npx supabase functions deploy register-subdomain
```

Auth redirect URLs must include `https://littlejoyarcade.site/**`,
`https://www.littlejoyarcade.site/**`, `https://jd4rider.github.io/littlejoyarcade/**`
and `http://localhost:5173/**`. Grant the owner role with:

```sql
update public.profiles set role = 'admin' where id = '<auth uid>';
```

## Keeping the catalogue current

`.github/workflows/sync-releases.yml` runs `scripts/sync-releases.mjs` every six
hours (also on `workflow_dispatch` or a `game-release` repository dispatch). It
reads each repository's latest published release and regenerates
`src/data/releases.json`; the catalogue merges that file at load time, so
hand-written copy is never touched. The commit triggers CI and the Pages deploy.

```bash
GITHUB_TOKEN=$(gh auth token) npm run sync:releases   # idempotent, safe locally
```

The displayed version is the newer of the repo's `package.json` version and its latest release tag, so bumping and
pushing a game updates the catalogue even before anyone cuts a release. Download buttons only appear when a release
tagged with the displayed version exists, so a link can never point at a file that was never uploaded. A game needs
the standard asset names (`-mac-arm64.dmg`, `-mac-x64.dmg`, `-win-setup.exe`, `-linux-x86_64.AppImage`) for the
buttons to fill in.

## Per-game deployment

Each game keeps its own repository and pipeline:

- Web: the game repo's `pages.yml` publishes the build to `/play/` on its project site.
- Desktop: its `release.yml` on `v*` tags (dmg/NSIS/AppImage).
- The portal never builds a game; it links the game's origin. A new version
  ships from the game repo without touching this one.

When a game's URL changes, update both `playUrl` in `src/data/games.ts` and the
row in `public.games` (`npm run publish:game` or the admin page).

## Local builds

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production bundle
npm run preview
npm test
```

## Checklist

- [x] Pages workflow is the only deploy path
- [x] Guest-only build works with no backend
- [x] Schema, RLS and seed migrations applied
- [x] Custom domain served over HTTPS with a valid certificate
- [x] Play-route health check scheduled
- [ ] Owner role granted after the first signed-in account
- [ ] Desktop installers rebuilt with the arcade client
