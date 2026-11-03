-- Cannon Clash 3D was re-exported as a portrait-only build: the canvas now fills a
-- phone screen instead of letterboxing a landscape view, and the Unity footer
-- (and its fullscreen button) is hidden by the new template. Only the catalogue
-- copy changes; the build itself lives on GitHub Pages. Idempotent.

update public.games
set
  description = replace(
    description,
    'A 3D cannon puzzle built in Unity',
    'A portrait 3D cannon puzzle built in Unity'
  ),
  highlights = array_append(highlights, 'Portrait play area that fills a phone screen and letterboxes on desktop'),
  how_to_play = array_replace(
    how_to_play,
    'Use the fullscreen button in the footer for the largest view',
    'Rotate to landscape and the game stays a centred portrait panel instead of stretching'
  ),
  manifest = jsonb_set(
    jsonb_set(
      jsonb_set(
        manifest,
        '{description}',
        to_jsonb(replace(manifest->>'description', 'A 3D cannon puzzle built in Unity', 'A portrait 3D cannon puzzle built in Unity'))
      ),
      '{highlights}',
      (manifest->'highlights') || to_jsonb('Portrait play area that fills a phone screen and letterboxes on desktop'::text)
    ),
    '{howToPlay,3}',
    to_jsonb('Rotate to landscape and the game stays a centred portrait panel instead of stretching'::text)
  ),
  updated_on = '2026-11-03',
  updated_at = now()
where id = 'cannon-clash-3d';

select id, version, updated_on, how_to_play[4] as last_step, jsonb_array_length(highlights) as highlights
from public.games
where id = 'cannon-clash-3d';
