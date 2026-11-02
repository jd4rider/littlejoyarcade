# Deployment

## Hosting decision

| Option | Commercial use | Cost | Verdict |
| --- | --- | --- | --- |
| **Cloudflare Pages** | Allowed on the free plan | $0 for static hosting; unlimited requests/bandwidth, 500 builds/month, 20k files per site | **Recommended production target** |
| Cloudflare Workers (API) | Allowed | Free tier 100k requests/day, then $5/month | Use only when a server endpoint is actually needed |
| Vercel Hobby | **Not permitted for commercial use** | $0 | Ruled out |
| Vercel Pro | Permitted | $20/user/month + usage | Acceptable only with explicit approval; unnecessary |
| GitHub Pages | Discouraged for commercial/business sites | $0 | Fine for the current preview; not the long-term host for a monetized arcade |

The portal is a static bundle, so Cloudflare Pages is a drop-in replacement for the current hosting. The choice
matters because AdSense revenue and paid products make this a commercial site; GitHub's own acceptable-use
policy discourages using Pages as a business's primary host.

**Current state:** the portal is deployed to GitHub Pages at
<https://jd4rider.github.io/littlejoyarcade/> as a working preview, because GitHub is the only hosting
credential available in this environment. The Cloudflare migration is a config-only change plus a login.

## Portal deployment (GitHub Pages — live now)

`.github/workflows/pages.yml` runs on every push to `main`:

1. `npm ci`
2. `npm test`
3. `npm run build`, injecting `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from repository *variables* when
   they exist (they do not yet, so the build ships guest-only).
4. Upload `dist/` and deploy to Pages.

Enable once per repo:

```bash
gh api -X POST repos/jd4rider/littlejoyarcade/pages -f build_type=workflow
```

`base: './'` and hash routing mean the project-path deployment needs no other configuration.

## Moving to Cloudflare Pages

1. `npm i -g wrangler && wrangler login` (or create a `CLOUDFLARE_API_TOKEN` with *Cloudflare Pages: Edit*).
2. Create the project and deploy:
   ```bash
   npm run build
   wrangler pages project create littlejoyarcade --production-branch main
   wrangler pages deploy dist --project-name littlejoyarcade
   ```
3. Or connect the Git repo in the dashboard: build command `npm run build`, output directory `dist`,
   Node 22. This gives preview deployments per pull request for free.
4. Add `littlejoyarcade.site` and `www.littlejoyarcade.site` as custom domains in the Pages project, then create
   the DNS records in `DNS_CONFIGURATION.md`. Cloudflare issues and renews the certificate automatically.
5. Add the same env vars under *Settings → Environment variables* (Production and Preview).
6. Keep the GitHub Pages workflow until the custom domain has served traffic successfully for a few days, then
   disable it to avoid two copies drifting apart.

## Per-game deployment

Each game keeps its own repository and pipeline:

- Web: existing `pages.yml` in the game repo, served from `/play/`.
- Desktop: existing `release.yml` on `v*` tags, producing dmg/NSIS/AppImage assets.
- A game may later move to its own Cloudflare Pages project on its subdomain without any portal change beyond
  the `playUrl` in `src/data/games.ts` and the `games` table.

## Supabase setup

The CLI is not installed in this environment (`npx supabase` works) and no Supabase account token is available,
so the project is **not created yet**. When credentials exist:

```bash
npx supabase login
npx supabase projects create littlejoyarcade --org-id <org> --region <region> --db-password '<strong>'
npx supabase link --project-ref <ref>
npx supabase db push                 # applies 0001..0003
```

Then set repository variables so the Pages/Cloudflare build can pick them up:

```bash
gh variable set VITE_SUPABASE_URL --body 'https://<ref>.supabase.co'
gh variable set VITE_SUPABASE_ANON_KEY --body '<anon key>'
```

And in Supabase → Authentication → URL configuration, add:

- Site URL: `https://littlejoyarcade.site`
- Redirect URLs: `https://littlejoyarcade.site/**`, `https://jd4rider.github.io/littlejoyarcade/**`,
  `http://localhost:5173/**`

Make the owner an admin (server-side, in the SQL editor):

```sql
update public.profiles set role = 'admin' where id = '<auth uid>';
```

## Local builds

```bash
npm install
npm run dev
npm run build     # typecheck + production bundle
npm run preview   # serve the production bundle
```

## Deployment checklist

- [x] Portal builds and tests pass locally
- [x] CI workflow committed
- [x] Pages workflow committed and deployed
- [ ] Cloudflare Pages project created (needs login)
- [ ] Custom domain attached and certificate issued
- [ ] Supabase project created and migrations applied
- [ ] Auth redirect URLs configured
- [ ] Owner account granted `admin`
- [ ] Storefront stays disabled until payment verification exists
