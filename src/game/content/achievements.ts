import type { GameState } from "../types";
import { DEVS } from "./devs";
import { UPGRADES } from "./upgrades";
import { RESEARCH } from "./research";

/**
 * 도전과제 — 1회 달성, **환생해도 영구 유지**. 각 1% 전역 생산 보너스(achievementMult).
 * 조건은 현재 상태로 판정 가능한 것만 사용(별도 누적 카운터 불필요).
 */
export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  check: (s: GameState) => boolean;
}

const totalDevs = (s: GameState): number =>
  DEVS.reduce((sum, d) => sum + (s.devs[d.id] ?? 0), 0);

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: "a_loc1k", name: "Hello, World", desc: "코드 1,000 LoC 도달", check: (s) => s.loc >= 1000 },
  { id: "a_users50", name: "입소문", desc: "유저 50명", check: (s) => s.users >= 50 },
  { id: "a_users1k", name: "대박 서비스", desc: "유저 1,000명", check: (s) => s.users >= 1000 },
  { id: "a_devs25", name: "팀 빌딩", desc: "개발자 25명 고용", check: (s) => totalDevs(s) >= 25 },
  { id: "a_devs100", name: "개발 조직", desc: "개발자 100명 고용", check: (s) => totalDevs(s) >= 100 },
  { id: "a_debt500", name: "스파게티 생존자", desc: "기술부채 500 돌파", check: (s) => s.debt >= 500 },
  { id: "a_upg5", name: "장비병", desc: "업그레이드 5개 보유", check: (s) => s.upgrades.length >= 5 },
  { id: "a_upgall", name: "풀 장착", desc: "모든 업그레이드 보유", check: (s) => s.upgrades.length >= UPGRADES.length }, // prettier-ignore
  { id: "a_resall", name: "R&D 완료", desc: "모든 연구 완료", check: (s) => s.research.length >= RESEARCH.length }, // prettier-ignore
  { id: "a_prestige1", name: "퇴사각", desc: "첫 창업(환생)", check: (s) => s.career >= 1 },
  { id: "a_prestige10", name: "연쇄 창업가", desc: "경력 10 달성", check: (s) => s.career >= 10 },
  { id: "a_won1m", name: "백만장자", desc: "누적 수익 1M₩", check: (s) => s.totalWon >= 1e6 },
];

const BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
export const getAchievement = (id: string): AchievementDef | undefined => BY_ID.get(id);

/** 아직 미달성인데 조건을 만족한 도전과제 id 목록. */
export function newlyUnlocked(s: GameState): string[] {
  const out: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!s.achievements.includes(a.id) && a.check(s)) out.push(a.id);
  }
  return out;
}
