---
description: Run a balance pass on dev_tycoon's economy — simulate and tune constants against pacing targets.
---

Invoke the `balance-tuner` agent to audit and tune the economy. Scope: $ARGUMENTS (default: the whole economy).

The agent must:
1. Read current constants from `src/game/config/` and the targets in `.claude/rules/game/balance.md`.
2. Write/run a throwaway simulation (Bash + Node/TS) that fast-forwards the economy at the expected click rate.
3. Print a milestone → time table with pass/fail vs the pacing budget, plus the idle-overtakes-click point and first-prestige time.
4. Propose adjusted constants (ready to paste) and re-simulate to confirm the targets are met.
5. Report which knob fixes "too slow / too fast / too grindy".

Use the `clicker-economy-math` skill for the formulas. Do not hand-tune without a simulation.
