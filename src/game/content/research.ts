/**
 * 연구(R&D) 트리 — 선행 노드 필요(트리), ₩로 구매, 환생 시 초기화.
 * 업그레이드와 달리 *새로운 종류*의 효과를 제공한다 (자동화·구조 변경).
 */
export interface ResearchDef {
  id: string;
  name: string;
  desc: string;
  cost: number; // ₩
  requires: string | null; // 선행 연구 id
  /** 기능 출시 비용 배율 (≤1) */
  featureCostMult?: number;
  /** 기능당 유저 획득 배율 */
  usersGainMult?: number;
  /** 자동 코드 생산 (LoC/s, 부채 영향 없음) */
  autoLoc?: number;
  /** 버그 이벤트 피해 배율 (≤1) */
  bugMult?: number;
  /** 자동 부채 감소 (/s) */
  debtDecay?: number;
}

export const RESEARCH: readonly ResearchDef[] = [
  // 브랜치 1: 성장 (애자일 → 그로스 → 코드 생성 AI)
  { id: "r_lean", name: "애자일 도입", desc: "기능 출시 비용 −40%", cost: 5000, requires: null, featureCostMult: 0.6 }, // prettier-ignore
  { id: "r_growth", name: "그로스 해킹", desc: "기능당 유저 ×2", cost: 45000, requires: "r_lean", usersGainMult: 2 }, // prettier-ignore
  { id: "r_autocode", name: "코드 생성 AI", desc: "자동 +60 LoC/s", cost: 250000, requires: "r_growth", autoLoc: 60 }, // prettier-ignore

  // 브랜치 2: 품질 (관측가능성 → 자동 리팩토링 봇)
  { id: "r_observ", name: "관측가능성", desc: "버그 피해 −60%", cost: 18000, requires: null, bugMult: 0.4 }, // prettier-ignore
  { id: "r_autoref", name: "자동 리팩토링 봇", desc: "부채 자동 −6/s", cost: 130000, requires: "r_observ", debtDecay: 6 }, // prettier-ignore
];

const BY_ID = new Map(RESEARCH.map((r) => [r.id, r]));
export const getResearch = (id: string): ResearchDef | undefined => BY_ID.get(id);
