/**
 * "Portal" transition between chambers.
 * No scrolling is ever shown: a soft, feathered iris with a thin golden rim closes over the view
 * like a temple door, the chamber title surfaces in the dark, the page is swapped behind it,
 * and the iris blooms open on the new chamber (whose text reveals as it opens).
 * Falls back to normal scrolling for reduced-motion users.
 * Registered in capture phase so it runs before the smooth-scroll link handler.
 */
export function initPageTransition(): () => void {
  if (typeof window === "undefined") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const LABELS: Record<string, [string, string]> = {
    home: ["THE UNCHARTED", "BASE CAMP"],
    about: ["CHAMBER I", "ABOUT SPARDHA"],
    events: ["CHAMBER II", "THE EVENTS"],
    campus: ["CHAMBER III", "THE CAMPUS"],
    contact: ["CHAMBER IV", "CONTACT US"],
  };
  const FEATHER = 112; // px, must match the mask feather in styles.css
  const T_CLOSE = 720, T_HOLD = 460, T_OPEN = 950;

  const root = document.documentElement;
  const el = document.createElement("div");
  el.className = "pt";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = '<div class="pt-v"></div><div class="pt-ring"></div><div class="pt-c"><small></small><b></b><i></i></div>';
  document.body.appendChild(el);
  const ring = el.querySelector(".pt-ring") as HTMLElement;
  const card = el.querySelector(".pt-c") as HTMLElement;
  const line = el.querySelector("i") as HTMLElement;
  const small = el.querySelector("small") as HTMLElement;
  const big = el.querySelector("b") as HTMLElement;

  const c01 = (v: number) => Math.min(1, Math.max(0, v));
  const inOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;
  const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  let raf = 0;

  const paint = (r: number, R0: number, title: number) => {
    el.style.setProperty("--r", `${r.toFixed(1)}px`);
    ring.style.opacity = String(c01((r + FEATHER - 8) / 70) * c01((R0 - r) / 90));
    card.style.opacity = String(title);
    card.style.transform = `translateY(${((1 - title) * 10).toFixed(1)}px) scale(${(0.985 + title * 0.015).toFixed(3)})`;
    line.style.width = `${title * Math.min(window.innerWidth * 0.55, 240)}px`;
  };

  const finish = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    el.classList.remove("on");
    el.style.removeProperty("--r");
    ring.style.opacity = card.style.opacity = card.style.transform = line.style.width = "";
  };

  const travel = (id: string, hash: string, target: HTMLElement) => {
    if (raf) return;
    const from = window.scrollY;
    const max = Math.max(0, root.scrollHeight - window.innerHeight);
    const to = Math.min(max, Math.max(0, id === "home" ? 0 : target.getBoundingClientRect().top + from));
    if (Math.abs(to - from) < 4) { history.replaceState(null, "", hash); return; }
    small.textContent = LABELS[id][0];
    big.textContent = LABELS[id][1];
    const R0 = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 40;
    paint(R0, R0, 0);
    el.classList.add("on");
    const t0 = performance.now();
    let jumped = false;
    const frame = (now: number) => {
      const t = now - t0;
      if (t < T_CLOSE) {
        const p = t / T_CLOSE;
        paint(lerp(R0, -FEATHER, inOut(p)), R0, c01((p - 0.55) / 0.45));
      } else if (t < T_CLOSE + T_HOLD) {
        if (!jumped) {
          jumped = true;
          window.scrollTo({ top: to, behavior: "instant" as ScrollBehavior });
          history.replaceState(null, "", hash);
        }
        paint(-FEATHER, R0, 1);
      } else if (t < T_CLOSE + T_HOLD + T_OPEN) {
        const p = (t - T_CLOSE - T_HOLD) / T_OPEN;
        paint(lerp(-FEATHER, R0, outCubic(p)), R0, 1 - c01(p / 0.28));
      } else { finish(); return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  };

  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const a = (e.target instanceof Element ? e.target.closest('a[href^="#"], button[data-goto]') : null) as HTMLElement | null;
    if (!a) return;
    const hash = a.getAttribute("href") || "#" + (a.getAttribute("data-goto") || "");
    const id = hash.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!LABELS[id] || !target) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    travel(id, hash, target);
  };

  const lock = (e: Event) => { if (raf) e.preventDefault(); };

  document.addEventListener("click", onClick, true);
  window.addEventListener("wheel", lock, { passive: false, capture: true });
  window.addEventListener("touchmove", lock, { passive: false, capture: true });
  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener("click", onClick, true);
    window.removeEventListener("wheel", lock, true);
    window.removeEventListener("touchmove", lock, true);
    el.remove();
  };
}
