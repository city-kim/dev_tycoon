import { useGame, sim } from "../store/gameStore";
import { fmt } from "../format/number";
import { BALANCE as B } from "../game/config/balanceConfig";

/** 퇴사 후 창업(환생). */
export function PrestigeCard() {
  const careerGain = useGame((s) => s.snap.careerGain);
  const canPrestige = useGame((s) => s.snap.canPrestige);
  const prestigeNow = useGame((s) => s.prestigeNow);

  const onPrestige = () => {
    if (!canPrestige) return;
    const ok = window.confirm(
      `퇴사하고 창업합니다.\n현재 진행도가 초기화되고 경력 +${careerGain} 을 얻습니다.\n진행할까요?`,
    );
    if (ok) prestigeNow();
  };

  return (
    <div className="card prestige">
      <h2 style={{ color: "#f0abfc" }}>퇴사 후 창업 (환생)</h2>
      <p>
        전부 초기화하는 대신 누적 수익만큼 <b style={{ color: "#f0abfc" }}>경력</b>을 얻습니다.
        <br />
        경력 1당 코드·수익 생산이 영구히 <b style={{ color: "#f0abfc" }}>+2%</b>.
      </p>
      <button className="prebtn" onClick={onPrestige} disabled={!canPrestige}>
        {canPrestige
          ? `🎓 창업하고 경력 +${careerGain} 획득`
          : `필요 수익 ${fmt(B.CAREER_DIV)} ₩ (현재 ${fmt(sim.totalWon)})`}
      </button>
    </div>
  );
}
