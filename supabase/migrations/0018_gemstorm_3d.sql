-- Gemstorm 3D: Crystal Cascade joins the Little Joy Arcade catalogue.
-- Generated from Gemstorm 3D: Crystal Cascade's arcade-manifest.json by
-- Gemstorm 3D/Tools/deploy/emit-migration.mjs - edit the manifest, then re-run it.
-- Idempotent: safe to re-run, and safe for supabase db push after this row already exists.

with m as (
  select $manifest${
  "id": "gemstorm-3d",
  "name": "Gemstorm 3D: Crystal Cascade",
  "tagline": "Match crystals in a jewelled 3D gemfield.",
  "description": "A 3D match-three built in Unity and rendered straight from the WebGL player: real faceted gems, real light, and a board that reframes itself to any screen. Ten hand-tuned levels across five worlds ask for four different things - reach a score, collect a colour, collect a set number of gems, or melt every frosted cell on the board - so the same swap can be the right move or the wrong one depending on what the level wants. Matching four forges a line gem that clears its row, five forges a Spectrum that takes a whole colour off the board, and combining two specials compounds them. The rules run on a deterministic integer engine separate from the animation, so a cascade always resolves the same way twice. Sign in with a Little Joy Arcade account and campaign progress follows you between devices; play without one and everything still saves in the browser.",
  "categories": [
    "Puzzle",
    "Casual",
    "Strategy"
  ],
  "runtime": "Unity WebGL",
  "version": "0.1.0",
  "updated": "2026-11-09",
  "status": "live",
  "featured": false,
  "playUrl": "https://jd4rider.github.io/gemstorm-3d-web/play/",
  "siteUrl": "https://jd4rider.github.io/gemstorm-3d-web/",
  "repoUrl": "https://github.com/jd4rider/gemstorm-3d-web",
  "releasesUrl": "https://github.com/jd4rider/gemstorm-3d-web/releases",
  "downloads": [],
  "cover": {
    "from": "#1b2a4a",
    "to": "#5b2a6e",
    "emoji": "💎"
  },
  "highlights": [
    "Native Unity WebGL build with real 3D gems, not a 2D stand-in",
    "A deterministic rules engine: the same board always resolves the same way",
    "Four goal types across ten levels - score, collect a colour, collect gems, melt frost",
    "Line gems, Spectrum gems and special-on-special combinations",
    "Board reframes itself to any screen, portrait or landscape",
    "Swipe-to-swap, shattering crystals, screen shake, music and ambience",
    "Campaign progress syncs to your Little Joy Arcade account, and plays offline without one"
  ],
  "howToPlay": [
    "Open the game and wait for the Unity progress bar - the first load streams about 62 MB",
    "Swipe a gem towards its neighbour to swap them - or tap one gem, then tap a neighbour. A swap that matches nothing is refused and costs no move",
    "Match three or more of a colour to clear them. Match four for a line gem, five for a Spectrum",
    "Watch the goal line under the level name: it says what this level actually wants",
    "Clear the goals before the moves counter in the top right runs out"
  ],
  "levels": "10 hand-tuned levels across 5 worlds (7x7 to 9x9 boards)",
  "saveKey": "lja:gemstorm-3d:unity-save"
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
  15,
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

-- Achievements are catalogued as <game_id>.<slug> so a player's unlocks can be joined
-- back to the game that awarded them.
insert into public.achievements (id, game_id, name, description, points)
select
  g.id || '.' || a.slug,
  g.id,
  a.name,
  a.description,
  a.points
from public.games g
cross join (values
  ('first_clear', 'First Clear', 'Clear any level.', 10),
  ('completionist', 'Completionist', 'Clear all ten levels.', 100)
) as a(slug, name, description, points)
where g.id = 'gemstorm-3d'
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  points = excluded.points;
