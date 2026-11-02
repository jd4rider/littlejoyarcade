-- Bus Jam Bonanza joins the Little Joy Arcade catalogue.
-- Generated from the Game manifest in src/data/games.ts. Idempotent: safe to
-- re-run, and safe for supabase db push after this row already exists.

with m as (
  select $manifest${
  "id": "bus-jam-bonanza",
  "name": "Bus Jam Bonanza",
  "tagline": "Thread the traffic. Fill the buses. Clear the queue.",
  "description": "A 2.5D bus-dispatch puzzle. Tap a parked bus, steer it through the traffic to one of a few boarding bays, and let colour-matched passengers board from a strictly ordered queue. Full buses leave automatically; the wrong dispatch order can fill every bay with the wrong colours, so reading the queue is the puzzle. All 300 Journey levels across ten worlds were built from a working dispatch order and re-solved by a BFS solver before shipping, so every level has a fair solution. One-way lanes, traffic gates, limited bays and deliberately parked decoys keep later worlds honest.",
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
  "playUrl": "https://jd4rider.github.io/bus-jam-bonanza/play/",
  "siteUrl": "https://jd4rider.github.io/bus-jam-bonanza/",
  "repoUrl": "https://github.com/jd4rider/bus-jam-bonanza",
  "releasesUrl": "https://github.com/jd4rider/bus-jam-bonanza/releases",
  "downloads": [],
  "cover": {
    "from": "#fbbf24",
    "to": "#b45309",
    "emoji": "🚌"
  },
  "highlights": [
    "300 Journey levels across ten themed worlds, every one re-solved by the shipped engine",
    "Swept-footprint routing, one-way lanes, traffic gates and limited boarding bays",
    "Strict front-of-queue boarding with colour and symbol coding on every bus and passenger",
    "Solver-backed three-stage hints, undo, redo, restart and par-based star ratings",
    "Journey, Zen, Daily, Expert, Endless and Free Play with offline-first saves"
  ],
  "howToPlay": [
    "Tap a bus to dispatch it to a free boarding bay.",
    "Passengers board only a matching-colour bus, and only from the front of the queue.",
    "Fill a bus to capacity and it leaves, freeing the bay for the next dispatch.",
    "Clear every passenger. If the lot jams, undo or restart and try a different order."
  ],
  "levels": "300 levels · 10 worlds + daily, zen, expert and endless",
  "saveKey": "bus-jam-bonanza-save-v1"
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
  11,
  coalesce(j->>'version', '0.0.0'),
  j->>'playUrl',
  j->>'siteUrl',
  j->>'repoUrl',
  array(select jsonb_array_elements_text(coalesce(j->'categories', '[]'::jsonb))),
  j->>'tagline',
  coalesce(j->>'runtime', 'Phaser 4'),
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
