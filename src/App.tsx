import { useEffect } from "react";
import { useGame, sim } from "./store/gameStore";
import { updateLiveDisplay } from "./store/liveDisplay";
import { BALANCE as B } from "./game/config/balanceConfig";
import { ResourceBar } from "./components/ResourceBar";
import { Workbench } from "./components/Workbench";
import { DebtCard } from "./components/DebtCard";
import { UpgradeShop } from "./components/UpgradeShop";
import { ResearchTree } from "./components/ResearchTree";
import { CommitLog } from "./components/CommitLog";
import { HireList } from "./components/HireList";
import { DevRoomCanvas } from "./components/DevRoomCanvas";
import { PrestigeCard } from "./components/PrestigeCard";
import { AchievementsCard } from "./components/AchievementsCard";
import { SaveCard } from "./components/SaveCard";
import { OfflineModal } from "./components/OfflineModal";
import { EventModal } from "./components/EventModal";

const DISPLAY_INTERVAL = 0.1; // seconds — throttled UI refresh (~10fps)
const AUTOSAVE_MS = 15000; // debounced autosave cadence
const EVENT_MIN = 100; // seconds — earliest next random event
const EVENT_VAR = 120; // + up to this much (randomized)

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
    let eventAcc = 0;
    let nextEventAt = EVENT_MIN + Math.random() * EVENT_VAR;
    const { advance, refresh, maybeTriggerEvent, checkDebtCrisis } = useGame.getState();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.5);
      last = now;
      advance(dt);
      updateLiveDisplay(); // live counter, every frame (DOM-direct, no re-render)

      eventAcc += dt;
      if (eventAcc >= nextEventAt) {
        eventAcc = 0;
        nextEventAt = EVENT_MIN + Math.random() * EVENT_VAR;
        maybeTriggerEvent();
      }

      checkDebtCrisis(); // 부채 임계치 초과 시 강제 위기 이벤트

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

/** Autosave on an interval + whenever the tab is hidden or closed. */
function usePersistence() {
  useEffect(() => {
    const { saveNow } = useGame.getState();
    const timer = window.setInterval(saveNow, AUTOSAVE_MS);
    const onHide = () => {
      if (document.visibilityState === "hidden") saveNow();
    };
    window.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", saveNow);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", saveNow);
      saveNow(); // persist on unmount (covers HMR / navigation)
    };
  }, []);
}

export default function App() {
  useGameLoop();
  usePersistence();

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
          <UpgradeShop />
          <ResearchTree />
          <CommitLog />
        </div>
        <div>
          <DevRoomCanvas />
          <HireList />
          <AchievementsCard />
          <PrestigeCard />
          <SaveCard />
        </div>
      </div>

      <OfflineModal />
      <EventModal />

      <div className="hint">
        requestAnimationFrame 게임 루프 · 모든 수치는 src/game/config·content 에서 조절
        <br />
        진행상황은 localStorage에 자동 저장됩니다 · 오프라인 정산 최대 8시간
      </div>
    </div>
  );
}
