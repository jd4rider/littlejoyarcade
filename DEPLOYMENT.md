# Deployment

## Hosting decision

| Option | Commercial use | Cost | Verdict |
| --- | --- | --- | --- |
| **Vercel — Hobby** | Personal, non-commercial projects only | $0 | Fine to get login + database working now; **not** for an ad-supported or paid arcade |
| **Vercel — Pro** | Permitted | ~$20/user/month | Required before ads or purchases go live |
| Cloudflare Pages | Allowed on free tier | $0 | Good fallback if Vercel Pro is not wanted |
| GitHub Pages | Discouraged for business sites | $0 | Current preview only |

The owner chose Vercel. The portal is a static Vite build, so Vercel is a drop-in host, and its Git integration
gives automatic production and preview deployments from this repository.

**Important:** Vercel does **not** host a database. "Login and a database on the backend" means Vercel hosts the
app while **Supabase** provides Postgres, auth and row level security. The schema in `supabase/migrations/` is
written for exactly that split.

Current state (2 November 2026): deployed to Vercel at <https://littlejoyarcade.vercel.app> and verified. The
production domain `littlejoyarcade.site` (and `www`) is attached to the project `littlejoyarcade`, but DNS still
points at GoDaddy's parking page, so the custom domain does not serve the site yet. The GitHub Pages preview at
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
