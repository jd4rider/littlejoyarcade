-- Orb Sort 3D joins the Little Joy Arcade catalogue.
-- Generated from the Game manifest in src/data/games.ts and orb-sort-3d-web/arcade-manifest.json.
-- Idempotent: safe to re-run, and safe for supabase db push after this row already exists.

with m as (
  select $manifest${
  "id": "orb-sort-3d",
  "name": "Orb Sort 3D",
  "tagline": "Pour the marbles. Seal the tube. Sort it clean.",
  "description": "A real 3D marble-sorting puzzle rendered by the Unity WebGL player. Glass tubes hold stacks of glossy marbles; pour a tube into another and every marble of the same colour that is sitting on top leaves together in one run, so the pour you get is the rule you were shown, not one ball at a time. The marbles actually fly: they leave the tipped lip, collide in mid-air, and settle into the receiving tube under physics. Finish a tube and a stopper caps it, locking it for the rest of the level. Every level is a stored board that has been solved by an exhaustive search, so each one ships with a verified solution rather than a guess. 300 levels across 12 themed worlds, portrait-first, nothing to install.",
  "categories": [
    "Puzzle",
    "Logic",
    "Casual"
  ],
  "runtime": "Unity WebGL",
  "version": "0.1.0",
  "updated": "2026-11-10",
  "status": "live",
  "featured": false,
  "playUrl": "https://jd4rider.github.io/orb-sort-3d-web/play/",
  "siteUrl": "https://jd4rider.github.io/orb-sort-3d-web/",
  "repoUrl": "https://github.com/jd4rider/orb-sort-3d-web",
  "releasesUrl": "https://github.com/jd4rider/orb-sort-3d-web/releases",
  "downloads": [],
  "cover": {
    "from": "#7c5cff",
    "to": "#0b1020",
    "emoji": "🔮"
  },
  "highlights": [
    "Native Unity WebGL build with real 3D glass tubes and glossy marbles",
    "Run pours: every matching marble on top leaves in one pour, not one at a time",
    "Marbles leave the tube under physics and collide before they settle",
    "Completed tubes are capped and sealed, so a finished tube stays finished",
    "300 levels, each one solved exhaustively before it was published",
    "12 themed worlds, portrait play area that letterboxes on desktop"
  ],
  "howToPlay": [
    "Wait behind the Unity progress bar while the payload streams in - the first load is about 30 MB",
    "Tap a tube to pick it up, then tap another to pour into it",
    "A pour moves the whole matching run from the top of the source tube, so plan around the colour you expose",
    "Finish a tube and it gets capped - three sealed tubes clears level 1",
    "Each level's colour order is fixed and verified solvable; there is no timer in the main mode"
  ],
  "levels": "300 levels across 12 worlds",
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
  18,
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
