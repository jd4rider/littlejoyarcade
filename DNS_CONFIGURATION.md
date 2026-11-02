# DNS configuration

## Verified current state (2 November 2026)

| Record | Value |
| --- | --- |
| Nameservers | `ns19.domaincontrol.com`, `ns20.domaincontrol.com` (GoDaddy) |
| `littlejoyarcade.site` A | `3.33.130.190`, `15.197.148.33` (GoDaddy parking page) |
| `www.littlejoyarcade.site` | CNAME-like alias to the apex; same parking IPs |
| SOA serial | `2026110200` |
| `bubblewrapgame.online` | GitHub Pages, custom domain configured and serving HTTPS |

The domain resolves, but it serves GoDaddy's parked page. **No DNS records have been changed yet**: no GoDaddy
API key or Cloudflare login was available in this environment, and nameserver changes must be approved.

Not touched and must stay untouched: MX, SPF, DKIM, DMARC and any verification TXT records. A domain inventory
before changes shows none beyond the parking records, but re-check in the GoDaddy DNS panel before editing.

## Target layout

| Hostname | Purpose | Points at |
| --- | --- | --- |
| `littlejoyarcade.site` | Main portal | Cloudflare Pages project `littlejoyarcade` |
| `www.littlejoyarcade.site` | Redirect to apex | Same Pages project (Cloudflare handles the redirect) |
| `bubblewrap.littlejoyarcade.site` | Bubble Wrap | Bubble Wrap's current deployment |
| `pipes.littlejoyarcade.site` | Pipe Dreams | `jd4rider.github.io` |
| `jewels.littlejoyarcade.site` | Jewel Match | `jd4rider.github.io` |
| `pixelstitch.littlejoyarcade.site` | Pixel Stitch | `jd4rider.github.io` |
| `sandsort.littlejoyarcade.site` | Sand Sort Studio | `jd4rider.github.io` |
| `lighthouse.littlejoyarcade.site` | Lighthouse Keeper | `jd4rider.github.io` |
| `lasers.littlejoyarcade.site` | Laser Logic | `jd4rider.github.io` |
| `circuitcrafter.littlejoyarcade.site` | Circuit Crafter | `jd4rider.github.io` |

`auth.` and `api.` subdomains are **not** needed: Supabase hosts auth on its own domain, and the portal is
static. Creating them would add certificate surface for no benefit. Document them as reserved for later.

## Option A — keep GoDaddy nameservers (recommended for the portal preview)

Add these in GoDaddy → DNS → Manage Zones. This points the apex at the current GitHub Pages deployment so the
custom domain works today, before any Cloudflare work:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | 600 |
| A | `@` | `185.199.109.153` | 600 |
| A | `@` | `185.199.110.153` | 600 |
| A | `@` | `185.199.111.153` | 600 |
| CNAME | `www` | `jd4rider.github.io` | 600 |

Then, in the repo, add a `CNAME` file containing `littlejoyarcade.site` and set the Pages custom domain:

```bash
gh api -X PUT repos/jd4rider/littlejoyarcade/pages -f cname=littlejoyarcade.site
```

Order matters: create the DNS records **before** setting the Pages custom domain, otherwise Pages will redirect
the `github.io` URL to a domain that does not resolve yet and the preview goes dark. Certificate issuance can
take up to 24 hours; `gh api repos/jd4rider/littlejoyarcade/pages` reports `https_certificate.state`.

For a GoDaddy API script, export `GODADDY_KEY` and `GODADDY_SECRET` (production keys from
<https://developer.godaddy.com/keys>) and use:

```bash
curl -s -X PUT "https://api.godaddy.com/v1/domains/littlejoyarcade.site/records" \
  -H "Authorization: sso-key $GODADDY_KEY:$GODADDY_SECRET" \
  -H 'Content-Type: application/json' \
  -d '[{"type":"A","name":"@","data":"185.199.108.153","ttl":600},
       {"type":"A","name":"@","data":"185.199.109.153","ttl":600},
       {"type":"A","name":"@","data":"185.199.110.153","ttl":600},
       {"type":"A","name":"@","data":"185.199.111.153","ttl":600},
       {"type":"CNAME","name":"www","data":"jd4rider.github.io","ttl":600}]'
```

`PUT` replaces **all** records of those types; `PATCH` would be safer if other records already exist. Read the
zone first:

```bash
curl -s "https://api.godaddy.com/v1/domains/littlejoyarcade.site/records" \
  -H "Authorization: sso-key $GODADDY_KEY:$GODADDY_SECRET"
```

## Option B — move to Cloudflare nameservers (recommended before monetization)

Changing nameservers is a disruptive, approval-required action. It is worth doing only when the site moves to
Cloudflare Pages:

1. Add the domain as a zone in Cloudflare (free plan). Cloudflare imports existing records — review the import
   and confirm no MX/TXT records were dropped.
2. In GoDaddy → Nameservers → *Change*, replace `ns19/ns20.domaincontrol.com` with the two Cloudflare
   nameservers shown in the zone.
3. Wait for activation (usually under an hour, up to 24). Verify with
   `dig +short NS littlejoyarcade.site @1.1.1.1`.
4. Add proxied records: `@` CNAME → `<project>.pages.dev` and `www` CNAME → `<project>.pages.dev`. Cloudflare
   supports CNAME flattening at the apex, so no A records are needed.
5. Game subdomains: `CNAME <game> → jd4rider.github.io` (DNS-only, then configure the custom domain in that
   game's Pages settings so the certificate matches).

## Verification commands

```bash
dig +short NS littlejoyarcade.site @1.1.1.1
dig +short A littlejoyarcade.site @1.1.1.1
dig +short CNAME www.littlejoyarcade.site @1.1.1.1
curl -sI https://littlejoyarcade.site | head -5
curl -sI https://www.littlejoyarcade.site | head -5
```

Expected: GoDaddy or Cloudflare nameservers, the hosting IPs/CNAME, HTTP 200 (or a 301 to the canonical host)
and a valid certificate for both apex and `www`.

## Rollback

Before editing, export the full record list to a file. To roll back, restore the parked A records
(`3.33.130.190`, `15.197.148.33`) and remove the added CNAME. For a nameserver move, restoring
`ns19/ns20.domaincontrol.com` at GoDaddy reverts to GoDaddy DNS.
