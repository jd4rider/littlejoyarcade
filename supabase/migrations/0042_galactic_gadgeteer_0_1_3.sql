update public.games
set
  version = '0.1.3',
  updated_on = '2026-11-10',
  updated_at = now(),
  how_to_play = array[
    'Standard controls: move with the arrow keys or A/D, jump with Space, fire with J, and use your gadget with K.',
    'Choose a gadget with 1–5; K uses it. On touch, use the left thumb pad and the action buttons.',
    'Collect the jetpack, magnet glove, spring boots and phase dash to solve the meadow traversal puzzles.',
    'Touching any enemy pops it, whether you run into it, brush it in mid-air or land on it.',
    'Reach the Starlight Engine fragment at the end of the meadow. Break the cracked wall for a hidden data capsule.',
    'On a phone, rotate to landscape. The game pauses safely if the device turns portrait.'
  ]::text[],
  manifest = jsonb_set(
    jsonb_set(manifest, '{version}', '"0.1.3"'::jsonb),
    '{howToPlay}',
    '[
      "Standard controls: move with the arrow keys or A/D, jump with Space, fire with J, and use your gadget with K.",
      "Choose a gadget with 1–5; K uses it. On touch, use the left thumb pad and the action buttons.",
      "Collect the jetpack, magnet glove, spring boots and phase dash to solve the meadow traversal puzzles.",
      "Touching any enemy pops it, whether you run into it, brush it in mid-air or land on it.",
      "Reach the Starlight Engine fragment at the end of the meadow. Break the cracked wall for a hidden data capsule.",
      "On a phone, rotate to landscape. The game pauses safely if the device turns portrait."
    ]'::jsonb
  )
where id = 'galactic-gadgeteer';
