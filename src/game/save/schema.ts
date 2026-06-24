/** Persisted save shape. Bump SAVE_VERSION + add a migration on every change. */

export const SAVE_KEY = "dev_tycoon:save";
export const SAVE_BAK_KEY = "dev_tycoon:save.bak";
export const SAVE_VERSION = 1;

/** v1 — first persisted format (mirrors GameState, all numbers native). */
export interface SaveV1 {
  version: 1;
  lastSave: number;
  loc: number;
  won: number;
  users: number;
  debt: number;
  career: number;
  features: number;
  totalWon: number;
  devs: Record<string, number>;
}

/** Union of all known save versions (for migration input typing). */
export type AnySave = SaveV1;
/** The current/latest save shape. */
export type LatestSave = SaveV1;
