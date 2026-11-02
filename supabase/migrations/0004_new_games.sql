-- Rumble Rally and Whisker Grid joined the shelf after the initial seed.
-- Idempotent, so re-running the full migration set is safe.

insert into public.games (id, name, description, status, featured, sort_order, version, play_url, site_url, repo_url, categories)
values
  ('rumble-rally', 'Rumble Rally',
   'A physics driving puzzle: steer your car over ramps, gaps and crates to the flag.',
   'live', false, 9, '0.1.2',
   'https://jd4rider.github.io/rumble-rally/play/',
   'https://jd4rider.github.io/rumble-rally/',
   'https://github.com/jd4rider/rumble-rally',
   array['Physics','Arcade','Casual']),
  ('whisker-grid', 'Whisker Grid',
   'A cat logic puzzle: one cat per colour, row and column, and no cats touching.',
   'live', false, 10, '0.2.0',
   'https://jd4rider.github.io/whisker-grid/play/',
   'https://jd4rider.github.io/whisker-grid/',
   'https://github.com/jd4rider/whisker-grid',
   array['Logic','Puzzle','Brain Training'])
on conflict (id) do nothing;

insert into public.achievements (id, game_id, name, description, points)
select g.id || '.' || a.slug, g.id, a.name, a.description, a.points
from public.games g
cross join (values
  ('first_clear', 'First Clear', 'Finish the first level.', 10),
  ('three_stars', 'Perfect Run', 'Earn three stars on any level.', 25),
  ('completionist', 'Completionist', 'Finish every level in the game.', 100)
) as a(slug, name, description, points)
where g.id in ('rumble-rally', 'whisker-grid')
on conflict (id) do nothing;
