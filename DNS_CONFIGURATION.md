# DNS configuration

Everything for Little Joy Arcade lives on **GitHub Pages**, with the domain's
nameservers left at GoDaddy. Firebase Hosting is not used for the live site; its
sites remain as spare mirrors only.

## Current records (verified against the GoDaddy API and public resolvers)

| Type | Name | Value |
| --- | --- | --- |
| NS | `@` | `ns19.domaincontrol.com`, `ns20.domaincontrol.com` (GoDaddy) |
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (GitHub Pages) |
| CNAME | `www` | `littlejoyarcade.site` |
| CNAME | each game host | `jd4rider.github.io` |
| CNAME | `_domainconnect` | `_domainconnect.gd.domaincontrol.com` (GoDaddy, untouched) |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; …` (untouched) |

Game hostnames currently published this way:

`jewel-match`, `pipe-dreams`, `pixel-stitch`, `sand-sort-studio`,
`lighthouse-keeper`, `laser-logic`, `circuit-crafter`, `rumble-rally`,
`whisker-grid`, `blocked-in`, `bubblewrap` — all
`<name>.littlejoyarcade.site` → `jd4rider.github.io`.

`bubblewrapgame.online` is a separate GitHub Pages site owned by Bubble Wrap.

There are no MX, SPF or DKIM records on this domain; nothing else needed
preserving. No CAA record exists, so GitHub is free to issue certificates.

## How the portal and the games are wired

- `littlejoyarcade.site` → GitHub Pages project site `jd4rider/littlejoyarcade`
  (`public/CNAME` holds the apex, hash routing means no rewrite rules).
- Each game is a GitHub Pages project site `jd4rider/<game>` publishing the
  playable build to `/play/`. The catalogue links
  `https://jd4rider.github.io/<game>/play/`.

**A Pages site has exactly one canonical hostname.** Once a game repo sets a
Pages custom domain (or ships a `public/CNAME`), GitHub 301s
`jd4rider.github.io/<game>/` to that hostname, and the `github.io` URL stops
serving the game directly. That redirect is why the subdomains must not be
configured on the game repos while the catalogue links `github.io`.

The `A`/`CNAME` records for the game hostnames are therefore deliberately left
out of the zone. Recreating one is a two-step job and only makes sense if the
whole arcade moves to custom hostnames:

1. `gh api -X PUT repos/jd4rider/<game>/pages -f cname=<game>.littlejoyarcade.site`
   (and add the matching `public/CNAME` file so a rebuild keeps it).
2. Update `playUrl`/`siteUrl` in the catalogue and the `games` table.

## Adding a new game subdomain

Use the automation rather than hand-editing records:

```bash
GODADDY_PAT=gd_pat_... node scripts/register-subdomain.mjs my-game \
  --target jd4rider.github.io \
  --repo jd4rider/my-game
```

The GoDaddy API accepts the personal access token as a bearer token
(`Authorization: Bearer gd_pat_...`). The older `sso-key key:secret` form only
works with legacy API keys and returns `401` for PATs.

The same operation exists in the portal at `/#/admin` → *Register a game
subdomain*, which calls the `register-subdomain` Edge Function; the PAT lives in
Supabase function secrets, never in the browser.

## Certificates

GitHub issues the certificate for a Pages custom domain automatically once the
hostname resolves to GitHub and the domain is verified for the account. Until a
host has its own certificate, GitHub serves only its wildcard `*.github.io`
certificate, which fails hostname validation for
`<game>.littlejoyarcade.site` — browsers show a certificate error even though
HTTP works. That is the state the game subdomains were left in: DNS correct,
certificate never issued. Nothing in the current catalogue depends on them.

Check a single host:

```bash
dig +short pipe-dreams.littlejoyarcade.site @1.1.1.1
echo | openssl s_client -connect 185.199.108.153:443 \
  -servername pipe-dreams.littlejoyarcade.site 2>/dev/null \
  | openssl x509 -noout -subject -ext subjectAltName
```

A `subject=CN=*.github.io` answer means the per-domain certificate is still
missing; the host is not usable over HTTPS yet. Re-request it with:

```bash
gh api -X PUT repos/jd4rider/<game>/pages \
  -f cname=<game>.littlejoyarcade.site -F https_enforced=true
```

## Verification

```bash
dig +short A littlejoyarcade.site @1.1.1.1
dig +short CNAME jewel-match.littlejoyarcade.site @1.1.1.1
curl -sI https://littlejoyarcade.site | head -3
curl -s -o /dev/null -w '%{http_code}\n' https://jewel-match.littlejoyarcade.site/play/
```

Expected: the four GitHub A records, a CNAME to `jd4rider.github.io`, HTTP 200
on the apex, and HTTP 200 on each game's `/play/` once its certificate exists.

## Rollback

The zone can be restored from the GoDaddy API dump before any change. The old
parking records were `A @ → 3.33.130.190` and `15.197.148.33`.
