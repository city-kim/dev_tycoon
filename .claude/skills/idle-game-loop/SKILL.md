---
name: idle-game-loop
description: How to build a single delta-timed requestAnimationFrame tick loop for an idle/clicker game in React without thrashing re-renders. Use when implementing or debugging dev_tycoon's update loop.
metadata:
  origin: dev_tycoon
---

# Idle Game Loop

One loop, delta-timed, decoupled from React's render cycle.

## The loop

```ts
let last = performance.now();
let rafId = 0;

function frame(now: number) {
  let dt = now - last;
  last = now;
  // Clamp pathological gaps (tab backgrounded); route real gaps via offline-progress on load.
  dt = Math.min(dt, 250);
  sim.tick(dt);            // pure: advances currencies, applies production
  rafId = requestAnimationFrame(frame);
}
rafId = requestAnimationFrame(frame);
// cleanup: cancelAnimationFrame(rafId)
```

## Key rules

- **Sim ≠ render.** `sim.tick` mutates the store/model every frame. The UI subscribes and is throttled separately (~10–30 fps for the live counter) so 60fps ticks don't trigger 60fps full re-renders.
- **Isolate the hot counter.** Put the ticking number in a tiny leaf component reading a single selector. Generator lists / shop subscribe to *counts*, not the live currency.
- **Use delta, not fixed assumptions.** Never assume 16.6ms; frame rate varies. Multiply rates by `dt/1000`.
- **Backgrounded tabs throttle rAF.** Don't rely on the loop running while hidden — handle the gap as offline progress when the tab returns (`visibilitychange`).
- **Determinism for tests.** `sim.tick(dt)` is pure given `(state, dt)`; unit-test it by feeding fixed deltas — no real timers.

## Anti-patterns

- ❌ `setInterval` per generator. ❌ Storing currency in React state and `setState` every frame. ❌ Unclamped delta. ❌ Doing offline catch-up inside the rAF loop instead of on load.

See `.claude/rules/game/architecture.md`.
