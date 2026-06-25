import { useGame } from "../store/gameStore";

/** 선택형 랜덤/강제 이벤트 모달. */
export function EventModal() {
  const event = useGame((s) => s.event);
  const resolve = useGame((s) => s.resolveEvent);
  if (!event) return null;

  return (
    <div className="modal-backdrop">
      <div className={"modal" + (event.forced ? " modal-crisis" : "")}>
        <h2>
          {event.emoji} {event.title}
          {event.forced && <span className="crisis-badge">강제</span>}
        </h2>
        <p className="modal-sub">{event.desc}</p>
        <div className="event-opts">
          {event.options.map((o, i) => (
            <button key={i} className="event-opt" onClick={() => resolve(i)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
