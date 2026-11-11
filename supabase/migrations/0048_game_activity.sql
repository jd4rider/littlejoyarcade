-- Recently played: one row per player per game, so the shelf follows a
-- signed-in player between devices. Guests keep the same history in
-- localStorage; the portal merges the device copy into this table on sign-in.
--
-- game_id is deliberately not a foreign key, for the same reason as favorites:
-- a game can be launched from the bundled catalogue before its row is seeded.

create table if not exists public.game_activity (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id text not null check (game_id ~ '^[a-z0-9-]{2,40}$'),
  last_played_at timestamptz not null default now(),
  play_count integer not null default 1 check (play_count > 0),
  primary key (user_id, game_id)
);

create index if not exists game_activity_user_idx
  on public.game_activity (user_id, last_played_at desc);

alter table public.game_activity enable row level security;

drop policy if exists activity_select_own on public.game_activity;
create policy activity_select_own on public.game_activity
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists activity_insert_own on public.game_activity;
create policy activity_insert_own on public.game_activity
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists activity_update_own on public.game_activity;
create policy activity_update_own on public.game_activity
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists activity_delete_own on public.game_activity;
create policy activity_delete_own on public.game_activity
  for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists activity_admin_write on public.game_activity;
create policy activity_admin_write on public.game_activity
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Increment atomically from the portal. The client only sends the game id, so
-- two devices playing at once cannot reset each other's launch count.
create or replace function public.record_game_launch(p_game_id text)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.game_activity (user_id, game_id, last_played_at, play_count)
  values (auth.uid(), p_game_id, now(), 1)
  on conflict (user_id, game_id) do update
    set play_count = public.game_activity.play_count + 1,
        last_played_at = now()
    where public.game_activity.user_id = auth.uid();
$$;

revoke all on function public.record_game_launch(text) from public;
grant execute on function public.record_game_launch(text) to authenticated;
