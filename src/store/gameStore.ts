/**
 * Bridges the pure sim to React.
 *
 * Performance model (see .claude/rules/game/architecture.md):
 *  - `sim` is the authoritative mutable state, advanced every frame by the
 *    rAF loop in App. It is NOT React state.
 *  - The live resource numbers read `sim` directly via their own rAF and write
 *    to refs (ResourceBar) — zero React re-renders on the hot path.
 *  - Everything else (costs, affordability, meter, log) is refreshed from a
 *    throttled `snap` snapshot (~10fps), so 60fps ticks never re-render lists.
 */
import { create } from "zustand";
import type { GameState } from "../game/types";
import { BALANCE as B } from "../game/config/balanceConfig";
import { DEVS } from "../game/content/devs";
import { createInitialState } from "../game/sim/state";
import { createBugClock, tick, type SimEvent } from "../game/sim/tick";
import * as A from "../game/sim/actions";
import {
  careerGain,
  clickPow,
  devCost,
  featureCost,
  prodMult,
  refundCost,
  usersGain,
} from "../game/sim/economy";

/** Authoritative game state singleton (mutated in place by sim + actions). */
export const sim: GameState = createInitialState();
const bug = createBugClock();

let logSeq = 0;
export interface LogEntry extends SimEvent {
  id: number;
}
const entry = (e: SimEvent): LogEntry => ({ id: ++logSeq, ...e });

export interface DevRow {
  id: string;
  emo: string;
  nm: string;
  count: number;
  cost: number;
  canAfford: boolean;
  loc: number;
  debt: number;
}

/** Throttled display snapshot for the non-counter UI. */
export interface Snapshot {
  prodMult: number;
  clickPow: number;
  featureCost: number;
  usersGain: number;
  canShip: boolean;
  refundCost: number;
  canRefactor: boolean;
  debt: number;
  debtRatio: number;
  penaltyPct: number;
  careerBonusPct: number;
  careerGain: number;
  canPrestige: boolean;
  devs: DevRow[];
}

function computeSnapshot(s: GameState): Snapshot {
  const pm = prodMult(s);
  const rc = refundCost(s);
  const fc = featureCost(s);
  const cg = careerGain(s);
  return {
    prodMult: pm,
    clickPow: clickPow(s),
    featureCost: fc,
    usersGain: usersGain(s),
    canShip: s.loc >= fc,
    refundCost: rc,
    canRefactor: s.won >= rc && s.debt >= 0.1,
    debt: s.debt,
    debtRatio: Math.min(s.debt / (B.DEBT_SOFTCAP * 2), 1),
    penaltyPct: Math.round((1 - pm) * 100),
    careerBonusPct: Math.round(B.CAREER_BONUS * s.career * 100),
    careerGain: cg,
    canPrestige: cg >= 1,
    devs: DEVS.map((d) => {
      const cost = devCost(s, d);
      return {
        id: d.id,
        emo: d.emo,
        nm: d.nm,
        count: s.devs[d.id],
        cost,
        canAfford: s.won >= cost,
        loc: d.loc,
        debt: d.debt,
      };
    }),
  };
}

interface Store {
  log: LogEntry[];
  snap: Snapshot;
  /** advance the sim by dt seconds (called every frame) */
  advance: (dt: number) => void;
  /** recompute the display snapshot (called ~10fps and after each action) */
  refresh: () => void;
  /** code-writing click → returns LoC gained (for the floating number) */
  code: () => number;
  ship: () => void;
  refactorNow: () => void;
  hire: (id: string) => void;
  prestigeNow: () => boolean;
}

function pushEvents(get: () => Store, set: (p: Partial<Store>) => void, events: SimEvent[]) {
  if (events.length === 0) return;
  const next = events.map(entry).reverse();
  set({ log: [...next, ...get().log].slice(0, 9) });
}

function logLine(get: () => Store, set: (p: Partial<Store>) => void, e: SimEvent) {
  set({ log: [entry(e), ...get().log].slice(0, 9) });
}

export const useGame = create<Store>((set, get) => ({
  log: [entry({ html: "$ npm init · 첫 코드를 짜보세요", cls: "g" })],
  snap: computeSnapshot(sim),

  advance: (dt) => {
    const events = tick(sim, dt, bug);
    pushEvents(get, set, events);
  },

  refresh: () => set({ snap: computeSnapshot(sim) }),

  code: () => {
    const gain = A.clickCode(sim);
    get().refresh();
    return gain;
  },

  ship: () => {
    const r = A.shipFeature(sim);
    if (r) logLine(get, set, { html: `🚀 기능 #${r.feature} 출시 · 유저 +${r.users}`, cls: "g" });
    get().refresh();
  },

  refactorNow: () => {
    const cleared = A.refactor(sim);
    if (cleared !== null)
      logLine(get, set, { html: `♻️ 리팩토링 완료 · 부채 ${Math.floor(cleared)} 청산`, cls: "p" });
    get().refresh();
  },

  hire: (id) => {
    const d = DEVS.find((x) => x.id === id);
    if (!d) return;
    const count = A.hireDev(sim, d);
    if (count !== null) logLine(get, set, { html: `+ ${d.nm} 채용 (${count}명)`, cls: "y" });
    get().refresh();
  },

  prestigeNow: () => {
    const gain = A.prestige(sim);
    if (gain === null) return false;
    logLine(get, set, { html: `🎓 창업! 경력 +${gain} (총 ${sim.career})`, cls: "p" });
    get().refresh();
    return true;
  },
}));
