/**
 * Hot-path DOM bridge for the live resource numbers.
 *
 * Instead of a second rAF loop, the ResourceBar registers its span refs here
 * and the single game loop (App) calls `updateLiveDisplay()` each frame. This
 * keeps the ticking numbers off React's render path while honoring the
 * "exactly one tick loop" rule (.claude/rules/game/architecture.md).
 */
import type { RefObject } from "react";
import { sim } from "./gameStore";
import { fmt } from "../format/number";
import { locPerSec, wonPerSec, debtPerSec } from "../game/sim/economy";
import { BALANCE as B } from "../game/config/balanceConfig";

export interface LiveRefs {
  locV: RefObject<HTMLSpanElement>;
  locR: RefObject<HTMLSpanElement>;
  wonV: RefObject<HTMLSpanElement>;
  wonR: RefObject<HTMLSpanElement>;
  usrV: RefObject<HTMLSpanElement>;
  usrR: RefObject<HTMLSpanElement>;
  dbtV: RefObject<HTMLSpanElement>;
  dbtR: RefObject<HTMLSpanElement>;
  carV: RefObject<HTMLSpanElement>;
  carR: RefObject<HTMLSpanElement>;
}

let refs: LiveRefs | null = null;

export function setLiveRefs(r: LiveRefs | null): void {
  refs = r;
}

const set = (el: HTMLSpanElement | null, text: string) => {
  if (el && el.textContent !== text) el.textContent = text;
};

/** Write the current sim numbers into the registered spans. Cheap; call/frame. */
export function updateLiveDisplay(): void {
  if (!refs) return;
  set(refs.locV.current, fmt(sim.loc));
  set(refs.locR.current, "+" + fmt(locPerSec(sim)) + "/s");
  set(refs.wonV.current, fmt(sim.won));
  set(refs.wonR.current, "+" + fmt(wonPerSec(sim)) + "/s");
  set(refs.usrV.current, fmt(sim.users));
  set(refs.usrR.current, "기능 " + sim.features + "개");
  set(refs.dbtV.current, fmt(sim.debt));
  set(refs.dbtR.current, "+" + fmt(debtPerSec(sim)) + "/s");
  set(refs.carV.current, fmt(sim.career));
  set(refs.carR.current, "전역 +" + Math.round(B.CAREER_BONUS * sim.career * 100) + "%");
}
