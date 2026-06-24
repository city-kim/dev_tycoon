# Game Architecture Rules (dev_tycoon)

Local-only React + Vite + TS clicker game. **No server, no DB.** All state is client-side; persistence is `localStorage`.

## State

- **Single source of truth.** One game store (Zustand recommended, or `useReducer`). No duplicated derived state in components.
- **Pure simulation layer.** Economy math (`src/game/sim/`) is framework-agnostic, deterministic given `(state, deltaMs)`, and unit-testable without React.
- **Separate model from view.** Components subscribe to slices/selectors; they never mutate raw numbers directly.

## The Tick Loop

- Exactly **one** `requestAnimationFrame` loop. Compute `deltaMs` between frames; advance the sim by delta. Never one `setInterval` per generator.
- Clamp delta (e.g. tab was backgrounded) so a huge frame gap doesn't desync; route large gaps through the **offline-progress** path instead.
- The sim ticks every frame; the **display** refresh is throttled (~10–30 fps) and decoupled from the sim tick.

## Rendering Discipline

- The live currency counter is an isolated leaf component. A per-frame number must not re-render generator lists, the upgrade shop, or the layout.
- Memoize lists; key by stable ids. Selectors return primitives where possible to avoid reference churn.

## Numbers

- Currencies can exceed `Number.MAX_SAFE_INTEGER`. Use a big-number representation (scientific/layered) for currency and costs once growth is exponential. Format for display (`1.23e9`, `1.23K/M/B/T`).

## Save / Load

- See `save-system.md`. Versioned schema, migrations, debounced writes, offline timestamp.

## Folder Convention

```
src/
  game/
    sim/            # pure economy: tick, cost, production, prestige
    config/         # balance constants (from balance-tuner)
    content/        # generators, upgrades, achievements tables (from game-designer)
    save/           # serialize, migrate, offline-progress
  store/            # game store + selectors
  components/       # UI (leaf counter, shop, generators, prestige panel)
  format/           # number formatting
```
