import { useEffect, useRef } from "react";
import temple from "@/assets/temple.jpg";
import plate from "@/assets/about-plate.jpg";
import "@/about.css";

/**
 * The About chamber is built on a photographic plate (about-plate.jpg).
 * Everything that moves is light, fire, mist or dust layered on top of it,
 * placed at the real positions of the torches / waterfall / sun-shaft in the image.
 * Torch positions are in % of the plate: [left, top].
 */
export const TORCHES: [number, number][] = [
  [25.6, 39.4], [12.5, 59.3], [98.2, 30.7], [82.2, 65.6],
  [8.1, 84.7], [18.6, 92.4], [90.1, 86.7], [81.7, 92.0],
];

function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let w = 0, h = 0, raf = 0, on = false;
    const size = () => { const d = Math.min(2, window.devicePixelRatio || 1); w = c.width = c.offsetWidth * d; h = c.height = c.offsetHeight * d; };
    size();
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; k: 0 | 1 | 2 };
    const U = () => w / 1000;
    const ember = (): P => { const [tx, ty] = TORCHES[Math.floor(Math.random() * TORCHES.length)]; return { x: (tx / 100) * w + (Math.random() - 0.5) * 10 * U(), y: (ty / 100) * h - 14 * U(), vx: (Math.random() - 0.5) * 0.35 * U(), vy: -(0.35 + Math.random() * 0.9) * U(), r: (0.6 + Math.random() * 1.1) * U() * 2, a: 1, k: 1 }; };
    // dust motes drifting inside the sun shaft (upper right)
    const mote = (): P => ({ x: (0.55 + Math.random() * 0.4) * w, y: Math.random() * 0.5 * h, vx: -(0.04 + Math.random() * 0.12) * U(), vy: (0.03 + Math.random() * 0.1) * U(), r: (0.5 + Math.random() * 1.1) * U() * 2, a: 0.15 + Math.random() * 0.5, k: 2 });
    const ps: P[] = [...Array.from({ length: 40 }, mote), ...Array.from({ length: 26 }, ember)];
    ps.forEach((p) => { if (p.k === 1) { p.y -= Math.random() * h * 0.25; p.a = Math.random(); } });
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!on) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ps.forEach((p, i) => {
        p.x += p.vx + (p.k === 1 ? Math.sin((p.y + i * 40) / (38 * U() + 1)) * 0.25 * U() : 0);
        p.y += p.vy;
        if (p.k === 1) { p.a -= 0.007; p.r *= 0.998; if (p.a <= 0) ps[i] = ember(); }
        else if (p.y > h * 0.62 || p.x < w * 0.45) { ps[i] = mote(); ps[i].y = 0; }
        const tw = p.k === 2 ? 0.6 + 0.4 * Math.sin(performance.now() / 700 + i) : 1;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
        g.addColorStop(0, p.k === 1 ? `rgba(255,170,70,${p.a})` : `rgba(255,236,190,${p.a * tw})`);
        g.addColorStop(1, "rgba(255,120,30,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.5, 0, 6.283); ctx.fill();
      });
    };
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; });
    io.observe(c);
    window.addEventListener("resize", size);
    loop();
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} className="ab-cv" aria-hidden />;
}

/** Full-bleed ambience: floating dust, fireflies and soft bokeh across the whole chamber. */
function Ambience() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let w = 0, h = 0, raf = 0, on = false;
    const size = () => { const d = Math.min(1.5, window.devicePixelRatio || 1); w = c.width = c.offsetWidth * d; h = c.height = c.offsetHeight * d; };
    size();
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; k: 0 | 1 | 2; ph: number };
    const U = () => Math.max(0.6, w / 1000);
    const mk = (k: 0 | 1 | 2, scatter = true): P => ({
      x: Math.random() * w, y: scatter ? Math.random() * h : h * (1 + Math.random() * 0.1), ph: Math.random() * 6.283, k,
      vx: (Math.random() - 0.5) * (k === 2 ? 0.05 : 0.18) * U(), vy: -(k === 2 ? 0.03 + Math.random() * 0.05 : 0.08 + Math.random() * 0.22) * U(),
      r: (k === 2 ? 14 + Math.random() * 26 : k === 1 ? 1.4 + Math.random() * 1.2 : 0.5 + Math.random() * 1.1) * U(),
      a: k === 2 ? 0.035 + Math.random() * 0.06 : 0.25 + Math.random() * 0.55,
    });
    const ps: P[] = [...Array.from({ length: 10 }, () => mk(2)), ...Array.from({ length: 60 }, () => mk(0)), ...Array.from({ length: 14 }, () => mk(1))];
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!on) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ps.forEach((p, i) => {
        p.x += p.vx + (p.k === 1 ? Math.sin(t / 900 + p.ph) * 0.35 * U() : Math.sin(t / 2600 + p.ph) * 0.08 * U());
        p.y += p.vy + (p.k === 1 ? Math.cos(t / 1100 + p.ph) * 0.18 * U() : 0);
        if (p.y < -p.r * 4 || p.x < -p.r * 4 || p.x > w + p.r * 4) ps[i] = mk(p.k, false);
        const tw = p.k === 1 ? 0.15 + 0.85 * Math.pow(0.5 + 0.5 * Math.sin(t / 650 + p.ph * 3), 2) : 0.65 + 0.35 * Math.sin(t / 800 + p.ph);
        const R = p.r * (p.k === 2 ? 1 : 3.2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
        const col = p.k === 1 ? "255,214,120" : p.k === 2 ? "255,176,92" : "255,232,186";
        g.addColorStop(0, `rgba(${col},${p.a * tw})`);
        g.addColorStop(p.k === 2 ? 0.7 : 1, `rgba(${col},${p.k === 2 ? p.a * tw * 0.5 : 0})`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, 6.283); ctx.fill();
      });
    };
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; });
    io.observe(c);
    window.addEventListener("resize", size);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} className="ab-amb" aria-hidden />;
}

export function AboutScene() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    // slow depth parallax for the temple backdrop
    let raf = 0;
    const par = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      el.style.setProperty("--py", `${((r.top + r.height / 2 - window.innerHeight / 2) * -0.06).toFixed(1)}px`);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(par); };
    window.addEventListener("scroll", onScroll, { passive: true });
    par();
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section id="about" ref={root} className="ab" aria-labelledby="about-title">
      {/* gentle wind-sway for the hanging vines (top right of the plate) */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id="ab-sway" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="3" result="t">
              <animate attributeName="baseFrequency" dur="11s" values="0.012 0.03;0.019 0.036;0.012 0.03" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="t" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="ab-ripple" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.004" numOctaves="2" seed="9" result="t">
              <animate attributeName="baseFrequency" dur="6s" values="0.05 0.004;0.06 0.006;0.05 0.004" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="t" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="ab-stage" aria-hidden>
        <img src={temple} alt="" className="ab-bg" />
        <div className="ab-rays" />
        <div className="ab-mist" />
        <div className="ab-floor" />
      </div>
      <Ambience />

      <div className="ab-wrap">
        <div className="ab-plate" style={{ "--plate": `url(${plate})` } as React.CSSProperties}>
          <img src={plate} alt="" className="ab-img" width={1851} height={1806} />

          {/* light only — nothing is drawn over the photograph */}
          <div className="ab-shaft" />
          <div className="ab-warm" />
          <div className="ab-fall" />
          <div className="ab-vines" />
          <div className="ab-fmist" />
          <div className="ab-fog f1" /><div className="ab-fog f2" />
          {TORCHES.map(([x, y], i) => (
            <div key={i} className="ab-tc" style={{ left: `${x}%`, top: `${y}%`, "--d": `${0.9 + (i % 4) * 0.23}s`, "--o": `${-i * 0.37}s` } as React.CSSProperties}>
              <i className="ab-glow" /><i className="ab-lick" />
            </div>
          ))}
          <div className="ab-scroll" aria-hidden>
            <div className="ab-sc-in">
              <div className="ab-sc-h">SPARDHA 2K26 — THE UNCHARTED</div>
              <p>Step beyond the familiar and enter The Uncharted — a realm where technology becomes a journey of discovery, ideas become unexplored territories, and every challenge leads to something unknown. Spardha 2K26 brings together innovation, creativity, and competition in an experience inspired by the mysteries of ancient worlds and the limitless possibilities of technology.</p>
              <div className="ab-sc-div" />
              <p className="ab-sc-q">Explore the unknown.<br />Discover new possibilities.<br />Create what has never been charted.</p>
            </div>
          </div>
          <Embers />
          <div className="ab-flick" />
        </div>
      </div>

      {/* real text: read by screen readers everywhere, shown as a card on phones where the baked text is too small */}
      <div className="ab-read">
        <h2 id="about-title">About — Spardha 2K26, The Uncharted</h2>
        <p>Step beyond the familiar and enter The Uncharted — a realm where technology becomes a journey of discovery, ideas become unexplored territories, and every challenge leads to something unknown. Spardha 2K26 brings together innovation, creativity, and competition in an experience inspired by the mysteries of ancient worlds and the limitless possibilities of technology.</p>
        <p className="ab-read-q">Explore the unknown. Discover new possibilities. Create what has never been charted.</p>
        <ul><li>02 Days</li><li>∞ Possibilities</li><li>01 Uncharted Journey</li><li>0 Limits</li></ul>
      </div>
    </section>
  );
}
