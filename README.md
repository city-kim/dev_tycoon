# 데브 타이쿤 (DevTycoon)

개발자 테마의 **클리커 / 방치형 웹게임**. 코드를 짜서 → 기능을 출시하고(유저↑) → 개발자를 채용해 자동화하고 → 기술부채를 관리하다 → 퇴사 후 창업(환생)으로 더 강해집니다.

> // 빠르게 짜고 비싸게 갚는다

**로컬 전용 · 서버/DB 없음.** 모든 상태는 클라이언트에 있고 진행상황은 `localStorage`에 저장됩니다. 정적 빌드라 GitHub Pages로 호스팅됩니다.

🔗 **배포:** https://city-kim.github.io/dev_tycoon/ (main 푸시 시 자동 배포)

---

## 게임 플레이

| 자원 | 설명 |
|---|---|
| 코드 (LoC) | 클릭/개발자로 생산. 기능 출시 비용. |
| 수익 (₩) | 유저 × 단가. 채용·업그레이드·연구 비용. |
| 유저 | 기능 출시로 증가. ₩의 원천. |
| 기술부채 | 생산성을 깎는 핵심 긴장. 리팩토링으로 청산. |
| 경력 | 환생(창업)으로 획득. 영구 +2%/경력. |

**핵심 긴장 — 기술부채:** 부채가 쌓이면 생산성(`prodMult = 1/(1+debt/120)`)이 떨어져 코드·수익이 동시에 줄어듭니다. 너무 방치하면 🐛 버그가 터지고, 생산성이 바닥나면 ⚠ 경고가 뜹니다. (단, 생산성 하한 8%로 회복 불가능한 데스스파이럴은 방지)

## 콘텐츠 (구현 완료)

- **개발자 6티어 채용** — 주니어 → 시니어 → 테크리드 → 풀스택 마법사 → AI 코딩 에이전트 → 오픈소스 군단 (자동 생산, 부채 발생)
- **업그레이드 트리(11종, 4계열)** — 클릭 강화 / 생산× / 부채 감소 / 오프라인 효율
- **연구(R&D) 트리(5노드, 선행 연구 필요)** — 애자일→그로스→코드생성AI, 관측가능성→자동 리팩토링 봇 (자동 LoC, 자동 부채 감소 등 새로운 효과)
- **선택형 랜덤 이벤트(5종)** — 바이럴 / 서버다운 / 투자제안 / 해커톤 / 부채청산 (속도↔부채 트레이드오프)
- **도전과제(12종)** — 영구 달성(환생해도 유지), 각 +1% 전역 생산
- **환생(퇴사 후 창업)** — 누적 수익을 경력으로 환산, 전역 생산 영구 강화
- **개발실 파티클 캔버스** — 채용한 개발자 이모지가 날아다니고, 클릭 시 튀고, 부채 높으면 🐛가 섞임
- **저장 시스템** — localStorage 자동 저장, 오프라인 정산(최대 8h), 세이브 내보내기/불러오기, 하드 리셋

## 기술 스택

React 18 · TypeScript · Vite · Zustand · Vitest · **pnpm**

- 순수 시뮬레이션 레이어(`src/game/sim`)는 React 비의존 + 단위 테스트 가능
- 단일 `requestAnimationFrame` 틱 루프(델타 클램프), 라이브 카운터는 DOM 직접 갱신으로 핫패스 리렌더 회피
- 빅넘버 표기, 버전드 세이브 + 마이그레이션

## 개발

> 패키지 매니저는 **pnpm**입니다 (`package-lock.json` 사용 금지).

```bash
pnpm install        # 의존성 설치
pnpm dev            # 개발 서버 (http://localhost:5173)
pnpm build          # 타입체크 + 프로덕션 빌드 → dist/
pnpm preview        # 빌드 결과 미리보기
pnpm test           # 단위 테스트 (vitest)
pnpm lint           # ESLint
```

빌드 결과(`dist/index.html`)는 상대 경로(`base: "./"`)라 로컬에서 더블클릭으로도 열립니다.

## 배포 (GitHub Pages)

`main`에 push하면 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)가 자동으로 빌드 후 Pages에 배포합니다.

**최초 1회 설정:** GitHub 저장소 → **Settings → Pages → Build and deployment → Source: `GitHub Actions`** 선택. 이후 push마다 자동 배포됩니다. (워크플로우 수동 실행도 가능)

## 프로젝트 구조

```
src/
  game/
    sim/        # 순수 경제: economy, tick, actions, state (+ 테스트)
    config/     # 밸런스 상수 (balanceConfig)
    content/    # 콘텐츠 테이블: devs, upgrades, research, events, achievements
    save/       # 영속성: schema(v3), migrate, serialize, offline, storage
  store/        # Zustand 스토어 + 라이브 디스플레이 브리지 + fx 이벤트 버스
  components/   # UI (ResourceBar, Workbench, DebtCard, UpgradeShop, ResearchTree,
                #     HireList, DevRoomCanvas, AchievementsCard, PrestigeCard,
                #     SaveCard, OfflineModal, EventModal, CommitLog)
  format/       # 숫자·시간 포맷
docs/           # ROADMAP, design-memo
prototype/      # 최초 vanilla JS MVP (devtycoon.html)
.claude/        # 멀티에이전트 하네스 (agents/rules/skills/commands)
```

## 멀티에이전트 하네스

이 저장소는 [ECC](https://github.com/affaan-m/ECC) 프레임워크에서 가져와 게임 개발용으로 특화한 멀티에이전트 하네스를 포함합니다. 자세한 내용은 [CLAUDE.md](CLAUDE.md), 출처/라이선스는 [.claude/CREDITS.md](.claude/CREDITS.md)를 참고하세요.

## 진행 상황

Phase 0(이식) → 1(영속성) → 2(업그레이드+밸런싱) → 3(연구/이벤트/도전과제) 완료. 로드맵: [docs/ROADMAP.md](docs/ROADMAP.md).
