-- Cannon Clash 3D was re-exported with friendlier early levels. The payload also
-- shrank from 81 MB to 76 MB (wasm 64.9 MB), so the first-load estimate in the
-- catalogue copy is out of date. Idempotent, and safe to re-run.

update public.games
set
  how_to_play = array_replace(
    how_to_play,
    'Open the game and wait for the Unity progress bar - the first load streams about 81 MB',
    'Open the game and wait for the Unity progress bar - the first load streams about 76 MB'
  ),
  updated_on = '2026-11-03',
  updated_at = now()
where id = 'cannon-clash-3d';

-- Keep the stored manifest in step with the columns the portal reads from.
update public.games
set
  manifest = jsonb_set(
    jsonb_set(manifest, '{howToPlay}', to_jsonb(how_to_play)),
    '{updated}',
    '"2026-11-03"'
  ),
  updated_at = now()
where id = 'cannon-clash-3d';

select
  id,
  version,
  updated_on,
  how_to_play[1] as first_step,
  manifest->'howToPlay'->>0 as manifest_first_step
from public.games
where id = 'cannon-clash-3d';
