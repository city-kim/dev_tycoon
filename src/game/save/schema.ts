/** Persisted save shape. Bump SAVE_VERSION + add a migration on every change. */

export const SAVE_KEY = "dev_tycoon:save";
export const SAVE_BAK_KEY = "dev_tycoon:save.bak";
export const SAVE_VERSION = 3;

/** v1 — first persisted format (no upgrades). */
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

/** v2 — adds the upgrade tree (Phase 2). */
export interface SaveV2 extends Omit<SaveV1, "version"> {
  version: 2;
  upgrades: string[];
}

/** v3 — adds research tree + achievements (Phase 3). */
export interface SaveV3 extends Omit<SaveV2, "version"> {
  version: 3;
  research: string[];
  achievements: string[];
}

/** Union of all known save versions (for migration input typing). */
export type AnySave = SaveV1 | SaveV2 | SaveV3;
/** The current/latest save shape. */
export type LatestSave = SaveV3;
