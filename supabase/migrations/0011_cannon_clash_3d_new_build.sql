-- Cannon Clash 3D was re-exported: the payload is now 81 MB instead of 55 MB.
-- The build itself lives on Pages, so the catalogue only needs the copy and the
-- updated date refreshed. Idempotent, and safe to re-run.

update public.games
set
  how_to_play = array_replace(
    how_to_play,
    'Open the game and wait for the Unity progress bar - the first load streams about 55 MB',
    'Open the game and wait for the Unity progress bar - the first load streams about 81 MB'
  ),
  manifest = jsonb_set(
    jsonb_set(manifest, '{updated}', '"2026-11-03"'),
    '{howToPlay,0}',
    '"Open the game and wait for the Unity progress bar - the first load streams about 81 MB"'
  ),
  updated_on = '2026-11-03',
  updated_at = now()
where id = 'cannon-clash-3d';

select id, version, updated_on, how_to_play[1] as first_step
from public.games
where id = 'cannon-clash-3d';
