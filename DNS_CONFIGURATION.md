# DNS configuration

## Verified current state (2 November 2026)

| Record | Value |
| --- | --- |
| Nameservers | `ns19.domaincontrol.com`, `ns20.domaincontrol.com` (GoDaddy) |
| `littlejoyarcade.site` A | `3.33.130.190`, `15.197.148.33` — GoDaddy parking page (HTTP 200, not our site) |
| `www.littlejoyarcade.site` | parking IPs |
| `bubblewrapgame.online` | GitHub Pages, custom domain + HTTPS working |

No records have been changed: no GoDaddy API key and no Vercel account token were available here. The parking
A records must be **replaced**, not added to, or the apex will keep resolving to GoDaddy's parked page.

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

The exact records are shown in **Vercel → Project → Settings → Domains** after adding the domain. Typical values:

| Type | Name | Value | Notes |
| --- | --- | --- | --- |
| A | `@` | `76.76.21.21` | Replaces the two GoDaddy parking A records |
| CNAME | `www` | `cname.vercel-dns.com` | Replace the existing `www` |
| TXT | `_vercel` | value shown by Vercel | Only if Vercel asks for domain verification |

Use Vercel's displayed values, not these, if they differ.

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
  -d '[{"type":"A","name":"@","data":"76.76.21.21","ttl":600},
       {"type":"CNAME","name":"www","data":"cname.vercel-dns.com","ttl":600}]'
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

Expected: GoDaddy nameservers, Vercel's A/CNAME values, HTTP 200 on the apex, a 301/308 from `www` to the apex,
and a valid certificate on both. DNS caches can hold the old parking IPs for up to the previous TTL; test with
`dig @1.1.1.1` before assuming a propagation problem.

## Optional: moving nameservers to Cloudflare

Not required for Vercel. Only worth it if you also want Cloudflare's CDN/WAF. It is a disruptive, approval-required
change: add the zone, review the imported records (especially MX/TXT), then replace `ns19/ns20.domaincontrol.com`
at GoDaddy with the Cloudflare pair. With Cloudflare DNS, keep Vercel's records DNS-only (grey cloud) or use
Cloudflare's Vercel integration; proxying without it can break certificate validation.

## Rollback

Restore the exported record set — the parking A records were `3.33.130.190` and `15.197.148.33`, and `www`
pointed at the apex. For a nameserver move, restoring the GoDaddy nameservers reverts everything.
