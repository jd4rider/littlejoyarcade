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

Migrations live in `supabase/migrations/` and are applied with the Supabase CLI.
**Use the CLI you are already logged in to** — there is no need for the
dashboard, a service-role key, or the owner's password:

```bash
supabase login                        # once per machine; skip if the next command works
supabase projects list                # proves the saved token is valid
supabase link --project-ref fqovramltegcfiyebyrt
supabase migration list --linked      # local vs remote history before you push
supabase db push                      # applies every migration the remote lacks
```

`supabase db push` writes to production, so read the SQL first and keep the
project linked. If a migration was applied by hand (for example with `psql`),
record it so the next `db push` does not run it again:

```bash
psql "$(cat supabase/.temp/pooler-url)" -v ON_ERROR_STOP=1 \
  -f supabase/migrations/00NN_name.sql
supabase migration repair --status applied 00NN --remote --yes
supabase migration list --linked      # 00NN should now show in both columns
```

Notes that have cost time before:

- Use the Homebrew CLI (`/opt/homebrew/bin/supabase`). An older npm global
  build can fail on macOS with a darwin binary error.
- Migration prefixes must be unique. Two files sharing a prefix (two `0046_*`)
  means the second is skipped; renumber it and repair the history.
- Never commit `supabase/.temp/` or `.secrets/`, and never put a service-role
  key in a `VITE_*` variable or a game build.

```bash
supabase secrets set GODADDY_PAT=gd_pat_...   # only for register-subdomain
supabase functions deploy register-subdomain
```

Auth redirect URLs must include `https://littlejoyarcade.site/**`,
`https://www.littlejoyarcade.site/**`, `https://jd4rider.github.io/littlejoyarcade/**`
and `http://localhost:5173/**`. Grant the owner role with:

```sql
update public.profiles set role = 'admin' where id = '<auth uid>';
```

## Wiring a game into accounts and saves

The platform owns the account, the cloud row and the shelf; a game only has to
copy one client and say which keys are its save. Do not fork the client logic.

### 1. Add the client (sign-in, sync, account panel)

1. Copy `packages/sdk/desktop/arcade-client.js` into the game's `public/`
   unchanged. It already carries the project URL and public anon key.
2. Load it with the game's catalogue id:

   ```html
   <script src="./arcade-client.js" data-game-id="jewel-match"></script>
   ```

3. If the game's build step regenerates the play page, copy the file and inject
   that tag from the build script (see Orb Frenzy's `scripts/prepare-site.mjs`)
   and fail the build when the tag or file is missing.

Sign-in then works three ways with no extra code:

- **Embedded in the portal** — the portal posts `{ type: 'lja:session' }` to the
  game's origin, so a player signed in at `littlejoyarcade.site` is signed in
  inside the game.
- **Opened in a new tab** — the client announces `lja:ready` to `window.opener`
  and the portal answers with the same session message, so “Open in new tab”
  stays signed in. The session is then kept in that origin's `localStorage`.
- **Opened directly** — the game shows its own account pill and the session
  persists for that origin after the first sign-in.

Signing in or out inside a game posts `lja:auth` back to the portal, so the
header and every other game agree on who is playing. Sessions are per origin:
that is why the handoff exists; do not try to share `localStorage` across games.

### 2. Declare this game's save keys

Every `jd4rider.github.io` build shares one `localStorage` origin, so the client
mirrors **only this game's keys**. Name them after the game id
(`jewel-match-save-v2`) or declare them explicitly when they do not match:

```html
<script
  src="./arcade-client.js"
  data-game-id="sand-sort-studio"
  data-save-keys="sand-sort-save-v1"
></script>
```

`window.LJA_SAVE_KEYS = ['key-a', 'key-b']` works too. A game that stores its
save somewhere else (IndexedDB, Unity `PlayerPrefs`) defines
`window.LJA_SNAPSHOT()` / `window.LJA_APPLY_SNAPSHOT(keys)`; the Orb Frenzy shim
is the reference (`public/arcade-unity.js`). Never publish an empty snapshot:
the client already guards this, and scoping the keys is what stops one game's
sync from overwriting another game's row.

### 3. Save progression

The drop-in client mirrors the declared keys into `public.game_progress`
(`{ keys, savedAt }`) automatically — that covers games that already have a
save module. For a typed API, use the SDK:

```ts
const arcade = createArcade({ gameId: 'jewel-match', schemaVersion: 1, cloud: createSupabaseCloud(supabase) })
await arcade.initialize()
const saved = arcade.progress.load<Save>()
await arcade.progress.save({ ...saved, level: 4 })
await arcade.progress.sync()
```

- Save on level complete, level failed, settings change, pause and quit.
- Newest `savedAt` wins; ties go to the cloud. A device with no local keys
  adopts the cloud copy instead of pushing over it.
- Offline writes queue and flush on the next sync. A failed sync is silent and
  never blocks gameplay.
- Unlocks/achievements use `arcade.achievements.unlock('<game>.<slug>')` (or
  `LJA_UnitySave.unlock` in Unity). They are cosmetic and never gate content.

Favorites and recently played are portal features: favorites live in
`public.game_favorites` and recently played in `public.game_activity`, merged
with the device copy at sign-in. **No game code is needed for either.**

### 4. Verify before shipping

1. Guest play with the network blocked: the game plays and saves locally.
2. Sign in on the portal, open the game, finish a level, then open the same
   game in a second browser profile: the level is restored.
3. Click “Open in new tab”: the game opens already signed in.
4. Play two levels offline, reconnect, and confirm the cloud row catches up
   without a duplicate or an older overwrite.
5. Phone viewport: the account pill does not cover controls, and full screen
   keeps the bottom of the game on screen.

References: `SDK_INTEGRATION.md` (typed SDK), `UNITY_ACCOUNT_SAVE_BRIEF.md`
(Unity WebGL end to end), `docs/SDK.md` (drop-in client) and `docs/SSO.md`
(social providers).

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
