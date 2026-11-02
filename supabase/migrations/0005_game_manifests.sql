-- Make the arcade catalogue database-driven.
--
-- A game row now carries everything the portal renders, not just a link. The
-- `manifest` column keeps the original JSON so new presentation fields can ship
-- without a migration, while the typed columns keep queries and the release
-- sync simple.
--
-- Writes are admin-only through the existing `games_admin_write` RLS policy
-- (profiles.role = 'admin'), so a signed-in admin or a server-side publish
-- script is the only way to change the catalogue.

alter table public.games add column if not exists tagline text;
alter table public.games add column if not exists runtime text not null default 'Phaser 4';
alter table public.games add column if not exists cover jsonb;
alter table public.games add column if not exists highlights text[] not null default '{}';
alter table public.games add column if not exists how_to_play text[] not null default '{}';
alter table public.games add column if not exists levels text;
alter table public.games add column if not exists save_key text;
alter table public.games add column if not exists downloads jsonb not null default '[]'::jsonb;
alter table public.games add column if not exists updated_on date;
alter table public.games add column if not exists manifest jsonb;

create index if not exists games_status_sort_idx on public.games (status, sort_order);

comment on column public.games.manifest is
  'Full Game manifest (the same shape as src/data/games.ts). Source of truth for the portal catalogue.';
comment on column public.games.downloads is
  'Array of { label, platform, url } objects, refreshed from GitHub releases.';

-- The public catalogue read policy already lets anon select every game; this
-- view exposes only published rows for the portal.
create or replace view public.published_games as
  select *
  from public.games
  where status = 'live'
  order by featured desc, sort_order asc, name asc;
