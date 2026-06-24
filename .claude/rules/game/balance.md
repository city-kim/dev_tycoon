# Balance Rules (dev_tycoon)

Owned by `balance-tuner`. Constants live in `src/game/config/` and are imported by the pure sim — never hard-coded inside components.

## Canonical formulas

- **Cost scaling (geometric):** `cost(n) = baseCost * growth^n`, `growth ∈ [1.07, 1.15]`.
- **Bulk buy** of `k` starting from owning `n`: `baseCost * growth^n * (growth^k − 1) / (growth − 1)`.
- **Production/sec:** `Σ count_i * baseRate_i * Π multipliers` (global, per-generator, prestige).
- **Prestige currency (sublinear):** `floor(C * sqrt(lifetimeEarnings / K))`.
- **Prestige global multiplier:** `1 + prestige * b` (or a `pow` curve for steeper meta-progression).
- **Offline gain:** `min(elapsedSec, capSec) * idleRatePerSec * offlineEfficiency`, `offlineEfficiency < 1`.

## Health invariants (must hold; verify by simulation)

- **No dead zones:** something meaningful to buy at least every ~2 min in early game.
- **No runaway:** no single upgrade trivializes the run; multipliers stack predictably.
- **Idle crossover:** idle income overtakes active clicking within the designer's target window.
- **Prestige is worth it:** run 2 reaches the previous wall at least ~2× faster.
- **Offline is a bonus, not the game:** capped so active play always dominates.

## Process

- Every constant change must be justified by a simulation (throwaway script) printing milestone times vs the pacing budget. Do not hand-tune blind.
- Keep numbers in one config object with a comment per field explaining its gameplay role and the knob direction ("raise → slower wall").
