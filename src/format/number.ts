/**
 * Big-number display formatting. (Ported from the MVP `fmt`.)
 * Phase 0 keeps native numbers; a layered/scientific type can slot in here
 * later (roadmap) without touching call sites.
 */
const UNITS = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

export function fmt(n: number): string {
  if (Number.isNaN(n)) return "0";
  if (n < 0) return "-" + fmt(-n);
  if (n < 1000) return n < 10 && n % 1 !== 0 ? n.toFixed(1) : Math.floor(n).toString();
  let i = 0;
  let v = n;
  while (v >= 1000 && i < UNITS.length - 1) {
    v /= 1000;
    i++;
  }
  return v.toFixed(2) + UNITS[i];
}
