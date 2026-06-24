import type { MouseEvent } from "react";
import { useGame } from "../store/gameStore";
import { emitCodeBurst } from "../store/fx";
import { fmt } from "../format/number";

/** 작업대: 코드 짜기 + 기능 출시. 떠오르는 +텍스트 연출 포함. */
export function Workbench() {
  const code = useGame((s) => s.code);
  const ship = useGame((s) => s.ship);
  const prodMult = useGame((s) => s.snap.prodMult);
  const clickPow = useGame((s) => s.snap.clickPow);
  const featureCost = useGame((s) => s.snap.featureCost);
  const usersGain = useGame((s) => s.snap.usersGain);
  const canShip = useGame((s) => s.snap.canShip);

  const pmPct = Math.round(prodMult * 100);
  const pmColor = prodMult > 0.8 ? "var(--green)" : prodMult > 0.5 ? "var(--gold)" : "var(--debt)";

  const onCode = (e: MouseEvent) => {
    const gain = code();
    floatText(e.clientX, e.clientY, "+" + fmt(gain));
    emitCodeBurst(); // 개발실 파티클 튀기기
  };

  return (
    <div className="card glitchable">
      <h2>
        작업대 <span style={{ color: pmColor }}>생산성 {pmPct}%</span>
      </h2>
      <div className="actions">
        <button className="bigbtn code" onClick={onCode}>
          <div className="t">⌨️ 코드 짜기</div>
          <div className="s">+{fmt(clickPow)} LoC · 부채 살짝 +</div>
        </button>
        <button className="bigbtn ship" onClick={ship} disabled={!canShip}>
          <div className="t">🚀 기능 출시</div>
          <div className="s">
            비용 {fmt(featureCost)} LoC → 유저 +{usersGain}
          </div>
        </button>
      </div>
    </div>
  );
}

function floatText(x: number, y: number, txt: string) {
  const f = document.createElement("div");
  f.className = "float";
  f.textContent = txt;
  f.style.left = x - 10 + "px";
  f.style.top = y - 14 + "px";
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 800);
}
