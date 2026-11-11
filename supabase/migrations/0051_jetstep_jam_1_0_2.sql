-- Jetstep Jam! 1.0.2: stops lifts descending into solid floors, removes the
-- rider teleport, pins physics to fixed steps and widens near-9:16 fill.
-- The catalogue lives in src/data/games.ts and is mirrored here for live data.

update public.games
set version = '1.0.2',
    updated_on = '2026-11-11',
    updated_at = now(),
    manifest = jsonb_set(jsonb_set(manifest, '{version}', '"1.0.2"'), '{updated}', '"2026-11-11"')
where id = 'jetstep-jam';

select id, name, version, updated_on,
       manifest->>'version' as manifest_version,
       manifest->>'updated' as manifest_updated
from public.games
where id = 'jetstep-jam';
