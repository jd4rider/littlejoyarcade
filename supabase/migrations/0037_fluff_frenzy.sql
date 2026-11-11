-- Fluff Frenzy 1.0.0: a sliding row/column match puzzle.
--
-- The row below mirrors the payload in src/data/games.ts and the game's own
-- arcade-manifest.json. Every one of the 500 Journey levels was authored and
-- proven by a solver that replays its own winning moves.

insert into public.games
  (id, name, description, status, featured, version, play_url, site_url, repo_url, categories,
   tagline, runtime, cover, highlights, how_to_play, levels, save_key, downloads, updated_on, manifest)
values
  (
    'fluff-frenzy',
    'Fluff Frenzy',
    'A sliding match puzzle starring fluffy pom-pom creatures. Instead of swapping two neighbours, you grab a whole row or column and slide it, wrapping cleanly around the board so fluffs leaving one edge reappear on the other. Three or more matching fluffs burst into clouds of colour, the survivors fall, and fresh fluffs cascade in, which is where the big chains live. Five modes (Classic Arcade with a move bank, two-minute Timed Frenzy, lossless Zen Garden, a seeded Daily Challenge and a 500-level Puzzle Journey across ten themed worlds) run on the same deterministic board engine, so a recorded solution replays exactly. Charge the Fluff Fever meter for double points, use rainbow, bomb, lightning, golden, frozen and locked fluffs in the later worlds, and earn up to three stars per Journey level for solving it in fewer moves.',
    'live',
    true,
    '1.0.0',
    'https://jd4rider.github.io/fluff-frenzy/play/',
    'https://jd4rider.github.io/fluff-frenzy/',
    'https://github.com/jd4rider/fluff-frenzy',
    array['Puzzle', 'Casual', 'Arcade'],
    'Slide the row. Free the fluff. Chase the frenzy.',
    'Phaser 3',
    '{"from": "#f0495f", "to": "#9a6cff", "emoji": "\uD83E\uDDF6"}'::jsonb,
    array[
      'Whole-row and whole-column sliding with seamless wraparound: no adjacent-swap limits, just draggable fluff lines',
      'Six hand-painted procedural fluff characters with fur strands, glossy highlights, blinking and three expressions',
      'Cascade chains with escalating banners, colour-matched bursts, expanding rings and a real Fluff Fever double-score mode',
      'Six special fluffs: rainbow wildcards, 3x3 bombs, lightning rows, golden bonus fluffs, frozen ice and locked anchors',
      'Five modes: Classic Arcade move bank, two-minute Timed Frenzy, endless Zen Garden, seeded Daily Challenge and the Journey',
      '500 Journey levels across ten themed worlds, each authored and proven by a solver that replays its own winning moves',
      'Star ratings reward efficiency, and stars unlock three fur styles in the fluff collection',
      'Portrait-first one-finger dragging, full keyboard support (arrows/WASD, R, P) and gamepad-friendly layout',
      'Three graphics presets and a reduced-motion switch, with pooled particles so long cascades stay smooth',
      'Procedural art, synthesised audio and no asset downloads: the game loads instantly and plays offline',
      'Versioned local saves with sanitising, ten trophies and lifetime statistics; the arcade client syncs the same keys when signed in'
    ],
    array[
      'Drag any fluff left or right to slide its whole row, or up and down to slide its column. The line wraps around the board as you move it.',
      'Three or more matching fluffs in a line burst. Everything above falls and new fluffs drop in, so one slide can set off a long cascade.',
      'On a keyboard, hover a cell and use the arrow keys or WASD to slide that row or column. R restarts and P pauses.',
      'Big matches and deep cascades charge the Fluff Fever meter; when it fills you get twelve seconds of double points.',
      'In Puzzle Journey the card tells you the goal and the move limit. Finish inside the star threshold to earn three stars.',
      'Ice and padlocks anchor their row and column until a match beside them breaks them free, so clear around them first.'
    ],
    '500 Journey levels \u00b7 10 worlds + 5 arcade modes',
    'fluff-frenzy-save-v1',
    '[]'::jsonb,
    '2026-11-10',
    '{
      "id": "fluff-frenzy",
      "name": "Fluff Frenzy",
      "tagline": "Slide the row. Free the fluff. Chase the frenzy.",
      "version": "1.0.0",
      "updated": "2026-11-10",
      "status": "live",
      "featured": true,
      "runtime": "Phaser 3",
      "categories": ["Puzzle", "Casual", "Arcade"],
      "playUrl": "https://jd4rider.github.io/fluff-frenzy/play/",
      "siteUrl": "https://jd4rider.github.io/fluff-frenzy/",
      "repoUrl": "https://github.com/jd4rider/fluff-frenzy",
      "cover": { "from": "#f0495f", "to": "#9a6cff", "emoji": "\uD83E\uDDF6" },
      "levels": "500 Journey levels \u00b7 10 worlds + 5 arcade modes",
      "saveKey": "fluff-frenzy-save-v1"
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
where id = 'fluff-frenzy';
