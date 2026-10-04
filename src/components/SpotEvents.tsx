import { useState } from "react";
import gridRaiders from "@/assets/spot/grid-raiders.jpg";
import templeOfTricks from "@/assets/spot/temple-of-tricks.jpg";
import templeTimeBomb from "@/assets/spot/temple-time-bomb.jpg";
import trapOrTreasure from "@/assets/spot/trap-or-treasure.jpg";
import rollOfRuins from "@/assets/spot/roll-of-ruins.jpg";
import coinQuest from "@/assets/spot/coin-quest.jpg";
import flipWar from "@/assets/spot/flip-war.jpg";
import blindArchitect from "@/assets/spot/blind-architect.jpg";
import cursedTreasure from "@/assets/spot/cursed-treasure.jpg";

export const SPOT = [
  { name: "Grid Raiders", poster: gridRaiders },
  { name: "Temple of Tricks", poster: templeOfTricks },
  { name: "Temple Time Bomb", poster: templeTimeBomb },
  { name: "Trap or Treasure", poster: trapOrTreasure },
  { name: "Roll of Ruins", poster: rollOfRuins },
  { name: "Coin Quest", poster: coinQuest },
  { name: "Flip War", poster: flipWar },
  { name: "Blind Architect", poster: blindArchitect },
  { name: "Cursed Treasure", poster: cursedTreasure },
];

export function SpotEvents() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-expanded={open} aria-controls="spot-grid" onClick={() => setOpen((o) => !o)} className="sp-toggle mt-6 border border-primary/70 bg-background/60 px-6 py-2 font-display text-xs font-semibold tracking-[0.3em] text-primary">
        {open ? "HIDE SPOT EVENTS" : "VIEW ALL SPOT EVENTS"}
        <svg viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M1 1l5 5 5-5" /></svg>
      </button>
      <div id="spot-grid" className={`sp-wrap ${open ? "open" : ""}`}>
        <div className="sp-clip">
          <div className="sp-grid">
            {SPOT.map((s, i) => (
              <article key={s.name} className="sp-card" style={{ "--i": i } as React.CSSProperties}>
                <span className="sp-num">{String(i + 1).padStart(2, "0")}</span>
                <div className="sp-poster"><img src={s.poster} alt={`${s.name} poster`} loading="lazy" decoding="async" /></div>
                <h4 className="sp-name">{s.name}</h4>
                <p className="sp-tag">SPOT EVENT</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
