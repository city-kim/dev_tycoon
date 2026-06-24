# Game Feel / Juice Rules (dev_tycoon)

A clicker lives and dies on feedback. Every player action must produce an immediate, satisfying response. Pair with the `motion-ui` skill.

## Every click must telegraph

- Floating `+N` number popup at the cursor, drifting up and fading.
- A micro-press/scale animation on the click target (e.g. `scale(0.96)` → spring back).
- Optional particle burst / screen-edge glow on big events (purchase, milestone, prestige).

## Performance-safe juice

- Animate with CSS transforms/opacity only (GPU-composited). Never animate layout properties in the hot path.
- Particle/popup count is capped and pooled; recycle DOM nodes or use a `<canvas>` overlay for bursts.
- Respect `prefers-reduced-motion`: cut nonessential motion when set.
- Juice must never block or slow the tick loop — it's view-layer only.

## Escalation of feedback

- Small action (click) → small feedback. Big action (prestige, milestone) → big, rare, earned feedback. Don't blow the budget on every click or nothing feels special.

## Audio (optional, hooks only)

- Keep sound behind a mute toggle and lazy-load assets. Provide event hooks (`onClick`, `onBuy`, `onPrestige`) so audio is additive, not load-bearing.
