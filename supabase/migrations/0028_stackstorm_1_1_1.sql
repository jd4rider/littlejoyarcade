-- Stackstorm 1.1.1: a calmer opening (a full second per row at level 1, and a
-- slower Journey start) and a simpler six-button touch strip with one spin
-- button. The version is part of the iframe URL, so bumping it also busts the
-- cached game shell.

update public.games
set
  version = '1.1.1',
  manifest = jsonb_set(manifest, '{version}', '"1.1.1"'),
  updated_on = '2026-11-10',
  updated_at = now()
where id = 'stackstorm';
