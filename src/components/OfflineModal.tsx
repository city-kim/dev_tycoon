import { useGame } from "../store/gameStore";
import { fmt } from "../format/number";
import { fmtDuration } from "../format/duration";

/** "자리를 비운 사이…" 오프라인 정산 요약 모달. */
export function OfflineModal() {
  const offline = useGame((s) => s.offline);
  const dismiss = useGame((s) => s.dismissOffline);
  if (!offline) return null;

  return (
    <div className="modal-backdrop" onClick={dismiss}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>☕ 다시 오셨네요</h2>
        <p className="modal-sub">
          자리를 비운 <b>{fmtDuration(offline.seconds)}</b> 동안 (효율 50%)
        </p>
        <div className="modal-rows">
          <div className="modal-row">
            <span>코드</span>
            <span className="g">+{fmt(offline.loc)} LoC</span>
          </div>
          <div className="modal-row">
            <span>수익</span>
            <span className="y">+{fmt(offline.won)} ₩</span>
          </div>
          <div className="modal-row">
            <span>기술부채</span>
            <span className="r">+{fmt(offline.debt)}</span>
          </div>
        </div>
        <button className="prebtn" onClick={dismiss}>
          계속하기
        </button>
      </div>
    </div>
  );
}
