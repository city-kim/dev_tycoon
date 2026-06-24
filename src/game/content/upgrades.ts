/**
 * 업그레이드 트리 — 1회성 구매(환생 시 초기화). 효과는 economy.ts에서 합산 적용.
 * 비용/효과 튜닝은 balance-tuner가 시뮬레이션으로 검증 (balance.sim.test.ts).
 */
export type UpgradeFamily = "click" | "prod" | "debt" | "offline";
export type Currency = "won" | "loc";

export interface UpgradeDef {
  id: string;
  family: UpgradeFamily;
  name: string;
  desc: string;
  cost: number;
  currency: Currency;
  /** 클릭 코드량 배율 (곱연산) */
  clickMult?: number;
  /** 전역 생산(LoC·₩) 배율 (곱연산) */
  prodMult?: number;
  /** 부채 발생량 배율 (≤1, 곱연산) */
  debtMult?: number;
  /** 오프라인 효율 가산 (합연산) */
  offlineAdd?: number;
}

export const UPGRADES: readonly UpgradeDef[] = [
  // ── 클릭 강화 (LoC로 구매: 초반 클릭 성장감) ──
  { id: "clk1", family: "click", name: "듀얼 모니터", desc: "코드 짜기 ×2", cost: 50, currency: "loc", clickMult: 2 }, // prettier-ignore
  { id: "clk2", family: "click", name: "기계식 키보드", desc: "코드 짜기 ×2", cost: 1200, currency: "loc", clickMult: 2 }, // prettier-ignore
  { id: "clk3", family: "click", name: "복붙 마스터", desc: "코드 짜기 ×3", cost: 60000, currency: "loc", clickMult: 3 }, // prettier-ignore

  // ── 생산 (₩로 구매: 개발자 산출 전역 배율) ──
  { id: "prd1", family: "prod", name: "버전 관리(Git)", desc: "전역 생산 ×1.5", cost: 600, currency: "won", prodMult: 1.5 }, // prettier-ignore
  { id: "prd2", family: "prod", name: "CI/CD 파이프라인", desc: "전역 생산 ×2", cost: 30000, currency: "won", prodMult: 2 }, // prettier-ignore
  { id: "prd3", family: "prod", name: "마이크로서비스", desc: "전역 생산 ×2", cost: 1500000, currency: "won", prodMult: 2 }, // prettier-ignore

  // ── 부채 감소 (₩로 구매: 부채 발생률 ↓) ──
  { id: "dbt1", family: "debt", name: "코드 리뷰 문화", desc: "부채 발생 ×0.7", cost: 2500, currency: "won", debtMult: 0.7 }, // prettier-ignore
  { id: "dbt2", family: "debt", name: "테스트 자동화", desc: "부채 발생 ×0.6", cost: 90000, currency: "won", debtMult: 0.6 }, // prettier-ignore
  { id: "dbt3", family: "debt", name: "정적 분석 도구", desc: "부채 발생 ×0.7", cost: 2500000, currency: "won", debtMult: 0.7 }, // prettier-ignore

  // ── 오프라인 (₩로 구매: 자리 비운 사이 효율 ↑) ──
  { id: "off1", family: "offline", name: "재택근무 셋업", desc: "오프라인 효율 +15%", cost: 12000, currency: "won", offlineAdd: 0.15 }, // prettier-ignore
  { id: "off2", family: "offline", name: "클라우드 IDE", desc: "오프라인 효율 +20%", cost: 600000, currency: "won", offlineAdd: 0.2 }, // prettier-ignore
];

export const FAMILY_LABEL: Record<UpgradeFamily, string> = {
  click: "클릭 강화",
  prod: "생산",
  debt: "부채 감소",
  offline: "오프라인",
};

const BY_ID = new Map(UPGRADES.map((u) => [u.id, u]));
export const getUpgrade = (id: string): UpgradeDef | undefined => BY_ID.get(id);
