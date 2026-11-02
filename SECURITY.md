# Security

## Threat model, briefly

A casual game portal has three things worth attacking: player accounts, entitlements (ad-free / premium), and
the owner's admin rights. Gameplay itself has no server authority, so cheating in a single-player game is not a
security issue — forging a purchase or another player's data is.

## Controls in place

| Area | Control |
| --- | --- |
| Passwords | Never handled. Supabase Auth magic links, PKCE flow. |
| Sessions | Provider-managed, auto-refresh, tokens kept out of URL query strings. |
| Player data | RLS on every table; policies scope rows to `auth.uid()`. |
| Admin | `profiles.role = 'admin'` checked by `is_admin()` inside Postgres policies; the UI gate is cosmetic. |
| Purchases | No client write policy. Purchase rows are written only by server-side webhook code with the service role. |
| Entitlements | Read-own only; grants go through `grant_entitlement`, executable by `service_role` only. |
| Save data | Versioned envelope; client-supplied `user_id` is ignored by policy, so a player cannot write to another account. |
| Secrets | Only the Supabase anon key is ever shipped. A service-role key is never placed in this repo or in a Vite variable. |
| Analytics | Aggregate events only, no advertising IDs or fingerprints. |
| Inputs | Database checks on slugs, display name length, prices and enums; UI max-lengths mirror them. |
| Embeds | Games are framed with `sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-orientation-lock"`; no top-level navigation or popups. |

## Secrets policy

- Allowed in the browser: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`, Stripe secret key and webhook secret, any DNS API token.
- Server-only values belong in Supabase Edge Function secrets or GitHub Actions secrets — never in
  `VITE_*`, never in `src/`, never in a committed file.
- Committed `.env` files are ignored by `.gitignore`; only `.env.example`-style documentation is committed.

## Known gaps (deliberate, documented)

1. **No backend is connected to the deployed build yet.** Accounts, cloud saves, entitlements and admin are
   implemented but inactive until Supabase credentials exist. Nothing security-sensitive is pretending to work.
2. **Achievement unlocks are client-reported.** `player_achievements` accepts self-inserts because achievements
   are cosmetic. They must never gate a paid entitlement; only `entitlements` does that, and it is service-role
   only.
3. **No rate limiting yet.** Supabase's built-in auth rate limits apply to magic links. The purchase webhook
   (when built) must add idempotency keys and provider signature verification before going live.
4. **Account deletion is manual.** Self-service erasure of local data exists in the dashboard; cloud deletion
   is a support request until an edge function with the service role is deployed.
5. **Game saves are not signed.** A player can edit their own local save. That is normal for offline games and
   never affects purchases.

## Before enabling payments

- Verify the Stripe webhook signature on every request; reject unsigned calls.
- Make webhook handling idempotent on `(provider, provider_reference)` (unique constraint already exists).
- Treat a successful redirect as *pending*, never as proof of payment.
- Grant entitlements only from the webhook, inside a transaction that also marks the purchase `paid`.
- Add server-side rate limiting and alerting on repeated webhook failures.
- Publish refund and tax policy pages before the first real charge.

## Reporting a vulnerability

Open a private security advisory on the repository rather than a public issue, and include reproduction steps.
Please do not test against other players' accounts or run load tests against production.
