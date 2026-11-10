-- Stackstorm 1.0.4: the opening Journey levels show a short hint card, the
-- puzzle lanes glow brighter, and each world's stone walls are baked from that
-- world's own rock colour. The version rides in the iframe URL, so bumping it
-- busts the cached game shell.

update public.games
set
  version = '1.0.4',
  manifest = jsonb_set(manifest, '{version}', '"1.0.4"'),
  updated_on = '2026-11-10',
  updated_at = now()
where id = 'stackstorm';
