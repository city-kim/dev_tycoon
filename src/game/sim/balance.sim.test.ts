/**
 * Balance simulation (balance-tuner). A greedy auto-player drives the real
 * economy; we assert pacing invariants (no early dead zone, no runaway,
 * upgrades reachable, prestige attainable in a sane window). Doubles as a
 * regression guard on the tuning constants.
 */
import { describe, it, expect } from "vitest";
import { createInitialState } from "./state";
import { createBugClock, tick } from "./tick";
import * as A from "./actions";
import {
  careerGain,
  clickPow,
  devCost,
  featureCost,
  locPerSec,
  refundCost,
  wonPerSec,
} from "./economy";
import { BALANCE as B } from "../config/balanceConfig";
import { DEVS } from "../content/devs";
import { UPGRADES } from "../content/upgrades";

interface Result {
  milestones: Record<string, number | undefined>;
  endT: number;
  users: number;
  totalWon: number;
}

function simulate(maxSec: number, clicksPerSec: number, activeClickSec: number): Result {
  const s = createInitialState();
  const bug = createBugClock();
  const dt = 0.25;
  let t = 0;
  const milestones: Record<string, number | undefined> = {};
  const mark = (k: string) => {
    if (milestones[k] === undefined) milestones[k] = Math.round(t);
  };

  while (t < maxSec) {
    // active clicking phase
    if (t < activeClickSec) {
      s.loc += clickPow(s) * clicksPerSec * dt;
      s.debt += B.CLICK_DEBT * clicksPerSec * dt;
    }
    tick(s, dt, bug, () => 0.5);
    t += dt;

    // sensible auto-play: protect production (refactor) → upgrades → ship to
    // grow ₩ engine → hire devs to grow LoC.
    let guard = 0;
    let bought = true;
    while (bought && guard++ < 80) {
      bought = false;

      // 1) keep debt low so prodMult (LoC *and* ₩) stays healthy — refactor
      //    early and cheap before it spirals.
      if (s.debt > B.DEBT_SOFTCAP * 0.3 && s.won >= refundCost(s)) {
        A.refactor(s);
        bought = true;
        continue;
      }

      // keep a ₩ reserve so a refactor is always affordable (avoid spiral)
      const reserve = refundCost(s);

      // 2) cheapest affordable upgrade
      for (const u of UPGRADES) {
        if (s.upgrades.includes(u.id)) continue;
        if (u.currency === "won") {
          if (s.won - u.cost >= reserve) {
            A.buyUpgrade(s, u);
            mark("firstUpgrade");
            bought = true;
            break;
          }
        } else if (s.loc >= u.cost) {
          A.buyUpgrade(s, u);
          mark("firstUpgrade");
          bought = true;
          break;
        }
      }
      if (bought) continue;

      // 3) ship to grow users (the ₩ engine)
      if (s.loc >= featureCost(s)) {
        A.shipFeature(s);
        mark("firstFeature");
        bought = true;
        continue;
      }

      // 4) hire cheapest affordable dev (grow LoC), keeping the reserve
      let best: (typeof DEVS)[number] | null = null;
      let bestCost = Infinity;
      for (const d of DEVS) {
        const c = devCost(s, d);
        if (s.won - c >= reserve && c < bestCost) {
          bestCost = c;
          best = d;
        }
      }
      if (best) {
        A.hireDev(s, best);
        mark("firstDev");
        bought = true;
        continue;
      }
    }

    if (s.users > 0 && wonPerSec(s) > 0) mark("idleIncome");
    if (t >= activeClickSec && locPerSec(s) >= clickPow(s) * clicksPerSec) mark("idleBeatsClick");
    if (careerGain(s) >= 1) {
      mark("firstPrestige");
      break;
    }
  }

  return { milestones, endT: Math.round(t), users: s.users, totalWon: s.totalWon };
}

describe("balance simulation", () => {
  const r = simulate(6 * 3600, 5, 180);

  it("milestones (for human review)", () => {
    // eslint-disable-next-line no-console
    console.log(
      "DevTycoon balance milestones (sec):",
      r.milestones,
      "ended@",
      r.endT,
      "users",
      Math.round(r.users),
      "totalWon",
      Math.round(r.totalWon),
    );
    expect(true).toBe(true);
  });

  it("no early dead zone — a purchase happens within 60s", () => {
    const first = Math.min(
      r.milestones.firstUpgrade ?? Infinity,
      r.milestones.firstDev ?? Infinity,
      r.milestones.firstFeature ?? Infinity,
    );
    expect(first).toBeLessThanOrEqual(60);
  });

  it("upgrades are reachable in a run", () => {
    expect(r.milestones.firstUpgrade).toBeDefined();
  });

  it("idle income gets established", () => {
    expect(r.milestones.idleIncome).toBeDefined();
  });

  it("prestige is attainable but not trivial", () => {
    expect(r.milestones.firstPrestige).toBeDefined();
    expect(r.milestones.firstPrestige!).toBeGreaterThan(300); // not a runaway
    expect(r.milestones.firstPrestige!).toBeLessThanOrEqual(6 * 3600);
  });
});
