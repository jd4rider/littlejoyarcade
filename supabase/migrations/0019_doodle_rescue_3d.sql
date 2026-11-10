-- Doodle Rescue 3D joins the Little Joy Arcade catalogue.
-- Mirrors arcade-manifest.json and src/data/games.ts. Idempotent: safe to re-run.

with m as (
  select $manifest${
  "id": "doodle-rescue-3d",
  "name": "Doodle Rescue 3D",
  "tagline": "Sketch it. Build it. Save the puppy.",
  "description": "A 3D physics drawing adventure built in Godot 4 and rendered straight in the browser. Drag a finger across the diorama and the glowing pencil leaves a real 3D beam with real collision: draw a roof to keep bees off Biscuit, a deck for him to cross a ravine, a wall to turn a rolling boulder, or a ramp that drops a toy ball into a basket. The puppy reacts to everything - ears back when the bees get close, a little spin when he is safe - and the result comes from the simulation that actually ran, not a scripted answer. Four toy worlds hold 20 hand-built levels, each with a stored solution that the shipping physics re-runs before release. A measured pen budget on every level, three stars for an efficient rescue, a journey map, cosmetic pens unlocked with stars, and progress that saves locally and syncs to a Little Joy Arcade account.",
  "categories": ["Physics", "Puzzle", "Casual", "Arcade"],
  "runtime": "Godot 4",
  "version": "0.1.0",
  "updated": "2026-11-09",
  "status": "live",
  "featured": true,
  "playUrl": "https://jd4rider.github.io/doodle-rescue-3d/",
  "siteUrl": "https://jd4rider.github.io/doodle-rescue-3d/",
  "repoUrl": "https://github.com/jd4rider/doodle-rescue-3d",
  "releasesUrl": "https://github.com/jd4rider/doodle-rescue-3d/releases",
  "downloads": [],
  "cover": {"from": "#8fd7ff", "to": "#2f5d3a", "emoji": "✏️"},
  "highlights": [
    "Genuine 3D drawing: every stroke becomes a rounded 3D beam with real collision, not a flat line",
    "Four play styles - Bee Defence, Bridge Build, Danger Dodge and Contraptions - sharing one pencil",
    "Biscuit the puppy: oversized eyes, floppy ears, blinking, breathing, nervous trembles and a victory spin",
    "20 hand-built levels across four toy worlds, each replayed by the shipping physics before release",
    "Three stars for an efficient rescue: the result card shows exactly how much pen you used",
    "Bridge decks sag under Biscuit's weight, and the walker meets the same collision the beams use",
    "Cosmetic pen tin unlocked with stars - a different colour, never different physics",
    "Stars, trophies and journey progress save locally and sync through a Little Joy Arcade account",
    "Portrait-first with a full-bleed 3D diorama that also adapts to desktop windows",
    "Reduced-motion and low-quality options for older phones"
  ],
  "howToPlay": [
    "Drag on the scene with a mouse or finger. A glowing pencil line previews the beam.",
    "Let go to build it: the stroke becomes a real 3D structure with real collision.",
    "Press Play. Bees attack, Biscuit crosses, boulders roll, or the ball starts moving.",
    "Keep Biscuit safe for the whole timer, or get him to the flag. Retry as often as you like.",
    "Use less pen for more stars. The bar shows the 3-star threshold before you press Play."
  ],
  "levels": "20 levels - 4 worlds - 4 play styles",
  "saveKey": "doodle-rescue-3d-save-v1"
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
  16,
  coalesce(j->>'version', '0.0.0'),
  j->>'playUrl',
  j->>'siteUrl',
  j->>'repoUrl',
  array(select jsonb_array_elements_text(coalesce(j->'categories', '[]'::jsonb))),
  j->>'tagline',
  coalesce(j->>'runtime', 'Godot 4'),
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

-- Achievements are catalogued as <game_id>.<slug> so a player's unlocks can be
-- joined back to the game that awarded them.
insert into public.achievements (id, game_id, name, description, points)
select
  g.id || '.' || a.slug,
  g.id,
  a.name,
  a.description,
  a.points
from public.games g
cross join (values
  ('first_rescue', 'First Rescue', 'Save Biscuit for the first time.', 10),
  ('rescue_5', 'Good Neighbour', 'Complete five levels.', 25),
  ('rescue_20', 'Every Path Home', 'Complete all 20 levels.', 100),
  ('three_stars_1', 'Clean Line', 'Earn three stars on a level.', 15),
  ('three_stars_10', 'Steady Paw', 'Earn three stars on ten levels.', 50),
  ('three_stars_all', 'Master Doodler', 'Earn three stars on every level.', 150),
  ('world_1', 'Meadow Graduate', 'Clear Sunny Meadows.', 30),
  ('world_2', 'Bridge Builder', 'Clear River Run.', 30),
  ('world_3', 'Boulder Dodger', 'Clear Rocky Canyon.', 30),
  ('world_4', 'Toybox Tinkerer', 'Clear Toybox Town.', 30),
  ('bridge_first', 'Across the Gap', 'Guide Biscuit over a drawn bridge.', 20),
  ('dodge_first', 'Not Today', 'Survive a rolling hazard.', 20),
  ('contraption_first', 'Rube Would Be Proud', 'Finish a contraption level.', 20),
  ('frugal_5', 'Waste Not', 'Use under a third of the pen on five levels.', 40),
  ('no_reset_5', 'First Try', 'Finish five levels without resetting.', 40),
  ('stars_30', 'Star Collector', 'Collect 30 stars.', 30),
  ('stars_60', 'Constellation', 'Collect 60 stars.', 60),
  ('pens_all', 'Full Tin', 'Unlock every pen.', 50)
) as a(slug, name, description, points)
where g.id = 'doodle-rescue-3d'
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  points = excluded.points;
