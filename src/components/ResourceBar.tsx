import { useEffect, useRef } from "react";
import { setLiveRefs } from "../store/liveDisplay";

/**
 * The hot path. Renders static spans and registers their refs with the
 * live-display bridge; the single game loop (App) writes the ticking numbers
 * into them each frame — so the counter never triggers a React re-render of
 * the rest of the tree (.claude/rules/game/architecture.md).
 */
export function ResourceBar() {
  const locV = useRef<HTMLSpanElement>(null);
  const locR = useRef<HTMLSpanElement>(null);
  const wonV = useRef<HTMLSpanElement>(null);
  const wonR = useRef<HTMLSpanElement>(null);
  const usrV = useRef<HTMLSpanElement>(null);
  const usrR = useRef<HTMLSpanElement>(null);
  const dbtV = useRef<HTMLSpanElement>(null);
  const dbtR = useRef<HTMLSpanElement>(null);
  const carV = useRef<HTMLSpanElement>(null);
  const carR = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setLiveRefs({ locV, locR, wonV, wonR, usrV, usrR, dbtV, dbtR, carV, carR });
    return () => setLiveRefs(null);
  }, []);

  return (
    <div className="res">
      <div className="stat">
        <span className="k">코드 LoC</span>
        <span className="v loc" ref={locV}>0</span>
        <span className="r" ref={locR}>+0/s</span>
      </div>
      <div className="stat">
        <span className="k">수익 ₩</span>
        <span className="v won" ref={wonV}>0</span>
        <span className="r" ref={wonR}>+0/s</span>
      </div>
      <div className="stat">
        <span className="k">유저</span>
        <span className="v usr" ref={usrV}>0</span>
        <span className="r" ref={usrR}>기능 0개</span>
      </div>
      <div className="stat">
        <span className="k">기술부채</span>
        <span className="v dbt" ref={dbtV}>0</span>
        <span className="r" ref={dbtR}>+0/s</span>
      </div>
      <div className="stat">
        <span className="k">경력</span>
        <span className="v car" ref={carV}>0</span>
        <span className="r" ref={carR}>전역 +0%</span>
      </div>
    </div>
  );
}
