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
  /** 리팩토링 환율: 부채 1 청산당 ₩ 비용 (부분 청산도 동일 단가) */
  REFUND_MULT: 5,
  /** 자동 리팩토링 ON일 때 매초 부채 상환에 쓰는 수익 비율 */
  AUTO_REFACTOR_FRAC: 0.5,
  /** 이 부채를 넘으면 강제 '기술부채 위기' 이벤트 발생 */
  DEBT_CRISIS: 3000,
  /** 위기 재무장 임계 — 부채가 이 값 아래로 내려가야 위기가 다시 발동 (히스테리시스) */
  DEBT_CRISIS_REARM: 1500,
  /** 기능 1개당 출시 유저 증가 계수 */
  USERS_PER_FEATURE: 0.15,
  /** 오프라인 정산 최대 시간 (초) — 8h */
  OFFLINE_CAP_SEC: 8 * 3600,
  /** 오프라인 생산 효율 (< 1: 능동 플레이가 항상 우위) */
  OFFLINE_EFFICIENCY: 0.5,
  /** 이 시간(초) 미만의 부재는 정산 요약을 띄우지 않음 */
  OFFLINE_MIN_SEC: 60,
} as const;
