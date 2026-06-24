import { useGame } from "../store/gameStore";

/** 도전과제: 영구 달성(환생해도 유지), 각 +1% 전역 생산. */
export function AchievementsCard() {
  const list = useGame((s) => s.snap.achievements);
  const unlocked = useGame((s) => s.snap.achUnlocked);
  const total = useGame((s) => s.snap.achTotal);
  const bonusPct = useGame((s) => s.snap.achBonusPct);

  return (
    <div className="card">
      <h2>
        도전과제
        <span style={{ color: "var(--gold)" }}>
          {unlocked}/{total} · 전역 +{bonusPct}%
        </span>
      </h2>
      <div className="ach-grid">
        {list.map((a) => (
          <div
            key={a.id}
            className={"ach" + (a.unlocked ? " on" : "")}
            title={a.unlocked ? a.desc : "???"}
          >
            <span className="ach-name">{a.unlocked ? a.name : "🔒"}</span>
            <span className="ach-desc">{a.unlocked ? a.desc : "미달성"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
