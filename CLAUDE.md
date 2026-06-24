# dev_tycoon — Multi-Agent Harness

A developer-themed **clicker / idle web game**. Click to ship code → earn money → hire devs & buy tools → automate → prestige.

> Harness imported & adapted from the [ECC](https://github.com/affaan-m/ECC) framework, then specialized for this game.

## Hard Constraints (never violate)

- **Stack:** React + Vite + TypeScript.
- **Local-only. No server. No database.** All state is client-side; persistence is `localStorage`. The only "network" feature allowed is save export/import via copy-paste strings.
- Anything that would require a backend (accounts, leaderboards, cloud save, telemetry) is **out of scope** unless explicitly re-approved.

## How this harness works

Work is decomposed across specialist subagents. Orchestrate with the `Agent` tool (or the slash commands below). Default pipeline for any game feature:

```
game-designer → balance-tuner → planner/architect → react-game-engineer → code-reviewer + react-reviewer (+ performance-optimizer) → playtest
```

Hand concrete artifacts between stages (design tables → constants → plan → code → review → playtest). Don't skip balancing: numbers come from simulation, never vibes.

### Agent roster

**Game specialists (custom)**
- `game-designer` — mechanics, content tables, progression & pacing. Design only, no code.
- `balance-tuner` — derives & simulates exact economy constants against pacing targets.
- `react-game-engineer` — implements the store, tick loop, components, persistence in React+TS.

**Engineering (imported from ECC)**
- `planner` — break work into thin, verifiable steps.
- `architect` — system/state design for cross-cutting changes.
- `code-explorer` — fast codebase navigation / "where is X".
- `code-reviewer` — general review (quality, security, maintainability).
- `react-reviewer` — React-specific review.
- `code-simplifier` — reduce complexity after a feature lands.
- `build-error-resolver` — fix build/type errors.
- `performance-optimizer` — hot-path / render performance (critical for the tick loop).
- `e2e-runner` — end-to-end test execution.
- `doc-updater` — keep docs in sync.

### Slash commands

- `/feature <desc>` — run the full design→balance→implement→review pipeline.
- `/balance [scope]` — simulate & tune the economy.
- `/playtest [focus]` — drive the running game in the browser and report.

### Skills

Game-specific: `clicker-economy-math`, `idle-game-loop`, `localstorage-save-system`.
Imported (ECC): `react-patterns`, `react-performance`, `react-testing`, `frontend-patterns`, `frontend-design-direction`, `design-system`, `motion-ui`, `browser-qa`, `click-path-audit`, `agent-harness-construction`.

## Rules (read before coding)

- Game: `.claude/rules/game/architecture.md`, `balance.md`, `save-system.md`, `juice.md`
- Stack: `.claude/rules/react/*`, `.claude/rules/typescript/*`, `.claude/rules/web/*`
- Cross-cutting: `.claude/rules/common/*`

The non-negotiables: single source of truth for state; **one** delta-timed `requestAnimationFrame` tick loop (no per-generator timers); the live counter must not re-render the whole tree; balance constants live in `src/game/config/` and are imported by a pure, testable sim layer.

## Target folder layout (once scaffolding begins)

```
src/
  game/{sim,config,content,save}/   # pure economy, constants, content tables, persistence
  store/                            # game store + selectors
  components/                       # leaf counter, shop, generators, prestige panel
  format/                           # number formatting
```

## Verify

`pnpm build` (typecheck) must pass before review. Playtest locally with `pnpm dev` and the `/playtest` command. No network requests should appear in the console.

**Package manager: pnpm** (see `pnpm-workspace.yaml`). Use `pnpm install` / `pnpm dev` / `pnpm build` / `pnpm test` — not npm. `package-lock.json` is gitignored.

## Deploy

Pushing to `main` auto-deploys to **GitHub Pages** via `.github/workflows/deploy.yml` (pnpm install → `pnpm build` → upload `dist/` → deploy). Live at https://city-kim.github.io/dev_tycoon/. This is **static hosting only** — it serves the built client, so the "no server / no DB" constraint still holds. `base: "./"` keeps the build working both on the Pages subpath and via local file open. One-time repo setup: Settings → Pages → Source = GitHub Actions.
