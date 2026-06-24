import { describe, it, expect } from "vitest";
import { createInitialState } from "../sim/state";
import { serialize, deserialize } from "./serialize";
import { migrate } from "./migrate";
import { applyOfflineProgress } from "./offline";
import { exportSave, importSave } from "./storage";
import { SAVE_VERSION } from "./schema";
import { BALANCE as B } from "../config/balanceConfig";

describe("serialize", () => {
  it("round-trips a state", () => {
    const s = createInitialState();
    s.loc = 123;
    s.won = 456;
    s.users = 7;
    s.debt = 8.5;
    s.career = 2;
    s.features = 4;
    s.totalWon = 99999;
    s.devs.jr = 5;
    s.devs.sr = 1;
    const back = deserialize(serialize(s));
    expect(back).toEqual(s);
  });

  it("tolerates missing fields and unknown dev ids", () => {
    const back = deserialize({
      version: 1,
      lastSave: 0,
      loc: 10,
      // most fields missing
      devs: { jr: 3, ghost: 99 },
    } as never);
    expect(back.loc).toBe(10);
    expect(back.won).toBe(0);
    expect(back.devs.jr).toBe(3);
    expect((back.devs as Record<string, number>).ghost).toBeUndefined();
  });
});

describe("migrate", () => {
  it("accepts the current version", () => {
    const s = serialize(createInitialState());
    expect(migrate(s).version).toBe(SAVE_VERSION);
  });
  it("rejects junk and unknown versions", () => {
    expect(() => migrate(null)).toThrow();
    expect(() => migrate({})).toThrow();
    expect(() => migrate({ version: 999 })).toThrow();
  });
});

describe("offline progress", () => {
  it("returns null below the minimum gap", () => {
    const s = createInitialState();
    s.devs.jr = 10;
    expect(applyOfflineProgress(s, B.OFFLINE_MIN_SEC - 1)).toBeNull();
  });

  it("earns capped, efficiency-scaled production and full debt", () => {
    const s = createInitialState();
    s.devs.jr = 10; // 3 LoC/s, 0.5 debt/s
    s.users = 100; // 100 ₩/s
    const r = applyOfflineProgress(s, 3600)!; // 1h < cap
    expect(r.seconds).toBe(3600);
    expect(r.loc).toBeCloseTo(3 * 3600 * B.OFFLINE_EFFICIENCY, 3);
    expect(r.debt).toBeCloseTo(0.5 * 3600, 3); // full, no efficiency
    expect(s.totalWon).toBeCloseTo(r.won, 3);
  });

  it("caps very long absences", () => {
    const s = createInitialState();
    s.devs.jr = 1;
    const r = applyOfflineProgress(s, 99 * 3600)!;
    expect(r.seconds).toBe(B.OFFLINE_CAP_SEC);
  });
});

describe("export / import", () => {
  it("round-trips through base64", () => {
    const s = createInitialState();
    s.loc = 42;
    s.career = 3;
    s.devs.sr = 2;
    const code = exportSave(s);
    const back = importSave(code)!;
    expect(back.loc).toBe(42);
    expect(back.career).toBe(3);
    expect(back.devs.sr).toBe(2);
  });

  it("returns null on garbage", () => {
    expect(importSave("not-valid-base64-$$$")).toBeNull();
    expect(importSave("")).toBeNull();
  });
});
