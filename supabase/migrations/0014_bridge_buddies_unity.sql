-- Bridge Buddies moved from the Babylon.js build to the Unity WebGL export.
--
-- The old play URL (jd4rider.github.io/bridge-buddies/play/) is replaced by the
-- Unity build in jd4rider/bridge-buddies-web. The game id, cover and featured
-- slot stay the same, so links to /#/game/bridge-buddies keep working.
--
-- Idempotent: safe to re-run, and the REST publisher writes the same row from
-- bridge-buddies-web/arcade-manifest.json.

update public.games
set
  description = 'A miniature 3D bridge-engineering puzzle, rebuilt in Unity and rendered straight from the WebGL player. Buy planks, beams and bracing out of a fixed budget, tap between posts to raise a truss, then press TEST and watch a little buddy drive across the span you just built. The bridge is a real structural solve rather than a canned animation: every member carries axial force and bending moment, the deck sags under the wheels and the vehicle rides the sag, and an overloaded member lets go instead of pretending it is fine. Portrait 9:16 play area scaled to fit any screen, mouse and touch input, no install and no download.',
  runtime = 'Unity WebGL',
  version = '0.1.0',
  play_url = 'https://jd4rider.github.io/bridge-buddies-web/play/',
  site_url = 'https://jd4rider.github.io/bridge-buddies-web/',
  repo_url = 'https://github.com/jd4rider/bridge-buddies-web',
  categories = array['Physics', 'Puzzle', 'Strategy', 'Casual'],
  highlights = array[
    'Native Unity WebGL build with real 3D rendering, not a 2D stand-in',
    'A real structural solve: axial force and bending moment on every member',
    'The deck sags under the vehicle, and the vehicle rides the sag',
    'Place the deck, the truss and the piers, then press TEST to watch it cross',
    'Portrait 9:16 play area that fills a phone and letterboxes on desktop',
    'Mouse and touch input, no install and no download'
  ],
  how_to_play = array[
    'Open the game and wait for the Unity progress bar - the first load streams about 61 MB',
    'Tap between two posts to place a member, and keep an eye on the budget',
    'Add bracing and piers until TEST shows the structure holding',
    'Press TEST and watch the buddy drive across the span'
  ],
  levels = 'Unity WebGL build - build-and-test challenges',
  -- The Unity player keeps its own progress in browser storage: no page-level
  -- save key is wired up, so the portal must not look for a cloud save.
  save_key = '',
  updated_on = '2026-11-04',
  manifest = jsonb_set(
    jsonb_set(
      jsonb_set(manifest, '{playUrl}', to_jsonb('https://jd4rider.github.io/bridge-buddies-web/play/'::text)),
      '{runtime}',
      to_jsonb('Unity WebGL'::text)
    ),
    '{updated}',
    to_jsonb('2026-11-04'::text)
  ),
  updated_at = now()
where id = 'bridge-buddies';

select
  id,
  runtime,
  version,
  play_url,
  save_key,
  updated_on
from public.games
where id = 'bridge-buddies';
