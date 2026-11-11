-- Fruit Fusion Frenzy 1.0.0: a Matter-physics fruit-merging arcade game.
--
-- The row below mirrors the payload in src/data/games.ts and the game's own
-- arcade-manifest.json. Five arcade modes plus a 500-level Journey whose
-- levels were each validated by replaying a recorded winning drop sequence.

insert into public.games
  (id, name, description, status, featured, version, play_url, site_url, repo_url, categories,
   tagline, runtime, cover, highlights, how_to_play, levels, save_key, downloads, updated_on, manifest)
values
  (
    'fruit-fusion-frenzy',
    'Fruit Fusion Frenzy',
    'A juicy physics fruit-merging arcade game. Drop glossy fruit characters into a glass jar, fuse matching pairs into bigger fruit, and set off chain reactions that fill the screen with colour. Five arcade modes (Classic Endless, Fusion Blitz, Fusion Rush, Zen Garden and the seeded Daily Challenge) sit alongside a 500-level Puzzle Journey across ten themed worlds, every level proven by replaying a recorded winning run on the same Matter physics. Charge the Fusion Fever meter for double points, build chains for huge multipliers, and fuse two watermelons for a Golden Harvest. Eight fruit skins, eight jars and ten scenery themes unlock with stars. Saves, achievements and statistics live locally and sync through a Little Joy Arcade account when signed in.',
    'live',
    true,
    '1.0.0',
    'https://jd4rider.github.io/fruit-fusion-frenzy/play/',
    'https://jd4rider.github.io/fruit-fusion-frenzy/',
    'https://github.com/jd4rider/fruit-fusion-frenzy',
    array['Puzzle', 'Physics', 'Arcade', 'Casual'],
    'Drop it. Merge it. Unleash the frenzy!',
    'Phaser 3',
    '{"from": "#5b7cfa", "to": "#2d9a5c", "emoji": "\uD83C\uDF49"}'::jsonb,
    array[
      'Real Matter physics: fruit drops, bounces, rolls, settles and fuses with transactional merge handling so nothing merges twice',
      'Eleven hand-drawn procedural fruit characters with glossy gradients, leaves, faces and six reactive expressions',
      'Explosive merge feedback, expanding shockwaves, chain banners and a full Golden Harvest celebration for two watermelons',
      'Fusion Fever: charge the meter with merges, then bank twelve seconds of double points and heavier effects',
      'Five arcade modes: Classic Endless, two-minute Fusion Blitz, Zen Garden with a self-recycling jar, five-mission Fusion Rush and a seeded Daily Challenge',
      '500 Puzzle Journey levels across ten themed worlds, each generated against the real physics and validated by replaying a winning drop sequence',
      'Stars reward efficiency: finish the objective, then finish it in fewer drops',
      'Eight fruit skins, eight jar themes and ten animated world backdrops unlocked with stars',
      'Portrait-first one-finger aiming with drag-to-drop or tap-to-drop, plus full keyboard (A/D, arrows, Space, R, P) and gamepad support',
      'Versioned, validated local saves, thirteen trophies and lifetime statistics; the arcade client syncs the same payload when signed in',
      'Procedural art and synthesised audio: no image or sound downloads, fully playable offline'
    ],
    array[
      'Drag anywhere over the jar to aim, then release to drop. On desktop use A/D or the arrow keys and Space to drop; a gamepad stick and A button work too.',
      'Two matching fruit that touch fuse into the next fruit up. Nothing else combines, so plan the pile instead of dropping blindly.',
      'One drop can trigger several fusions in a row. Chains pay more points and charge the Fusion Fever meter faster.',
      'Fruit resting above the dotted line fills the jar. Keep the pile below it; a full jar ends the run after a short grace period.',
      'In Puzzle Journey, complete the objective before the drop limit runs out. Fewer drops earn two and three stars.'
    ],
    '500 Journey levels · 10 worlds + 5 arcade modes',
    'fruit-fusion-frenzy-save-v1',
    '[]'::jsonb,
    '2026-11-10',
    '{
      "id": "fruit-fusion-frenzy",
      "name": "Fruit Fusion Frenzy",
      "tagline": "Drop it. Merge it. Unleash the frenzy!",
      "version": "1.0.0",
      "updated": "2026-11-10",
      "status": "live",
      "featured": true,
      "runtime": "Phaser 3",
      "categories": ["Puzzle", "Physics", "Arcade", "Casual"],
      "playUrl": "https://jd4rider.github.io/fruit-fusion-frenzy/play/",
      "siteUrl": "https://jd4rider.github.io/fruit-fusion-frenzy/",
      "repoUrl": "https://github.com/jd4rider/fruit-fusion-frenzy",
      "cover": { "from": "#5b7cfa", "to": "#2d9a5c", "emoji": "\uD83C\uDF49" },
      "levels": "500 Journey levels · 10 worlds + 5 arcade modes",
      "saveKey": "fruit-fusion-frenzy-save-v1"
    }'::jsonb
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  featured = excluded.featured,
  version = excluded.version,
  play_url = excluded.play_url,
  site_url = excluded.site_url,
  repo_url = excluded.repo_url,
  categories = excluded.categories,
  tagline = excluded.tagline,
  runtime = excluded.runtime,
  cover = excluded.cover,
  highlights = excluded.highlights,
  how_to_play = excluded.how_to_play,
  levels = excluded.levels,
  save_key = excluded.save_key,
  downloads = excluded.downloads,
  updated_on = excluded.updated_on,
  manifest = excluded.manifest,
  updated_at = now();

select id, name, version, status, play_url
from public.games
where id = 'fruit-fusion-frenzy';
