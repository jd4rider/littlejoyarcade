-- Stackstorm joins the Little Joy Arcade catalogue.
-- Mirrors stackstorm/arcade-manifest.json and src/data/games.ts.
-- Idempotent: safe to re-run, and safe for supabase db push after this row exists.

with m as (
  select $manifest${
  "id": "stackstorm",
  "name": "Stackstorm",
  "tagline": "Stack. Slide. Storm.",
  "description": "A neon falling-block puzzle game with a real Super Rotation System engine and a half-second slide window after every landing: successful moves and rotations restart the lock timer, so a piece can still be nudged into place. Classic Marathon and Storm Mode build combos, back-to-back bonuses and a rechargeable surge; Sprint chases forty lines; Time Attack packs a score hunt into two minutes. Puzzle Journey adds 500 levels across ten themed worlds, each built from a working solution and replayed by the shipped engine before release: fill the wells with I pieces, spend the decoys without sealing your own route, and beat the gold time for three stars. Themes, trophies, lifetime statistics and local saves work offline; a Little Joy Arcade account syncs the same payload across devices.",
  "categories": ["Puzzle", "Arcade", "Casual"],
  "runtime": "Phaser 3",
  "version": "1.0.0",
  "updated": "2026-11-09",
  "status": "live",
  "featured": true,
  "playUrl": "https://jd4rider.github.io/stackstorm/play/",
  "siteUrl": "https://jd4rider.github.io/stackstorm/",
  "repoUrl": "https://github.com/jd4rider/stackstorm",
  "releasesUrl": "https://github.com/jd4rider/stackstorm/releases",
  "downloads": [],
  "cover": {"from": "#67f6ff", "to": "#2a1152", "emoji": "\u26A1"},
  "highlights": [
    "A proper SRS falling-block engine: seven-bag randomizer, hold, ghost, wall kicks and frame-rate-independent timing",
    "The slide window: successful moves and rotations reset the lock timer for up to fifteen nudges after a piece lands",
    "Five modes: Classic Marathon, Storm Mode, Sprint, Time Attack and the 500-level Puzzle Journey",
    "Storm Mode charges a meter on clears and spends it on a twelve-second double-score surge",
    "500 Journey levels across ten worlds, each constructed from a proven solution and replay-validated in the test suite",
    "Eight colour themes, thirteen trophies and lifetime statistics saved locally and synced by the arcade client",
    "Portrait-first touch pad with press-and-hold movement, optional swipe gestures, and full keyboard controls",
    "Accessibility: reduced motion, high contrast, per-piece symbols beyond colour, adjustable DAS/ARR and separate volume sliders",
    "Runs entirely in the browser with no downloads, no accounts required and a fully offline core game"
  ],
  "howToPlay": [
    "Move with the arrow keys or the on-screen pad; rotate with Up/X and Z; hold with C or Shift; hard drop with Space.",
    "When a piece lands it waits half a second before locking. Keep sliding or turning to nudge it into place - the glowing outline and the bar at the top of the board show the window.",
    "Complete rows to clear them. Consecutive clears build a combo and four-line clears pay a back-to-back bonus.",
    "In Storm Mode, clear lines to charge the meter, then press S or tap SURGE for twelve seconds of double points.",
    "In Puzzle Journey, use the I pieces to fill the empty wells and clear the target. Stars reward finishing under par and gold times."
  ],
  "levels": "500 Journey levels - 10 worlds + 4 arcade modes",
  "saveKey": "stackstorm-save-v1"
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
  17,
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
  ('first_steps', 'First Steps', 'Complete your first Journey level.', 10),
  ('lightning_strike', 'Lightning Strike', 'Clear four lines at once.', 20),
  ('combo_starter', 'Combo Starter', 'Reach a three-clear combo.', 20),
  ('chain_master', 'Chain Master', 'Reach a ten-clear combo.', 40),
  ('speed_demon', 'Speed Demon', 'Clear Sprint in under two minutes.', 40),
  ('marathon_hero', 'Marathon Hero', 'Score 100,000 in Classic Marathon.', 60),
  ('puzzle_pioneer', 'Puzzle Pioneer', 'Complete 25 Journey levels.', 30),
  ('world_conqueror', 'World Conqueror', 'Earn at least one star on all fifty levels of a world.', 100),
  ('storm_rider', 'Storm Rider', 'Activate Storm Surge twenty-five times.', 50),
  ('perfect_storm', 'Perfect Storm', 'Clear the board completely at least once.', 30),
  ('tspin_artist', 'Spin Artist', 'Land ten T-spins.', 40),
  ('line_keeper', 'Line Keeper', 'Clear 1,000 lines across all modes.', 50),
  ('star_collector', 'Star Collector', 'Collect 250 Journey stars.', 80)
) as a(slug, name, description, points)
where g.id = 'stackstorm'
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  points = excluded.points;
