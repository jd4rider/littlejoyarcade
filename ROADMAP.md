# Roadmap

## Done and verified

- Catalogue of all eight games with real versions, content counts, save keys and live URLs.
- Portal: home, searchable/filterable catalogue, detail pages, embedded play shell with fullscreen and
  new-tab escape hatch, guest dashboard, auth page, admin area, privacy/terms/support, 404.
- Guest progress: local activity, arcade achievements computed from real sessions, data export and local wipe.
- `@littlejoyarcade/sdk`: versioned saves, offline queue, conflict resolution, achievements, entitlements, ad
  policy, analytics, platform detection, React/Phaser/Electron adapters, Supabase adapter, unit tests.
- Supabase schema, RLS policies, admin function, achievement/product seed.
- CI (typecheck, lint, test, build) and Pages deployment.

## Blocked on credentials or approval

| Work | Blocker | Who |
| --- | --- | --- |
| Supabase project + auth + cloud saves | Supabase account token | owner |
| Owner admin role | A real signed-in account first | owner |
| Storefront / payments | Stripe account, tax and refund policy | owner |
| Real ads in games | AdSense approval + ad unit ids | Google (pending) |

## Next, in order

1. **Keep GitHub Pages as the only host.** `pages.yml` publishes; `check-play-routes.yml` guards the live game
   URLs. Verify apex and `www` over HTTPS after any DNS change.
2. **Create the Supabase project**, apply `0001–0003`, add the two public env vars as repository variables,
   configure auth redirect URLs, and grant the owner `admin`.
3. **Wire the SDK into Bubble Wrap** as the reference integration: hydrate its existing save, save on change,
   unlock two achievements, gate its ad slot behind `adsAllowed()`. Verify guest → signed-in migration.
4. **Review GitHub Pages' acceptable-use policy** before ads and purchases go live, since it discourages
   commercial sites; if that becomes a blocker, move only the host, keeping Supabase and the SDK unchanged.
5. **Wire the remaining seven games**, one small PR each, preserving their existing save shapes.
6. **AdSense**: after approval, create units, add one policy-compliant placement per game (menus only), add
   `ads.txt`, and measure for two weeks.
7. **Storefront**: Stripe Checkout + signed, idempotent webhook + `grant_entitlement`. Enable `active` products
   last.
8. **Daily Puzzle Passport**: a featured challenge from several games per day with cosmetic rewards, once the
   core loops are stable and achievements are trustworthy server-side.

## Later

- Per-game subdomains once GitHub issues their certificates, with the `github.io` build kept as the permanent
  fallback.
- PWA install for the portal and each game (offline-first, no store fees).
- Capacitor builds for Android and iOS with platform billing.
- A Little Joy Arcade launcher for desktop: browse and launch installed games from one window, reusing the SDK's
  Electron storage adapter.
- Arcade-wide premium bundle, then cosmetic themes per game.
- Accessibility pass: keyboard-only play for every game, colour-blind-safe palettes, reduced-motion parity.

## Explicitly not doing yet

- Converting Bubble Wrap to Phaser (separate project, no benefit to the platform).
- Bundling games into one giant application.
- Subscriptions.
- Ad placeholders that fake requests before approval.
- Mobile app packaging before the web platform is stable.
