-- Neon Rivals 1.0.1: fills the whole screen in landscape, touch controls that
-- actually drive the fighter, and a CPU that keeps the pressure on.
--
-- No schema change and no new row: the game already exists in the catalogue,
-- so this just records the version the play URL is serving.

update public.games
set version = '1.0.1',
    updated_on = '2026-11-10',
    updated_at = now(),
    manifest = jsonb_set(manifest, '{version}', '"1.0.1"')
where id = 'neon-rivals';

select id, name, version, status, play_url
from public.games
where id = 'neon-rivals';
