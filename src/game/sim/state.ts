import type { GameState } from "../types";
import { DEVS } from "../content/devs";

/** Fresh game state (new run / first launch). */
export function createInitialState(): GameState {
  const devs: Record<string, number> = {};
  for (const d of DEVS) devs[d.id] = 0;
  return {
    loc: 0,
    won: 0,
    users: 0,
    debt: 0,
    career: 0,
    features: 0,
    totalWon: 0,
    devs,
    upgrades: [],
    research: [],
    achievements: [],
    lastSave: 0,
  };
}

/** Reset everything except career-derived progress (used by prestige). */
export function resetForPrestige(s: GameState): void {
  s.loc = 0;
  s.won = 0;
  s.users = 0;
  s.debt = 0;
  s.features = 0;
  s.totalWon = 0;
  for (const d of DEVS) s.devs[d.id] = 0;
  s.upgrades = [];
  s.research = []; // research resets with the run; achievements persist
}
