import { SAVE_VERSION, type AnySave, type LatestSave } from "./schema";

/**
 * Forward-migrate a parsed save to the latest version. Each version bump adds
 * one `case` that transforms v(n) → v(n+1). Unknown/future versions throw so
 * the loader can fall back to a fresh game rather than corrupting state.
 */
export function migrate(raw: unknown): LatestSave {
  if (!raw || typeof raw !== "object") throw new Error("save: not an object");
  let data = raw as AnySave & { version?: number };
  if (typeof data.version !== "number") throw new Error("save: missing version");

  while (data.version < SAVE_VERSION) {
    switch (data.version) {
      case 1:
        // v1 → v2: introduce the upgrade tree (none owned on old saves).
        data = { ...data, version: 2, upgrades: [] };
        break;
      default:
        throw new Error(`save: no migration from v${data.version}`);
    }
  }

  if (data.version !== SAVE_VERSION) {
    throw new Error(`save: unsupported version v${data.version}`);
  }
  return data as LatestSave;
}
