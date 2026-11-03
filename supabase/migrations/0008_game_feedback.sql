-- Player feedback for every game in the catalogue.
--
-- Anyone can rate a game without an account; the comment is readable only by
-- the owner (via the admin role) so honest notes stay private to the developer.
-- Public visitors still see an aggregate score through a security-definer
-- function, which exposes counts and averages and never the raw rows.
--
-- `game_id` deliberately has no foreign key to public.games: a newly launched
-- game must be able to collect feedback even if the catalogue sync has not
-- written its row to Postgres yet. The format check keeps the column tidy.

create table if not exists public.game_feedback (
  id uuid primary key default gen_random_uuid(),
  game_id text not null check (game_id ~ '^[a-z0-9-]{2,40}$'),
  -- Null for a guest rating. Kept so a signed-in player can update their own
  -- rating instead of stacking duplicates.
  user_id uuid references auth.users (id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 2000),
  player_name text check (player_name is null or char_length(player_name) between 1 and 32),
  game_version text check (game_version is null or char_length(game_version) <= 24),
  source text not null default 'portal' check (source in ('portal', 'game')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One rating per signed-in player per game. Guest rows are unaffected because
-- the index is partial.
create unique index if not exists game_feedback_one_per_player
  on public.game_feedback (game_id, user_id)
  where user_id is not null;

create index if not exists game_feedback_game_recent_idx
  on public.game_feedback (game_id, created_at desc);
create index if not exists game_feedback_recent_idx
  on public.game_feedback (created_at desc);

drop trigger if exists game_feedback_touch on public.game_feedback;
create trigger game_feedback_touch before update on public.game_feedback
  for each row execute function public.touch_updated_at();

comment on table public.game_feedback is
  'Player ratings and private notes, one per signed-in player per game. Comments are owner-readable only.';
comment on column public.game_feedback.source is
  'Where the feedback was collected: the arcade portal, or a game reporting its own prompt.';

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.game_feedback enable row level security;

-- Guests may submit, but never claim a user id they do not own.
drop policy if exists feedback_insert_guest on public.game_feedback;
create policy feedback_insert_guest on public.game_feedback
  for insert to anon
  with check (user_id is null);

-- Signed-in players may submit as themselves, and later amend that row.
drop policy if exists feedback_insert_own on public.game_feedback;
create policy feedback_insert_own on public.game_feedback
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists feedback_update_own on public.game_feedback;
create policy feedback_update_own on public.game_feedback
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- No select policy exists for anon: the raw notes are private. Signed-in
-- players can read back their own row, and the owner sees everything.
drop policy if exists feedback_select_own on public.game_feedback;
create policy feedback_select_own on public.game_feedback
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists feedback_admin_delete on public.game_feedback;
create policy feedback_admin_delete on public.game_feedback
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Public scoreboard
-- ---------------------------------------------------------------------------

-- Aggregates only. Definer rights let anon read the summary while the table
-- itself stays closed, and the function cannot be used to page through rows.
create or replace function public.game_feedback_summary()
returns table (game_id text, ratings bigint, average float8, latest timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select
    f.game_id,
    count(*)::bigint as ratings,
    round(avg(f.rating)::numeric, 2)::float8 as average,
    max(f.created_at) as latest
  from public.game_feedback f
  group by f.game_id;
$$;

revoke all on function public.game_feedback_summary() from public;
grant execute on function public.game_feedback_summary() to anon, authenticated;
