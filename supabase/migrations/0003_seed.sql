-- Seed data reflecting the games that actually exist and are deployed.
-- on conflict do nothing, so re-running never clobbers admin edits.

insert into public.games (id, name, description, status, featured, sort_order, version, play_url, site_url, repo_url, categories)
values
  ('bubblewrap', 'Bubble Wrap', 'A 12 × 9 sheet of bubble wrap with classic and journey modes.', 'live', true, 1, '0.2.0',
   'https://bubblewrapgame.online/play/', 'https://bubblewrapgame.online/', 'https://github.com/jd4rider/bubble-wrap',
   array['Relaxing','Casual','Arcade']),
  ('pipe-dreams', 'Pipe Dreams', 'Rotate pipes to guide the water from IN to OUT.', 'live', true, 2, '0.2.0',
   'https://jd4rider.github.io/pipe-dreams/play/', 'https://jd4rider.github.io/pipe-dreams/', 'https://github.com/jd4rider/pipe-dreams',
   array['Puzzle','Relaxing','Logic']),
  ('jewel-match', 'Jewel Match', 'A match-3 with specials, power-ups and a 48-level journey.', 'live', true, 3, '0.3.1',
   'https://jd4rider.github.io/jewel-match/play/', 'https://jd4rider.github.io/jewel-match/', 'https://github.com/jd4rider/jewel-match',
   array['Puzzle','Casual','Brain Training']),
  ('pixel-stitch', 'Pixel Stitch', 'A nonogram with 24 line-logic-verified pictures and a share-code editor.', 'live', false, 4, '0.1.0',
   'https://jd4rider.github.io/pixel-stitch/play/', 'https://jd4rider.github.io/pixel-stitch/', 'https://github.com/jd4rider/pixel-stitch',
   array['Puzzle','Logic','Brain Training']),
  ('sand-sort-studio', 'Sand Sort Studio', 'Pour coloured sand between flasks until each holds one colour.', 'live', false, 5, '0.1.1',
   'https://jd4rider.github.io/sand-sort-studio/play/', 'https://jd4rider.github.io/sand-sort-studio/', 'https://github.com/jd4rider/sand-sort-studio',
   array['Puzzle','Relaxing','Logic']),
  ('lighthouse-keeper', 'Lighthouse Keeper', 'Route beams along a night coast without lighting the reef.', 'live', false, 6, '0.1.0',
   'https://jd4rider.github.io/lighthouse-keeper/play/', 'https://jd4rider.github.io/lighthouse-keeper/', 'https://github.com/jd4rider/lighthouse-keeper',
   array['Puzzle','Logic','Strategy']),
  ('laser-logic', 'Laser Logic', 'Mirrors, filters and prisms steer beams into matching receivers.', 'live', false, 7, '0.1.0',
   'https://jd4rider.github.io/laser-logic/play/', 'https://jd4rider.github.io/laser-logic/', 'https://github.com/jd4rider/laser-logic',
   array['Logic','Puzzle','Brain Training']),
  ('circuit-crafter', 'Circuit Crafter', 'Wire batteries, gates and timers without blowing a fuse.', 'live', false, 8, '0.1.0',
   'https://jd4rider.github.io/circuit-crafter/play/', 'https://jd4rider.github.io/circuit-crafter/', 'https://github.com/jd4rider/circuit-crafter',
   array['Logic','Strategy','Brain Training'])
on conflict (id) do nothing;

-- Three shared achievement definitions per game. Games call
-- arcade.achievements.unlock('first_clear') and the SDK prefixes the game id.
insert into public.achievements (id, game_id, name, description, points)
select
  g.id || '.' || a.slug,
  g.id,
  a.name,
  a.description,
  a.points
from public.games g
cross join (values
  ('first_clear', 'First Clear', 'Finish the first level.', 10),
  ('three_stars', 'Perfect Run', 'Earn three stars on any level.', 25),
  ('completionist', 'Completionist', 'Finish every level in the game.', 100)
) as a(slug, name, description, points)
on conflict (id) do nothing;

-- Products exist for the storefront, but stay inactive until checkout,
-- webhook verification and tax handling are configured and approved.
insert into public.products (slug, name, description, price_cents, currency, entitlement, kind, active)
values
  ('arcade-ad-free', 'Little Joy Arcade — Ad-free', 'Remove ads across the whole arcade, forever.', 499, 'USD', 'arcade.ad_free', 'one_time', false),
  ('bubblewrap-ad-free', 'Bubble Wrap — Ad-free', 'Remove ads from Bubble Wrap only.', 199, 'USD', 'bubblewrap.ad_free', 'one_time', false),
  ('bubblewrap-premium-themes', 'Bubble Wrap — Premium themes', 'Extra sheet themes and pop sounds.', 299, 'USD', 'bubblewrap.premium_themes', 'one_time', false)
on conflict (slug) do nothing;
