-- Fruit Fusion Frenzy 1.0.1: a larger, more readable UI at phone sizes,
-- slightly bigger fruit, and Journey goals that name and picture the goal
-- fruit both in the level card and in the live HUD.
--
-- Only the version, the updated date, the highlight list and the embedded
-- manifest change; the play URL and every other field stay as published.

update public.games set
  version = '1.0.1',
  updated_on = '2026-11-10',
  highlights = array[
    'Real Matter physics: fruit drops, bounces, rolls, settles and fuses with transactional merge handling so nothing merges twice',
    'Eleven hand-drawn procedural fruit characters with glossy gradients, leaves, faces and six reactive expressions',
    'Explosive merge feedback, expanding shockwaves, chain banners and a full Golden Harvest celebration for two watermelons',
    'Fusion Fever: charge the meter with merges, then bank twelve seconds of double points and heavier effects',
    'Five arcade modes: Classic Endless, two-minute Fusion Blitz, Zen Garden with a self-recycling jar, five-mission Fusion Rush and a seeded Daily Challenge',
    '500 Puzzle Journey levels across ten themed worlds, each generated against the real physics and validated by replaying a winning drop sequence',
    'Stars reward efficiency: finish the objective, then finish it in fewer drops',
    'Every Journey level names and pictures the fruit you are growing, and the HUD tracks that goal fruit as you fuse toward it',
    'Eight fruit skins, eight jar themes and ten animated world backdrops unlocked with stars',
    'Portrait-first one-finger aiming with drag-to-drop or tap-to-drop, plus full keyboard (A/D, arrows, Space, R, P) and gamepad support',
    'Versioned, validated local saves, thirteen trophies and lifetime statistics; the arcade client syncs the same payload when signed in',
    'Procedural art and synthesised audio: no image or sound downloads, fully playable offline'
  ],
  manifest = jsonb_set(
    jsonb_set(
      jsonb_set(manifest, '{version}', '"1.0.1"'),
      '{updated}', '"2026-11-10"'
    ),
    '{highlights}',
    '[
      "Real Matter physics: fruit drops, bounces, rolls, settles and fuses with transactional merge handling so nothing merges twice",
      "Eleven hand-drawn procedural fruit characters with glossy gradients, leaves, faces and six reactive expressions",
      "Explosive merge feedback, expanding shockwaves, chain banners and a full Golden Harvest celebration for two watermelons",
      "Fusion Fever: charge the meter with merges, then bank twelve seconds of double points and heavier effects",
      "Five arcade modes: Classic Endless, two-minute Fusion Blitz, Zen Garden with a self-recycling jar, five-mission Fusion Rush and a seeded Daily Challenge",
      "500 Puzzle Journey levels across ten themed worlds, each generated against the real physics and validated by replaying a winning drop sequence",
      "Stars reward efficiency: finish the objective, then finish it in fewer drops",
      "Every Journey level names and pictures the fruit you are growing, and the HUD tracks that goal fruit as you fuse toward it",
      "Eight fruit skins, eight jar themes and ten animated world backdrops unlocked with stars",
      "Portrait-first one-finger aiming with drag-to-drop or tap-to-drop, plus full keyboard (A/D, arrows, Space, R, P) and gamepad support",
      "Versioned, validated local saves, thirteen trophies and lifetime statistics; the arcade client syncs the same payload when signed in",
      "Procedural art and synthesised audio: no image or sound downloads, fully playable offline"
    ]'::jsonb
  ),
  updated_at = now()
where id = 'fruit-fusion-frenzy';

select id, name, version, status, play_url
from public.games
where id = 'fruit-fusion-frenzy';
