import type { GameState } from "../types";
import { DEVS } from "../content/devs";
import { createInitialState } from "../sim/state";
import { SAVE_VERSION, type LatestSave } from "./schema";

/** GameState → save blob. */
export function serialize(s: GameState): LatestSave {
  const devs: Record<string, number> = {};
  for (const d of DEVS) devs[d.id] = s.devs[d.id] ?? 0;
  return {
    version: SAVE_VERSION,
    lastSave: s.lastSave,
    loc: s.loc,
    won: s.won,
    users: s.users,
    debt: s.debt,
    career: s.career,
    features: s.features,
    totalWon: s.totalWon,
    devs,
    upgrades: [...s.upgrades],
    research: [...s.research],
    achievements: [...s.achievements],
    autoRefactor: s.autoRefactor,
  };
}

const num = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

/**
 * Save blob → GameState. Tolerant: missing fields fall back to a fresh game's
 * defaults, unknown dev ids are dropped, and dev ids added since the save are
 * initialized to 0 (so adding content never breaks old saves).
 */
export function deserialize(data: LatestSave): GameState {
  const base = createInitialState();
  const devs: Record<string, number> = {};
  for (const d of DEVS) devs[d.id] = num(data.devs?.[d.id]);
  return {
    loc: num(data.loc),
    won: num(data.won),
    users: num(data.users),
    debt: num(data.debt),
    career: num(data.career),
    features: num(data.features),
    totalWon: num(data.totalWon),
    devs,
    upgrades: strArray(data.upgrades),
    research: strArray(data.research),
    achievements: strArray(data.achievements),
    autoRefactor: typeof data.autoRefactor === "boolean" ? data.autoRefactor : false,
    lastSave: num(data.lastSave, base.lastSave),
  };
}

const strArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
