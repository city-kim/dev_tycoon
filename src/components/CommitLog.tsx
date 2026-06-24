import { useGame } from "../store/gameStore";

/** 커밋 로그: 최근 이벤트 9줄. */
export function CommitLog() {
  const log = useGame((s) => s.log);
  return (
    <div className="card">
      <h2>커밋 로그</h2>
      <div className="log">
        {log.map((e) => (
          <div key={e.id} className={e.cls}>
            {e.html}
          </div>
        ))}
      </div>
    </div>
  );
}
