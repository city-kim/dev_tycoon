/**
 * Player actions as pure-ish mutations over GameState. Each returns a small
 * result describing what happened (or why it couldn't), so the UI/store layer
 * can log without re-deriving anything.
 */
import type { DevDef, GameState } from "../types";
import { BALANCE as B } from "../config/balanceConfig";
import {
  careerGain,
  clickPow,
  devCost,
  featureCost,
  refundCost,
  usersGain,
} from "./economy";
import { resetForPrestige } from "./state";

/** 코드 짜기: LoC 획득 + 약간의 부채. 항상 성공. 획득량 반환. */
export function clickCode(s: GameState): number {
  const gain = clickPow(s);
  s.loc += gain;
  s.debt += B.CLICK_DEBT;
  return gain;
}

/** 기능 출시: LoC 소모 → 유저 증가. 성공 시 획득 유저 수, 실패 시 null. */
export function shipFeature(s: GameState): { feature: number; users: number } | null {
  const cost = featureCost(s);
  if (s.loc < cost) return null;
  s.loc -= cost;
  s.features += 1;
  const gain = usersGain(s);
  s.users += gain;
  return { feature: s.features, users: gain };
}

/** 리팩토링: ₩ 소모 → 부채 전량 청산. 성공 시 청산량, 실패 시 null. */
export function refactor(s: GameState): number | null {
  const cost = refundCost(s);
  if (s.won < cost || s.debt < 0.1) return null;
  s.won -= cost;
  const cleared = s.debt;
  s.debt = 0;
  return cleared;
}

/** 개발자 채용: ₩ 소모 → 보유 수 +1. 성공 시 새 보유 수, 실패 시 null. */
export function hireDev(s: GameState, d: DevDef): number | null {
  const cost = devCost(s, d);
  if (s.won < cost) return null;
  s.won -= cost;
  s.devs[d.id] += 1;
  return s.devs[d.id];
}

/** 환생(퇴사 후 창업): 경력 획득 + 전체 초기화. 성공 시 획득 경력, 실패 시 null. */
export function prestige(s: GameState): number | null {
  const gain = careerGain(s);
  if (gain < 1) return null;
  s.career += gain;
  resetForPrestige(s);
  return gain;
}
