update public.games
set
  version = '0.1.1',
  updated_on = '2026-11-10',
  updated_at = now(),
  how_to_play = array[
    'Classic Keen controls: move with the arrow keys, jump with Ctrl, fire with Space, and use your gadget with Alt.',
    'Choose a gadget with 1–5; Alt or K uses it. On touch, use the left thumb pad and the action buttons.',
    'Collect the jetpack, magnet glove, spring boots and phase dash to solve the meadow traversal puzzles.',
    'Reach the Starlight Engine fragment at the end of the meadow. Break the cracked wall for a hidden data capsule.',
    'On a phone, rotate to landscape. The game pauses safely if the device turns portrait.'
  ]::text[],
  manifest = jsonb_set(
    jsonb_set(manifest, '{version}', '"0.1.1"'::jsonb),
    '{howToPlay}',
    '[
      "Classic Keen controls: move with the arrow keys, jump with Ctrl, fire with Space, and use your gadget with Alt.",
      "Choose a gadget with 1–5; Alt or K uses it. On touch, use the left thumb pad and the action buttons.",
      "Collect the jetpack, magnet glove, spring boots and phase dash to solve the meadow traversal puzzles.",
      "Reach the Starlight Engine fragment at the end of the meadow. Break the cracked wall for a hidden data capsule.",
      "On a phone, rotate to landscape. The game pauses safely if the device turns portrait."
    ]'::jsonb
  )
where id = 'galactic-gadgeteer';
