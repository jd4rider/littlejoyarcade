-- Bridge Buddies 0.2.0: pieces are carried and snapped into place, and the three
-- prototype challenges became a sixteen-bridge journey map with saved progress.
-- The catalogue copy still described tapping between posts and a three-challenge
-- slice, and quoted a 61 MB first load (the build is now 56 MB). Idempotent, and
-- safe to re-run.

update public.games
set
  version = '0.2.0',
  tagline = 'Carry it. Snap it. Get them across.',
  description = 'A miniature 3D bridge-engineering puzzle, rebuilt in Unity and rendered straight from the WebGL player. Carry a plank, a brace or a pier out of the tray and a glowing green ghost shows exactly where it will land; let go near a slot and it snaps home. Every member carries axial force and bending moment, the deck sags under the wheels and the vehicle rides the sag, and an overloaded member lets go instead of pretending it is fine. Sixteen bridges are laid out on a journey map across four chapters of the ravine, each one a different shape, depth, budget and vehicle - from a hatchback on four short planks to a tipper on a truss that has to be pinned at every joint. Progress and medals are saved between sessions. Full-viewport play area at any aspect ratio, mouse and touch input, no install and no download.',
  highlights = array[
    'Carry a piece and a shining green ghost shows where it will snap into place',
    'A 16-bridge journey map across four chapters, with progress and medals saved',
    'Every bridge is a different ravine: panel count, truss depth, budget and vehicle',
    'A real structural solve: axial force and bending moment on every member',
    'The deck sags under the vehicle, and the vehicle rides the sag',
    'Fills the whole screen at any aspect ratio, phone portrait or desktop',
    'Mouse and touch input, no install and no download'
  ],
  how_to_play = array[
    'Open the game and wait for the Unity progress bar - the first load streams about 56 MB',
    'Drag a piece out of the tray at the bottom. The green ghost shows the slot it will take',
    'Let go near a slot to snap it in; the budget bar shows what is left to spend',
    'Press CROSS and watch the buddy drive the bridge you built',
    'Cross a bridge to unlock the next stop on the journey map'
  ],
  levels = '16 bridges · 4 chapters · journey map progression',
  updated_on = '2026-11-07',
  updated_at = now()
where id = 'bridge-buddies';

-- Keep the stored manifest in step with the columns the portal reads from.
update public.games
set
  manifest = manifest
    || jsonb_build_object(
         'version', '0.2.0',
         'tagline', 'Carry it. Snap it. Get them across.',
         'description', description,
         'highlights', to_jsonb(highlights),
         'howToPlay', to_jsonb(how_to_play),
         'levels', levels,
         'updated', '2026-11-07'
       ),
  updated_at = now()
where id = 'bridge-buddies';

select
  id,
  version,
  updated_on,
  levels,
  how_to_play[2] as second_step,
  manifest->'howToPlay'->>1 as manifest_second_step
from public.games
where id = 'bridge-buddies';
