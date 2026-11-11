-- Journey targets are now measured against ordinary player-paced play instead
-- of the solver's deep cascade chains, and every cascade free is credited to
-- the goal as it lands. Level 1 asks for 86 fluffs in 15 moves, not 661.

update public.games
set
  version = '1.0.1',
  updated_on = '2026-11-10',
  updated_at = now(),
  how_to_play = array[
    'Drag any fluff left or right to slide its whole row, or up and down to slide its column. The line wraps around the board as you move it.',
    'Three or more matching fluffs connected in a group burst — a line, an L or a blob, never a diagonal. Everything above falls and new fluffs drop in, so one slide can set off a long cascade.',
    'On a keyboard, hover a cell and use the arrow keys or WASD to slide that row or column. R restarts and P pauses.',
    'Big matches and deep cascades charge the Fluff Fever meter; when it fills you get twelve seconds of double points.',
    'In Puzzle Journey the card tells you the goal and the move limit. Every fluff freed counts, including the ones a cascade drops, and the meter ticks up as each cascade lands. Finish inside the star threshold for three stars.',
    'Ice and padlocks anchor their row and column until a match beside them breaks them free, so clear around them first.'
  ]::text[],
  manifest = jsonb_set(
    jsonb_set(
      jsonb_set(manifest, '{version}', '"1.0.1"'::jsonb),
      '{howToPlay}',
      '[
        "Drag any fluff left or right to slide its whole row, or up and down to slide its column. The line wraps around the board as you move it.",
        "Three or more matching fluffs connected in a group burst — a line, an L or a blob, never a diagonal. Everything above falls and new fluffs drop in, so one slide can set off a long cascade.",
        "On a keyboard, hover a cell and use the arrow keys or WASD to slide that row or column. R restarts and P pauses.",
        "Big matches and deep cascades charge the Fluff Fever meter; when it fills you get twelve seconds of double points.",
        "In Puzzle Journey the card tells you the goal and the move limit. Every fluff freed counts, including the ones a cascade drops, and the meter ticks up as each cascade lands. Finish inside the star threshold for three stars.",
        "Ice and padlocks anchor their row and column until a match beside them breaks them free, so clear around them first."
      ]'::jsonb
    ),
    '{highlights}',
    '[
      "Whole-row and whole-column sliding with seamless wraparound: no adjacent-swap limits, just draggable fluff lines",
      "Six hand-painted procedural fluff characters with fur strands, glossy highlights, blinking and three expressions",
      "Cascade chains with escalating banners, colour-matched bursts, expanding rings and a real Fluff Fever double-score mode",
      "Six special fluffs: rainbow wildcards, 3x3 bombs, lightning rows, golden bonus fluffs, frozen ice and locked anchors",
      "Five modes: Classic Arcade move bank, two-minute Timed Frenzy, endless Zen Garden, seeded Daily Challenge and the Journey",
      "500 Journey levels across ten themed worlds, each target measured against ordinary player-paced play and proven by replaying a winning run",
      "Star ratings reward efficiency, and stars unlock three fur styles in the fluff collection",
      "Portrait-first one-finger dragging, full keyboard support (arrows/WASD, R, P) and gamepad-friendly layout",
      "Three graphics presets and a reduced-motion switch, with pooled particles so long cascades stay smooth",
      "Procedural art, synthesised audio and no asset downloads: the game loads instantly and plays offline",
      "Versioned local saves with sanitising, ten trophies and lifetime statistics; the arcade client syncs the same keys when signed in"
    ]'::jsonb
  )
where id = 'fluff-frenzy';

select id, version, updated_on,
       jsonb_array_length(manifest->'highlights') as highlights,
       jsonb_array_length(manifest->'howToPlay') as steps
from public.games
where id = 'fluff-frenzy';
