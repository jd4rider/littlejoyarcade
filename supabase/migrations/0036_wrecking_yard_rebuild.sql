-- Wrecking Yard was re-exported from the Unity project. The template, framework
-- JS and loader filenames are unchanged, so only the payload bytes moved; the
-- catalogue copy stays accurate (the first load still streams about 56 MB).
-- Refresh the "updated" date so the portal reflects the new build.

update public.games
set
  manifest = jsonb_set(manifest, '{updated}', '"2026-11-03"'),
  updated_on = '2026-11-03',
  updated_at = now()
where id = 'wrecking-yard';

select id, version, updated_on, runtime, play_url
from public.games
where id = 'wrecking-yard';
