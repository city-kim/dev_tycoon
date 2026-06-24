---
name: clicker-economy-math
description: Formulas and tuning recipes for clicker/idle game economies — cost scaling, bulk buys, production, prestige, and offline progress. Use when designing or balancing dev_tycoon's numbers.
metadata:
  origin: dev_tycoon
---

# Clicker Economy Math

Use this when deriving or sanity-checking the numbers behind generators, upgrades, prestige, and offline gains.

## Cost scaling

Geometric growth is the genre standard:

```
cost(n)      = baseCost * growth^n           // price of the (n+1)-th unit, owning n
costBulk(n,k)= baseCost * growth^n * (growth^k - 1) / (growth - 1)   // buy k at once
maxAffordable(n, money) = floor( log( money*(growth-1)/(baseCost*growth^n) + 1 ) / log(growth) )
```

- `growth ≈ 1.07` feels generous; `≈ 1.15` builds a hard wall. Tune per generator.

## Production

```
perSec = Σ_i ( count_i * baseRate_i ) * globalMult * prestigeMult
```

Keep multipliers multiplicative and explicit; additive-vs-multiplicative confusion is the #1 balance bug.

## Prestige (the reset layer)

```
prestigeGain = floor( C * sqrt( lifetimeEarnings / K ) )   // sublinear → diminishing
globalMult   = 1 + prestige * b                            // linear meta-bonus
```

Goal: each prestige should let the player blow past the prior wall ≥2× faster, or it isn't worth the reset.

## Offline progress

```
gain = min(elapsedSec, capSec) * idleRatePerSec * offlineEfficiency   // efficiency < 1
```

Cap it (e.g. a few hours) so active play stays dominant.

## How to tune (don't guess)

1. Pick pacing targets (first buy <10s, idle-overtakes-click <5min, first prestige 30–60min).
2. Write a throwaway sim that steps the economy at the expected click rate and prints time-to-each-milestone.
3. Adjust `baseCost`, `growth`, `baseRate`, `C/K/b` until milestone times match targets.
4. Re-check health invariants: no dead zones, no runaway, prestige worth it.

See `.claude/rules/game/balance.md` and the `balance-tuner` agent.
