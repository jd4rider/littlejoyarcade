-- Favorites: the games a player has chosen to keep on their own shelf.
-- Guests keep the same list in localStorage; the portal merges those picks
-- into this table the first time they sign in.
--
-- game_id is deliberately not a foreign key: the portal's bundled catalogue can
-- list a game before its row is seeded, and a favorite must never fail because
-- of that. Reads are filtered against the live catalogue in the client.

create table if not exists public.game_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id text not null check (game_id ~ '^[a-z0-9-]{2,40}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create index if not exists game_favorites_user_idx
  on public.game_favorites (user_id, created_at desc);

alter table public.game_favorites enable row level security;

-- favorites -----------------------------------------------------------------
drop policy if exists favorites_select_own on public.game_favorites;
create policy favorites_select_own on public.game_favorites
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists favorites_insert_own on public.game_favorites;
create policy favorites_insert_own on public.game_favorites
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists favorites_delete_own on public.game_favorites;
create policy favorites_delete_own on public.game_favorites
  for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists favorites_admin_write on public.game_favorites;
create policy favorites_admin_write on public.game_favorites
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
