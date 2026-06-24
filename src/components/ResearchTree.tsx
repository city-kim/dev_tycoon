import { useGame } from "../store/gameStore";
import { fmt } from "../format/number";
import { getResearch } from "../game/content/research";

/** 연구(R&D) 트리: 선행 연구가 필요한 영구(런 한정) 해금. */
export function ResearchTree() {
  const research = useGame((s) => s.snap.research);
  const buy = useGame((s) => s.buyResearch);

  return (
    <div className="card">
      <h2>연구 (R&D)</h2>
      <div className="res-grid">
        {research.map((r) => {
          const reqId = getResearch(r.id)?.requires;
          const reqName = reqId ? getResearch(reqId)?.name : null;
          return (
            <button
              key={r.id}
              className={"res-node" + (r.owned ? " owned" : "") + (r.locked ? " locked" : "")}
              onClick={() => buy(r.id)}
              disabled={r.owned || r.locked || !r.canAfford}
              title={r.locked && reqName ? `선행 연구: ${reqName}` : r.desc}
            >
              <span className="res-name">{r.name}</span>
              <span className="res-desc">{r.desc}</span>
              <span className="res-cost">
                {r.owned
                  ? "완료"
                  : r.locked
                    ? `🔒 ${reqName}`
                    : `${fmt(r.cost)}₩`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
