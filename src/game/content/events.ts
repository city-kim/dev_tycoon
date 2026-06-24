import type { GameState } from "../types";
import { locPerSec, wonPerSec } from "../sim/economy";

/**
 * 랜덤 이벤트 — 선택형. 각 옵션은 트레이드오프(주로 속도↔부채)를 따른다.
 * apply는 상태를 변형하고 로그 문구를 반환한다.
 */
export interface EventOption {
  label: string;
  apply: (s: GameState) => string;
}

export interface EventDef {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  options: EventOption[];
}

export const EVENTS: readonly EventDef[] = [
  {
    id: "viral",
    emoji: "🔥",
    title: "바이럴!",
    desc: "한 기능이 SNS에서 입소문을 탔습니다. 트래픽이 몰려옵니다.",
    options: [
      {
        label: "급하게 스케일업 (유저 +50%, 부채 +150)",
        apply: (s) => {
          const gain = Math.ceil(s.users * 0.5) + 1;
          s.users += gain;
          s.debt += 150;
          return `🔥 바이럴 대응 · 유저 +${gain}, 부채 +150`;
        },
      },
      {
        label: "안정 우선 (변화 없음)",
        apply: () => "🔥 바이럴 기회를 흘려보냈다",
      },
    ],
  },
  {
    id: "outage",
    emoji: "💥",
    title: "서버 다운",
    desc: "프로덕션 장애 발생! 유저들이 이탈하고 있습니다.",
    options: [
      {
        label: "긴급 대응 (₩ 10% 소모, 부채 절반)",
        apply: (s) => {
          const cost = Math.floor(s.won * 0.1);
          s.won -= cost;
          s.debt *= 0.5;
          return `💥 긴급 대응 · ₩ ${cost} 소모, 부채 절반`;
        },
      },
      {
        label: "방치 (부채 +40%, 유저 −10%)",
        apply: (s) => {
          s.debt *= 1.4;
          s.users = Math.floor(s.users * 0.9);
          return "💥 장애 방치 · 부채↑ 유저↓";
        },
      },
    ],
  },
  {
    id: "invest",
    emoji: "💰",
    title: "투자 제안",
    desc: "VC가 시드 투자를 제안합니다. 단, 빠른 성장 압박이 따라옵니다.",
    options: [
      {
        label: "수락 (₩ 10분치 즉시, 부채 +200)",
        apply: (s) => {
          const cash = Math.max(500, wonPerSec(s) * 600);
          s.won += cash;
          s.totalWon += cash;
          s.debt += 200;
          return `💰 투자 유치 · ₩ +${Math.floor(cash)}, 부채 +200`;
        },
      },
      {
        label: "거절 (지분 사수)",
        apply: () => "💰 투자 제안 거절",
      },
    ],
  },
  {
    id: "hackathon",
    emoji: "⚡",
    title: "사내 해커톤",
    desc: "주말 해커톤! 짧고 굵게 코드를 쏟아낼 기회입니다.",
    options: [
      {
        label: "참가 (LoC 10분치 즉시, 부채 +100)",
        apply: (s) => {
          const loc = Math.max(50, locPerSec(s) * 600);
          s.loc += loc;
          s.debt += 100;
          return `⚡ 해커톤 · LoC +${Math.floor(loc)}, 부채 +100`;
        },
      },
      {
        label: "불참 (워라밸)",
        apply: () => "⚡ 해커톤 불참 · 주말을 지켰다",
      },
    ],
  },
  {
    id: "techdebt_sprint",
    emoji: "🧹",
    title: "부채 청산 스프린트",
    desc: "한 스프린트를 통째로 리팩토링에 투자할까요?",
    options: [
      {
        label: "진행 (부채 −70%, 유저 성장 잠시 정체했다고 가정)",
        apply: (s) => {
          s.debt *= 0.3;
          return "🧹 청산 스프린트 · 부채 −70%";
        },
      },
      {
        label: "기능 개발 우선 (변화 없음)",
        apply: () => "🧹 부채는 다음에…",
      },
    ],
  },
];

const BY_ID = new Map(EVENTS.map((e) => [e.id, e]));
export const getEvent = (id: string): EventDef | undefined => BY_ID.get(id);
