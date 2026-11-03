-- Traffic Tangle joins the Little Joy Arcade catalogue.
-- Generated from the Game manifest in src/data/games.ts. Idempotent: safe to
-- re-run, and safe for supabase db push after this row already exists.

with m as (
  select $manifest${
  "id": "traffic-tangle",
  "name": "Traffic Tangle",
  "tagline": "Draw the routes. Start the traffic. Get everyone home.",
  "description": "A miniature toy-city routing puzzle. Give every car a road route to its own coloured pin, set the signals, then press GO and watch all of them drive at once. Nothing is scripted: each level runs a fixed-step traffic simulation with lane occupancy, intersection reservations and real conflict zones, so two cars crossing on the same layer collide unless their timings miss. One thousand Journey levels across twenty worlds are generated from a working plan and re-driven by the shipped simulation before they ship. Bridges and tunnels stack layers, one-way streets, roundabouts, railroad crossings and multi-stop deliveries keep later worlds honest.",
  "categories": [
    "Puzzle",
    "Logic",
    "Strategy",
    "Casual"
  ],
  "runtime": "Phaser 3",
  "version": "1.0.0",
  "updated": "2026-11-02",
  "status": "live",
  "playUrl": "https://jd4rider.github.io/traffic-tangle/play/",
  "siteUrl": "https://jd4rider.github.io/traffic-tangle/",
  "repoUrl": "https://github.com/jd4rider/traffic-tangle",
  "releasesUrl": "https://github.com/jd4rider/traffic-tangle/releases",
  "downloads": [],
  "cover": {
    "from": "#2f8fbf",
    "to": "#132a3a",
    "emoji": "🚦"
  },
  "highlights": [
    "1,000 Journey levels across twenty themed worlds, each re-driven by the shipped simulation in CI",
    "A deterministic 60 Hz traffic engine with lane occupancy, intersection reservations and deadlock detection",
    "Bridges, tunnels, one-way streets, roundabouts, signals and multi-stop deliveries",
    "Draw routes by dragging or two taps, with solver-backed hints and full undo/redo",
    "Portrait-first touch controls, keyboard shortcuts and offline saves"
  ],
  "howToPlay": [
    "Tap a car to select it, then tap its pin to draw a route - or drag along the roads yourself.",
    "Tap a traffic light to shift its phase until the timing works.",
    "Press GO and watch every car drive at once. Redo the routes if two of them meet.",
    "Get every car home without a collision. Undo, reset and hints are always free."
  ],
  "levels": "1,000 levels · 20 worlds + daily, zen, endless and sandbox",
  "saveKey": "traffic-tangle-save-v1"
}$manifest$::jsonb as j
)
insert into public.games (
  id, name, description, status, featured, sort_order, version, play_url, site_url, repo_url,
  categories, tagline, runtime, cover, highlights, how_to_play, levels, save_key, downloads,
  updated_on, manifest
)
select
  j->>'id',
  j->>'name',
  j->>'description',
  case when j->>'status' = 'coming-soon' then 'coming_soon' else coalesce(j->>'status', 'live') end::public.game_status,
  coalesce((j->>'featured')::boolean, false),
  13,
  coalesce(j->>'version', '0.0.0'),
  j->>'playUrl',
  j->>'siteUrl',
  j->>'repoUrl',
  array(select jsonb_array_elements_text(coalesce(j->'categories', '[]'::jsonb))),
  j->>'tagline',
  coalesce(j->>'runtime', 'Phaser 3'),
  j->'cover',
  array(select jsonb_array_elements_text(coalesce(j->'highlights', '[]'::jsonb))),
  array(select jsonb_array_elements_text(coalesce(j->'howToPlay', '[]'::jsonb))),
  j->>'levels',
  j->>'saveKey',
  coalesce(j->'downloads', '[]'::jsonb),
  (j->>'updated')::date,
  j
from m
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
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
  updated_at = now()
returning id, name, version, status, sort_order;
