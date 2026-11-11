-- Jetstep Jam! 1.0.0: an original portrait-first jet-boot arcade adventure.
-- The static catalogue in src/data/games.ts is mirrored here for live data.

insert into public.games
  (id, name, description, status, featured, version, play_url, site_url, repo_url, categories,
   tagline, runtime, cover, highlights, how_to_play, levels, save_key, downloads, updated_on, manifest)
values
  (
    'jetstep-jam',
    'Jetstep Jam!',
    'An original portrait-first jet-boot arcade adventure starring Pip, a tiny inventor with enormous rocket boots. A 1,000-level campaign spans 20 musical worlds, from the friendly Melody Meadows machinery to the heart of the Harmony Engine. Each tall stage combines multi-floor traversal, limited jet energy, lifts, switches, hazards, enemies and required Sound Sparks. Twenty world bosses, 35 power-ups, six extra modes, 20 outfits, 30 boot skins and 102 achievements support the journey. Art, animation and adaptive Web Audio are code-generated; the game uses the Little Joy Arcade drop-in client for identity and cloud-save mirroring and keeps achievements local.',
    'live',
    true,
    '1.0.0',
    'https://jd4rider.github.io/jetstep-jam/',
    'https://jd4rider.github.io/jetstep-jam/',
    'https://github.com/jd4rider/jetstep-jam',
    array['Arcade'],
    'Light the boots. Recover the Sound Sparks. Restore the Harmony Engine.',
    'Phaser 3',
    '{"from": "#5cf2d6", "to": "#ff7ec4", "emoji": "🎵"}'::jsonb,
    array[
      '1,000 deterministic campaign levels across 20 worlds, all validated for reachable sparks, exits and fuel',
      '20 world boss encounters with multi-pattern attacks and exposed weak-point phases',
      '35 power-ups, 20 outfits, 30 boot skins and 102 achievements',
      'Six extra modes: Endless Descent, Classic Arcade, Daily Challenge, Time Attack, Boss Rush and Zen',
      'Multi-floor lifts, switches, hazards, collectible routes and three-star mastery scoring',
      'Portrait-first 540x960 presentation with multitouch, keyboard and gamepad input',
      'Original code-generated character art, environments, music and ambience',
      'Versioned local saves with arcade cloud-save mirroring and offline fallback'
    ],
    array[
      'Move with A/D or the arrow keys. Tap Space or JET to jump, and hold it to fire the jet boots.',
      'Duck with S or Down. Hold while running to slide under low machinery.',
      'Collect every required Sound Spark to light the exit portal, then reach it. Optional fragments are pure score.',
      'Jet energy drains while thrusting. Land, collect jet cells and use charging pads to refill it.',
      'On touch, use the left and right buttons, JET and DUCK. Size, opacity and handedness are configurable.',
      'Escape pauses, R restarts a stage, and E interacts where a context action is offered.',
      'Bosses expose a resonator for a short window. Dodge the pattern and touch the glow to take a phase.'
    ],
    '1,000 levels · 20 worlds · 6 modes',
    'jetstep-jam-save-v1',
    '[]'::jsonb,
    '2026-11-11',
    jsonb_build_object(
      'id', 'jetstep-jam',
      'name', 'Jetstep Jam!',
      'tagline', 'Light the boots. Recover the Sound Sparks. Restore the Harmony Engine.',
      'description', 'An original portrait-first jet-boot arcade adventure starring Pip, a tiny inventor with enormous rocket boots. A 1,000-level campaign spans 20 musical worlds, from the friendly Melody Meadows machinery to the heart of the Harmony Engine. Each tall stage combines multi-floor traversal, limited jet energy, lifts, switches, hazards, enemies and required Sound Sparks. Twenty world bosses, 35 power-ups, six extra modes, 20 outfits, 30 boot skins and 102 achievements support the journey. Art, animation and adaptive Web Audio are code-generated; the game uses the Little Joy Arcade drop-in client for identity and cloud-save mirroring and keeps achievements local.',
      'categories', jsonb_build_array('Arcade'),
      'runtime', 'Phaser 3',
      'version', '1.0.0',
      'updated', '2026-11-11',
      'status', 'live',
      'featured', true,
      'playUrl', 'https://jd4rider.github.io/jetstep-jam/',
      'siteUrl', 'https://jd4rider.github.io/jetstep-jam/',
      'repoUrl', 'https://github.com/jd4rider/jetstep-jam',
      'releasesUrl', 'https://github.com/jd4rider/jetstep-jam/releases',
      'downloads', jsonb_build_array(),
      'cover', jsonb_build_object('from', '#5cf2d6', 'to', '#ff7ec4', 'emoji', '🎵'),
      'highlights', jsonb_build_array(
        '1,000 deterministic campaign levels across 20 worlds, all validated for reachable sparks, exits and fuel',
        '20 world boss encounters with multi-pattern attacks and exposed weak-point phases',
        '35 power-ups, 20 outfits, 30 boot skins and 102 achievements',
        'Six extra modes: Endless Descent, Classic Arcade, Daily Challenge, Time Attack, Boss Rush and Zen',
        'Multi-floor lifts, switches, hazards, collectible routes and three-star mastery scoring',
        'Portrait-first 540x960 presentation with multitouch, keyboard and gamepad input',
        'Original code-generated character art, environments, music and ambience',
        'Versioned local saves with arcade cloud-save mirroring and offline fallback'
      ),
      'howToPlay', jsonb_build_array(
        'Move with A/D or the arrow keys. Tap Space or JET to jump, and hold it to fire the jet boots.',
        'Duck with S or Down. Hold while running to slide under low machinery.',
        'Collect every required Sound Spark to light the exit portal, then reach it. Optional fragments are pure score.',
        'Jet energy drains while thrusting. Land, collect jet cells and use charging pads to refill it.',
        'On touch, use the left and right buttons, JET and DUCK. Size, opacity and handedness are configurable.',
        'Escape pauses, R restarts a stage, and E interacts where a context action is offered.',
        'Bosses expose a resonator for a short window. Dodge the pattern and touch the glow to take a phase.'
      ),
      'levels', '1,000 levels · 20 worlds · 6 modes',
      'saveKey', 'jetstep-jam-save-v1'
    )
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
  updated_at = now(),
  manifest = excluded.manifest;

select id, name, version, status,
       jsonb_array_length(manifest->'highlights') as highlights,
       jsonb_array_length(manifest->'howToPlay') as steps
from public.games
where id = 'jetstep-jam';
