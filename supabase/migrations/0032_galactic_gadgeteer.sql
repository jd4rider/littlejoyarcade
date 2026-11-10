-- Galactic Gadgeteer: The Lost Worlds joins the Little Joy Arcade catalogue.
-- Idempotent: safe to re-run after the row already exists.

with m as (
  select $manifest${
  "id": "galactic-gadgeteer",
  "name": "Galactic Gadgeteer: The Lost Worlds",
  "tagline": "Explore strange worlds. Discover incredible gadgets. Save the galaxy.",
  "description": "An original 2D sci-fi platformer starring Pip, a young gadgeteer, and BOLT, a hovering robot with opinions. The first playable expedition, The Fallen Beacon, is a complete Starlight Meadows level built around responsive movement: a meadow gate, a jetpack chasm, a magnetic crate puzzle, spring-boot gardens and a phase-thin wall all lead to a lost Starlight Engine fragment. Keyboard, mouse, standard-mapped controllers and multitouch controls feed one input layer; the game pauses cleanly when a controller disconnects or the browser loses focus, and landscape is enforced on phones.",
  "categories": ["Arcade"],
  "runtime": "Phaser 3",
  "version": "0.1.0",
  "updated": "2026-11-10",
  "status": "live",
  "featured": true,
  "playUrl": "https://jd4rider.github.io/galactic-gadgeteer/play/",
  "siteUrl": "https://jd4rider.github.io/galactic-gadgeteer/",
  "repoUrl": "https://github.com/jd4rider/galactic-gadgeteer",
  "releasesUrl": "https://github.com/jd4rider/galactic-gadgeteer/releases",
  "downloads": [],
  "cover": { "from": "#2ec4b6", "to": "#132b52", "emoji": "🚀" },
  "highlights": [
    "A complete playable Starlight Meadows expedition, from the meadow gate to the Starlight fragment",
    "All five gadgets: plasma blaster, jetpack, spring boots, magnet glove and phase dash",
    "Keyboard and mouse, standard-mapped controllers, and true multitouch virtual controls",
    "Landscape-only mobile presentation with a polished rotate overlay",
    "Original procedural character art, parallax scenery, particles and synthesized music",
    "Star Shards, hidden data capsules and a breakable secret wall"
  ],
  "howToPlay": [
    "Move with A/D or the arrow keys, jump with Space, fire with J or the left mouse button.",
    "Choose a gadget with 1–5 and use it with K. On touch, use the left thumb pad and the action buttons.",
    "Collect the jetpack, magnet glove, spring boots and phase dash to solve the meadow traversal puzzles.",
    "Reach the Starlight Engine fragment at the end of the meadow. Break the cracked wall for a hidden data capsule.",
    "On a phone, rotate to landscape. The game pauses safely if the device turns portrait."
  ],
  "levels": "1 expedition · Starlight Meadows, World 1",
  "saveKey": "galactic-gadgeteer-save-v1"
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
  32,
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
