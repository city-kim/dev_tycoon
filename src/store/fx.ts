/**
 * Tiny view-layer event bus for visual FX. Decouples action handlers (e.g.
 * the code-writing click) from the canvas without prop drilling or store
 * churn. FX-only — never carries game state.
 */
type Handler = () => void;

const codeBurstHandlers = new Set<Handler>();

/** Subscribe to code-burst pulses (canvas). Returns an unsubscribe fn. */
export function onCodeBurst(h: Handler): () => void {
  codeBurstHandlers.add(h);
  return () => codeBurstHandlers.delete(h);
}

/** Fire a code-burst pulse (called on each 코드 짜기 click). */
export function emitCodeBurst(): void {
  for (const h of codeBurstHandlers) h();
}
