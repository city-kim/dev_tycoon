import { useGame } from "../store/gameStore";
import { fmt } from "../format/number";

/** 기술 부채 미터 + 리팩토링(부분 청산 가능) + 자동 리팩토링 토글. */
export function DebtCard() {
  const refactorNow = useGame((s) => s.refactorNow);
  const toggleAuto = useGame((s) => s.toggleAutoRefactor);
  const debt = useGame((s) => s.snap.debt);
  const debtRatio = useGame((s) => s.snap.debtRatio);
  const penaltyPct = useGame((s) => s.snap.penaltyPct);
  const canRefactor = useGame((s) => s.snap.canRefactor);
  const cost = useGame((s) => s.snap.refactorCost);
  const cleared = useGame((s) => s.snap.refactorCleared);
  const full = useGame((s) => s.snap.refactorFull);
  const auto = useGame((s) => s.snap.autoRefactor);
  const danger = useGame((s) => s.snap.debtDanger);

  return (
    <div className={"card glitchable" + (danger ? " debt-danger" : "")}>
      <h2>
        기술 부채
        {danger && <span className="debt-warn">⚠ 생산성 위험 — 리팩토링 필요</span>}
      </h2>
      <div className="debtwrap">
        <div className="meter">
          <div className="fill" style={{ width: debtRatio * 100 + "%" }} />
        </div>
        <div className="debtrow">
          <span>부채 {fmt(debt)}</span>
          <span className="penalty">페널티 -{penaltyPct}%</span>
        </div>
        <button className="refbtn" onClick={refactorNow} disabled={!canRefactor}>
          {full
            ? `♻️ 리팩토링 — ${fmt(cost)}₩ (전액 청산)`
            : `🩹 긴급 패치 — ${fmt(cost)}₩ → 부채 ${fmt(cleared)} 감소`}
        </button>
        <button
          className={"auto-toggle" + (auto ? " on" : "")}
          onClick={toggleAuto}
          title="수익의 일부를 자동으로 부채 상환에 사용"
        >
          <span className="auto-dot" />
          자동 리팩토링 {auto ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}
