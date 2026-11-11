-- Slingstorm 0.1.1: the playfield is a left-to-right side view, and the dotted
-- aim line is now the real flight path.
--
-- Matter converts the gravity you hand it (gravity.scale * step^2), so the old
-- preview integrated a fall rate the shots never flew; the guide missed by up
-- to 1,260px at full pull. Both sides now share one integrator, and the levels
-- were re-authored along a single ridge with the slingshot on the left.

update public.games
set
  version = '0.1.1',
  description = 'A portrait-first slingshot demolition game. Pull a Slingling back down the ridge to the left and fire it right into towers built on that same ridge. Towers are real Matter rigid bodies: knock out a support and the whole thing comes down. Eight materials behave differently (glass shatters, ice is brittle, stone takes work, metal shrugs shots off, boom crates chain), ten Slinglings each have a tap-in-flight ability, and every one of the 500 Journey levels is generated deterministically and validated — the tower must stand for two seconds with no shot, and every target must be reachable by a real ballistic arc from the slingshot.',
  updated_on = '2026-11-11',
  updated_at = now(),
  highlights = array[
    'Side-on slingshot demolition built for portrait: pull back to the left, fire right along the ridge',
    'Blender-rendered Slinglings and Grumplets with real strand fur, glossy eyes, per-type silhouettes and five baked animations each',
    'Real Matter physics towers - break a support and the structure collapses; nothing is scripted to fall',
    'Eight materials with distinct feel: wood splinters, glass and ice shatter, stone takes repeated hits, metal resists, boom crates chain',
    'Ten Slinglings with tap-in-flight abilities: detonate, split into three, drill, chain lightning, freeze, bank, crush, repel metal, gust',
    '500 Journey levels across ten themed worlds, each generated deterministically and validated for stability and reachability',
    'Six modes: Puzzle Journey, Endless Siege, two-minute Destruction Blitz, Precision Challenge, Zen Demolition and a seeded Daily Siege',
    'Storm combos escalate through six announcements, and the Storm meter unlocks a double-score Slingstorm Fever',
    'Three-star ratings reward efficiency; stars and best scores persist in a versioned local save',
    'Portrait-first touch and mouse dragging, full keyboard aiming, pause and fast retry',
    'Procedural structures and particles, pooled emitters, fixed 120Hz physics substeps so fast shots cannot tunnel',
    'Synthesised audio and painted block textures: no downloads, and the game works offline'
  ]::text[],
  how_to_play = array[
    'Touch or click the loaded Slingling, drag back to the left to stretch the slingshot, then release to fire to the right. Pull further for more power; the dotted line is the exact arc the shot will fly.',
    'Tap anywhere while a Slingling is in the air to use its ability. Boomkin detonates, Triplet splits, Frostpop freezes, Zing arcs lightning and Wrecker crushes.',
    'Towers are physical. Thin supports and glass legs are usually worth more than the wall in front of them.',
    'Knock every Grumplet out of the tower. Anything knocked off the ridge counts as beaten.',
    'You only get the shots listed at the bottom of the screen, and any you do not need are worth 2,500 points each when the tower goes down.',
    'Keyboard: A/D or arrows to aim, W/S to change power, Enter to fire, Space for the ability, P or Escape to pause, R to retry.'
  ]::text[],
  manifest = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          manifest,
          '{version}',
          '"0.1.1"'::jsonb
        ),
        '{description}',
        to_jsonb('A portrait-first slingshot demolition game. Pull a Slingling back down the ridge to the left and fire it right into towers built on that same ridge. Towers are real Matter rigid bodies: knock out a support and the whole thing comes down. Eight materials behave differently (glass shatters, ice is brittle, stone takes work, metal shrugs shots off, boom crates chain), ten Slinglings each have a tap-in-flight ability, and every one of the 500 Journey levels is generated deterministically and validated - the tower must stand for two seconds with no shot, and every target must be reachable by a real ballistic arc from the slingshot.'::text)
      ),
      '{highlights}',
      '[
        "Side-on slingshot demolition built for portrait: pull back to the left, fire right along the ridge",
        "Blender-rendered Slinglings and Grumplets with real strand fur, glossy eyes, per-type silhouettes and five baked animations each",
        "Real Matter physics towers - break a support and the structure collapses; nothing is scripted to fall",
        "Eight materials with distinct feel: wood splinters, glass and ice shatter, stone takes repeated hits, metal resists, boom crates chain",
        "Ten Slinglings with tap-in-flight abilities: detonate, split into three, drill, chain lightning, freeze, bank, crush, repel metal, gust",
        "500 Journey levels across ten themed worlds, each generated deterministically and validated for stability and reachability",
        "Six modes: Puzzle Journey, Endless Siege, two-minute Destruction Blitz, Precision Challenge, Zen Demolition and a seeded Daily Siege",
        "Storm combos escalate through six announcements, and the Storm meter unlocks a double-score Slingstorm Fever",
        "Three-star ratings reward efficiency; stars and best scores persist in a versioned local save",
        "Portrait-first touch and mouse dragging, full keyboard aiming, pause and fast retry",
        "Procedural structures and particles, pooled emitters, fixed 120Hz physics substeps so fast shots cannot tunnel",
        "Synthesised audio and painted block textures: no downloads, and the game works offline"
      ]'::jsonb
    ),
    '{howToPlay}',
    '[
      "Touch or click the loaded Slingling, drag back to the left to stretch the slingshot, then release to fire to the right. Pull further for more power; the dotted line is the exact arc the shot will fly.",
      "Tap anywhere while a Slingling is in the air to use its ability. Boomkin detonates, Triplet splits, Frostpop freezes, Zing arcs lightning and Wrecker crushes.",
      "Towers are physical. Thin supports and glass legs are usually worth more than the wall in front of them.",
      "Knock every Grumplet out of the tower. Anything knocked off the ridge counts as beaten.",
      "You only get the shots listed at the bottom of the screen, and any you do not need are worth 2,500 points each when the tower goes down.",
      "Keyboard: A/D or arrows to aim, W/S to change power, Enter to fire, Space for the ability, P or Escape to pause, R to retry."
    ]'::jsonb
  )
where id = 'slingstorm';

select id, name, version, status,
       jsonb_array_length(manifest->'highlights') as highlights,
       jsonb_array_length(manifest->'howToPlay') as steps,
       manifest->>'version' as manifest_version
from public.games
where id = 'slingstorm';
