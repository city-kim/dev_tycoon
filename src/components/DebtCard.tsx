import { useGame } from "../store/gameStore";
import { fmt } from "../format/number";

/** 기술 부채 미터 + 리팩토링 버튼. */
export function DebtCard() {
  const refactorNow = useGame((s) => s.refactorNow);
  const debt = useGame((s) => s.snap.debt);
  const debtRatio = useGame((s) => s.snap.debtRatio);
  const penaltyPct = useGame((s) => s.snap.penaltyPct);
  const refundCost = useGame((s) => s.snap.refundCost);
  const canRefactor = useGame((s) => s.snap.canRefactor);
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
          ♻️ 리팩토링 — {fmt(refundCost)}₩
        </button>
      </div>
    </div>
  );
}
