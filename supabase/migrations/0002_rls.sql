-- Row level security. Every player-owned table is readable only by its owner,
-- and purchases/entitlements are intentionally write-locked to the service role.

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.game_progress enable row level security;
alter table public.achievements enable row level security;
alter table public.player_achievements enable row level security;
alter table public.products enable row level security;
alter table public.purchases enable row level security;
alter table public.entitlements enable row level security;
alter table public.player_settings enable row level security;
alter table public.game_sessions enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- games ---------------------------------------------------------------------
-- The catalogue is public. Hidden games stay readable so a shared link keeps
-- working; the portal filters them out of listings.
drop policy if exists games_select_all on public.games;
create policy games_select_all on public.games
  for select to anon, authenticated
  using (true);

drop policy if exists games_admin_write on public.games;
create policy games_admin_write on public.games
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- game_progress -------------------------------------------------------------
drop policy if exists progress_select_own on public.game_progress;
create policy progress_select_own on public.game_progress
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists progress_insert_own on public.game_progress;
create policy progress_insert_own on public.game_progress
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists progress_update_own on public.game_progress;
create policy progress_update_own on public.game_progress
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists progress_delete_own on public.game_progress;
create policy progress_delete_own on public.game_progress
  for delete to authenticated
  using (user_id = auth.uid());

-- achievements --------------------------------------------------------------
drop policy if exists achievements_select_all on public.achievements;
create policy achievements_select_all on public.achievements
  for select to anon, authenticated
  using (true);

drop policy if exists achievements_admin_write on public.achievements;
create policy achievements_admin_write on public.achievements
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- player_achievements -------------------------------------------------------
drop policy if exists player_achievements_select_own on public.player_achievements;
create policy player_achievements_select_own on public.player_achievements
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- A player may record an unlock for themselves, but never for anyone else.
drop policy if exists player_achievements_insert_own on public.player_achievements;
create policy player_achievements_insert_own on public.player_achievements
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.achievements a where a.id = achievement_id)
  );

drop policy if exists player_achievements_admin_write on public.player_achievements;
create policy player_achievements_admin_write on public.player_achievements
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- products ------------------------------------------------------------------
-- Active products are public; inactive drafts are owner-only.
drop policy if exists products_select_active on public.products;
create policy products_select_active on public.products
  for select to anon, authenticated
  using (active or public.is_admin());

drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- purchases -----------------------------------------------------------------
-- Read-only to their owner. No insert/update policy exists for any client role:
-- rows arrive only from verified server-side webhooks using the service role.
drop policy if exists purchases_select_own on public.purchases;
create policy purchases_select_own on public.purchases
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- entitlements --------------------------------------------------------------
-- Players may read their own active slug list. Writes are service-role only;
-- there is deliberately no client insert policy, so a browser cannot grant
-- itself premium access even with a tampered request.
drop policy if exists entitlements_select_own on public.entitlements;
create policy entitlements_select_own on public.entitlements
  for select to authenticated
  using ((user_id = auth.uid() and revoked_at is null) or public.is_admin());

-- player_settings -----------------------------------------------------------
drop policy if exists settings_own on public.player_settings;
create policy settings_own on public.player_settings
  for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- game_sessions -------------------------------------------------------------
drop policy if exists sessions_insert_own on public.game_sessions;
create policy sessions_insert_own on public.game_sessions
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists sessions_select_own on public.game_sessions;
create policy sessions_select_own on public.game_sessions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists sessions_update_own on public.game_sessions;
create policy sessions_update_own on public.game_sessions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
