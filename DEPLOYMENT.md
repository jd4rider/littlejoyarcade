# Deployment

## Hosting decision

| Option | Commercial use | Cost | Verdict |
| --- | --- | --- | --- |
| **Netlify — Free** | Allowed | $0; 100 GB bandwidth, 300 build min/month | **Chosen.** Its apex A record works with GoDaddy DNS, so no nameserver change |
| Cloudflare Pages | Allowed on free tier | $0 — 500 builds/month, 20k files, unmetered static requests | Deployed and kept as an alternative; apex needs Cloudflare DNS |
| Vercel — Hobby | Personal, non-commercial only | $0 | Preview mirror; not for a monetized arcade |
| Vercel — Pro | Permitted | ~$20/user/month | Only if Vercel-specific features are needed |
| Firebase Hosting — Spark | Allowed | $0; 10 GB storage, 360 MB/day transfer | Works, but the transfer cap is tighter |
| Azure Static Web Apps — Free | Allowed | $0; 100 GB/month | Workable, more setup friction |
| GitHub Pages | Discouraged for business sites | $0 | Preview only |

**Netlify is the intended production host**, chosen because it supports an apex `A` record: the domain can stay on
GoDaddy's nameservers, which avoids a disruptive DNS migration. Cloudflare Pages stays deployed as an
alternative, and Vercel as a preview mirror. All three free tiers permit commercial use except Vercel Hobby.

### Netlify (free, chosen)

`netlify.toml` contains the build (`npm run build`), publish directory (`dist`), security headers, immutable
asset caching and an SPA fallback. Netlify project creation is pending a one-time browser login on this machine
(`npx netlify-cli login`); once authorised:

```bash
npx netlify-cli sites:create --name littlejoyarcade
npx netlify-cli deploy --prod --dir=dist
```

DNS: Netlify's external-DNS mode needs one apex `A` record (`75.2.60.5`). `scripts/godaddy-apply-dns.sh` applies
it with the GoDaddy token from the environment, backs up the zone first, and preserves the existing `_dmarc` TXT
and `_domainconnect` records. `scripts/godaddy-restore-dns.sh` rolls it back.

```bash
export GODADDY_PAT='gd_pat_...'
scripts/godaddy-apply-dns.sh              # dry run
CONFIRM=yes scripts/godaddy-apply-dns.sh  # apply + poll public DNS
```

CI: `.github/workflows/netlify.yml` builds and tests on every push and deploys once `NETLIFY_AUTH_TOKEN` and
`NETLIFY_SITE_ID` exist as repository secrets; otherwise it logs a notice and skips.

### Cloudflare Pages (free, chosen)

Project `littlejoyarcade` is created and deployed: <https://littlejoyarcade.pages.dev>. `wrangler.toml` holds the
project config; the build is pure static assets, so no Functions are needed and requests are unmetered.

```bash
npm run build
npx wrangler pages deploy dist --project-name=littlejoyarcade --branch=main
```

CI: `.github/workflows/cloudflare.yml` builds and tests on every push, then deploys when
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` exist as repository secrets. Without them it logs a notice and
skips, so CI stays green.

- Account ID: `47edcbac4d4a89c5a63567c612a423c1`
- Token: Cloudflare → My Profile → API Tokens → **Cloudflare Pages: Edit**

```bash
gh secret set CLOUDFLARE_API_TOKEN --body '<token>'
gh secret set CLOUDFLARE_ACCOUNT_ID --body '47edcbac4d4a89c5a63567c612a423c1'
```

Custom domain: Workers & Pages → `littlejoyarcade` → Custom domains. The apex needs the zone on Cloudflare
(CNAME flattening), which means moving nameservers — see `DNS_CONFIGURATION.md` for both paths.

**Important:** Vercel does **not** host a database. "Login and a database on the backend" means Vercel hosts the
app while **Supabase** provides Postgres, auth and row level security. The schema in `supabase/migrations/` is
written for exactly that split.

Current state (2 November 2026): the portal is live on both Cloudflare Pages
(<https://littlejoyarcade.pages.dev>) and Vercel (<https://littlejoyarcade.vercel.app>), verified with a real
browser render. The production domain is attached in Vercel but DNS still points at GoDaddy's parking page, so
neither custom domain serves the site yet. The GitHub Pages preview at
<https://jd4rider.github.io/littlejoyarcade/> stays up until the cutover.

Auto-deploy on push is **not** connected yet: `vercel git connect` failed because the Vercel GitHub App does not
have access to this new repository. Fix by installing/authorising the app for it at
<https://github.com/apps/vercel/installations/new>, then run `npx vercel git connect` once. Until then, deploys
are made from this machine with `npm run deploy:vercel` (`npx vercel --prod`), which is already authenticated as
`jd4rider`.

## One-time Vercel setup (owner, ~3 minutes)

1. Go to <https://vercel.com/new>, sign in with GitHub, and **Import** `jd4rider/littlejoyarcade`.
   Vercel reads `vercel.json`: build `npm run build`, output `dist`, install `npm ci`. No dashboard tweaks needed.
2. Add environment variables (Project → Settings → Environment Variables), for **Production and Preview**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   Both come from the Supabase project (below). Without them the deploy still works, guest-only.
3. Deploy. You get `https://<project>.vercel.app`.
4. Project → Settings → Domains → add `littlejoyarcade.site` and `www.littlejoyarcade.site`. Vercel shows the exact
   DNS records to create — see `DNS_CONFIGURATION.md`. Do not add records from memory; use the values Vercel shows,
   because they can differ per project (`_vercel` TXT verification especially).
5. Optional: keep the GitHub Pages workflow until Vercel serves the domain successfully, then disable it so two
   copies cannot drift.

After step 1, every push to `main` deploys automatically, and every pull request gets a preview URL. No GitHub
Actions secrets are required for Vercel.

### If you want me to run the deploy instead

Either:

- run `npx vercel login` in a terminal and tell me it is done (the CLI stores credentials locally), or
- create a token at <https://vercel.com/account/tokens> and paste it, or add it as a GitHub Actions secret
  `VERCEL_TOKEN` plus `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` from `npx vercel link`.

With a token I can create the project, set env vars, deploy, attach the domain and verify the certificate.

## Backend: Supabase (database + login)

Recommended path, because it keeps billing and setup in one place:

**A. Via Vercel Marketplace (fastest)** — Project → Storage/Marketplace → Supabase → create the integration.
It provisions a project and adds the two `VITE_*` variables (plus server-side keys) to the Vercel project
automatically. If your account does not show the Supabase integration, use path B.

**B. Directly at supabase.com** — create a free project, then copy Project URL and the `anon` key into Vercel's
environment variables. Never copy the service-role key into a `VITE_*` variable.

Then apply the schema:

```bash
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push          # applies 0001_schema, 0002_rls, 0003_seed
```

In Supabase → Authentication → URL configuration:

- Site URL: `https://littlejoyarcade.site`
- Redirect URLs: `https://littlejoyarcade.site/**`, `https://www.littlejoyarcade.site/**`,
  `https://<project>.vercel.app/**`, `http://localhost:5173/**`

Magic-link sign-in will not work until the redirect URL matches the domain the player is on. Preview deployments
get new hostnames per branch; add `https://*-<team>.vercel.app/**` if you want previews to support login too.

Make the owner an admin after the first sign-in:

```sql
update public.profiles set role = 'admin' where id = '<auth uid>';
```

Redeploy after adding env vars: Vite inlines `VITE_*` at build time, so changing a variable without a rebuild does
nothing.

## Domain cutover

1. Deploy Vercel and confirm `https://<project>.vercel.app` renders.
2. Add both hostnames in Vercel → Domains.
3. Replace the GoDaddy parking records with the records Vercel shows (usually `A @ → 76.76.21.21` and
   `CNAME www → cname.vercel-dns.com`, plus any `_vercel` TXT). Details and verification commands:
   `DNS_CONFIGURATION.md`.
4. Wait for Vercel to verify the domain and issue the certificate (usually minutes, up to 24 h).
5. Verify `https://littlejoyarcade.site` and `https://www.littlejoyarcade.site` (301 to apex) both return 200 with
   a valid certificate.
6. Disable the GitHub Pages workflow once Vercel is confirmed.

## Per-game deployment

Each game keeps its own repository and pipeline:

- Web: existing `pages.yml` in the game repo, served from `/play/`.
- Desktop: existing `release.yml` on `v*` tags (dmg/NSIS/AppImage).
- A game can later move to its own Vercel or Cloudflare project on a subdomain; only `playUrl` in
  `src/data/games.ts` (and the `games` table row) needs updating.

## Local builds

```bash
npm install
npm run dev
npm run build      # typecheck + production bundle
npm run preview
npx vercel dev     # optional: run with Vercel's routing/headers locally
```

## Checklist

- [x] Vercel config committed (`vercel.json`), build verified locally
- [x] Guest-only build works with no backend
- [x] Schema, RLS and seed migrations ready
- [ ] Vercel project imported (owner)
- [ ] Supabase project created + migrations applied (owner)
- [ ] `VITE_*` variables set in Vercel, then redeployed
- [ ] Custom domain added in Vercel and DNS switched at GoDaddy
- [ ] HTTPS verified on apex and `www`
- [ ] Vercel plan upgraded to Pro before ads/purchases (Hobby forbids commercial use)
