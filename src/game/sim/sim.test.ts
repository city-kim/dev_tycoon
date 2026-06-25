import { describe, it, expect } from "vitest";
import { createInitialState } from "./state";
import { createBugClock, tick } from "./tick";
import { buyResearch, buyUpgrade, clickCode, hireDev, shipFeature, refactor, prestige } from "./actions";
import {
  achievementMult,
  careerGain,
  clickPow,
  devCost,
  featureCost,
  locPerSec,
  prodMult,
  researchMods,
  usersGain,
  wonPerSec,
} from "./economy";
import { DEVS } from "../content/devs";
import { getResearch } from "../content/research";
import { getUpgrade } from "../content/upgrades";
import { newlyUnlocked } from "../content/achievements";
import { CRISIS_EVENT } from "../content/events";
import { BALANCE as B } from "../config/balanceConfig";
import { fmt } from "../../format/number";

describe("economy", () => {
  it("starts empty and idle", () => {
    const s = createInitialState();
    expect(locPerSec(s)).toBe(0);
    expect(wonPerSec(s)).toBe(0);
    expect(prodMult(s)).toBe(1);
    expect(clickPow(s)).toBe(1);
  });

  it("debt reduces productivity (softcap)", () => {
    const s = createInitialState();
    s.debt = 120; // == softcap
    expect(prodMult(s)).toBeCloseTo(0.5, 5);
  });

  it("career gives a global multiplier and click power", () => {
    const s = createInitialState();
    s.career = 10;
    expect(clickPow(s)).toBeCloseTo((1 + 10) * 1.2, 5);
  });

  it("dev and feature costs grow geometrically", () => {
    const s = createInitialState();
    const jr = DEVS[0];
    expect(devCost(s, jr)).toBe(jr.base);
    s.devs[jr.id] = 1;
    expect(devCost(s, jr)).toBe(Math.floor(jr.base * 1.15));
    expect(featureCost(s)).toBe(8);
    s.features = 2;
    expect(featureCost(s)).toBe(Math.floor(8 * Math.pow(1.55, 2)));
  });
});

describe("actions", () => {
  it("clickCode adds LoC and a little debt", () => {
    const s = createInitialState();
    const gain = clickCode(s);
    expect(gain).toBe(1);
    expect(s.loc).toBe(1);
    expect(s.debt).toBeCloseTo(0.03, 5);
  });

  it("shipFeature requires enough LoC, then adds users", () => {
    const s = createInitialState();
    expect(shipFeature(s)).toBeNull();
    s.loc = 8;
    const r = shipFeature(s);
    // usersGain is computed after features++, so feature #1 → ceil(1 + 1*0.15) = 2
    expect(r).toEqual({ feature: 1, users: 2 });
    expect(s.users).toBe(2);
    expect(s.loc).toBe(0);
  });

  it("hireDev spends ₩ and increments count", () => {
    const s = createInitialState();
    s.won = 20;
    const jr = DEVS[0];
    expect(hireDev(s, jr)).toBe(1);
    expect(s.won).toBe(5);
    expect(hireDev(s, jr)).toBeNull(); // 17 > 5
  });

  it("refactor clears all debt for a ₩ cost", () => {
    const s = createInitialState();
    s.debt = 40;
    s.won = 1000;
    const cleared = refactor(s);
    expect(cleared).toBe(40);
    expect(s.debt).toBe(0);
    expect(s.won).toBe(1000 - 200); // max(50, 40*5)
  });

  it("prestige needs lifetime earnings, grants career, resets run", () => {
    const s = createInitialState();
    expect(prestige(s)).toBeNull();
    s.totalWon = 1e6;
    s.loc = 999;
    s.devs.jr = 3;
    expect(careerGain(s)).toBe(1);
    expect(prestige(s)).toBe(1);
    expect(s.career).toBe(1);
    expect(s.loc).toBe(0);
    expect(s.devs.jr).toBe(0);
  });
});

describe("tick", () => {
  it("accrues LoC/₩/debt from owned devs and users over dt", () => {
    const s = createInitialState();
    s.devs.jr = 10; // 10 * 0.3 = 3 LoC/s
    s.users = 5; // 5 ₩/s
    const bug = createBugClock();
    tick(s, 1, bug, () => 0);
    expect(s.loc).toBeCloseTo(3, 5);
    expect(s.won).toBeCloseTo(5, 5);
    expect(s.totalWon).toBeCloseTo(5, 5);
    expect(s.debt).toBeCloseTo(10 * 0.05, 5);
  });

  it("fires a bug event when over softcap and timer elapses", () => {
    const s = createInitialState();
    s.debt = 200; // over softcap
    const bug = createBugClock();
    const events = tick(s, 999, bug, () => 0); // rng()=0 -> nextAt=5, elapsed 999>5
    expect(events.length).toBe(1);
    expect(events[0].cls).toBe("r");
    expect(s.debt).toBeGreaterThan(200);
  });
});

describe("debt floor (death-spiral fix)", () => {
  it("prodMult never drops below PROD_FLOOR", () => {
    const s = createInitialState();
    s.debt = 1e9;
    expect(prodMult(s)).toBe(B.PROD_FLOOR);
    s.debt = 0;
    expect(prodMult(s)).toBe(1);
  });
});

describe("debt-followability devices", () => {
  it("refactor fully clears when ₩ suffices", () => {
    const s = createInitialState();
    s.debt = 40;
    s.won = 1000;
    expect(refactor(s)).toBe(40);
    expect(s.debt).toBe(0);
    expect(s.won).toBe(1000 - 40 * B.REFUND_MULT);
  });

  it("refactor does a partial clear when ₩ is insufficient (income always chips debt)", () => {
    const s = createInitialState();
    s.debt = 100;
    s.won = 200; // only enough for 200/5 = 40 debt
    expect(refactor(s)).toBe(40);
    expect(s.debt).toBe(60);
    expect(s.won).toBe(0);
  });

  it("auto-refactor spends income to reduce debt only when enabled", () => {
    const on = createInitialState();
    on.users = 100;
    on.debt = 50;
    on.autoRefactor = true;
    const off = createInitialState();
    off.users = 100;
    off.debt = 50;
    tick(on, 1, createBugClock(), () => 0.5);
    tick(off, 1, createBugClock(), () => 0.5);
    expect(off.debt).toBe(50); // no devs → debt unchanged when auto off
    expect(on.debt).toBeLessThan(50); // auto chipped it
    expect(on.won).toBeLessThan(off.won); // ...by spending ₩
  });

  it("crisis event: both options resolve debt (always escapable)", () => {
    const a = createInitialState();
    a.debt = 5000;
    a.won = 1000;
    CRISIS_EVENT.options[0].apply(a); // 비상 대응팀: ₩40% 소모, 전액 청산
    expect(a.debt).toBe(0);
    expect(a.won).toBe(600);

    const b = createInitialState();
    b.debt = 5000;
    b.users = 100;
    CRISIS_EVENT.options[1].apply(b); // 서비스 동결: 부채 −90%, 유저 −20%
    expect(b.debt).toBeCloseTo(500, 5);
    expect(b.users).toBe(80);
  });
});

describe("upgrades (Phase 2)", () => {
  it("buyUpgrade gates on funds and applies click multiplier", () => {
    const s = createInitialState();
    const clk1 = getUpgrade("clk1")!; // 50 LoC, click ×2
    expect(buyUpgrade(s, clk1)).toBe(false);
    s.loc = 50;
    expect(buyUpgrade(s, clk1)).toBe(true);
    expect(s.loc).toBe(0);
    expect(clickPow(s)).toBe(2); // base 1 × 2
    expect(buyUpgrade(s, clk1)).toBe(false); // no double-buy
  });
});

describe("research (Phase 3)", () => {
  it("requires prerequisites and ₩", () => {
    const s = createInitialState();
    const growth = getResearch("r_growth")!; // requires r_lean
    s.won = 1e9;
    expect(buyResearch(s, growth)).toBe(false); // prereq missing
    expect(buyResearch(s, getResearch("r_lean")!)).toBe(true);
    expect(buyResearch(s, growth)).toBe(true);
  });

  it("applies feature-cost discount, user multiplier, and debt decay", () => {
    const s = createInitialState();
    const base = featureCost(s);
    s.research = ["r_lean"]; // featureCost ×0.6
    expect(featureCost(s)).toBe(Math.floor(base * 0.6));

    s.features = 10;
    s.research = ["r_lean", "r_growth"]; // users ×2
    expect(usersGain(s)).toBe(Math.ceil((1 + 10 * B.USERS_PER_FEATURE) * 2));

    s.research = ["r_observ", "r_autoref"]; // debt -6/s
    s.debt = 100;
    const bug = createBugClock();
    tick(s, 1, bug, () => 0.5);
    expect(researchMods(s).debtDecay).toBe(6);
    expect(s.debt).toBeLessThan(100); // decayed (no devs adding debt)
  });

  it("autocode adds LoC independent of debt penalty", () => {
    const s = createInitialState();
    s.research = ["r_lean", "r_growth", "r_autocode"]; // +60 LoC/s
    s.debt = 1e9; // prodMult floored
    const bug = createBugClock();
    tick(s, 1, bug, () => 0.5);
    expect(s.loc).toBeGreaterThan(50); // autocode flows despite debt
  });
});

describe("achievements (Phase 3)", () => {
  it("unlock by condition and grant a global multiplier; survive prestige", () => {
    const s = createInitialState();
    s.loc = 1000;
    const got = newlyUnlocked(s);
    expect(got).toContain("a_loc1k");
    s.achievements = ["a_loc1k", "a_users50"];
    expect(achievementMult(s)).toBeCloseTo(1.02, 5);

    // prestige resets the run but keeps achievements
    s.totalWon = 1e6;
    prestige(s);
    expect(s.achievements).toEqual(["a_loc1k", "a_users50"]);
    expect(s.research).toEqual([]);
    expect(s.upgrades).toEqual([]);
  });
});

describe("fmt", () => {
  it("formats across magnitudes", () => {
    expect(fmt(0)).toBe("0");
    expect(fmt(42)).toBe("42");
    expect(fmt(1500)).toBe("1.50K");
    expect(fmt(2_300_000)).toBe("2.30M");
    expect(fmt(-1500)).toBe("-1.50K");
  });
});
