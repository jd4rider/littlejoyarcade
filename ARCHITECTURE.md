# Architecture

## Shape of the system

```
                    ┌──────────────────────────────┐
  littlejoyarcade.site │  Portal (React + TS + Vite)  │  ← static, CDN-hosted
                    │  catalogue · detail · play   │
                    └──────────────┬───────────────┘
                                   │ links / iframes
        ┌──────────────┬───────────┴───────────┬──────────────┐
        ▼              ▼                       ▼              ▼
   bubblewrap      pipe-dreams             jewel-match   … 6 more
   (own Pages      (own Pages              (own Pages
    project)        project)                project)
        │              │                       │
        └──────────────┴──────┬────────────────┘
                              │ @littlejoyarcade/sdk (optional, per game)
                              ▼
                    ┌──────────────────┐
                    │ Supabase         │  Auth · Postgres · RLS · Edge Functions
                    └──────────────────┘
```

Key decision: **games are not bundled into the portal.** Each game already ships its own static build and
desktop installers from its own repository. The portal is a catalogue and shell around them. That keeps blast
radius small, lets each game release independently, and means the platform can grow to dozens of games without
one monorepo build.

## Front end

- React 19, TypeScript (strict), Vite 6, Tailwind CSS 4 via `@tailwindcss/vite`.
- Hash routing (`HashRouter`) so deep links survive on GitHub Pages, Cloudflare Pages and Electron without
  server rewrites. If the project later moves to a host with SPA fallback, switching to `BrowserRouter` is a
  one-line change plus a `_redirects` file.
- `base: './'` keeps asset URLs portable across a project path (`/littlejoyarcade/`), a custom domain root,
  and `file://` inside a future Electron shell.
- No global state library. Auth lives in a context, activity in local storage, everything else is derived.

## Data flow

1. A player opens the portal. No network request is required beyond static assets.
2. Launching a game records a local session (`lja:activity:v1`) and an SDK analytics event.
3. The game runs on its own origin. Its existing local save keeps working untouched.
4. When a game adopts the SDK, it talks to `arcade.progress` / `arcade.achievements`, which write locally first
   and sync to Supabase when a player is signed in.

## Backend

Supabase provides auth (magic links, PKCE), Postgres, and row level security. No custom password handling and
no service-role key in the browser. Purchases and entitlements are written only by trusted server code.

Tables: `profiles`, `games`, `game_progress`, `achievements`, `player_achievements`, `products`, `purchases`,
`entitlements`, `player_settings`, `game_sessions`. See `DATABASE.md`.

## SDK

`@littlejoyarcade/sdk` is framework-agnostic TypeScript with zero hard runtime dependencies. Entry points:

| Import | Purpose |
| --- | --- |
| `@littlejoyarcade/sdk` | `createArcade`, progress merge helpers, Supabase adapter |
| `@littlejoyarcade/sdk/react` | `ArcadeProvider`, `useArcade`, `useArcadeProgress`, `useEntitlement` |
| `@littlejoyarcade/sdk/phaser` | `bindPhaserProgress` (save on shutdown, resync on reconnect) |
| `@littlejoyarcade/sdk/electron` | `createElectronStorage` for a context-isolated preload bridge |

The cloud is an interface (`CloudAdapter`), so Supabase can be swapped for another provider, and tests run
without a network.

### Save format

```ts
{ schema: 1, data: {...game shape...}, updatedAt: 1720000000000, deviceId: "uuid" }
```

Conflict rule: newest `updatedAt` wins; exact ties go to the cloud copy. Guest progress is uploaded only when
the cloud copy is missing or older — a migration never silently overwrites newer cloud data. Saves made while
offline are queued under `lja:<game>:pending` and flushed by `progress.sync()`.

## Failure behaviour

| Failure | Result |
| --- | --- |
| Backend unreachable | Game boots, local save loads, save is queued, status `offline` |
| No Supabase env vars | Accounts and cloud features are hidden; guest play unaffected |
| Local storage blocked | In-memory storage for the session; the game still plays |
| Game embed blocked by browser | “Open in new tab” escape hatch in the play bar |
| AdSense not approved / no slot | No ad markup is inserted at all |

## Hosting architecture

Production target chosen by the owner: **Vercel** for the frontend, with **Supabase** for Postgres, auth and row
level security. Vercel serves the static Vite bundle and gives production plus preview deployments from Git;
Supabase is the actual backend, since Vercel does not host databases.

Vercel's Hobby plan is for personal, non-commercial projects only. That is fine while accounts are being built
out, but an ad-supported or paid arcade needs Vercel Pro (~$20/user/month) before monetization. Cloudflare Pages
(free, commercial use allowed) is the fallback if Pro is not wanted; the build is host-agnostic either way.

Current deployment: GitHub Pages project site, because it is the only hosting credential available in this
environment. It remains the working preview while the Vercel project is created. Details: `DEPLOYMENT.md`;
DNS: `DNS_CONFIGURATION.md`.

## Dependency map

| Component | Depends on | Blocks |
| --- | --- | --- |
| Portal | nothing at runtime | — |
| Vercel project | GitHub repo import | production URL, domain cutover |
| Accounts | Supabase project + build-time env vars | cloud saves, entitlements, admin |
| Cloud saves | SDK wired into each game | cross-device progress |
| Storefront | Stripe (or similar) + webhook endpoint | purchases |
| Ads | AdSense approval + ad unit IDs + consent | ad revenue |
| Subdomains | DNS access at GoDaddy or a nameserver move to Cloudflare | branded game URLs |
