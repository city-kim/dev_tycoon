---
description: Playtest dev_tycoon locally in the browser and report feel, bugs, and click-path issues.
---

Playtest the running game. Focus: $ARGUMENTS (default: core loop + first 5 minutes).

1. Start the dev server (`pnpm dev`) if not already running.
2. Use the `browser-qa` and `click-path-audit` skills to drive the game in the browser.
3. Exercise: first click → first purchase → idle accrual → save/reload (offline progress) → prestige (if reachable).
4. Report:
   - **Bugs** — anything broken, with repro steps.
   - **Feel** — does every action telegraph feedback (`.claude/rules/game/juice.md`)? Dead frames, jank, missing popups?
   - **Pacing** — did the first-purchase / idle-crossover targets hold in practice?
   - **Performance** — does the live counter cause visible re-render jank? Flag for `performance-optimizer` if so.

Local-only; no network calls expected.
