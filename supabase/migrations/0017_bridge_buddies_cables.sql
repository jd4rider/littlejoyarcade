-- Bridge Buddies 0.2.1: the tray carries four pieces now - plank, brace, cable,
-- pier - and every level is its own ravine on the journey map. Cables are
-- tension-only, which is worth saying in the catalogue because it changes how the
-- puzzle is played. Idempotent, and safe to re-run.

update public.games
set
  version = '0.2.1',
  description = 'A miniature 3D bridge-engineering puzzle, rebuilt in Unity and rendered straight from the WebGL player. Carry a plank, a brace, a cable or a pier out of the tray and a glowing green ghost shows exactly where it will land; let go near a slot and it snaps home with a click. Cables only pull: they are cheap and light, but the solver lets one go slack the moment it would have to push. The bridge is a real structural solve rather than a canned animation: every member carries axial force and bending moment, the deck sags under the wheels and the vehicle rides the sag, and an overloaded member lets go instead of pretending it is fine. Sixteen bridges are laid out on a journey map across four chapters of the ravine, each with its own panel count, truss depth, budget and vehicle. Full-viewport play area that fits any screen - phone portrait or desktop widescreen - with mouse and touch input, no install and no download.',
  highlights = array[
    'Carry a piece and a shining green ghost shows where it will snap into place',
    'Cables are tension-only: cheap, light, and slack the moment they would have to push',
    'A 16-bridge journey map across four chapters, with progress and medals saved',
    'A real structural solve: axial force and bending moment on every member',
    'The deck sags under the vehicle, and the vehicle rides the sag',
    'Fills the whole screen at any aspect ratio, phone portrait or desktop',
    'Mouse and touch input, no install and no download'
  ],
  how_to_play = array[
    'Open the game and wait for the Unity progress bar - the first load streams about 56 MB',
    'The piece tray opens at the bottom - tap the tab to close or reopen it',
    'Drag a piece out of the tray and let go near a slot to snap it in',
    'Press CROSS and watch the buddy drive the bridge you built'
  ],
  levels = '16 bridges · 4 chapters · journey map progression',
  save_key = 'bb.journey',
  updated_on = '2026-11-07',
  updated_at = now()
where id = 'bridge-buddies';

-- Keep the stored manifest in step with the columns the portal reads from.
update public.games
set
  manifest = manifest
    || jsonb_build_object(
         'version', version,
         'description', description,
         'highlights', to_jsonb(highlights),
         'howToPlay', to_jsonb(how_to_play),
         'levels', levels,
         'saveKey', save_key,
         'updated', updated_on::text
       ),
  updated_at = now()
where id = 'bridge-buddies';

select id, version, updated_on, levels, save_key
from public.games
where id = 'bridge-buddies';
