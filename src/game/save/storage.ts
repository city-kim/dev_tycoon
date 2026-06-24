/** localStorage read/write for the save blob. Defensive: never throws to callers. */
import type { GameState } from "../types";
import { SAVE_BAK_KEY, SAVE_KEY } from "./schema";
import { migrate } from "./migrate";
import { deserialize, serialize } from "./serialize";

function hasStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

/** Persist current state. Stamps lastSave = now. Returns success. */
export function saveState(s: GameState, now: number): boolean {
  if (!hasStorage()) return false;
  try {
    s.lastSave = now;
    localStorage.setItem(SAVE_KEY, JSON.stringify(serialize(s)));
    return true;
  } catch {
    return false;
  }
}

/**
 * Load persisted state, migrating as needed. Returns null if absent or
 * unreadable; a corrupt blob is backed up to SAVE_BAK_KEY before bailing.
 */
export function loadState(): GameState | null {
  if (!hasStorage()) return null;
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return deserialize(migrate(JSON.parse(raw)));
  } catch {
    try {
      localStorage.setItem(SAVE_BAK_KEY, raw);
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

/** Remove the save (hard reset). */
export function clearSave(): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

/** Export current state as a portable base64 string (the "cloud save" stand-in). */
export function exportSave(s: GameState): string {
  const json = JSON.stringify(serialize(s));
  // Unicode-safe base64.
  return btoa(unescape(encodeURIComponent(json)));
}

/** Parse an exported string back into GameState. Returns null if invalid. */
export function importSave(text: string): GameState | null {
  try {
    const json = decodeURIComponent(escape(atob(text.trim())));
    return deserialize(migrate(JSON.parse(json)));
  } catch {
    return null;
  }
}
