---
description: Design → balance → implement → review a new dev_tycoon game feature using the multi-agent pipeline.
---

Drive a new game feature end-to-end through the harness. Feature request: $ARGUMENTS

Run the pipeline, handing artifacts between specialists:

1. **Design** — delegate to the `game-designer` agent: define the mechanic, where it sits in the core loop, and content tables with curve *shapes*. Output explicit pacing targets.
2. **Balance** — delegate to `balance-tuner`: turn the curve shapes into concrete constants, simulate, and emit a config object. Block until the simulation passes the pacing targets.
3. **Plan** — delegate to `planner` (or `architect` for cross-cutting changes): slice the implementation into thin, verifiable steps respecting `.claude/rules/game/architecture.md`.
4. **Implement** — delegate to `react-game-engineer`: build slice by slice, typechecking/building after each.
5. **Review** — delegate to `code-reviewer` and `react-reviewer`; for hot-path changes also `performance-optimizer`.
6. **Verify** — use the `browser-qa` / `click-path-audit` skills to playtest the feature locally (`npm run dev`).

Respect the constraints: **React + Vite + TS, local-only, no server, no DB.** Report what each stage produced and stop for my input if a stage's output conflicts with the pacing budget.
