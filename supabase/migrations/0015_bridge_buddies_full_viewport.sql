-- Bridge Buddies was re-exported with its own full-viewport layout: the canvas
-- now fills the browser instead of sitting in a letterboxed 9:16 window, so the
-- catalogue copy that promised letterboxing is out of date. Idempotent, and
-- safe to re-run.

update public.games
set
  description = replace(
    description,
    'Portrait 9:16 play area scaled to fit any screen',
    'A full-viewport play area that fits any screen - phone portrait or desktop widescreen -'
  ),
  highlights = array_replace(
    highlights,
    'Portrait 9:16 play area that fills a phone and letterboxes on desktop',
    'Fills the whole screen at any aspect ratio, phone portrait or desktop'
  ),
  updated_on = '2026-11-04',
  updated_at = now()
where id = 'bridge-buddies';

-- Keep the stored manifest in step with the columns the portal reads from.
update public.games
set
  manifest = jsonb_set(
    jsonb_set(
      jsonb_set(manifest, '{description}', to_jsonb(description)),
      '{highlights}',
      to_jsonb(highlights)
    ),
    '{updated}',
    '"2026-11-04"'
  ),
  updated_at = now()
where id = 'bridge-buddies';

select
  id,
  updated_on,
  highlights[5] as fifth_highlight,
  manifest->'highlights'->>4 as manifest_fifth_highlight
from public.games
where id = 'bridge-buddies';
