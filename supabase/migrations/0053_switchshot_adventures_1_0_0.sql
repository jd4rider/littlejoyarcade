-- Switchshot Adventures 1.0.0: a portrait-first tap-to-shoot puzzle platformer.
--
-- The row below mirrors src/data/games.ts and the game's own
-- arcade-manifest.json. Five hundred Journey rooms are generated
-- deterministically and validated for shootable switches, climbable stairs
-- and reachable exits before they are published.

insert into public.games
  (id, name, description, status, featured, version, play_url, site_url, repo_url, categories,
   tagline, runtime, cover, highlights, how_to_play, levels, save_key, downloads, updated_on, manifest)
values
  (
    'switchshot-adventures',
    'Switchshot Adventures',
    'A portrait-first tap-to-shoot puzzle platformer. Pip climbs ten mechanical towers with the Switchshot, a blaster that opens hatches, powers circuits, pulls crates and grows platforms. 500 validated Journey rooms, four blaster modes, ten guardian encounters, Endless Tower, Speedrun, a daily room and six challenge rooms. Art, animation and audio are code-generated; the game uses the Little Joy Arcade drop-in client for identity and cloud-save mirroring and keeps progress local when offline.',
    'live',
    true,
    '1.0.0',
    'https://jd4rider.github.io/switchshot-adventures/',
    'https://jd4rider.github.io/switchshot-adventures/',
    'https://github.com/jd4rider/switchshot-adventures',
    array['Arcade'],
    'Every shot opens a new adventure.',
    'Phaser 3',
    '{"from": "#6ff2c8", "to": "#ff8fc7", "emoji": "🔫"}'::jsonb,
    array[
      '500 deterministic Journey rooms across ten worlds, all validated for shootable switches, climbable stairs and reachable exits',
      'Tap-to-shoot aiming that works while running, jumping and riding moving platforms',
      'Four blaster modes: Pulse, Volt, Growth and Gravity',
      'Ten guardian encounters with three weak points each',
      'Endless Tower, Speedrun, Daily Puzzle and six Challenge Rooms',
      'Thumb Glide, Classic Buttons, left-handed and aim-assist accessibility options',
      'Portrait-first 720×1280 presentation with multitouch, keyboard, mouse and gamepad input'
    ],
    array[
      'Move with A/D or the arrow keys and jump with Space. On touch, drag the lower-left pad and flick up to jump.',
      'Tap anywhere in the room to fire toward that point. Shots travel through the world and can bounce off mirrors.',
      'Hit every switch on a hatch to open it, then climb the staircase to the next chamber.',
      'Switch blasters with 1–4. Volt powers circuits, Growth grows platforms and Gravity slides crates onto plates.',
      'Collect the required gems to light the portal and reach it. Optional gems and a clean run earn the extra stars.',
      'Escape pauses and R restarts a room.'
    ],
    '500 rooms · 10 worlds · 5 modes',
    'switchshot-adventures-save-v1',
    '[]'::jsonb,
    '2026-11-11',
    jsonb_build_object(
      'id', 'switchshot-adventures',
      'name', 'Switchshot Adventures',
      'tagline', 'Every shot opens a new adventure.',
      'description', 'A portrait-first tap-to-shoot puzzle platformer. Pip climbs ten mechanical towers with the Switchshot, a blaster that opens hatches, powers circuits, pulls crates and grows platforms. 500 validated Journey rooms, four blaster modes, ten guardian encounters, Endless Tower, Speedrun, a daily room and six challenge rooms. Art, animation and audio are code-generated; the game uses the Little Joy Arcade drop-in client for identity and cloud-save mirroring and keeps progress local when offline.',
      'categories', jsonb_build_array('Arcade'),
      'runtime', 'Phaser 3',
      'version', '1.0.0',
      'updated', '2026-11-11',
      'status', 'live',
      'featured', true,
      'playUrl', 'https://jd4rider.github.io/switchshot-adventures/',
      'siteUrl', 'https://jd4rider.github.io/switchshot-adventures/',
      'repoUrl', 'https://github.com/jd4rider/switchshot-adventures',
      'releasesUrl', 'https://github.com/jd4rider/switchshot-adventures/releases',
      'downloads', jsonb_build_array(),
      'cover', jsonb_build_object('from', '#6ff2c8', 'to', '#ff8fc7', 'emoji', '🔫'),
      'highlights', jsonb_build_array(
        '500 deterministic Journey rooms across ten worlds, all validated for shootable switches, climbable stairs and reachable exits',
        'Tap-to-shoot aiming that works while running, jumping and riding moving platforms',
        'Four blaster modes: Pulse, Volt, Growth and Gravity',
        'Ten guardian encounters with three weak points each',
        'Endless Tower, Speedrun, Daily Puzzle and six Challenge Rooms',
        'Thumb Glide, Classic Buttons, left-handed and aim-assist accessibility options',
        'Portrait-first 720×1280 presentation with multitouch, keyboard, mouse and gamepad input'
      ),
      'howToPlay', jsonb_build_array(
        'Move with A/D or the arrow keys and jump with Space. On touch, drag the lower-left pad and flick up to jump.',
        'Tap anywhere in the room to fire toward that point. Shots travel through the world and can bounce off mirrors.',
        'Hit every switch on a hatch to open it, then climb the staircase to the next chamber.',
        'Switch blasters with 1–4. Volt powers circuits, Growth grows platforms and Gravity slides crates onto plates.',
        'Collect the required gems to light the portal and reach it. Optional gems and a clean run earn the extra stars.',
        'Escape pauses and R restarts a room.'
      ),
      'levels', '500 rooms · 10 worlds · 5 modes',
      'saveKey', 'switchshot-adventures-save-v1'
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
where id = 'switchshot-adventures';
