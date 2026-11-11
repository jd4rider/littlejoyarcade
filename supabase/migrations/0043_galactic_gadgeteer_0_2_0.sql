update public.games
set
  version = '0.2.0',
  updated_on = '2026-11-10',
  updated_at = now(),
  description = 'An original 2D sci-fi platformer starring Pip, a young gadgeteer, and BOLT, a hovering robot with opinions. A 150-expedition campaign spans ten lost worlds, from the handcrafted Starlight Meadows opener to the Starlight Engine itself. Every expedition combines responsive movement with a magnetic crate gate, jetpack traversal, spring boots and a phase-thin barrier, plus 36 Star Shards, two data capsules and checkpoint relays. Keyboard, mouse, standard-mapped controllers and multitouch controls feed one input layer; the game pauses cleanly when a controller disconnects or the browser loses focus, and landscape is enforced on phones.',
  highlights = array[
    '150 expeditions across ten lost worlds, from Starlight Meadows to the Starlight Engine',
    'A handcrafted opening expedition plus 149 deterministic generated layouts with safe, tested routes',
    'All five gadgets: plasma blaster, jetpack, spring boots, magnet glove and phase dash',
    'Expedition map, automatic Continue progression and a Next Expedition results flow',
    'Keyboard and mouse, standard-mapped controllers, and true multitouch virtual controls',
    '36 Star Shards, two hidden data capsules and a breakable secret wall in every expedition'
  ]::text[],
  how_to_play = array[
    'Standard controls: move with the arrow keys or A/D, jump with Space, fire with J, and use your gadget with K.',
    'Choose a gadget with 1–5; K uses it. On touch, use the left thumb pad and the action buttons.',
    'Collect the jetpack, magnet glove, spring boots and phase dash to solve traversal puzzles in every world.',
    'Touching any enemy pops it, whether you run into it, brush it in mid-air or land on it.',
    'Reach the Starlight Engine fragment at the end of each expedition. Break the cracked wall for a hidden data capsule.',
    'Finish an expedition to unlock the next one. The Expedition Map jumps between the ten lost worlds.',
    'On a phone, rotate to landscape. The game pauses safely if the device turns portrait.'
  ]::text[],
  levels = '150 expeditions · 10 worlds',
  manifest = manifest || jsonb_build_object(
    'version', '0.2.0',
    'updated', '2026-11-10',
    'description', 'An original 2D sci-fi platformer starring Pip, a young gadgeteer, and BOLT, a hovering robot with opinions. A 150-expedition campaign spans ten lost worlds, from the handcrafted Starlight Meadows opener to the Starlight Engine itself. Every expedition combines responsive movement with a magnetic crate gate, jetpack traversal, spring boots and a phase-thin barrier, plus 36 Star Shards, two data capsules and checkpoint relays. Keyboard, mouse, standard-mapped controllers and multitouch controls feed one input layer; the game pauses cleanly when a controller disconnects or the browser loses focus, and landscape is enforced on phones.',
    'highlights', jsonb_build_array(
      '150 expeditions across ten lost worlds, from Starlight Meadows to the Starlight Engine',
      'A handcrafted opening expedition plus 149 deterministic generated layouts with safe, tested routes',
      'All five gadgets: plasma blaster, jetpack, spring boots, magnet glove and phase dash',
      'Expedition map, automatic Continue progression and a Next Expedition results flow',
      'Keyboard and mouse, standard-mapped controllers, and true multitouch virtual controls',
      '36 Star Shards, two hidden data capsules and a breakable secret wall in every expedition'
    ),
    'howToPlay', jsonb_build_array(
      'Standard controls: move with the arrow keys or A/D, jump with Space, fire with J, and use your gadget with K.',
      'Choose a gadget with 1–5; K uses it. On touch, use the left thumb pad and the action buttons.',
      'Collect the jetpack, magnet glove, spring boots and phase dash to solve traversal puzzles in every world.',
      'Touching any enemy pops it, whether you run into it, brush it in mid-air or land on it.',
      'Reach the Starlight Engine fragment at the end of each expedition. Break the cracked wall for a hidden data capsule.',
      'Finish an expedition to unlock the next one. The Expedition Map jumps between the ten lost worlds.',
      'On a phone, rotate to landscape. The game pauses safely if the device turns portrait.'
    ),
    'levels', '150 expeditions · 10 worlds'
  )
where id = 'galactic-gadgeteer';
