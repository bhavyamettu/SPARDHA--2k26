import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import cave from "@/assets/cave.jpg";
import temple from "@/assets/temple.jpg";
import forest from "@/assets/forest.jpg";
import logo from "@/assets/spardha-logo.png";
import acm from "@/assets/acm-logo.png";
import campusMap from "@/assets/campus-map.jpg";
import { RegistrationModal } from "@/components/RegistrationModal";
import { initSmoothScroll } from "@/lib/smooth-scroll";
import { initPageTransition } from "@/lib/page-transition";
import { initTextReveal } from "@/lib/text-reveal";
import { SpotEvents } from "@/components/SpotEvents";
import { ContactSection } from "@/components/ContactSection";
import { AboutScene } from "@/components/AboutScene";
import { EventsDoor, type MapEvent } from "@/components/EventsDoor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SPARDHA 2K26 — The Uncharted | VVITU Techno Fest" },
      { name: "description", content: "Spardha 2K26 — The Uncharted. Annual techno fest of VVIT University, presented by ACM VVITU. October 12–13, 2026." },
      { property: "og:title", content: "SPARDHA 2K26 — The Uncharted" },
      { property: "og:description", content: "Explore the unknown. The annual techno fest of VVIT University, Oct 12–13, 2026." },
    ],
  }),
  component: Index,
});

const NAV = ["home", "about", "events", "campus", "contact"] as const;

type Ev = MapEvent;
const EVENTS: Ev[] = [
  { id: "code", name: "Code Dunes", tag: "Competitive programming challenge", date: "12 October 2026", time: "9:00 AM – 1:00 PM", day: "Day 1 · First Discovery", team: "Individual (1)", extra: "Event 1 · Duration: 90 Minutes", closing: "", x: "39%", y: "29%", hs: [[7.5, 11.6, 25, 26.3], [33, 21, 12.4, 14.8]], about: "Code Dunes is a competitive programming challenge featuring 5 algorithmic problems of increasing difficulty. Participants compete individually on HackerRank, with submissions automatically evaluated against hidden test cases and scores reflected on the live leaderboard.", rules: ["Solve all 5 challenges within 90 minutes.", "3 Medium and 2 Hard problems.", "Any programming language supported by HackerRank is allowed.", "Mobile phone usage is prohibited.", "Single round; final rankings are based on score and performance."] },
  { id: "unseen", name: "Prompt the Unseen", tag: "Generative AI Challenge", date: "12 October 2026", time: "12:00 PM – 3:00 PM", day: "Day 1 · First Discovery", team: "2 members (exactly 2)", extra: "Event 2 · Rounds: 3 × 40 Minutes", closing: "", x: "39%", y: "56%", hs: [[8.5, 39.8, 23.2, 27], [33, 48, 11.9, 15.8]], about: "A Generative AI challenge testing AI knowledge, prompt engineering, creativity, and innovation through three rounds—knowledge, AI image generation, and AI video creation.", rules: ["Each team must have exactly 2 participants.", "Bring your own smartphone or laptop.", "Complete each round within the allotted time.", "Only shortlisted teams advance.", "Organizers' decisions are final."] },
  { id: "seas", name: "The Cursed Seas", tag: "Dare the Depths. Claim the Doom.", date: "13 October 2026", time: "9:00 AM – 1:00 PM", day: "Day 2 · Beyond the Known", team: "Individual", extra: "Event 1 · Duration: 2 Hours", closing: "Think. Solve. Survive. Conquer the Seas.", x: "63%", y: "30%", hs: [[70.2, 11.1, 23.8, 26.5], [55.2, 21.9, 15.2, 17.2]], about: "A pirate-themed technical adventure combining puzzles, logic, and programming challenges. Solve each challenge, unlock the next stage, and survive the journey to discover the hidden treasure.", rules: ["Complete each challenge to unlock the next stage.", "Wrong answers cost a life/attempt.", "No skipping or bypassing challenges.", "Follow the instructions on each challenge screen.", "Complete the journey to claim the treasure."] },
  { id: "signal", name: "The Last Signal", tag: "Technical clue-solving expedition", date: "13 October 2026", time: "12:00 PM – 3:00 PM", day: "Day 2 · Beyond the Known", team: "2 members", extra: "Event 2 · Rounds: 20 Min · 10 Min · 30 Min", closing: "", x: "65%", y: "62%", hs: [[71.8, 42.7, 24.2, 26.9], [59, 53.8, 11.6, 17.6]], about: "Navigate the unknown by solving technical clues, identifying routes, and reaching the destination. The final round combines grid-solving and system challenges, testing teamwork, logic, and communication.", rules: ["Start at SOURCE and follow clues to reach DEST.", "Identify the correct nodes and backtrack when instructed.", "In Round 3, one participant solves grids while the other solves system questions.", "Complete each round within the allotted time.", "Organizers' decisions are final."] },
];


const SIZES: Record<string, [number, number]> = { code: [1, 1], unseen: [2, 2], seas: [1, 1], signal: [2, 2] };
const REG_EVENTS = EVENTS.map((e) => ({ id: e.id, name: e.name, day: e.day.split(" · ")[0], size: SIZES[e.id] }));

// Hotspots over campus-map.jpg: [name, left%, top%, width%, height%]
const SPOTS: [string, number, number, number, number][] = [
  ["Ground", 15.6, 27.3, 52.7, 7.2], ["Sports Ground", 15.6, 37.1, 12.7, 13.7], ["Viva Auditorium", 72.8, 29.3, 11.7, 5.5],
  ["B Block", 31.7, 37.1, 9.8, 5.9], ["OAT", 41.8, 37.1, 16.3, 3.8], ["C Block", 58.4, 37.1, 9.2, 6.2],
  ["Stage", 45.1, 43.0, 9.6, 1.9], ["Central Block", 44.4, 45.1, 11.2, 5.1], ["A Block", 32.2, 50.8, 9.3, 6.4],
  ["D Block", 58.4, 50.8, 9.2, 6.4], ["University Block", 15.6, 56.5, 12.7, 10.7], ["New Block", 32.2, 60.2, 38.9, 8.5],
  ["Bus Ground", 12.5, 71.3, 11.7, 9.4],
];

function Dust({ n = 30 }: { n?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="absolute top-0 h-1 w-1 rounded-full bg-parchment/60"
          style={{ left: `${(i * 37) % 100}%`, animation: `dust-fall ${10 + (i % 7) * 2}s linear ${-(i * 1.3)}s infinite`, opacity: 0.5 }} />
      ))}
      <div className="mist absolute inset-x-0 top-1/3 h-1/3 blur-2xl" />
    </div>
  );
}

function Loader({ onDone }: { onDone: () => void }) {
  const [p, setP] = useState(0);
  const [opening, setOpening] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setP((v) => Math.min(100, v + 4 + Math.round(Math.random() * 6))), 60);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (p >= 100 && !opening) { setOpening(true); setTimeout(onDone, 1500); }
  }, [p, opening, onDone]);
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-1000 ${opening ? "opacity-0 delay-700" : ""}`}>
      <div className={`bronze-coin flex h-56 w-56 items-center justify-center rounded-full transition-transform duration-1000 ${opening ? "scale-150" : ""}`}>
        <img src={logo} alt="Spardha 2K26" className="w-40 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" />
      </div>
      <p className="mt-8 font-display text-xs font-semibold tracking-[0.5em] text-parchment/85">VVITU ACM PRESENTS...</p>
      <div className="mt-6 h-px w-48 bg-border"><div className="h-px bg-primary transition-all" style={{ width: `${p}%` }} /></div>
      <p className="mt-3 font-display text-sm text-primary">{Math.min(p, 100)}%</p>
    </div>
  );
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const f = () => setY(window.scrollY);
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return y;
}

function Nav({ active, onRegister }: { active: string; onRegister: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    const k = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", k);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", k); };
  }, [menu]);
  return (
    <header className={`site-nav ${scrolled || menu ? "is-scrolled" : ""} ${menu ? "is-open" : ""}`}>
      <div className="site-nav__in">
        <div className="site-nav__brand">
          <a href="#home" aria-label="ACM VVITU" className="acm-badge"><img src={acm} alt="ACM" className="site-nav__acm" /></a>
          <span className="site-nav__sep" aria-hidden />
          <a href="#home" aria-label="Spardha 2K26"><img src={logo} alt="Spardha" className="site-nav__logo" /></a>
        </div>
        <nav className="site-nav__links" aria-label="Primary">
          {NAV.map((n) => (
            <a key={n} href={`#${n}`} aria-current={active === n ? "true" : undefined} className={`site-nav__link ${active === n ? "is-active" : ""}`}>{n.toUpperCase()}</a>
          ))}
        </nav>
        <div className="site-nav__right">
          <button type="button" onClick={() => { setMenu(false); onRegister(); }} className="site-nav__cta">REGISTER</button>
          <button type="button" className="site-nav__burger" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} onClick={() => setMenu((m) => !m)}><span /><span /><span /></button>
        </div>
      </div>
      <div className="site-nav__panel">
        {NAV.map((n) => (
          <a key={n} href={`#${n}`} onClick={() => setMenu(false)} className={`site-nav__plink ${active === n ? "is-active" : ""}`}>{n.toUpperCase()}</a>
        ))}
        <button type="button" onClick={() => { setMenu(false); onRegister(); }} className="site-nav__cta site-nav__cta--wide">REGISTER NOW</button>
      </div>
    </header>
  );
}

function Chrome() {
  const bar = useRef<HTMLDivElement>(null);
  const torch = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
      setShow(window.scrollY > 900);
    };
    const onMove = (e: MouseEvent) => {
      torch.current?.style.setProperty("--mx", `${e.clientX}px`);
      torch.current?.style.setProperty("--my", `${e.clientY}px`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMove); };
  }, []);
  return (
    <>
      <div ref={bar} className="scroll-progress" />
      <div ref={torch} className="torch" />
      <button aria-label="Back to top" data-show={show} className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
    </>
  );
}

const LAYERS = [
  { id: "home", src: cave, flip: false },
  { id: "about", src: temple, flip: false },
  { id: "events", src: forest, flip: false },
  { id: "campus", src: temple, flip: true },
  { id: "contact", src: cave, flip: true },
  { id: "footer", src: forest, flip: true },
];

function Backdrop({ ready }: { ready: boolean }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const smooth = (t: number) => t * t * (3 - 2 * t);
    const update = () => {
      raf = 0;
      const c = window.scrollY + window.innerHeight / 2;
      const mids = LAYERS.map((l) => { const el = document.getElementById(l.id); return el ? el.offsetTop + el.offsetHeight / 2 : 0; });
      let bloom = 0, sweep = -1;
      LAYERS.forEach((_, i) => {
        let o: number;
        if (c <= mids[i]) o = i === 0 ? 1 : c <= mids[i - 1] ? 0 : smooth((c - mids[i - 1]) / (mids[i] - mids[i - 1]));
        else o = i === LAYERS.length - 1 ? 1 : c >= mids[i + 1] ? 0 : smooth(1 - (c - mids[i]) / (mids[i + 1] - mids[i]));
        if (i > 0) { const b = 1 - Math.abs(2 * o - 1); if (b > bloom) { bloom = b; sweep = 2 * o - 1; } }
        const el = refs.current[i];
        if (el) el.style.opacity = String(o);
      });
      root.current?.style.setProperty("--bloom", String(bloom * 0.6));
      root.current?.style.setProperty("--sw", String(sweep));
    };
    const tick = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    return () => { window.removeEventListener("scroll", tick); window.removeEventListener("resize", tick); cancelAnimationFrame(raf); };
  }, [ready]);
  return (
    <div ref={root} className="bd" style={{ opacity: ready ? 1 : 0 }} aria-hidden>
      {LAYERS.map((l, i) => (
        <div key={l.id} ref={(el) => { refs.current[i] = el; }} className={`bd-l ${l.flip ? "bd-flip" : ""}`} style={{ opacity: i === 0 ? 1 : 0 }}>
          <img src={l.src} alt="" className="bg-photo bg-drift" />
        </div>
      ))}
      <div className="bd-shade" />
      <div className="vignette absolute inset-0" />
      <div className="rays" />
      <div className="bd-streak" />
      <Dust n={26} />
    </div>
  );
}

function Rail({ active }: { active: string }) {
  return (
    <div className="fixed right-4 top-1/2 z-[60] hidden -translate-y-1/2 flex-col items-center gap-6 md:flex">
      <span className="absolute inset-y-[-1.5rem] w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      {NAV.map((n) => (
        <a key={n} href={`#${n}`} aria-label={n} className="group relative flex h-4 w-4 items-center justify-center">
          <span className={`rail-dot ${active === n ? "is-on" : ""}`} />
          <span className="rail-tip">{n.toUpperCase()}</span>
        </a>
      ))}
    </div>
  );
}

function Index() {
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState("home");
  const [ev, setEv] = useState<Ev | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [reg, setReg] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [zoom, setZoom] = useState(false);
  const y = useScrollY();

  useEffect(() => {
    const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    NAV.forEach((n) => { const el = document.getElementById(n); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [loaded]);

  useEffect(() => initTextReveal(), [loaded]);

  useEffect(() => {
    if (!loaded) return;
    const off = [initSmoothScroll(), initPageTransition()];
    return () => off.forEach((f) => f());
  }, [loaded]);

  const heroP = Math.min(1, y / 900);

  return (
    <main className="bg-background text-foreground">
      <Backdrop ready={loaded} />
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      <Nav active={active} onRegister={() => setReg({ open: true, id: null })} />
      <Chrome />
      <Rail active={active} />

      {/* HOME */}
      <section id="home" className={`relative h-[180vh] ${loaded ? "animate-crack" : ""}`}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <img src={cave} alt="Ancient cave opening onto a misty valley of temples" width={1920} height={1088}
            className="bg-photo absolute inset-0 h-full w-full object-cover" style={{ transform: `scale(${1 + heroP * 0.6})`, transformOrigin: "55% 50%" }} />
          <div className="vignette absolute inset-0" />
          <div className="rays" />
          <Dust n={40} />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ opacity: 1 - heroP * 1.6, transform: `translateY(${-heroP * 120}px)`, filter: `blur(${heroP * 10}px)` }}>
            <div className="hero-veil pointer-events-none absolute inset-0" />
            <p className="animate-rise presents relative font-display text-[10px] tracking-[0.35em] md:text-xs">ACM VVITU STUDENT CHAPTER PRESENTS</p>
            <h1 className="animate-rise relative mt-4"><span className="logo-shine mx-auto block w-[min(80vw,620px)]" style={{ "--logo": `url(${logo})` } as React.CSSProperties}><img src={logo} alt="Spardha 2K26" width={1200} height={721} className="logo-white block w-full" /></span></h1>
            <h2 className="hero-sub animate-rise legible relative mt-2 font-display font-bold text-parchment" style={{ animationDelay: ".3s" }}>THE UNCHARTED</h2>
            <p className="animate-rise relative mt-6 max-w-3xl" style={{ animationDelay: ".6s" }}><span className="fest-script">The Annual Techno Fest of</span><span className="fest-univ">Vasireddy Venkatadri International Technological University</span></p>
          </div>
          <div className="scroll-cue absolute bottom-10 left-8 hidden flex-col items-center gap-2 font-display text-[10px] font-semibold tracking-[0.4em] text-parchment legible md:flex" style={{ opacity: 1 - heroP * 4 }}><span>SCROLL</span><span className="h-10 w-px bg-primary" /></div>
          <div className="sign" style={{ opacity: Math.max(0, 1 - heroP * 2.2) }}>
            <div className="woodboard sign-board">
              <p className="font-display font-semibold text-parchment/90 legible">EXPEDITION DATES</p>
              <p className="font-display font-bold tracking-widest text-parchment legible">OCT 12<sup>th</sup> &amp; 13<sup>th</sup></p>
            </div>
            <span className="sign-post" />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <AboutScene />

      {/* EVENTS */}
      <section id="events" className="relative py-28">
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <div className="scrim mx-auto max-w-3xl px-6 py-8 text-center">
            <p className="font-display text-xs font-semibold tracking-[0.5em] text-primary chapter">CHAMBER II</p>
            <h2 className="engraved mt-3 text-5xl font-bold md:text-7xl">THE EXPEDITION MAP</h2>
            <p className="mt-3 font-serif text-xl font-semibold italic text-parchment">Choose a territory. Begin your discovery.</p>
          </div>
        </div>
        <EventsDoor events={EVENTS} ev={ev} onPick={setEv} onRegister={(id) => setReg({ open: true, id })} />
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <div className="scrim mx-auto mt-28 max-w-3xl px-6 py-8 text-center">
            <h2 className="engraved text-4xl font-bold md:text-6xl">SPOT EVENTS</h2>
            <p className="mx-auto mt-4 max-w-xl font-serif text-xl font-semibold text-parchment">On-the-spot challenges and surprises await! Navigate through our interactive gallery to discover the exciting spot events.</p>
            <SpotEvents />
          </div>
        </div>
      </section>

      {/* CAMPUS */}
      <section id="campus" className="relative overflow-hidden py-28">
        <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
          <div className="scrim mx-auto max-w-3xl px-6 py-8">
          <p className="font-display text-xs font-semibold tracking-[0.5em] text-primary chapter">CHAMBER III</p>
          <h2 className="engraved mt-3 text-5xl font-bold md:text-7xl">THE CAMPUS</h2>
          <p className="mt-3 font-serif text-xl font-semibold italic text-parchment">{place ? `Arrived at ${place}` : "Select a landmark to travel there."}</p>
          </div>
          <div className="cm-wrap mx-auto mt-10 text-left">
            <div className="campus-frame relative overflow-hidden">
              <img src={campusMap} alt="Illustrated navigation map of the VVIT University campus" loading="lazy" className="block h-auto w-full" />
              {SPOTS.map(([n, x, y, w, h]) => (
                <button key={n} aria-label={n} onClick={() => setPlace(n === place ? null : n)} className={`hs ${place === n ? "is-on" : ""}`} style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}><span className="hs-tag">{n}</span></button>
              ))}
            </div>
            <div className="scrim px-6 py-8">
              <h3 className="card-title font-display font-semibold tracking-[0.3em] text-primary">LANDMARKS</h3>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {SPOTS.map(([n]) => (
                  <button key={n} onClick={() => setPlace(n === place ? null : n)} className={`border px-3 py-2 text-left font-display text-[11px] font-semibold tracking-[0.15em] ${place === n ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/60 text-parchment"}`}>{n.toUpperCase()}</button>
                ))}
              </div>
              <button onClick={() => setZoom(true)} className="shine mt-6 border border-primary/70 bg-background/60 px-5 py-2 font-display text-xs font-semibold tracking-[0.3em] text-primary">VIEW FULL MAP</button>
            </div>
          </div>
          {place && <button onClick={() => setPlace(null)} className="mt-6 border border-parchment/40 px-5 py-2 font-display text-xs tracking-[0.25em] text-parchment">CLEAR SELECTION</button>}
        </div>
        {zoom && <div className="reg-back" onClick={() => setZoom(false)}><img src={campusMap} alt="Campus map, full view" className="max-h-full max-w-full object-contain" /></div>}
      </section>

      {/* CONTACT */}
      <ContactSection />

      {/* FOOTER */}
      <footer id="footer" className="relative overflow-hidden pt-40">
        <div className="scrim relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-10 text-center">
          <h2 className="engraved text-3xl font-bold md:text-5xl">THE EXPEDITION IS COMPLETE.</h2>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-[0.4em] text-parchment legible md:text-3xl">THE UNKNOWN REMAINS.</h2>
          <p className="mt-14 font-display font-semibold tracking-[0.3em] text-primary">VVITU ACM / SPARDHA 2K26</p>
          <div className="mt-4 flex flex-wrap justify-center gap-5 font-display text-[11px] font-semibold tracking-[0.25em] text-parchment/90">
            {NAV.map((n) => <a key={n} href={`#${n}`} className="hover:text-parchment">{n.toUpperCase()}</a>)}
            <button type="button" onClick={() => setReg({ open: true, id: null })} className="hover:text-parchment">REGISTER</button>
          </div>
          <p className="mt-6 text-sm font-medium text-parchment/90">acm.vvit@gmail.com · +91 78426 71226</p>
          <p className="text-sm font-medium text-parchment/90">Vasireddy Venkatadri International Technological University, Nambur, Guntur — 522508</p>
          <p className="mt-6 text-xs text-parchment/75">VVITU ACM Student Chapter · © 2026 VVITU ACM Student Chapter</p>
        </div>
        <div className="h-40 bg-gradient-to-b from-transparent to-background" />
      </footer>
      <RegistrationModal open={reg.open} eventId={reg.id} events={REG_EVENTS} onClose={() => setReg({ open: false, id: null })} />
    </main>
  );
}
