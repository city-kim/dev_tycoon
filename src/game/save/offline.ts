import type { GameState } from "../types";
import { BALANCE as B } from "../config/balanceConfig";
import { locPerSec, wonPerSec, debtPerSec } from "../sim/economy";

export interface OfflineSummary {
  /** capped seconds away */
  seconds: number;
  loc: number;
  won: number;
  debt: number;
}

/**
 * Apply offline progress for `elapsedSec` of real absence. Production is earned
 * at the load-time rate, capped and scaled by OFFLINE_EFFICIENCY so active play
 * always dominates; debt accrues in full (no mercy — 빠르게 짜고 비싸게 갚는다).
 * Mutates `s`. Returns a summary, or null if the gap is too short to report.
 */
export function applyOfflineProgress(s: GameState, elapsedSec: number): OfflineSummary | null {
  if (!Number.isFinite(elapsedSec) || elapsedSec < B.OFFLINE_MIN_SEC) return null;

  const capped = Math.min(elapsedSec, B.OFFLINE_CAP_SEC);
  const eff = B.OFFLINE_EFFICIENCY;

  const loc = locPerSec(s) * capped * eff;
  const won = wonPerSec(s) * capped * eff;
  const debt = debtPerSec(s) * capped;

  s.loc += loc;
  s.won += won;
  s.totalWon += won;
  s.debt += debt;

  if (loc <= 0 && won <= 0 && debt <= 0) return null;
  return { seconds: capped, loc, won, debt };
}
