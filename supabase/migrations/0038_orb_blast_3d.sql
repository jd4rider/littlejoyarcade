-- Orb Blast 3D joins the Little Joy Arcade catalogue.
-- Generated from orb-blast-3d-web/arcade-manifest.json, the same object src/data/games.ts carries.
-- Idempotent: safe to re-run, and safe for supabase db push after this row already exists.

with m as (
  select $manifest${
  "id": "orb-blast-3d",
  "name": "Orb Blast 3D",
  "tagline": "Aim. Match. Blast. Unleash the cascade!",
  "description": "A portrait-first 3D bubble shooter rendered by the Unity WebGL player. The puzzle runs on a deterministic hex grid rather than on rigidbody physics: the same analytic solver that places a fired orb also draws the aim guide, so the dotted line and the shot that follows are one plan instead of two approximations. Shots bounce off the side rails, three or more connected orbs of a colour burst into particles, and anything left hanging from the ceiling detaches and cascades down the board. Fifteen hand-authored levels in Crystal Gardens, each with a shot budget and three-star thresholds, played under a fixed 3D camera that frames the whole board on a phone. A procedurally built title screen opens on the live stage, and its level panel lists every stage you have unlocked. Nothing to install.",
  "categories": [
    "Puzzle",
    "Arcade",
    "Casual"
  ],
  "runtime": "Unity WebGL",
  "version": "0.2.0",
  "updated": "2026-11-11",
  "status": "live",
  "featured": false,
  "playUrl": "https://jd4rider.github.io/orb-blast-3d-web/play/",
  "siteUrl": "https://jd4rider.github.io/orb-blast-3d-web/",
  "repoUrl": "https://github.com/jd4rider/orb-blast-3d-web",
  "releasesUrl": "https://github.com/jd4rider/orb-blast-3d-web/releases",
  "downloads": [],
  "cover": {
    "from": "#38bdf8",
    "to": "#090b1b",
    "emoji": "🎯"
  },
  "highlights": [
    "Native Unity WebGL build: a real 3D board, lit spheres and a layered backdrop",
    "A title screen and level panel built in code, so they never drift from the game",
    "One solver drives both the aim guide and the shot, so the preview never lies",
    "Bounce shots off the side rails - the guide draws every wall the orb will touch",
    "Matches burst into particles, then anything left hanging loses its grip and falls",
    "Keyboard, mouse and touch: drag to aim and release to fire, or steer with A/D and space",
    "15 hand-authored levels with shot limits and three-star thresholds"
  ],
  "howToPlay": [
    "Wait behind the Unity progress bar while the payload streams in",
    "Drag anywhere on the board to aim, then release to fire",
    "On a keyboard, A/D or the arrow keys steer the launcher and space fires",
    "The guide shows the whole path including rail bounces, and the orb stops where the line ends",
    "Match three or more orbs of one colour to burst them, then watch for anything left floating",
    "Clear the board before the shot limit runs out; S or Tab swaps the loaded orb and R restarts"
  ],
  "levels": "15 hand-authored levels",
  "saveKey": ""
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
  19,
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
