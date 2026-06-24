/**
 * 튜닝 상수 — 밸런싱은 여기와 content/devs.ts 만 만지면 된다.
 * (MVP `prototype/devtycoon.html` <script> 상단에서 1:1 이식)
 *
 * Owned by the `balance-tuner` agent. Pure data; imported by the sim layer.
 */
export const BALANCE = {
  /** 유저 1명당 ₩/초 */
  REV_PER_USER: 1.0,
  /** 부채 페널티 강도 (작을수록 가혹): prodMult = 1/(1+debt/SOFTCAP) */
  DEBT_SOFTCAP: 120,
  /** 생산성 하한 — 부채가 극심해도 이만큼은 생산(데스스파이럴 방지) */
  PROD_FLOOR: 0.08,
  /** 첫 기능 출시 LoC 비용 */
  FEATURE_BASE: 8,
  /** 기능 비용 증가율 */
  FEATURE_GROW: 1.55,
  /** 개발자 채용 비용 증가율 */
  COST_GROW: 1.15,
  /** 환생 환산 기준 (이 수익마다 경력 ↑) */
  CAREER_DIV: 1e6,
  /** 환생 보상 곡선 (sublinear) */
  CAREER_POW: 0.6,
  /** 경력 1당 전역 배율 */
  CAREER_BONUS: 0.02,
  /** 코드 짜기 클릭당 부채 증가 */
  CLICK_DEBT: 0.03,
  /** 리팩토링 최소 비용 (₩) */
  REFUND_MIN: 50,
  /** 리팩토링 비용 계수: max(REFUND_MIN, debt * REFUND_MULT) */
  REFUND_MULT: 5,
  /** 기능 1개당 출시 유저 증가 계수 */
  USERS_PER_FEATURE: 0.15,
  /** 오프라인 정산 최대 시간 (초) — 8h */
  OFFLINE_CAP_SEC: 8 * 3600,
  /** 오프라인 생산 효율 (< 1: 능동 플레이가 항상 우위) */
  OFFLINE_EFFICIENCY: 0.5,
  /** 이 시간(초) 미만의 부재는 정산 요약을 띄우지 않음 */
  OFFLINE_MIN_SEC: 60,
} as const;
