# Social sign-in (SSO)

The portal supports Google, Facebook, GitHub, Apple, Discord, X and Twitch via
Supabase Auth's OAuth providers. The UI is already shipped: `src/lib/auth.tsx`
reads `/auth/v1/settings` and only renders buttons for providers the project
reports as enabled. Nothing appears until credentials are added, so the login
page stays clean today.

Email magic links and email/password remain the fallback for every provider and
for players who do not want a social account.

## What is already done

- Provider buttons on `/#/login`, with labels, error surfacing and busy states.
- `signInWithOAuth` returns to the origin the player started on; the Supabase
  redirect allow-list contains the apex, `www`, the Pages path and localhost.
- The account is the same row for every provider: one `auth.users` entry,
  one profile, one set of cloud saves.

## One-time setup per provider

Supabase's callback URL is always:

```
https://fqovramltegcfiyebyrt.supabase.co/auth/v1/callback
```

1. **Google** — <https://console.cloud.google.com/apis/credentials>
   - Create an OAuth client ID of type *Web application*.
   - Authorised redirect URI: the callback URL above.
   - Copy the client ID and secret into Supabase → Authentication → Providers → Google.
2. **Facebook** — <https://developers.facebook.com/apps>
   - Create an app, add *Facebook Login*, set the valid OAuth redirect URI to the callback URL.
   - Copy App ID and App Secret into Supabase → Providers → Facebook.
3. **GitHub** — <https://github.com/settings/developers>
   - New OAuth App; callback URL as above.
   - Copy the client ID and secret into Supabase → Providers → GitHub.
4. **Apple / Discord / X / Twitch** — same pattern; each provider page in
   Supabase lists the exact redirect URI to register.

After saving credentials, reload the login page: the buttons appear
automatically because the settings endpoint now lists them.

## Optional: push this through the CLI

Provider secrets are not stored in `supabase/config.toml` (they must not be
committed). Set them in the dashboard, or keep them in a local, gitignored
`.env` and use `supabase config push` from a machine that has them.

## Desktop games

The in-game client (`packages/sdk/desktop/arcade-client.js`) uses email/password
because an OAuth browser round trip cannot return to a `file://` Electron
window. If social sign-in inside desktop apps becomes a requirement, the clean
path is a system-browser flow with a custom protocol handler
(`littlejoyarcade://auth/callback`) plus PKCE; that is a separate project.

## Verify

```bash
curl -s "$VITE_SUPABASE_URL/auth/v1/settings" -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  | python3 -c 'import sys,json; print([k for k,v in json.load(sys.stdin)["external"].items() if v])'
```

`email` alone means no provider is configured yet. With Google configured it
prints `['email', 'google']`, and the portal shows *Continue with Google*.
