-- Stackstorm 1.0.3: puzzle boards light the lanes the player has to fill, early
-- Journey levels deal several decoys so every primary colour shows up, the
-- palette is pushed to vivid primaries and puzzle gravity is three times faster.
-- The version rides in the iframe URL, so bumping it also busts the cached shell.

update public.games
set
  version = '1.0.3',
  manifest = jsonb_set(manifest, '{version}', '"1.0.3"'),
  updated_on = '2026-11-10',
  updated_at = now()
where id = 'stackstorm';
