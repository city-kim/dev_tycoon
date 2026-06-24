/** Core game data shapes. Kept framework-agnostic (no React imports). */

export interface DevDef {
  id: string;
  emo: string;
  /** display name (Korean) */
  nm: string;
  /** base hire cost in ₩ */
  base: number;
  /** LoC produced per second, per unit */
  loc: number;
  /** technical debt added per second, per unit */
  debt: number;
}

export interface GameState {
  loc: number;
  won: number;
  users: number;
  debt: number;
  career: number;
  features: number;
  /** lifetime ₩ earned this run — drives prestige */
  totalWon: number;
  /** id -> owned count */
  devs: Record<string, number>;
  /** owned upgrade ids (one-time purchases; reset on prestige) */
  upgrades: string[];
  /** unlocked research node ids (tree; reset on prestige) */
  research: string[];
  /** unlocked achievement ids (permanent — survive prestige) */
  achievements: string[];
  /** epoch ms of last save (used by Phase 1 persistence) */
  lastSave: number;
}
