/**
 * Pure economy math. Every function is a pure read over GameState — no React,
 * no globals, no mutation. This is the testable heart of the game.
 * (Ported 1:1 from the MVP derived-value helpers.)
 */
import type { DevDef, GameState } from "../types";
import { BALANCE as B } from "../config/balanceConfig";
import { DEVS } from "../content/devs";
import { getUpgrade } from "../content/upgrades";

export interface UpgradeMods {
  click: number;
  prod: number;
  debt: number;
  offlineAdd: number;
}

/** 보유 업그레이드 효과 합산 (곱/합연산). */
export const upgradeMods = (s: GameState): UpgradeMods => {
  const m: UpgradeMods = { click: 1, prod: 1, debt: 1, offlineAdd: 0 };
  for (const id of s.upgrades) {
    const u = getUpgrade(id);
    if (!u) continue;
    if (u.clickMult) m.click *= u.clickMult;
    if (u.prodMult) m.prod *= u.prodMult;
    if (u.debtMult) m.debt *= u.debtMult;
    if (u.offlineAdd) m.offlineAdd += u.offlineAdd;
  }
  return m;
};

/** 경력 전역 배율: 1 + 0.02 * career */
export const careerMult = (s: GameState): number => 1 + B.CAREER_BONUS * s.career;

/** 부채 생산성 페널티 배율: 1/(1 + debt/softcap) ∈ (0,1] */
export const prodMult = (s: GameState): number => 1 / (1 + s.debt / B.DEBT_SOFTCAP);

/** 부채/페널티 적용 전 raw LoC/초 (개발자 합산) */
export const rawLoc = (s: GameState): number =>
  DEVS.reduce((sum, d) => sum + s.devs[d.id] * d.loc, 0);

/** 실제 LoC/초 (부채·경력·업그레이드 반영) */
export const locPerSec = (s: GameState): number =>
  rawLoc(s) * prodMult(s) * careerMult(s) * upgradeMods(s).prod;

/** 부채/초 (개발자 합산, 업그레이드 감소 반영) */
export const debtPerSec = (s: GameState): number =>
  DEVS.reduce((sum, d) => sum + s.devs[d.id] * d.debt, 0) * upgradeMods(s).debt;

/** ₩/초 (유저 × 단가, 부채·경력·업그레이드 반영) */
export const wonPerSec = (s: GameState): number =>
  s.users * B.REV_PER_USER * prodMult(s) * careerMult(s) * upgradeMods(s).prod;

/** 코드 짜기 클릭 1회 LoC 획득량 (업그레이드 반영) */
export const clickPow = (s: GameState): number =>
  (1 + s.career) * careerMult(s) * upgradeMods(s).click;

/** 오프라인 효율 (기본 + 업그레이드, 0.95 상한) */
export const offlineEfficiency = (s: GameState): number =>
  Math.min(0.95, B.OFFLINE_EFFICIENCY + upgradeMods(s).offlineAdd);

/** 다음 기능 출시 LoC 비용 */
export const featureCost = (s: GameState): number =>
  Math.floor(B.FEATURE_BASE * Math.pow(B.FEATURE_GROW, s.features));

/** 기능 출시 시 유저 증가량 */
export const usersGain = (s: GameState): number =>
  Math.ceil(1 + s.features * B.USERS_PER_FEATURE);

/** 개발자 d 1명 추가 채용 비용 (₩) */
export const devCost = (s: GameState, d: DevDef): number =>
  Math.floor(d.base * Math.pow(B.COST_GROW, s.devs[d.id]));

/** 리팩토링(부채 전량 청산) 비용 (₩) */
export const refundCost = (s: GameState): number =>
  Math.max(B.REFUND_MIN, s.debt * B.REFUND_MULT);

/** 환생 시 획득 경력 (sublinear) */
export const careerGain = (s: GameState): number =>
  Math.floor(Math.pow(s.totalWon / B.CAREER_DIV, B.CAREER_POW));
