-- Stackstorm 1.1.2: full keyboard play on desktop — arrows or WASD move, Up/W
-- rotates, Down/S soft drops, Space hard drops. Storm Surge moved from S (now
-- soft drop) to F. The version is part of the iframe URL, so bumping it also
-- busts the cached game shell.

update public.games
set
  version = '1.1.2',
  manifest = jsonb_set(manifest, '{version}', '"1.1.2"'),
  updated_on = '2026-11-10',
  updated_at = now()
where id = 'stackstorm';
