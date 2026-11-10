-- Stackstorm 1.0.5: a level started from the results screen (or from the
-- Journey map after any completed run) froze on its first frame because the
-- reused Phaser scene kept its `finished` flag. Fixed in GameScene.create.
-- The version rides in the iframe URL, so bumping it busts the cached shell.

update public.games
set
  version = '1.0.5',
  manifest = jsonb_set(manifest, '{version}', '"1.0.5"'),
  updated_on = '2026-11-10',
  updated_at = now()
where id = 'stackstorm';
