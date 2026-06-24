# Save System Rules (dev_tycoon) — localStorage only

No server, no DB. The save is a single JSON blob in `localStorage` under a namespaced key (e.g. `dev_tycoon:save`).

## Requirements

- **Versioned schema.** Every save carries `version`. On load, run forward migrations `v(n) → v(n+1)`; never assume the latest shape.
- **Persist what matters, derive the rest.** Store counts, currencies, prestige, upgrades-owned, and a `lastSeen` epoch ms. Do not store values that the sim can recompute.
- **Offline timestamp.** On load, compute `elapsed = now − lastSeen` and route it through the offline-progress path (capped, with `offlineEfficiency`). Show the player an "while you were away…" summary.
- **Write triggers:** debounced autosave (e.g. every 10–20s), plus immediate save on `visibilitychange` (hidden) and `beforeunload`. Never save every frame.
- **Robust load:** wrap parse in try/catch; on corruption, back up the bad blob to a `:save.bak` key and start fresh rather than crashing.
- **Big numbers survive serialization.** If using a scientific/layered number type, (de)serialize it explicitly — raw `JSON.stringify` of a class instance loses methods.

## Player-facing controls (recommended)

- Manual Save / Hard Reset (with confirm).
- Export save → base64 string to clipboard; Import save ← paste. (This is the "cloud save" substitute given there's no backend.)

## Anti-patterns

- ❌ Saving on every tick. ❌ Trusting `localStorage` shape blindly. ❌ Unversioned saves. ❌ Letting offline progress exceed active play.
