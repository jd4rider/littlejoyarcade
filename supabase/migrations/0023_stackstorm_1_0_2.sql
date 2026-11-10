-- Stackstorm 1.0.2: distinct early Journey boards, a neutral (non-green) well so
-- the piece colours read clearly, sized HOLD/NEXT panels, and move arrows at
-- opposite ends of the touch strip. The version is part of the iframe URL, so
-- bumping it also busts the cached game shell.

update public.games
set
  version = '1.0.2',
  manifest = jsonb_set(manifest, '{version}', '"1.0.2"'),
  updated_on = '2026-11-10',
  updated_at = now()
where id = 'stackstorm';
