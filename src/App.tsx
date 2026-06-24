import { useEffect } from "react";
import { useGame, sim } from "./store/gameStore";
import { updateLiveDisplay } from "./store/liveDisplay";
import { BALANCE as B } from "./game/config/balanceConfig";
import { ResourceBar } from "./components/ResourceBar";
import { Workbench } from "./components/Workbench";
import { DebtCard } from "./components/DebtCard";
import { CommitLog } from "./components/CommitLog";
import { HireList } from "./components/HireList";
import { PrestigeCard } from "./components/PrestigeCard";

const DISPLAY_INTERVAL = 0.1; // seconds — throttled UI refresh (~10fps)

/**
 * The single game loop. Advances the sim every frame (delta-timed, clamped),
 * and refreshes the throttled display snapshot ~10fps. The live resource
 * numbers update themselves in ResourceBar (DOM-direct), so this loop never
 * re-renders the whole tree.
 */
function useGameLoop() {
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const { advance, refresh } = useGame.getState();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.5);
      last = now;
      advance(dt);
      updateLiveDisplay(); // live counter, every frame (DOM-direct, no re-render)

      acc += dt;
      if (acc >= DISPLAY_INTERVAL) {
        acc = 0;
        refresh();
        const glitch = Math.min(sim.debt / (B.DEBT_SOFTCAP * 3), 1);
        document.documentElement.style.setProperty("--glitch", glitch.toFixed(2));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
}

export default function App() {
  useGameLoop();

  return (
    <div className="wrap">
      <header>
        <div className="logo">
          <span className="br">&lt;</span>dev<span className="fn">.tycoon</span>
          <span className="br">/&gt;</span>
          <span className="cursor" />
        </div>
        <div className="tag">// 빠르게 짜고 비싸게 갚는다</div>
      </header>

      <ResourceBar />

      <div className="grid">
        <div>
          <Workbench />
          <DebtCard />
          <CommitLog />
        </div>
        <div>
          <HireList />
          <PrestigeCard />
        </div>
      </div>

      <div className="hint">
        requestAnimationFrame 게임 루프 · 모든 수치는 src/game/config·content 에서 조절
        <br />
        저장/오프라인 보상은 로드맵 Phase 1에서 추가됩니다 (현재는 메모리에만 저장)
      </div>
    </div>
  );
}
