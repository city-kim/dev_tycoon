import { useGame } from "../store/gameStore";
import { fmt } from "../format/number";

/** 개발자 채용 리스트. */
export function HireList() {
  const devs = useGame((s) => s.snap.devs);
  const hire = useGame((s) => s.hire);

  return (
    <div className="card">
      <h2>개발자 채용</h2>
      <div>
        {devs.map((d) => (
          <button key={d.id} className="hire" onClick={() => hire(d.id)} disabled={!d.canAfford}>
            <span className="emo">{d.emo}</span>
            <span className="mid">
              <span className="nm">
                {d.nm} <span className="cnt">×{d.count}</span>
              </span>
              <span className="ds">
                +{d.loc} LoC/s · 부채 +{d.debt}/s
              </span>
            </span>
            <span className="cost">{fmt(d.cost)}₩</span>
          </button>
        ))}
      </div>
    </div>
  );
}
