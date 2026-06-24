import { useGame } from "../store/gameStore";
import { fmt } from "../format/number";
import { FAMILY_LABEL, type UpgradeFamily } from "../game/content/upgrades";

const FAMILY_ORDER: UpgradeFamily[] = ["click", "prod", "debt", "offline"];

/** 업그레이드 트리: 1회성 구매, 직군별 그룹. */
export function UpgradeShop() {
  const upgrades = useGame((s) => s.snap.upgrades);
  const buy = useGame((s) => s.buyUpgrade);

  return (
    <div className="card">
      <h2>업그레이드</h2>
      <div className="upg-fams">
        {FAMILY_ORDER.map((fam) => {
          const items = upgrades.filter((u) => u.family === fam);
          // 가장 싼 미보유 1개 + 보유한 것들을 노출 (트리 느낌, 스포일러 최소화)
          const nextUnowned = items.find((u) => !u.owned);
          const visible = items.filter((u) => u.owned || u === nextUnowned);
          return (
            <div key={fam} className="upg-fam">
              <div className="upg-fam-label">{FAMILY_LABEL[fam]}</div>
              <div className="upg-row">
                {visible.map((u) => (
                  <button
                    key={u.id}
                    className={"upg" + (u.owned ? " owned" : "")}
                    onClick={() => buy(u.id)}
                    disabled={u.owned || !u.canAfford}
                    title={u.desc}
                  >
                    <span className="upg-name">{u.name}</span>
                    <span className="upg-desc">{u.desc}</span>
                    <span className="upg-cost">
                      {u.owned ? "보유" : `${fmt(u.cost)}${u.currency === "won" ? "₩" : " LoC"}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
