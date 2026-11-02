-- Little Joy Arcade — core schema.
-- Run with: supabase db push   (or paste into the SQL editor in order).

create extension if not exists "pgcrypto";

do $$ begin
  create type public.game_status as enum ('live', 'coming-soon', 'hidden');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_kind as enum ('one_time', 'bundle');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.purchase_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 32),
  avatar_url text,
  role text not null default 'player' check (role in ('player', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  name text not null,
  description text,
  status public.game_status not null default 'live',
  featured boolean not null default false,
  sort_order integer not null default 0,
  version text not null default '0.0.0',
  play_url text not null,
  site_url text,
  repo_url text,
  categories text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id text not null references public.games (id) on delete cascade,
  schema_version integer not null default 1 check (schema_version > 0),
  data jsonb not null default '{}'::jsonb,
  device_id text,
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create table if not exists public.achievements (
  id text primary key,
  game_id text references public.games (id) on delete cascade,
  name text not null,
  description text,
  points integer not null default 10 check (points >= 0),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.player_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  entitlement text not null,
  kind public.product_kind not null default 'one_time',
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  provider text not null default 'stripe',
  provider_reference text,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null,
  status public.purchase_status not null default 'pending',
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  unique (provider, provider_reference)
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entitlement_slug text not null,
  source text not null default 'purchase',
  purchase_id uuid references public.purchases (id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, entitlement_slug)
);

create table if not exists public.player_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  reduced_motion boolean not null default false,
  sound boolean not null default true,
  ads_consent boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  game_id text not null references public.games (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  device text,
  app_version text
);

create index if not exists game_sessions_user_idx on public.game_sessions (user_id, started_at desc);
create index if not exists game_sessions_game_idx on public.game_sessions (game_id, started_at desc);
create index if not exists player_achievements_user_idx on public.player_achievements (user_id);
create index if not exists entitlements_user_idx on public.entitlements (user_id) where revoked_at is null;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists games_touch on public.games;
create trigger games_touch before update on public.games
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.player_settings;
create trigger settings_touch before update on public.player_settings
  for each row execute function public.touch_updated_at();

-- Every new auth user gets a profile and settings row. display_name comes from
-- signup metadata when present, and is always user-editable later.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 32), ''))
  on conflict (id) do nothing;

  insert into public.player_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only the service role (webhooks / edge functions) may grant entitlements.
create or replace function public.grant_entitlement(
  p_user uuid,
  p_slug text,
  p_purchase uuid default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.entitlements (user_id, entitlement_slug, source, purchase_id)
  values (p_user, p_slug, case when p_purchase is null then 'manual' else 'purchase' end, p_purchase)
  on conflict (user_id, entitlement_slug) do update
    set revoked_at = null,
        purchase_id = coalesce(excluded.purchase_id, public.entitlements.purchase_id);
$$;

revoke all on function public.grant_entitlement(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.grant_entitlement(uuid, text, uuid) to service_role;
