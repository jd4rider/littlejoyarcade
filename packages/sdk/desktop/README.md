# Desktop + web game client

`arcade-client.js` is a single dependency-free file that gives any game a
Little Joy Arcade account panel and cloud saves. It is plain JavaScript on
purpose: Phaser, React and vanilla games can all load it without a build step.

## Install it in a game

1. Copy the file into the game's Vite `public/` folder, with the public anon key
   filled in:

   ```bash
   KEY=$(grep '^VITE_SUPABASE_ANON_KEY=' ../littlejoyarcade/.env.local | cut -d= -f2-)
   sed "s|__LJA_ANON_KEY__|$KEY|" packages/sdk/desktop/arcade-client.js > ../my-game/public/arcade-client.js
   ```

2. Load it at the end of `index.html`:

   ```html
   <script src="./arcade-client.js" data-game-id="my-game"></script>
   ```

3. Make sure a `public.games` row exists for `my-game`; cloud saves reference it
   as a foreign key. `game_progress` is protected by RLS, so the public anon key
   is safe to ship.

That is all. The client adds a small floating account button, handles sign-up,
sign-in, token refresh and sign-out, and mirrors the game's Web Storage keys to
the player's account. On a second device it restores the newest snapshot and
reloads once so the game reads it.

## When a game does not use localStorage

Games that keep saves in IndexedDB or SQLite can define two globals before the
client loads:

```js
window.LJA_SNAPSHOT = () => ({ 'my-game.db': exportSaveAsJsonString() })
window.LJA_APPLY_SNAPSHOT = (keys) => importSaveFromJsonString(keys['my-game.db'])
```

The client stores whatever JSON object those return, and conflict handling stays
the same: local edits are pushed; only an untouched device accepts a cloud copy.

## Verify

Open the game, click the account button, create an account, then:

- `window.LittleJoyArcade.status()` reports `Saved to the cloud`.
- Sign in on another device or in the web build; the save appears and the page
  reloads once.

Electron needs no special configuration: `sandbox: true` plus
`contextIsolation: true` still allows `fetch` to Supabase, and `localStorage`
persists under the app's `userData` directory.
