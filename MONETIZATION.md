# Monetization

Three revenue paths, one entitlement model. Nothing charges anyone today: the storefront and ad slots are
built but switched off until the prerequisites below are met.

## Entitlements are the centre of gravity

| Slug | Effect |
| --- | --- |
| `arcade.ad_free` | No ads anywhere in the arcade |
| `bubblewrap.ad_free` | No ads in Bubble Wrap |
| `arcade.premium` | Umbrella for future premium features |
| `<game>.premium_themes` | Cosmetic packs, e.g. `bubblewrap.premium_themes` |
| `<game>.puzzle_pack_1` | Extra level packs |

The SDK exposes `entitlements.has(slug)` and `entitlements.adsAllowed()`, which returns false when either
`arcade.ad_free` or `<game>.ad_free` is held. Every ad surface must ask that one question, so a purchase can
never be bypassed by an ad implementation that forgot to check.

The browser can only *read* entitlements. Grants happen server-side through `grant_entitlement`, which is
executable by the service role alone.

## 1. Advertising

Current state:

- AdSense publisher id `ca-pub-8675744307100993` is verified on `bubblewrapgame.online`. Approval is pending.
- No ad unit slot ids exist yet, so **no ad markup is inserted anywhere**. The existing Bubble Wrap site hides
  its slot when no slot id is configured, and the portal has no ad code at all.
- The portal deliberately shows no ads while the account is unapproved — placing ads on a site that is not yet
  approved risks the account.

Policy the implementation must follow:

- Never inside active gameplay; between levels, on menus, or on catalogue pages only.
- Never to a player holding an ad-free entitlement.
- Consent prompt where required (EEA/UK), with a "reject" path that is as easy as accept.
- No interstitials, no auto-playing sound, no layout shift.
- Kids-facing content: no personalised advertising.

Next steps once approved:

1. Create ad units in AdSense for `littlejoyarcade.site` and each game domain.
2. Add a single `AdSlot` component that reads `arcade.entitlements.adsAllowed()` and renders nothing when false.
3. Configure Google's consent management or a certified CMP for EEA traffic.
4. Add `ads.txt` per domain with the publisher line.
5. Measure fill and RPM for two weeks before adding a second placement.

Revenue expectation: casual puzzle traffic is low-RPM. At 10k monthly pageviews and a $2–4 RPM, expect roughly
$20–40/month. Ads are a baseline, not the business.

## 2. Individual game purchases

One-time products, e.g. "Bubble Wrap — Premium themes" at $2.99. Desktop builds could also be sold as a
convenience bundle while the web version stays free. Requires Stripe Checkout, a webhook, and the verification
steps in `SECURITY.md`.

## 3. Arcade-wide premium

`arcade.ad_free` at $4.99 once, or a future yearly pass. This is the most attractive product because it is one
purchase across eight games and does not split the audience.

## Storefront state

| Component | State |
| --- | --- |
| `products` table + seed rows | Written; all products `active = false` |
| `getProducts()` in the SDK | Working |
| Portal store UI | Not shown; checkout intentionally disabled |
| Stripe integration | Not built |
| Webhook verification | Not built |
| Tax / refund pages | Not written (needs a real business decision) |

Do not flip `active = true` until checkout, webhook verification, refund policy and tax handling are all real.
A product row becoming visible is the last step, not the first.

## Platform billing rules for later

- **Web:** Stripe Checkout. Never handle card data.
- **Google Play:** Play Billing is mandatory for digital goods; Stripe links inside the app are not allowed.
- **Apple App Store:** In-App Purchase is mandatory for digital goods; no external checkout links.
- Entitlements must therefore be granted per platform (Play/App Store receipts verified server-side), not by
  reusing the Stripe webhook.
