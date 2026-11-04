# Brief: add Little Joy Arcade accounts + cloud saves to a Unity WebGL game

> **How to use this file:** paste this whole message to the agent, fill in §0, let it work.
> Everything below is the real contract of the Little Joy Arcade platform (project `fqovramltegcfiyebyrt`).
> Do not invent tables, columns, endpoints or SDK methods that are not written here. If something is
> genuinely missing, add a numbered migration and say so — never guess.

---

## 0. Fill these in first

| Placeholder | Value |
| --- | --- |
| `GAME_ID` | `__` (slug, `^[a-z0-9-]{2,40}$`, must match the `public.games` row) |
| `GAME_NAME` | `__` |
| `GAME_REPO` | `__` (e.g. `jd4rider/cannon-clash-3d-web`) |
| `UNITY_VERSION` | `__` |

You are working in the Unity WebGL game repo. The platform repo is
`/Users/jonathanforrider/programming/littlejoyarcade` — read it, copy from it, but do not restructure it.

---

## 1. What you are building

A Unity WebGL build served from GitHub Pages that:

1. keeps working **exactly as it does today** with no network, no account and no storage,
2. gains **one shared Little Joy Arcade account** (email + password) usable across every arcade game,
3. gains **cloud saves in Postgres** so campaign progress, stars, unlocks and settings follow the
   player to any device,
4. reports **achievements** to the arcade,
5. never blocks gameplay on a failed sync.

The player's save is one JSON blob owned by the game. The platform guarantees only the envelope
around it (§5) and stores it in `public.game_progress`.

---

## 2. The integration chain (follow this exactly)

```
Unity C#  ──►  Assets/Plugins/WebGL/LittleJoyArcade.jslib  ──►  page JavaScript
                                                                    │
                                       public/arcade-unity.js  (game-owned shim)
                                       public/arcade-client.js (platform client, copy verbatim)
                                                                    │
                                                                    ▼
                                       Supabase: Auth (/auth/v1) + PostgREST (/rest/v1)
```

**Why this shape:** Unity's `PlayerPrefs` on WebGL lives in IndexedDB, which page JavaScript cannot
read reliably, and Unity cannot call the TypeScript SDK. So the page holds the synced copy and Unity
talks to it through two jslib calls: **load my save** and **store my save**. That is the whole bridge.

**Never** try to make the arcade client mirror `PlayerPrefs` directly, and never store the save only
in IndexedDB.

---

## 3. Files to add

```
Assets/Plugins/WebGL/LittleJoyArcade.jslib    # C# <-> JS bridge (WebGL builds only)
Assets/Scripts/Platform/ArcadeBridge.cs       # static wrapper, no-ops outside WebGL
Assets/Scripts/Platform/ArcadeSave.cs         # envelope + local/cloud reconciliation
public/arcade-client.js                       # copy of the platform client, unmodified
public/arcade-unity.js                        # shim: save hooks, panel, achievements
scripts/prepare-site.mjs                      # patch: copy both JS files, inject both tags
```

`public/` is whatever folder your repo's `prepare-site.mjs` sources from — if the repo has none,
put both JS files next to the Unity template and copy them into `site/play/` in the build step.

---

## 4. `public/arcade-unity.js` — the shim

Create it with this content (replace `GAME_ID` in the `data-game-id` tag, not here):

```js
/*
 * Unity <-> Little Joy Arcade bridge.
 * Owns the one key the arcade client mirrors for this game, and gives Unity a
 * small synchronous API: load the save, store the save, unlock an achievement.
 */
(function () {
  var script = document.currentScript || document.querySelector('script[data-game-id]')
  var GAME = (script && script.dataset.gameId) || window.LJA_GAME_ID || 'GAME_ID'
  var KEY = 'lja:' + GAME + ':unity-save'
  var SESSION = 'lja:session'
  var API = 'https://fqovramltegcfiyebyrt.supabase.co'

  function anonKey() {
    var tag = document.querySelector('script[data-anon-key]')
    return (tag && tag.dataset.anonKey) || window.LJA_SUPABASE_ANON_KEY || ''
  }

  function read() {
    try {
      return localStorage.getItem(KEY) || ''
    } catch (e) {
      return ''
    }
  }

  function write(json) {
    try {
      localStorage.setItem(KEY, json)
      return true
    } catch (e) {
      return false
    }
  }

  function session() {
    try {
      var raw = localStorage.getItem(SESSION)
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  }

  function api() {
    return window.LittleJoyArcade || null
  }

  function sendStatus(text) {
    // ArcadeBridge lives on a DontDestroyOnLoad object in the boot scene.
    if (typeof SendMessage === 'function') {
      try {
        SendMessage('ArcadeBridge', 'OnArcadeStatus', String(text || ''))
      } catch (e) {
        /* object not created yet */
      }
    }
  }

  var shim = {
    gameId: GAME,
    load: read,
    save: function (json) {
      if (!json || typeof json !== 'string') return false
      var ok = write(json)
      var client = api()
      if (client && client.user()) {
        client.syncNow('game')
        sendStatus('Saving…')
      }
      return ok
    },
    clear: function () {
      try {
        localStorage.removeItem(KEY)
      } catch (e) {}
    },
    signedIn: function () {
      var client = api()
      return !!(client && client.user())
    },
    email: function () {
      var client = api()
      var user = client && client.user()
      return user && user.email ? user.email : ''
    },
    sync: function () {
      var client = api()
      if (client) client.syncNow('unity')
    },
    signOut: function () {
      var client = api()
      if (client) client.signOut()
    },
    openPanel: function () {
      // The account pill is inside the client's shadow root; click it.
      var host = document.querySelector('[data-lja-client]')
      var toggle = host && host.shadowRoot && host.shadowRoot.querySelector('.toggle')
      if (toggle) toggle.click()
    },
    status: function () {
      var client = api()
      return client ? client.status().text : 'Not signed in'
    },
    unlock: function (slug) {
      var s = session()
      var user = s && s.user ? s.user : null
      var anon = anonKey()
      if (!user || !s.access_token || !anon) return false
      var id = slug.indexOf('.') > 0 ? slug : GAME + '.' + slug
      fetch(API + '/rest/v1/player_achievements?on_conflict=user_id,achievement_id', {
        method: 'POST',
        headers: {
          apikey: anon,
          authorization: 'Bearer ' + s.access_token,
          'content-type': 'application/json',
          prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({ user_id: user.id, achievement_id: id })
      }).then(function (res) {
        sendStatus(res.ok ? 'Achievement saved' : 'Achievement queued')
      }).catch(function () {
        sendStatus('Achievement queued')
      })
      return true
    }
  }

  // The client only mirrors keys it can see; `lja:` keys are excluded from its
  // automatic sweep, which is why these two hooks exist.
  window.LJA_SNAPSHOT = function () {
    var value = read()
    return value ? { 'unity-save': value } : {}
  }
  window.LJA_APPLY_SNAPSHOT = function (keys) {
    if (keys && typeof keys['unity-save'] === 'string') write(keys['unity-save'])
  }

  window.LJA_UnitySave = shim
})()
```

**Requirement:** never let this file throw on a browser with storage blocked. Every access is already
guarded; keep it that way.

---

## 5. The save format

One string, two layers of versioning.

**Layer 1 — the platform envelope** (handled entirely by `arcade-client.js`; do not touch it):
the `game_progress` row holds `{ "keys": { "unity-save": "<json string>" }, "savedAt": 175… }`.
The row also carries `schema_version`, `device_id` and `updated_at` (timestamptz).

**Layer 2 — the game blob** that Unity writes. Use concrete `[Serializable]` classes so
`JsonUtility` can round-trip it (it cannot handle `Dictionary<,>` or interfaces):

```json
{
  "v": 1,
  "savedAt": 1751234567890,
  "payload": {
    "unlockedLevel": 14,
    "stars": [3, 2, 3, 1],
    "bestScores": [1200, 900],
    "achievements": ["first_clear", "three_stars"],
    "settings": { "music": true, "sfx": true, "reducedMotion": false },
    "cosmetics": ["candy", "retro"],
    "daily": { "date": "2026-11-03", "done": true, "streak": 4 }
  }
}
```

Rules:

- `v` is the game's own save version. Bump it when the shape changes, and migrate on load.
- `savedAt` is `DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()`. It decides which copy wins.
- Everything the player would be upset to lose goes in `payload`. All of it, not a subset.
- Cap total size. One blob under ~200 KB. Cosmetic galleries and level catalogues stay in the build.
- Local key: `PlayerPrefs` key `lja.save` (unchanged behaviour offline). Cloud key:
  `lja:<GAME_ID>:unity-save`.

---

## 6. `Assets/Plugins/WebGL/LittleJoyArcade.jslib`

```c
mergeInto(LibraryManager.library, {
  LJA_Unity_Available: function () {
    return (window.LJA_UnitySave && typeof window.LJA_UnitySave.load === 'function') ? 1 : 0;
  },

  LJA_Unity_Load: function () {
    var value = (window.LJA_UnitySave && window.LJA_UnitySave.load()) || '';
    var size = lengthBytesUTF8(value) + 1;
    var buffer = _malloc(size);
    stringToUTF8(value, buffer, size);
    return buffer;
  },

  LJA_Unity_Save: function (jsonPtr) {
    var json = UTF8ToString(jsonPtr);
    if (window.LJA_UnitySave) window.LJA_UnitySave.save(json);
  },

  LJA_Unity_Free: function (ptr) {
    _free(ptr);
  },

  LJA_Unity_SignedIn: function () {
    return (window.LJA_UnitySave && window.LJA_UnitySave.signedIn()) ? 1 : 0;
  },

  LJA_Unity_Email: function () {
    var value = (window.LJA_UnitySave && window.LJA_UnitySave.email()) || '';
    var size = lengthBytesUTF8(value) + 1;
    var buffer = _malloc(size);
    stringToUTF8(value, buffer, size);
    return buffer;
  },

  LJA_Unity_Status: function () {
    var value = (window.LJA_UnitySave && window.LJA_UnitySave.status()) || '';
    var size = lengthBytesUTF8(value) + 1;
    var buffer = _malloc(size);
    stringToUTF8(value, buffer, size);
    return buffer;
  },

  LJA_Unity_Sync: function () {
    if (window.LJA_UnitySave) window.LJA_UnitySave.sync();
  },

  LJA_Unity_SignOut: function () {
    if (window.LJA_UnitySave) window.LJA_UnitySave.signOut();
  },

  LJA_Unity_OpenPanel: function () {
    if (window.LJA_UnitySave) window.LJA_UnitySave.openPanel();
  },

  LJA_Unity_Unlock: function (slugPtr) {
    var slug = UTF8ToString(slugPtr);
    return (window.LJA_UnitySave && window.LJA_UnitySave.unlock(slug)) ? 1 : 0;
  }
});
```

Every `LJA_Unity_*` function returns a pointer for strings — C# must free it (`LJA_Unity_Free`).
`SendMessage('ArcadeBridge', 'OnArcadeStatus', text)` is how the panel reports back.

---

## 7. `Assets/Scripts/Platform/ArcadeBridge.cs`

```csharp
using System;
using System.Runtime.InteropServices;
using UnityEngine;

/// Thin, fail-safe wrapper over the WebGL jslib. Every call is a no-op outside
/// WebGL, and nothing here throws into gameplay code.
public static class ArcadeBridge
{
    public static event Action<string> StatusChanged;
    public static event Action<bool> SignedInChanged;

    static bool available;

#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")] static extern int LJA_Unity_Available();
    [DllImport("__Internal")] static extern IntPtr LJA_Unity_Load();
    [DllImport("__Internal")] static extern void LJA_Unity_Save(string json);
    [DllImport("__Internal")] static extern void LJA_Unity_Free(IntPtr ptr);
    [DllImport("__Internal")] static extern int LJA_Unity_SignedIn();
    [DllImport("__Internal")] static extern IntPtr LJA_Unity_Email();
    [DllImport("__Internal")] static extern IntPtr LJA_Unity_Status();
    [DllImport("__Internal")] static extern void LJA_Unity_Sync();
    [DllImport("__Internal")] static extern void LJA_Unity_SignOut();
    [DllImport("__Internal")] static extern void LJA_Unity_OpenPanel();
    [DllImport("__Internal")] static extern int LJA_Unity_Unlock(string slug);
#endif

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
    static void Init()
    {
        try
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            available = LJA_Unity_Available() == 1;
#endif
        }
        catch (Exception)
        {
            available = false;
        }
    }

    public static bool Available => available;

#if UNITY_WEBGL && !UNITY_EDITOR
    static string TakeString(IntPtr ptr)
    {
        if (ptr == IntPtr.Zero) return string.Empty;
        try { return Marshal.PtrToStringUTF8(ptr) ?? string.Empty; }
        finally { LJA_Unity_Free(ptr); }
    }
#endif

    public static string LoadRaw()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        if (!available) return string.Empty;
        try { return TakeString(LJA_Unity_Load()); } catch (Exception) { return string.Empty; }
#else
        return string.Empty;
#endif
    }

    public static void SaveRaw(string json)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        if (!available || string.IsNullOrEmpty(json)) return;
        try { LJA_Unity_Save(json); } catch (Exception) { /* local save already happened */ }
#endif
    }

    public static bool SignedIn
    {
        get
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            try { return available && LJA_Unity_SignedIn() == 1; } catch (Exception) { return false; }
#else
            return false;
#endif
        }
    }

    public static string Email()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        try { return available ? TakeString(LJA_Unity_Email()) : string.Empty; } catch (Exception) { return string.Empty; }
#else
        return string.Empty;
#endif
    }

    public static string Status()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        try { return available ? TakeString(LJA_Unity_Status()) : "Not available"; } catch (Exception) { return "Not available"; }
#else
        return "Not available";
#endif
    }

    public static void Sync()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        if (!available) return;
        try { LJA_Unity_Sync(); } catch (Exception) { }
#endif
    }

    public static void SignOut()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        if (!available) return;
        try { LJA_Unity_SignOut(); } catch (Exception) { }
#endif
    }

    public static void OpenPanel()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        if (!available) return;
        try { LJA_Unity_OpenPanel(); } catch (Exception) { }
#endif
    }

    public static bool Unlock(string slug)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        if (!available || string.IsNullOrEmpty(slug)) return false;
        try { return LJA_Unity_Unlock(slug) == 1; } catch (Exception) { return false; }
#else
        return false;
#endif
    }

    /// Called from JS via SendMessage on the ArcadeBridge GameObject.
    public void OnArcadeStatus(string text)
    {
        StatusChanged?.Invoke(text);
        SignedInChanged?.Invoke(SignedIn);
    }
}
```

Notes for the implementer:

- `OnArcadeStatus` must live on a **component** named `ArcadeBridge` on a `DontDestroyOnLoad`
  GameObject in the first scene, or `SendMessage` silently finds nothing.
- Call the bridge only from the Unity main thread. Never from `Task`/`Thread`.
- `Marshal.PtrToStringUTF8` needs .NET Standard 2.1 (Unity 2021+). On an older scripting runtime,
  use `Marshal.PtrToStringAnsi` and keep the save JSON ASCII-safe.

---

## 8. `Assets/Scripts/Platform/ArcadeSave.cs`

```csharp
using System;
using UnityEngine;

[Serializable] public class SaveSettings
{
    public bool music = true;
    public bool sfx = true;
    public bool reducedMotion = false;
}

[Serializable] public class SavePayload
{
    public int unlockedLevel = 1;
    public int[] stars = Array.Empty<int>();
    public int[] bestScores = Array.Empty<int>();
    public string[] achievements = Array.Empty<string>();
    public string[] cosmetics = Array.Empty<string>();
    public SaveSettings settings = new SaveSettings();
    public string dailyDate = "";
    public bool dailyDone = false;
    public int dailyStreak = 0;
}

[Serializable] public class SaveEnvelope
{
    public int v = 1;
    public long savedAt = 0;
    public SavePayload payload = new SavePayload();
}

public static class ArcadeSave
{
    const string LOCAL_KEY = "lja.save";
    static SaveEnvelope current = new SaveEnvelope();

    public static SaveEnvelope Current => current;

    /// Reads PlayerPrefs, then adopts a newer cloud copy if the bridge has one.
    /// Runs once from the boot scene, before any menu reads progress.
    public static void Boot()
    {
        var local = ReadLocal();
        var cloud = ReadCloud();

        current = local;
        if (cloud != null && cloud.savedAt > local.savedAt)
        {
            current = cloud;
            WriteLocal(cloud);      // so the next cold boot is already correct
        }
    }

    static SaveEnvelope ReadLocal()
    {
        var raw = PlayerPrefs.GetString(LOCAL_KEY, string.Empty);
        return Deserialize(raw) ?? new SaveEnvelope();
    }

    static void WriteLocal(SaveEnvelope envelope)
    {
        PlayerPrefs.SetString(LOCAL_KEY, JsonUtility.ToJson(envelope));
        PlayerPrefs.Save();
    }

    static SaveEnvelope ReadCloud()
    {
        var raw = ArcadeBridge.LoadRaw();
        return string.IsNullOrEmpty(raw) ? null : Deserialize(raw);
    }

    static SaveEnvelope Deserialize(string raw)
    {
        if (string.IsNullOrEmpty(raw)) return null;
        try
        {
            var parsed = JsonUtility.FromJson<SaveEnvelope>(raw);
            return parsed != null && parsed.payload != null ? parsed : null;
        }
        catch (Exception) { return null; }   // corrupt or newer format: keep playing
    }

    /// Call after any progress or settings change, and on pause/quit.
    public static void Commit()
    {
        current.v = 1;
        current.savedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var json = JsonUtility.ToJson(current);
        PlayerPrefs.SetString(LOCAL_KEY, json);
        PlayerPrefs.Save();
        ArcadeBridge.SaveRaw(json);
    }

    public static void Unlock(string slug)
    {
        if (Array.IndexOf(current.payload.achievements, slug) >= 0) return;
        var list = new System.Collections.Generic.List<string>(current.payload.achievements) { slug };
        current.payload.achievements = list.ToArray();
        ArcadeBridge.Unlock(slug);
        Commit();
    }
}
```

**Save points (all of them):** level complete, level failed, unlock/purchase of a cosmetic, settings
change, `OnApplicationPause(true)`, `OnApplicationQuit`, and `OnApplicationFocus(false)`.
Debounce to at most one commit per second so a pause does not write five times.

---

## 9. Sign-in UI inside the game

The shared panel ships with `arcade-client.js`: a 42 px pill in the bottom-left with email/password
sign-in, create-account, "Sync now", "Sign out", and a live status line. It is plain DOM on top of
the canvas, has `aria-live` status text, and works when storage or the network is missing.

Requirements:

- It must never cover game controls. If the bottom-left of your HUD is in use, either move that HUD
  element or adjust the pill's `left`/`bottom` in the copied `arcade-client.js` (one CSS string —
  keep it a copy-only change and note it in your report).
- Inside the portal the game runs in a sandboxed iframe
  (`allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-orientation-lock`). That
  means `localStorage`, `fetch` to Supabase and the DOM panel all work; `window.open` popups do
  not. **Do not use an OAuth popup flow.** Email + password only.
- Sessions are per browser origin, so one account is shared across games but each game needs its own
  sign-in once. Say this in the panel copy; do not pretend otherwise.
- Optional: an in-canvas "Account" button in your Settings screen that calls
  `ArcadeBridge.OpenPanel()`, plus a small label showing `ArcadeBridge.SignedIn ? email : "Sign in to
  sync"`, refreshed on `ArcadeBridge.StatusChanged`.
- `#login` on the page URL opens the panel on load — use it for a deep link from your menu.

---

## 10. Register the game in the platform (hard prerequisite)

`game_progress.game_id` has a **foreign key to `public.games`**, so nothing can save until the row
exists. Do this first.

1. **Catalogue row.** Add `littlejoyarcade/supabase/migrations/00NN_<game_id>.sql` modelled exactly
   on `0009_traffic_tangle.sql`: a `with m as (select $manifest$ {…}$manifest$::jsonb as j)` block plus
   `insert … on conflict (id) do update`. Fill `id`, `name`, `tagline`, `description`, `play_url`
   (`https://jd4rider.github.io/<repo>/play/`), `site_url`, `repo_url`, `categories`, `runtime`
   (`Unity WebGL`), `version`, `updated`, `status`, `cover` (`{from,to,emoji}`), `highlights`,
   `how_to_play`, `levels`, `save_key` (your `PlayerPrefs` key), `downloads: []`.
2. **Achievements.** Ids are `<GAME_ID>.<slug>`. Seed at least the three shared ones:

   ```sql
   insert into public.achievements (id, game_id, name, description, points)
   select g.id || '.' || a.slug, g.id, a.name, a.description, a.points
   from public.games g
   cross join (values
     ('first_clear',  'First Clear',  'Finish the first level.',       10),
     ('three_stars',  'Perfect Run',  'Earn three stars on any level.', 25),
     ('completionist','Completionist','Finish every level in the game.',100)
   ) as a(slug, name, description, points)
   where g.id = 'GAME_ID'
   on conflict (id) do nothing;
   ```

   An unlock only records if the definition exists, so this must be applied before release.
3. **Apply:** `cd littlejoyarcade && npx supabase link --project-ref fqovramltegcfiyebyrt && npx supabase db push`.
   This writes to production — get explicit owner approval first, and show the SQL.
4. **Portal mirror:** add the same manifest to `littlejoyarcade/src/data/games.ts` so the catalogue
   card matches the database row.

---

## 11. Wiring the build so a new export cannot lose login

`scripts/prepare-site.mjs` publishes the Unity export to `site/play/`. Patch it so the account layer
survives every rebuild:

1. copy `public/arcade-client.js` and `public/arcade-unity.js` into `site/play/`;
2. inject the two tags before `</body>` of `site/play/index.html`, in this order:

   ```html
   <script src="./arcade-unity.js" data-game-id="GAME_ID"></script>
   <script src="./arcade-client.js" data-game-id="GAME_ID"></script>
   ```

3. make it **idempotent** (skip if the tag is already there, so a re-run does not double-inject) and
   **fail loudly** if either tag or either file is missing after writing — same style as the existing
   `.br` and canvas checks;
4. add both files to the "required files" assertions at the end.

The canonical client is `littlejoyarcade/bus-jam-bonanza/public/arcade-client.js`. Copy it verbatim;
it already contains the project URL and the public anon key. Do not fork its logic, and do not put a
service-role key anywhere.

Add one regression step to CI: build, then assert both script tags exist in `site/play/index.html`
and both files exist on disk.

---

## 12. Rules the integration must obey

1. **Local-first.** No account, no network, blocked storage → the game plays identically. Missing
   storage falls back to an in-memory `PlayerPrefs`-shaped store for the session.
2. **Newest save wins.** Compare `savedAt`; ties go to the cloud. Never overwrite a newer cloud blob
   with an older local one, and never delete the cloud row on sign-out.
3. **No privileged keys in the build.** Only the public anon key. RLS is the security boundary.
4. **Never write `purchases` or `entitlements`.** A client may only `select` its own active rows.
5. **Achievements are cosmetic.** Never gate paid content or level unlocks on them.
6. **No PII in telemetry.** Counts, slugs, level numbers, durations. No emails, names, free text.
7. **Failures are silent.** A failed sync never shows a modal, never blocks a level, never loses the
   local save.
8. **Ads stay off.** There is no active ad network; do not add one. If an entitlement check is needed
   later, read `entitlements` and treat any error as "no entitlement".

---

## 13. Verification — run it, paste the output

**Browser checks (real build, `site/play/` served locally or on Pages):**

1. Guest play, network blocked → game boots, levels play, `lja.save` in `PlayerPrefs`; no console
   errors; no requests to `supabase.co`.
2. Sign in with a test account → the pill shows the email; status reaches *Saved to the cloud*;
   a `game_progress` row appears.
3. Completing a level while signed in → cloud row's `updated_at` moves and the payload contains the
   new level.
4. Second browser profile, same account → on load the cloud save is restored and the game resumes at
   the right level.
5. Offline while signed in → play two levels → status *Offline — saved locally* → go online → the
   queued save lands; nothing lost, no duplicate rows.
6. Achievement unlock → row in `player_achievements`; survives reload.
7. **RLS negative tests with the anon key only:** `select` on `game_progress` without a session
   returns zero rows; `insert` with another user's `user_id` is rejected; `insert` into
   `entitlements`/`purchases` is rejected.
8. Build with no network config at all → still builds and plays; account UI hidden/disabled.
9. Re-run the whole pipeline from a fresh Unity export → both script tags and both JS files are still
   present (this is the regression that silently strips login).
10. Portrait phone viewport (390×844): the pill does not overlap HUD or play area.

**SQL:**

```sql
select id, name, version, status, play_url, runtime, save_key
from public.games where id = 'GAME_ID';

select id, name from public.achievements where game_id = 'GAME_ID' order by id;

select user_id, game_id, schema_version, updated_at,
       jsonb_typeof(data) as kind, length(data::text) as bytes,
       data->'keys'->>'unity-save' as has_blob
from public.game_progress where game_id = 'GAME_ID' order by updated_at desc limit 5;
```

**Commands:** run the repo's build and any tests (`npm run build`, `npm test`, `node
scripts/prepare-site.mjs`). Report exact commands and exit codes.

---

## 14. Deployment

- The game repo's own `.github/workflows/pages.yml` publishes to
  `https://jd4rider.github.io/<repo>/play/`. That is the canonical URL.
- No `public/CNAME`, no custom Pages domain, no second host, no Netlify/Firebase/Vercel.
- No committed `.env`. The client ships the public URL + anon key; nothing else is needed at build
  time.
- Do not push, publish, apply production migrations or change auth settings without explicit owner
  approval. Prepare, show the diff and the verification, then stop.

---

## 15. Explicit don'ts

- Don't build a second backend, proxy, Firebase project or "temporary" REST API.
- Don't store the save only in IndexedDB or only in `PlayerPrefs`; both paths must reconcile.
- Don't replace `arcade-client.js` with custom auth code, and don't reimplement token refresh.
- Don't create a `game_progress`-like table per game.
- Don't add `console.log` of save blobs, user ids or emails.
- Don't call the bridge from a background thread, and don't call `LJA_Unity_Save` every frame.
- Don't let a Unity re-export drop the two `<script>` tags.
- Don't change `littlejoyarcade`'s RLS policies or other games' rows.

---

## 16. Definition of done

Report, in this order:

1. Every file you added or changed, with the reason.
2. The migration SQL (if you added one) and whether it was applied.
3. `GAME_ID`, the `PlayerPrefs` key, the cloud key, and the full `payload` shape.
4. All save points and where they are called from.
5. Verification output from §13, plus the commands and exit codes.
6. Anything you could not verify, stated as a limitation, never as a pass.

---

## 17. One-time owner actions

- Create/confirm the test account used for sync testing.
- Grant admin on the platform to `jd4rider@gmail.com`:
  `update public.profiles set role = 'admin' where id = '<auth uid>';` (owner only).
- Approve applying the migration and publishing the build.
