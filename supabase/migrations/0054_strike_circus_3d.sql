-- Strike Circus 3D joins the Little Joy Arcade catalogue.
-- Generated from the game repo arcade-manifest.json; edit the manifest there, then re-run.
-- Idempotent: safe to re-run, and safe for supabase db push after this row already exists.

with m as (
  select $manifest${
  "id": "strike-circus-3d",
  "name": "Strike Circus 3D",
  "tagline": "Ten pins. Three dimensions. One neon alley.",
  "description": "A portrait 3D ten-pin bowling arcade game rendered straight from the Unity WebGL player. Drag to slide the ball, pull back to set the power and angle, and release to throw; real physics and a calibrated hook model do the rest. The four-stop neon tour starts on a warm lane and ends slick and fast, each stop asking for a bigger score from a fixed shot budget. Stars reward every stop, best scores and unlocks are saved in the browser, and everything is playable with mouse or touch. Nothing to install - the payload streams in behind a progress bar and the whole game runs in the browser.",
  "categories": [
    "Arcade",
    "Sports",
    "Physics",
    "Casual"
  ],
  "runtime": "Unity WebGL",
  "version": "0.1.0",
  "updated": "2026-11-11",
  "status": "live",
  "featured": false,
  "playUrl": "https://jd4rider.github.io/strike-circus-3d-web/play/",
  "siteUrl": "https://jd4rider.github.io/strike-circus-3d-web/",
  "repoUrl": "https://github.com/jd4rider/strike-circus-3d-web",
  "releasesUrl": "https://github.com/jd4rider/strike-circus-3d-web/releases",
  "downloads": [],
  "cover": {
    "from": "#ff4fc4",
    "to": "#0b0618",
    "emoji": "🎳"
  },
  "highlights": [
    "Native Unity WebGL ten-pin bowling with real rigidbody pins",
    "Drag, pull back and release: one-thumb aiming, power and spin",
    "Four neon tour stops with lane grip, hook and shot budgets that escalate",
    "Three-star scoring per stop, with best scores and unlocks saved locally",
    "Portrait 9:16 play area that fits phones and letterboxes cleanly on desktop",
    "Mouse and touch input, no install and no download"
  ],
  "howToPlay": [
    "Open the game and wait for the Unity progress bar - the first load streams the build",
    "Drag anywhere on the lane to line the ball up, then pull back for power and release to throw",
    "Use SPIN left and right to curve the ball into the pocket, or STRAIGHT for a safe line",
    "Clear the target score before the shots run out to earn stars and unlock the next stop"
  ],
  "levels": "4 tour stops · 4-6 shots each · 3 stars per stop",
  "saveKey": "strike-circus-3d-save-v1"
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
  202,
  coalesce(j->>'version', '0.0.0'),
  j->>'playUrl',
  j->>'siteUrl',
  j->>'repoUrl',
  array(select jsonb_array_elements_text(coalesce(j->'categories', '[]'::jsonb))),
  j->>'tagline',
  coalesce(j->>'runtime', 'Unity WebGL'),
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
