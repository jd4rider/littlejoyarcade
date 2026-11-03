-- Gear Garden joins the Little Joy Arcade catalogue.
-- Generated from the Game manifest in src/data/games.ts. Idempotent: safe to
-- re-run, and safe for supabase db push after this row already exists.

with m as (
  select $manifest${
  "id": "gear-garden",
  "name": "Gear Garden",
  "tagline": "Fit the gears. Wake the garden.",
  "description": "A portrait-first 2.5D clockwork puzzle. Fit brass gears onto wooden axles, then send a motor’s power through them to blooms, windmills, fountains and clockwork birds. Gears only mesh when their tooth counts add up to 24, a compound shaft carries motion to a second layer, belts cross and reverse, clutches must be engaged, and a driven axle can stall or overload. All 1,000 gardens across twenty worlds were constructed from a working mechanism, verified by the same solver the game uses for hints, and re-validated in CI, so no shipped garden can be unsolvable. Exact rational ratios mean a speed requirement is never a matter of rounding.",
  "categories": [
    "Puzzle",
    "Logic",
    "Brain Training",
    "Casual"
  ],
  "runtime": "PixiJS 8",
  "version": "1.0.0",
  "updated": "2026-11-02",
  "status": "live",
  "playUrl": "https://jd4rider.github.io/gear-garden/play/",
  "preferredPlayUrl": "https://geargarden.littlejoyarcade.site/play/",
  "siteUrl": "https://jd4rider.github.io/gear-garden/",
  "repoUrl": "https://github.com/jd4rider/gear-garden",
  "releasesUrl": "https://github.com/jd4rider/gear-garden/releases",
  "downloads": [],
  "cover": {
    "from": "#e3ad55",
    "to": "#2f4633",
    "emoji": "⚙️"
  },
  "highlights": [
    "1,000 gardens across twenty themed worlds, each one solver-verified before shipping",
    "A real transmission simulation: mesh directions, exact ratios, compound shafts, belts, clutches and torque loads",
    "Contradictions are explained — two drives disagreeing, a braked axle, or a mechanism behind too much load",
    "Tactile 2.5D brass and copper gears with layered shadows and mechanisms that bloom when powered",
    "Solver-backed hints, full undo/redo, portrait touch controls plus a keyboard path, and offline saves"
  ],
  "howToPlay": [
    "Tap a gear in the tray, then tap an empty wooden axle to fit it.",
    "Neighbouring gears mesh only when their tooth counts add up to 24. Watch the objective’s direction and speed.",
    "Press RUN to turn the motor. If nothing moves, check the chain, a released clutch or an overloaded drive.",
    "Wake every mechanism in the garden. Undo and restart are always free."
  ],
  "levels": "1,000 gardens · 20 worlds + daily, zen, endless and free build",
  "saveKey": "gear-garden-save-v1"
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
  12,
  coalesce(j->>'version', '0.0.0'),
  j->>'playUrl',
  j->>'siteUrl',
  j->>'repoUrl',
  array(select jsonb_array_elements_text(coalesce(j->'categories', '[]'::jsonb))),
  j->>'tagline',
  coalesce(j->>'runtime', 'PixiJS 8'),
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
