-- Stackstorm 1.0.1 ships the visible-spawn and real-time-gravity fixes.
-- The version is part of the iframe URL, so bumping it also busts the cached
-- game shell for players who already have 1.0.0 open.

update public.games
set
  version = '1.0.1',
  manifest = jsonb_set(manifest, '{version}', '"1.0.1"'),
  updated_on = '2026-11-09',
  updated_at = now()
where id = 'stackstorm';
