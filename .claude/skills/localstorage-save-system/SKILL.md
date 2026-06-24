---
name: localstorage-save-system
description: Versioned localStorage save/load with migrations, offline-progress timestamp, debounced writes, and export/import — for a backend-less clicker game. Use when implementing dev_tycoon persistence.
metadata:
  origin: dev_tycoon
---

# localStorage Save System (no backend)

## Shape

```ts
const KEY = "dev_tycoon:save";
const SAVE_VERSION = 3;

interface SaveV3 {
  version: number;
  lastSeen: number;        // epoch ms — drives offline progress
  money: string;           // serialized big number
  generators: Record<string, number>;
  upgrades: string[];
  prestige: number;
  lifetimeEarnings: string;
}
```

## Load (defensive + migrate + offline)

```ts
function load(): GameState {
  const raw = localStorage.getItem(KEY);
  if (!raw) return newGame();
  try {
    let data = JSON.parse(raw);
    data = migrate(data);                 // v(n) -> v(n+1) until SAVE_VERSION
    const state = deserialize(data);      // rebuild big-number instances
    applyOfflineProgress(state, Date.now() - data.lastSeen); // capped, efficiency<1
    return state;
  } catch (e) {
    localStorage.setItem(KEY + ".bak", raw); // never lose a corrupt save silently
    return newGame();
  }
}
```

## Write (debounced + lifecycle)

- Autosave on a debounced timer (10–20s), **not** every frame.
- Force a save on `document.visibilitychange` (when `hidden`) and `beforeunload` — this is when players actually leave.
- Always stamp `lastSeen = Date.now()` at write time.

## Migrations

`migrate(data)` is a switch on `data.version` that incrementally transforms old saves forward. Every schema change bumps `SAVE_VERSION` and adds one migration step. Test with real old-version blobs.

## Export / Import (the "cloud save" substitute)

- Export: `btoa(JSON.stringify(save))` → copy to clipboard.
- Import: `JSON.parse(atob(text))` → validate → migrate → load. Guard with try/catch and a confirm dialog (overwrites current run).

See `.claude/rules/game/save-system.md`.
