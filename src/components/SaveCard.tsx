import { useState } from "react";
import { useGame } from "../store/gameStore";

type Mode = "idle" | "export" | "import";

/** 저장 관리: 수동 저장 · 내보내기/불러오기(백엔드 없는 "클라우드 세이브") · 하드 리셋. */
export function SaveCard() {
  const saveNow = useGame((s) => s.saveNow);
  const exportNow = useGame((s) => s.exportNow);
  const importNow = useGame((s) => s.importNow);
  const hardReset = useGame((s) => s.hardReset);

  const [mode, setMode] = useState<Mode>("idle");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");

  const flash = (m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(""), 2000);
  };

  const onSave = () => {
    saveNow();
    flash("저장됨 ✓");
  };

  const onExport = () => {
    const code = exportNow();
    setText(code);
    setMode("export");
    navigator.clipboard?.writeText(code).then(
      () => flash("클립보드에 복사됨 ✓"),
      () => flash("아래 코드를 복사하세요"),
    );
  };

  const onImport = () => {
    if (importNow(text.trim())) {
      flash("불러오기 완료 ✓");
      setMode("idle");
      setText("");
    } else {
      flash("잘못된 세이브 코드 ✗");
    }
  };

  const onReset = () => {
    if (window.confirm("정말 모든 진행을 삭제할까요? (경력 포함, 되돌릴 수 없음)")) {
      hardReset();
      setMode("idle");
      setText("");
      flash("초기화됨");
    }
  };

  return (
    <div className="card">
      <h2>
        저장 관리 {msg && <span style={{ color: "var(--green)" }}>{msg}</span>}
      </h2>
      <div className="save-btns">
        <button className="save-btn" onClick={onSave}>
          💾 저장
        </button>
        <button className="save-btn" onClick={onExport}>
          📤 내보내기
        </button>
        <button className="save-btn" onClick={() => setMode(mode === "import" ? "idle" : "import")}>
          📥 불러오기
        </button>
        <button className="save-btn danger" onClick={onReset}>
          🗑️ 초기화
        </button>
      </div>

      {mode === "export" && (
        <textarea className="save-area" readOnly value={text} onFocus={(e) => e.target.select()} />
      )}
      {mode === "import" && (
        <div className="save-import">
          <textarea
            className="save-area"
            placeholder="세이브 코드를 붙여넣으세요"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="save-btn" onClick={onImport} disabled={!text.trim()}>
            적용
          </button>
        </div>
      )}
    </div>
  );
}
