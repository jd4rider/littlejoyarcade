-- Stackstorm 1.1.0: Journey levels are endless score chases. The seven-bag queue
-- runs until the stack tops out, clearing the level means beating a score target
-- first, and the catalogue copy now describes it that way. The version rides in
-- the iframe URL, so bumping it busts the cached game shell.

update public.games
set
  version = '1.1.0',
  manifest = jsonb_set(manifest, '{version}', '"1.1.0"'),
  updated_on = '2026-11-10',
  updated_at = now()
where id = 'stackstorm';
