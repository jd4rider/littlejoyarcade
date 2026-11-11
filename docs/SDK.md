# Little Joy Arcade SDK

Everything a game needs to plug into the arcade: accounts, cloud saves,
achievements, entitlements, analytics, and publishing a new title. The SDK is
framework-agnostic TypeScript in `packages/sdk`, plus one dependency-free
browser/Electron client and two Node publishing scripts.

```
packages/sdk/
  src/index.ts      createArcade, progress store helper
  src/client.ts     the runtime (local-first, offline-safe)
  src/supabase.ts   CloudAdapter backed by Supabase + RLS
  src/local.ts      storage, envelopes, conflict merging
  src/phaser.ts     bridge for Phaser scenes
  src/react.tsx     hook/provider for React
  src/electron.ts   file-backed storage for Electron preload bridges
  desktop/arcade-client.js   drop-in script: account panel + cloud mirror
```

## 1. Quick start (any game)

```ts
import { createArcade, createSupabaseCloud } from '@littlejoyarcade/sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

const arcade = createArcade({
  gameId: 'star-trail',
  schemaVersion: 1,
  cloud: createSupabaseCloud(supabase),
})

await arcade.initialize()          // resolves the signed-in user, then syncs
const save = arcade.progress.load() // local first; never blocks on the network
arcade.progress.save({ level: 4 })  // writes locally, pushes when signed in
await arcade.achievements.unlock('first_clear')
```

`progress.save` always writes locally first. When the player is signed in and
online it also writes the cloud row; offline it queues a pending envelope that
the next `sync()` flushes. Newest `updatedAt` wins, ties go to the cloud, and a
local edit is never silently replaced by an older cloud copy.

## 2. Interfaces

```ts
interface Arcade {
  gameId: string
  initialize(): Promise<ArcadeUser | null>
  auth: {
    getUser(): ArcadeUser | null
    refresh(): Promise<ArcadeUser | null>
    signOut(): Promise<void>
    onChange(listener: (user: ArcadeUser | null) => void): () => void
  }
  progress: {
    load<T>(): T | null
    save<T>(data: T): Promise<void>
    sync(): Promise<SyncStatus>
    status(): SyncStatus
    clear(): void
  }
  achievements: { unlock(slug): Promise<boolean>; has(slug): boolean; list(): string[]; sync(): Promise<string[]> }
  entitlements: { has(slug): boolean; list(): string[]; refresh(): Promise<string[]>; adsAllowed(): boolean }
  store: { getProducts(): Promise<Product[]> }
  analytics: { track(name, props?): void; events(): ArcadeEvent[]; flush(): Promise<void> }
  support: { url: string; open(): void }
  platform: { runtime: 'browser' | 'electron' | 'capacitor' | 'unknown'; online: boolean; touch: boolean }
  envelope(): ProgressEnvelope | null
}
```

Types (`src/types.ts`): `Json`, `StorageLike`, `ArcadeUser`, `ProgressEnvelope`,
`SyncStatus`, `Product`, `AchievementDefinition`, `ArcadeEvent`, `PlatformInfo`,
`CloudAdapter`, `ArcadeOptions`.

`CloudAdapter` is the only backend surface. Swap Supabase for anything by
implementing `loadProgress`, `saveProgress`, `loadAchievements`,
`unlockAchievement`, `loadEntitlements`, `listProducts`, and optionally
`getUser`/`signOut`/`onAuthChange`.

## 3. Framework adapters

**Phaser** — `import { attachArcade } from '@littlejoyarcade/sdk/phaser'` then
call `attachArcade(scene, arcade)` to get a scene-scoped save/achievement helper,
or use `arcade` directly in `create()`; no Phaser dependency is imported by the
SDK itself.

**React** — wrap the app in `<ArcadeProvider arcade={arcade}>` from
`@littlejoyarcade/sdk/react` and call `useArcade()` in components.

**Electron** — keep `contextIsolation: true` and `sandbox: true`. Expose a
narrow preload bridge and adapt it with `createElectronStorage(bridge)` so saves
live in `app.getPath('userData')` instead of `localStorage`.

## 4. Drop-in client (no build step)

For games that already ship their own save code, copy
`packages/sdk/desktop/arcade-client.js` into `public/` and load:

```html
<script src="./arcade-client.js" data-game-id="star-trail"></script>
```

It adds an account panel (create/sign in/sync/sign out), refreshes sessions, and
mirrors Web Storage keys into `game_progress`. For IndexedDB/SQLite saves, define
`window.LJA_SNAPSHOT` / `window.LJA_APPLY_SNAPSHOT` before loading it. The public
anon key inside the file is safe to ship; RLS protects the rows.

Because every `jd4rider.github.io` game shares one storage origin, only the
game's own keys are mirrored: keys named `<game-id>-…` by default, or exactly
the list in `data-save-keys` / `window.LJA_SAVE_KEYS` when the save predates the
id (for example `bubble-wrap-save-v2` for `bubblewrap`). Declaring the list is
what keeps one game's sync from replacing another game's cloud row.

The client also joins the player's portal session. Embedded in the iframe, the
catalogue posts `{ type: 'lja:session', session }` to the game's exact origin.
Opened in a new tab, the client announces `{ type: 'lja:ready' }` to
`window.opener` and the portal answers with the same session message, so the tab
opens signed in instead of asking again. The game then keeps the session in its
own origin's `localStorage`, and posts `lja:auth` back whenever it signs in or
out so the portal header stays in step. Only the portal origins are trusted; a
direct visit to the game falls back to its own account panel.

## 5. Tip jar (Buy Me a Coffee)

One URL serves every surface: `https://www.buymeacoffee.com/jd4rider`. The
drop-in client owns it, so a game never hard-codes the link:

```js
window.LittleJoyArcade.tipJar.url   // the URL
window.LittleJoyArcade.tipJar.open() // opens it in a new tab
```

With the npm SDK it is `arcade.support.open()` / `arcade.support.url`. A game
build can override the destination with `data-tip-url` on its client script or
`window.LJA_TIP_URL` (for a title that ever needs its own page).

Placement rules:

- Results, game-over, pause and menu screens only. Never during play, never an
  interstitial, and only one surface per run.
- Never open it automatically. It is a click, always.
- Best moment is right after the player earned something: a cleared level, a new
  best, a finished run.
- Keep the next action primary. The tip jar is a quiet footer under the panel,
  not a wall in front of it.
- Say what it is plainly: "Buy me a coffee". No countdowns, no prices, no
  "donate".

### Phaser

Draw it as a tertiary button under the results card and let the client handle
the new tab. Jewel Match's results panel is the reference implementation
(`src/phaser/support.js` + the end of `showPanel()`):

```js
import { openTipJar } from './support.js'

p.add(button(this, W / 2, 760, '☕ Buy me a coffee', () => openTipJar(), {
  w: 300, h: 46, size: 18, color: 0x3b2a12, textColor: '#fde68a',
}))
```

`support.js` calls `window.LittleJoyArcade.tipJar.open()` when the drop-in
client is present and falls back to the plain URL otherwise, so the button also
works in Electron or a bare static build.

### Unity

For WebGL, bridge into the page with a `.jslib` plugin next to your other
WebGL plugins:

```csharp
// Assets/Plugins/WebGL/LittleJoyTipJar.jslib
mergeInto(LibraryManager.library, {
  LJA_OpenTipJar: function () {
    if (window.LittleJoyArcade && window.LittleJoyArcade.tipJar) {
      window.LittleJoyArcade.tipJar.open();
    } else {
      window.open('https://www.buymeacoffee.com/jd4rider', '_blank', 'noopener');
    }
  }
});
```

```csharp
// TipJar.cs
using System.Runtime.InteropServices;
using UnityEngine;

public static class TipJar
{
#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")] private static extern void LJA_OpenTipJar();
    public static void Open() => LJA_OpenTipJar();
#else
    public static void Open() =>
        Application.OpenURL("https://www.buymeacoffee.com/jd4rider");
#endif
}
```

Wire `TipJar.Open()` to a `Button.onClick` on the game-over/results canvas. In
WebGL the button must live inside the Unity canvas so the browser treats the
click as a real user gesture; otherwise the popup is blocked. Desktop builds go
through `Application.OpenURL`, which is the same page in the default browser.

### Godot

```gdscript
const TIP_URL := "https://www.buymeacoffee.com/jd4rider"

func _on_tip_button_pressed() -> void:
    if OS.has_feature("web"):
        var js := "window.LittleJoyArcade && window.LittleJoyArcade.tipJar ? " \
            + "window.LittleJoyArcade.tipJar.open() : window.open('%s', '_blank')" % TIP_URL
        JavaScriptBridge.eval(js)
    else:
        OS.shell_open(TIP_URL)
```

Add the button to the results/game-over `CanvasLayer` (so it sits above the
game and receives a real click), and keep the same copy as the web games. In a
web export, load `arcade-client.js` before the canvas if you also want accounts
and cloud saves; if it is absent the `window.open` fallback still works.

## 6. Publishing a game (API)

The catalogue is database-driven: the portal reads `public.games` at startup and
falls back to the bundled catalogue only if the backend is unavailable. A row
can be written two ways.

**CLI / server**

```bash
SUPABASE_DB_PASSWORD=... node scripts/publish-game.mjs game.json
SUPABASE_DB_PASSWORD=... node scripts/publish-game.mjs --list
```

Manifest shape (the same as `Game` in `src/data/games.ts`):

```json
{
  "id": "star-trail",
  "name": "Star Trail",
  "tagline": "Collect the sparks.",
  "description": "A small constellation puzzle.",
  "categories": ["Puzzle", "Logic"],
  "runtime": "Phaser 4",
  "version": "0.1.0",
  "updated": "2026-11-02",
  "status": "live",
  "featured": false,
  "playUrl": "https://star-trail.littlejoyarcade.site/play/",
  "siteUrl": "https://star-trail.littlejoyarcade.site/",
  "repoUrl": "https://github.com/jd4rider/star-trail",
  "downloads": [],
  "cover": { "from": "#38bdf8", "to": "#0c4a6e", "emoji": "✨" },
  "highlights": ["20 hand-built levels"],
  "howToPlay": ["Tap a star to collect it."],
  "levels": "20 levels",
  "saveKey": "star-trail-save-v1"
}
```

The script upserts every presentation column plus the raw manifest, so new
fields need no migration.

**Admin UI** — `/admin` (owner role only) lists the catalogue, toggles
status/featured, and will host the manifest form. Writes go through the anon
client but Postgres enforces `games_admin_write` (`profiles.role = 'admin'`), so
the policy, not the UI, is the security boundary.

## 7. Subdomain automation

`scripts/register-subdomain.mjs` registers a game hostname idempotently using the
GoDaddy API, optionally claims it on GitHub Pages, then verifies DNS:

```bash
GODADDY_PAT=gd_pat_... node scripts/register-subdomain.mjs star-trail \
  --target jd4rider.github.io \
  --repo jd4rider/star-trail
```

- `--target` is where traffic should go: **`jd4rider.github.io`**. Every game
  is a GitHub Pages project site, so its subdomain CNAMEs to Pages and the
  playable build lives at `https://<game>.littlejoyarcade.site/play/`.
- `--repo` is optional; when present the script sets the repo's Pages custom
  domain too.
- It edits only the CNAME for that subdomain and leaves MX/TXT/www untouched.
- Dry run by default; pass `CONFIRM=yes` to apply.

After the record exists, set the same hostname as the repo's Pages custom domain
(`gh api -X PUT repos/jd4rider/<game>/pages -f cname=<game>.littlejoyarcade.site`).
GitHub then issues the certificate; until it does, the host only serves the
wildcard `*.github.io` certificate and HTTPS fails, so allow time and re-check
with `openssl s_client` before advertising the URL.

**In the app** — the admin page (`/#/admin`, owner role only) has the same two
operations:

- *Publish a game* upserts the manifest straight into `games`; RLS only permits
  `profiles.role = 'admin'`.
- *Register a game subdomain* calls the deployed `register-subdomain` Supabase
  function. The GoDaddy PAT lives in function secrets and is never exposed to the
  browser.

```bash
supabase secrets set GODADDY_PAT=gd_pat_...
supabase functions deploy register-subdomain
```

The function verifies the caller's JWT, checks their profile row, then writes
only the requested CNAME through the GoDaddy API. A non-admin gets `403` even if
they call it directly with the anon key.

## 8. Release sync

`npm run sync:releases` regenerates `src/data/releases.json` from each repo's
latest published GitHub release (version, date, download URLs). The scheduled
workflow commits changes, which redeploys the site. See `DEPLOYMENT.md`.

## 9. Security model

- The anon key is public; every player-owned table is protected by RLS.
- Entitlements are read-only for players; only the service role grants them.
- Purchases are verified server-side; a redirect is never proof of payment.
- Admin operations are authorised by `is_admin()` in Postgres, not by hidden UI.
- The drop-in client stores only its own session and mirrors game saves.
