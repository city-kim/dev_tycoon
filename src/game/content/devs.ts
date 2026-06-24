import type { DevDef } from "../types";

/**
 * 채용 가능한 개발자 티어. 콘텐츠 확장(로드맵 P1)은 이 배열에 추가.
 * (MVP DEVS 배열에서 1:1 이식)
 */
export const DEVS: readonly DevDef[] = [
  { id: "jr", emo: "🧑‍💻", nm: "주니어 개발자", base: 15, loc: 0.3, debt: 0.05 },
  { id: "sr", emo: "👩‍💻", nm: "시니어 개발자", base: 100, loc: 2, debt: 0.2 },
  { id: "tl", emo: "🧙", nm: "테크 리드", base: 1100, loc: 12, debt: 0.8 },
  { id: "fs", emo: "🦸", nm: "풀스택 마법사", base: 12000, loc: 70, debt: 3.0 },
  { id: "ai", emo: "🤖", nm: "AI 코딩 에이전트", base: 130000, loc: 400, debt: 12 },
  { id: "oss", emo: "🌍", nm: "오픈소스 군단", base: 1.4e6, loc: 2500, debt: 50 },
];
