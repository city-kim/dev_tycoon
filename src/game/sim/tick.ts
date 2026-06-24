/**
 * The single source of forward simulation. `tick` advances the economy by
 * `dt` seconds and is pure given (state, dt, bug) — deterministic enough to
 * unit-test by feeding fixed deltas (randomness is isolated to bug events and
 * injectable for tests).
 */
import type { GameState } from "../types";
import { BALANCE as B } from "../config/balanceConfig";
import { locPerSec, wonPerSec, debtPerSec, researchMods } from "./economy";

export interface BugClock {
  /** seconds accumulated toward the next possible bug roll */
  timer: number;
  /** seconds until the next bug fires once over softcap */
  nextAt: number;
}

export function createBugClock(): BugClock {
  return { timer: 0, nextAt: 0 };
}

/** A log line emitted by the sim (e.g. a bug event). */
export interface SimEvent {
  html: string;
  cls?: string;
}

/**
 * Advance the economy by dt seconds. Mutates `s` in place and returns any
 * log events produced this tick.
 *
 * @param rng injectable RNG (defaults to Math.random) so tests are deterministic.
 */
export function tick(
  s: GameState,
  dt: number,
  bug: BugClock,
  rng: () => number = Math.random,
): SimEvent[] {
  const events: SimEvent[] = [];

  const research = researchMods(s);

  s.loc += locPerSec(s) * dt;
  const w = wonPerSec(s) * dt;
  s.won += w;
  s.totalWon += w;
  s.debt += debtPerSec(s) * dt;

  // 연구: 자동 리팩토링 봇 — 부채 자동 감소
  if (research.debtDecay > 0 && s.debt > 0) {
    s.debt = Math.max(0, s.debt - research.debtDecay * dt);
  }

  // 부채가 임계치를 넘으면 가끔 버그 이벤트(연출 + 페널티, 연구로 피해 경감)
  if (s.debt > B.DEBT_SOFTCAP) {
    bug.timer += dt;
    if (bug.nextAt === 0) bug.nextAt = 5 + rng() * 5;
    if (bug.timer > bug.nextAt) {
      bug.timer = 0;
      bug.nextAt = 5 + rng() * 5;
      const spike = s.debt * 0.04 * research.bugMult;
      s.debt += spike;
      events.push({ html: `🐛 버그 발생 · 부채 +${Math.floor(spike)}`, cls: "r" });
    }
  } else {
    bug.timer = 0;
    bug.nextAt = 0;
  }

  return events;
}
