import { useEffect, useRef, useState } from "react";
import doorImg from "@/assets/journey-door.jpg";
import eventsMap from "@/assets/events-map.jpg";

export type MapEvent = {
  id: string; name: string; tag: string; date: string; time: string; day: string; team: string;
  about: string; rules: string[]; x: string; y: string; extra?: string; closing?: string;
  hs: [number, number, number, number][]; // clickable rects on the map image: [left%, top%, w%, h%]
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

/** Scroll-driven scene: a vine-covered stone gate splits open, light floods out, and the expedition map arrives through it. */
export function EventsDoor({ events, ev, onPick, onRegister }: { events: MapEvent[]; ev: MapEvent | null; onPick: (e: MapEvent | null) => void; onRegister: (id: string) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const doors = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const [hov, setHov] = useState<string | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const w = wrap.current;
      if (!w) return;
      const r = w.getBoundingClientRect();
      const p = reduce ? 1 : clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      const open = smooth(seg(p, 0.1, 0.62));
      const mapIn = smooth(seg(p, 0.32, 0.8));
      const glowOp = smooth(seg(p, 0.1, 0.38)) * (1 - smooth(seg(p, 0.6, 0.92)));
      if (left.current) left.current.style.transform = `translate3d(${-open * 102}%,0,0)`;
      if (right.current) right.current.style.transform = `translate3d(${open * 102}%,0,0)`;
      if (doors.current) {
        doors.current.style.transform = `scale(${1 + open * 0.32})`;
        doors.current.style.opacity = String(1 - smooth(seg(p, 0.72, 0.86)));
        doors.current.style.visibility = p > 0.9 ? "hidden" : "visible";
      }
      if (glow.current) { glow.current.style.opacity = String(glowOp); glow.current.style.transform = `scale(${0.4 + open * 1.6})`; }
      if (dim.current) dim.current.style.opacity = String(open * 0.9);
      if (box.current) {
        box.current.style.opacity = String(mapIn);
        box.current.style.transform = `scale(${0.8 + 0.2 * mapIn})`;
        box.current.style.filter = mapIn >= 1 ? "none" : `blur(${(1 - mapIn) * 10}px) brightness(${1 + (1 - mapIn) * 1.3})`;
        box.current.style.pointerEvents = mapIn > 0.92 ? "auto" : "none";
      }
      if (hint.current) hint.current.style.opacity = String(1 - seg(p, 0, 0.07));
    };
    const tick = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    return () => { window.removeEventListener("scroll", tick); window.removeEventListener("resize", tick); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (!ev) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onPick(null);
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [ev, onPick]);

  const half = (side: "l" | "r") => (
    <div ref={side === "l" ? left : right} className="absolute top-0 h-full w-1/2 overflow-hidden will-change-transform" style={{ [side === "l" ? "left" : "right"]: 0 }}>
      <img src={doorImg} alt="" aria-hidden className="absolute top-0 h-full w-[200%] max-w-none object-cover" style={{ [side === "l" ? "left" : "right"]: 0 }} draggable={false} />
    </div>
  );

  return (
    <div ref={wrap} className="relative" style={{ height: "260vh" }}>
      <div className="sticky top-0 isolate flex h-screen items-center justify-center overflow-hidden">
        <div ref={dim} className="absolute inset-0" style={{ opacity: 0, background: "radial-gradient(ellipse at center, oklch(.2 .02 60 / 35%), oklch(.07 .01 60 / 92%))" }} />
        <div ref={glow} className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ opacity: 0, background: "radial-gradient(circle, oklch(.97 .09 90 / 90%) 0%, oklch(.85 .13 80 / 55%) 18%, transparent 52%)" }} />

        <div ref={box} className="relative will-change-transform" style={{ opacity: 0, width: "min(94vw, 1180px, calc((100svh - 5.5rem) * 1.3907))", aspectRatio: "776 / 558", pointerEvents: "none" }}>
          <div className="absolute inset-0 transition-[transform,filter] duration-[1200ms] ease-out" style={ev ? { transform: "scale(1.3)", transformOrigin: `${ev.x} ${ev.y}`, filter: "brightness(.55) blur(2px)" } : undefined}>
            <img src={eventsMap} alt="Illustrated expedition map: Day 1 — Code Dunes and Prompt the Unseen; Day 2 — The Cursed Seas and The Last Signal" className="h-full w-full select-none shadow-2xl" draggable={false} />
            {!ev && events.map((e) => e.hs.map((r, i) => (
              <button key={`${e.id}${i}`} aria-label={i === 0 ? `Explore ${e.name}` : undefined} aria-hidden={i === 0 ? undefined : true} tabIndex={i === 0 ? 0 : -1}
                onClick={() => onPick(e)} onMouseEnter={() => setHov(e.id)} onMouseLeave={() => setHov(null)} onFocus={() => setHov(e.id)} onBlur={() => setHov(null)}
                className={`ev-hs ${hov === e.id ? "on" : ""}`} style={{ left: `${r[0]}%`, top: `${r[1]}%`, width: `${r[2]}%`, height: `${r[3]}%` }} />
            )))}
          </div>
        </div>

        {!ev && (
          <div className="absolute inset-x-3 bottom-3 z-10 grid grid-cols-2 gap-2 md:hidden">
            {events.map((e) => <button key={e.id} onClick={() => onPick(e)} className="border border-primary/60 bg-background/80 px-2 py-2 font-display text-[10px] font-semibold tracking-[0.15em] text-primary">{e.name.toUpperCase()}</button>)}
          </div>
        )}

        {ev && (
          <div className="animate-rise absolute inset-0 z-30 flex items-center justify-center bg-ink/50 p-3 md:p-8">
            <div className="woodboard grid max-h-full w-full max-w-4xl gap-6 overflow-auto p-5 md:grid-cols-[220px_1fr] md:p-8">
              <div className="parchment flex aspect-[3/4] flex-col items-center justify-center p-4 text-center" style={{ transform: "rotate(-2deg)" }}>
                <p className="font-display text-[10px] font-bold tracking-[0.3em]">SPARDHA 2K26</p>
                <p className="mt-4 font-display text-2xl font-bold">{ev.name}</p>
                <p className="mt-2 font-serif text-lg font-semibold italic">{ev.tag}</p>
              </div>
              <div className="text-parchment">
                <p className="font-display text-xs font-semibold tracking-[0.3em] text-primary legible">{ev.day}</p>
                <h3 className="engraved mt-1 text-3xl font-bold">{ev.name}</h3>
                <p className="mt-2 text-sm font-medium text-parchment legible">{ev.date} · {ev.time} · VVIT University · Team: {ev.team}</p>
                {ev.extra && <p className="mt-1 text-sm font-semibold tracking-wide text-primary legible">{ev.extra}</p>}
                <p className="mt-4 font-serif text-xl font-semibold leading-snug">{ev.about}</p>
                <ul className="mt-4 space-y-1.5 text-sm font-medium text-parchment">{ev.rules.map((r) => <li key={r}>✦ {r}</li>)}</ul>
                {ev.closing && <p className="mt-4 font-display text-sm font-semibold tracking-[0.2em] text-primary legible">{ev.closing}</p>}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => onRegister(ev.id)} className="shine bg-primary px-5 py-2 font-display text-xs tracking-[0.25em] text-primary-foreground hover:brightness-110">REGISTER NOW</button>
                  <button onClick={() => onPick(null)} className="border border-parchment/40 px-5 py-2 font-display text-xs tracking-[0.25em] text-parchment hover:bg-parchment/10">BACK TO EXPEDITIONS</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={doors} aria-hidden className="pointer-events-none absolute inset-0 z-20 will-change-transform" style={{ transformOrigin: "50% 50%" }}>
          {half("l")}{half("r")}
        </div>
        <p ref={hint} className="legible pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 font-display text-[11px] font-semibold tracking-[0.5em] text-parchment">SCROLL TO OPEN THE GATE ↓</p>
      </div>
    </div>
  );
}
