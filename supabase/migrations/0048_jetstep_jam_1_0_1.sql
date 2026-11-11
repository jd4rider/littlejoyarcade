-- Jetstep Jam! 1.0.1: fills and centres the phone screen, and makes lifts
-- boardable at a readable speed. The catalogue lives in src/data/games.ts and
-- is mirrored here for live data.

update public.games
set version = '1.0.1',
    updated_on = '2026-11-11',
    updated_at = now(),
    manifest = jsonb_set(jsonb_set(manifest, '{version}', '"1.0.1"'), '{updated}', '"2026-11-11"')
where id = 'jetstep-jam';

select id, name, version, updated_on,
       manifest->>'version' as manifest_version,
       manifest->>'updated' as manifest_updated
from public.games
where id = 'jetstep-jam';
