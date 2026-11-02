# DNS configuration

## Verified current state (2 November 2026)

| Record | Value |
| --- | --- |
| Nameservers | `ns19.domaincontrol.com`, `ns20.domaincontrol.com` (GoDaddy) |
| `littlejoyarcade.site` A | **GitHub Pages:** `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `www.littlejoyarcade.site` | CNAME → `jd4rider.github.io` |
| `_dmarc` TXT | preserved untouched |
| `_domainconnect` CNAME | preserved untouched |
| `bubblewrapgame.online` | GitHub Pages, custom domain + HTTPS working |

Nameservers stayed at GoDaddy. The parking records were replaced with GitHub Pages' four apex A records and a
`www` CNAME, using the GoDaddy API with a bearer token; the parking A record was removed, not merely added to.
A previous experiment pointed the apex at Netlify (`75.2.60.5`) but Netlify's API would not attach the custom
domain without the dashboard, so it was reverted to GitHub Pages. `littlejoyarcade.site` is also attached to the
Vercel project as a spare route.

The portal ships `public/CNAME` containing `littlejoyarcade.site`, and the Pages custom domain is set with:

```bash
gh api -X PUT repos/jd4rider/littlejoyarcade/pages -f cname=littlejoyarcade.site
```

HTTPS is issued by GitHub after DNS resolves; `gh api repos/jd4rider/littlejoyarcade/pages` reports
`https_certificate.state` as it provisions.

Before editing, export the full record list from GoDaddy → DNS → Manage Zones (or the API) and confirm no MX,
SPF, DKIM, DMARC or verification TXT records exist that must be preserved.

## Target layout

| Hostname | Purpose | Points at |
| --- | --- | --- |
| `littlejoyarcade.site` | Main portal | Vercel project |
| `www.littlejoyarcade.site` | Redirect to apex | Vercel project |
| `bubblewrap.littlejoyarcade.site` | Bubble Wrap (optional, later) | Bubble Wrap's deployment |
| `pipes`, `jewels`, `pixelstitch`, `sandsort`, `lighthouse`, `lasers`, `circuitcrafter` | Other games (optional, later) | GitHub Pages per game |

`auth.` and `api.` are not needed: Supabase hosts auth, and the portal is static.

## Vercel cutover (recommended)

These are the records Vercel's verifier returned for this exact project (2 November 2026):

| Type | Name | Value | Notes |
| --- | --- | --- | --- |
| A | `@` | `216.198.79.1` | Replaces **both** GoDaddy parking A records |
| A | `@` | `64.29.17.1` | Second required apex record |

`www` already CNAMEs to `littlejoyarcade.site`, so it follows the apex automatically once the two A records
change. If you prefer an explicit `www` record, use `CNAME www → cname.vercel-dns.com`. No `_vercel` TXT record
is needed for this domain — Vercel already verified project ownership.

Alternative: switching nameservers to `ns1.vercel-dns.com` / `ns2.vercel-dns.com` also works, but that is a
broader change than two A records.

### Order of operations (this order matters)

1. Deploy to Vercel and confirm the `*.vercel.app` URL renders.
2. In Vercel → Domains, add `littlejoyarcade.site` and `www.littlejoyarcade.site`.
3. In GoDaddy, **delete** the parking `A @` records, then add the Vercel `A` record; update `www`.
   TTL 600 so rollback is quick.
4. Wait for Vercel to verify (minutes, up to 24 h). Vercel issues and renews the certificate automatically.
5. Confirm both hostnames serve HTTPS and `www` redirects to the apex.

Adding DNS before the Vercel project exists leaves the domain pointing at a host that has no site for it.

### GoDaddy API version (once a key exists)

Export `GODADDY_KEY` and `GODADDY_SECRET` (production keys from <https://developer.godaddy.com/keys>), read the
zone first, then `PUT` the replacement set:

```bash
curl -s "https://api.godaddy.com/v1/domains/littlejoyarcade.site/records" \
  -H "Authorization: sso-key $GODADDY_KEY:$GODADDY_SECRET"

curl -s -X PUT "https://api.godaddy.com/v1/domains/littlejoyarcade.site/records" \
  -H "Authorization: sso-key $GODADDY_KEY:$GODADDY_SECRET" \
  -H 'Content-Type: application/json' \
  -d '[{"type":"A","name":"@","data":"216.198.79.1","ttl":600},
       {"type":"A","name":"@","data":"64.29.17.1","ttl":600}]'
```

`PUT` replaces every record of the submitted types. If MX/TXT records exist, submit them in the same payload or
use `PATCH`/individual record endpoints instead. Review the zone dump before writing.

## Verification

```bash
dig +short NS littlejoyarcade.site @1.1.1.1
dig +short A littlejoyarcade.site @1.1.1.1
dig +short CNAME www.littlejoyarcade.site @1.1.1.1
curl -sI https://littlejoyarcade.site | head -5
curl -sI https://www.littlejoyarcade.site | head -5
```

Expected: GoDaddy nameservers, the two Vercel A records above, HTTP 200 on the apex, a 301/308 from `www` to
the apex, and a valid certificate on both. `vercel domains verify littlejoyarcade.site` should switch from
"not configured properly" to verified. DNS caches can hold the old parking IPs for up to the previous TTL; test with
`dig @1.1.1.1` before assuming a propagation problem.

## Option C — Cloudflare Pages (chosen host)

Cloudflare Pages can serve the custom domain in two ways:

**1. Zone on Cloudflare (recommended).** Move the domain's nameservers to Cloudflare (free plan), then add
`littlejoyarcade.site` and `www.littlejoyarcade.site` under Workers & Pages → `littlejoyarcade` → Custom domains.
Cloudflare creates the proxied records and the certificate itself. This also gives API access to DNS, so all
game subdomains can be managed in one place.

**2. DNS stays at GoDaddy.** Add `CNAME www → littlejoyarcade.pages.dev`. The apex cannot use a CNAME at GoDaddy,
so the apex would need GoDaddy forwarding to `www` (works, but weaker for SEO and certificates). If keeping
GoDaddy DNS matters more than using Cloudflare, Netlify is the smoother free host because it provides an apex A
record — the app itself is host-agnostic.

## Optional: moving nameservers to Cloudflare

This is what makes a free, commercial-use Cloudflare Pages deployment on the apex possible, and it also gives
the project programmatic DNS access. It is a disruptive, approval-required change: add the zone, review the
imported records (especially MX/TXT), then replace `ns19/ns20.domaincontrol.com` at GoDaddy with the Cloudflare
pair. Existing MX/TXT records must be recreated exactly in Cloudflare before the switch.

## Rollback

Restore the exported record set — the parking A records were `3.33.130.190` and `15.197.148.33`, and `www`
pointed at the apex. For a nameserver move, restoring the GoDaddy nameservers reverts everything.
