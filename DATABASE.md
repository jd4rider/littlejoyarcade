# Database

PostgreSQL on Supabase. Migrations live in `supabase/migrations/` and are applied in filename order:

1. `0001_schema.sql` — tables, indexes, triggers, helper functions.
2. `0002_rls.sql` — row level security policies.
3. `0003_seed.sql` — the eight real games, achievement definitions, inactive products.

## Tables

| Table | Purpose | Owner |
| --- | --- | --- |
| `profiles` | One row per auth user: display name, avatar, role (`player`/`admin`) | player (own row) |
| `games` | Catalogue: slug id, name, status, featured flag, version, URLs, categories | public read, admin write |
| `game_progress` | Versioned save envelope per player per game | player (own rows) |
| `achievements` | Definitions; ids are `<game>.<slug>` | public read, admin write |
| `player_achievements` | Unlocks with timestamps | player inserts own, reads own |
| `products` | Storefront catalogue; `active` gates visibility | public read if active, admin write |
| `purchases` | Payment records; `provider` + `provider_reference` unique | read own; **service role writes only** |
| `entitlements` | Granted slugs (`arcade.ad_free`, …) with revocation | read own active; **service role writes only** |
| `player_settings` | Motion, sound, ad consent | player (own row) |
| `game_sessions` | Session start/end for activity and admin metrics | player inserts/updates own |

Achievement ids are namespaced (`pipe-dreams.first_clear`). The SDK prefixes a bare slug with the game id, so
games call `arcade.achievements.unlock('first_clear')`.

## Row level security

RLS is enabled on every table. Highlights:

- `profiles`, `game_progress`, `player_settings`, `player_achievements`: `auth.uid()` scoping on select,
  insert and update. A player can never address another player's row.
- `purchases` and `entitlements`: select-own policies only. **There is deliberately no insert or update policy
  for `anon` or `authenticated`.** A tampered browser request cannot mint an entitlement; only the service role
  (webhook or edge function) can call `grant_entitlement(...)`.
- `games`, `achievements`, `products`: public read of the catalogue; writes require `is_admin()`.
- `is_admin()` is a `security definer` function reading `profiles.role`, used by policies so admin rights are
  enforced by Postgres, not by hiding UI.
- `grant_entitlement` is revoked from `public`, `anon` and `authenticated`, and granted only to `service_role`.

## Functions and triggers

| Object | Role |
| --- | --- |
| `is_admin()` | Role check used inside policies |
| `touch_updated_at()` | `updated_at` maintenance on profiles, games, settings |
| `handle_new_user()` | Creates a profile and settings row for every new auth user |
| `grant_entitlement(user, slug, purchase)` | Idempotent grant, service role only |

## Applying migrations

```bash
# option A — Supabase CLI (recommended)
supabase login
supabase link --project-ref <ref>
supabase db push

# option B — SQL editor
# paste 0001, then 0002, then 0003 in order
```

Then verify:

```sql
select relname, relrowsecurity from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r';

select id, name, status from public.games order by sort_order;
```

## Design notes

- `game_progress.data` is `jsonb` on purpose. Each game keeps its own save shape; the platform only guarantees
  the envelope (`schema`, `data`, `updatedAt`, `deviceId`) and never rewrites a game's internal structure.
- `schema_version` is stored beside the payload so future migrations can transform old saves server-side.
- Sessions are intentionally lightweight and never require an account: anonymous sessions stay purely local.
- No card data, addresses or phone numbers are stored anywhere. Payment providers keep card details.
