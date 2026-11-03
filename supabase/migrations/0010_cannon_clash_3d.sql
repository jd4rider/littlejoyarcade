-- Cannon Clash 3D joins the Little Joy Arcade catalogue.
-- Generated from the Game manifest in src/data/games.ts. Idempotent: safe to
-- re-run, and safe for supabase db push after this row already exists.

with m as (
  select $manifest${
  "id": "cannon-clash-3d",
  "name": "Cannon Clash 3D",
  "tagline": "Line up the shot. Break the block line.",
  "description": "A 3D cannon puzzle built in Unity and rendered straight from the WebGL player. Each level hands you a fixed number of shots, a target and a stack of blocks standing between you and it: pick the angle, pick the power, and fire. Real 3D physics does the rest, so the same shot can topple one tower and bounce uselessly off another. Stars reward finishing cleanly, worlds unlock as you go, and a daily challenge picks a fresh board each day. Nothing to install - the payload streams in behind a progress bar and the whole game runs in the browser.",
  "categories": [
    "Puzzle",
    "Arcade",
    "Physics",
    "Casual"
  ],
  "runtime": "Unity WebGL",
  "version": "0.1.0",
  "updated": "2026-11-02",
  "status": "live",
  "playUrl": "https://jd4rider.github.io/cannon-clash-3d-web/play/",
  "siteUrl": "https://jd4rider.github.io/cannon-clash-3d-web/",
  "repoUrl": "https://github.com/jd4rider/cannon-clash-3d-web",
  "releasesUrl": "https://github.com/jd4rider/cannon-clash-3d-web/releases",
  "downloads": [],
  "cover": {
    "from": "#7b5bff",
    "to": "#14122b",
    "emoji": "💥"
  },
  "highlights": [
    "Native Unity WebGL build with real 3D physics, not a 2D stand-in",
    "A campaign of block-breaking levels with a shot budget and star ratings",
    "Daily challenge and world progression tracked in your browser",
    "Play area scaled to fit any screen without stretching the view",
    "Mouse and touch input, no install and no download"
  ],
  "howToPlay": [
    "Open the game and wait for the Unity progress bar - the first load streams about 55 MB",
    "Aim the cannon, then choose the power for the shot",
    "Clear the target without running out of shots",
    "Use the fullscreen button in the footer for the largest view"
  ],
  "levels": "Unity WebGL build · campaign worlds + daily challenge",
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
  14,
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
