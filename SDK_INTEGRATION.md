# SDK integration

`@littlejoyarcade/sdk` gives every game the same auth, saves, achievements, entitlements and analytics through
one small surface. It has no hard runtime dependencies: React, Supabase and Phaser are optional peers.

## Install

Inside this monorepo the portal consumes the workspace package directly:

```json
"dependencies": { "@littlejoyarcade/sdk": "*" }
```

For a separate game repository, either copy `packages/sdk/src` into the game (simplest, no registry needed) or
publish the package and install it by version. Publishing is deferred until the API stops moving; the source is
the contract for now.

## Initialise

```ts
import { createArcade, createSupabaseCloud } from '@littlejoyarcade/sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export const arcade = createArcade({
  gameId: 'pipe-dreams',
  schemaVersion: 1,
  cloud: createSupabaseCloud(supabase),
})

await arcade.initialize()
```

Omit `cloud` and everything still works, locally: saves persist, achievements bank locally, and nothing throws
when the network is gone.

## Progress

```ts
const saved = arcade.progress.load<{ unlocked: number; stars: Record<string, number> }>()
if (saved) data = { ...data, ...saved }

await arcade.progress.save(data)   // local write first, then cloud (or queue)
await arcade.progress.sync()       // merge + flush pending writes
arcade.progress.status()           // 'local' | 'syncing' | 'synced' | 'offline' | 'error'
```

Merge rule: newest `updatedAt` wins, ties go to the cloud. Guest data is uploaded only when the cloud is empty
or older, so signing in never silently discards newer cloud progress.

## Achievements

```ts
await arcade.achievements.unlock('first_clear')  // stored as pipe-dreams.first_clear
arcade.achievements.has('first_clear')
arcade.achievements.list()
```

Unlocks are idempotent. They are cosmetic only — never use them to gate a paid feature.

## Entitlements and ads

```ts
arcade.entitlements.has('arcade.ad_free')
arcade.entitlements.adsAllowed()   // false when arcade.ad_free or pipe-dreams.ad_free is held
```

Call `adsAllowed()` before rendering any ad surface, every time.

## Analytics

```ts
arcade.analytics.track('level_completed', { level: 12, stars: 3 })
await arcade.analytics.flush()     // optional transport; events stay queued otherwise
```

Events are aggregate and capped locally (100 by default). Never send emails, names or free-text.

## Platform detection

```ts
arcade.platform // { runtime: 'browser' | 'electron' | 'capacitor' | 'unknown', online, touch }
```

## React

```tsx
import { ArcadeProvider, useArcade, useArcadeProgress, useEntitlement } from '@littlejoyarcade/sdk/react'

<ArcadeProvider arcade={arcade}>
  <Game />
</ArcadeProvider>

function Game() {
  const { data, save, status } = useArcadeProgress({ level: 1, score: 0 })
  const adFree = useEntitlement('arcade.ad_free')
  return <button onClick={() => save({ ...data, level: data.level + 1 })}>Next ({status})</button>
}
```

## Phaser

```ts
import { bindPhaserProgress } from '@littlejoyarcade/sdk/phaser'

export default class GameScene extends Phaser.Scene {
  create() {
    const bridge = bindPhaserProgress(this, arcade, () => saveData)
    const saved = bridge.load()      // hydrate your existing save shape
  }
}
```

The bridge saves on `shutdown`/`destroy` and re-syncs on the browser's `online` event. Phaser itself is not
imported by the SDK, so version upgrades cannot break it.

## Electron

Keep `contextIsolation: true`, `nodeIntegration: false`, and expose one narrow bridge from preload:

```ts
// preload.cjs
contextBridge.exposeInMainWorld('arcadeFile', {
  read: (key) => ipcRenderer.sendSync('arcade:read', key),
  write: (key, value) => ipcRenderer.send('arcade:write', key, value),
  remove: (key) => ipcRenderer.send('arcade:remove', key),
})
```

```ts
import { createElectronStorage } from '@littlejoyarcade/sdk/electron'

const arcade = createArcade({
  gameId: 'pipe-dreams',
  storage: createElectronStorage(window.arcadeFile),
})
```

In the main process, validate the key against an allowlist and write inside `app.getPath('userData')`.

## Vanilla JavaScript

```html
<script type="module">
  import { createArcade } from './sdk/index.ts'
  const arcade = createArcade({ gameId: 'my-game' })
  const saved = arcade.progress.load()
  arcade.progress.save({ ...saved, level: 3 })
</script>
```

## Capacitor (future)

The SDK works unchanged in a WebView: pass a custom `CloudAdapter` that routes auth through the app's secure
storage and purchases through Play Billing / StoreKit, then grant entitlements server-side. Do not reuse the web
Stripe flow inside a store-distributed app.

## Integration checklist per game

1. `createArcade({ gameId })` next to the existing save module.
2. Hydrate the current save shape from `progress.load()`; nothing else about the game changes.
3. Call `progress.save()` wherever the game already persists today.
4. Add `achievements.unlock()` on real milestones that already exist.
5. Gate ad surfaces behind `adsAllowed()`.
6. Test: guest play, signed-in sync, offline play then reconnect, and a browser refresh mid-level.
