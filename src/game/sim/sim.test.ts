import { describe, it, expect } from "vitest";
import { createInitialState } from "./state";
import { createBugClock, tick } from "./tick";
import { clickCode, hireDev, shipFeature, refactor, prestige } from "./actions";
import {
  careerGain,
  clickPow,
  devCost,
  featureCost,
  locPerSec,
  prodMult,
  wonPerSec,
} from "./economy";
import { DEVS } from "../content/devs";
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

describe("fmt", () => {
  it("formats across magnitudes", () => {
    expect(fmt(0)).toBe("0");
    expect(fmt(42)).toBe("42");
    expect(fmt(1500)).toBe("1.50K");
    expect(fmt(2_300_000)).toBe("2.30M");
    expect(fmt(-1500)).toBe("-1.50K");
  });
});
