-- Cannon Clash 3D was re-exported as a portrait-only build: the canvas fills a
-- phone screen instead of letterboxing a landscape view, and the Unity footer
-- (with its fullscreen button) is hidden by the new template. Only the catalogue
-- copy changes; the build itself lives on GitHub Pages. Idempotent.

update public.games
set
  description = replace(
    description,
    'A 3D cannon puzzle built in Unity',
    'A portrait 3D cannon puzzle built in Unity'
  ),
  highlights = case
    when 'Portrait play area that fills a phone screen and letterboxes on desktop' = any (highlights)
      then highlights
    else array_append(highlights, 'Portrait play area that fills a phone screen and letterboxes on desktop')
  end,
  how_to_play = array_replace(
    how_to_play,
    'Use the fullscreen button in the footer for the largest view',
    'Rotate to landscape and the game stays a centred portrait panel instead of stretching'
  ),
  updated_on = '2026-11-03',
  updated_at = now()
where id = 'cannon-clash-3d';

-- Keep the stored manifest in step with the columns the portal reads from.
update public.games
set
  manifest = jsonb_set(
    jsonb_set(
      jsonb_set(manifest, '{description}', to_jsonb(description)),
      '{highlights}',
      to_jsonb(highlights)
    ),
    '{howToPlay}',
    to_jsonb(how_to_play)
  ),
  updated_at = now()
where id = 'cannon-clash-3d';

select
  id,
  version,
  updated_on,
  how_to_play[4] as last_step,
  array_length(highlights, 1) as highlight_count,
  left(description, 40) as description_start
from public.games
where id = 'cannon-clash-3d';
