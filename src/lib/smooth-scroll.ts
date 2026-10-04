/**
 * Lightweight inertial scrolling (no dependencies).
 * - mouse wheel / trackpad glide with easing
 * - in-page links (#events, #campus…) travel with a long eased tween
 * - touch, keyboard and nested scroll areas (modals) stay native
 */
export function initSmoothScroll(): () => void {
  if (typeof window === "undefined") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const root = document.documentElement;
  const max = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const clamp = (v: number) => Math.min(max(), Math.max(0, v));
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const put = (y: number) => window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });

  let current = window.scrollY;
  let target = current;
  let raf = 0;
  let animating = false;
  let last = 0;
  let tween: { from: number; to: number; t0: number; dur: number } | null = null;

  const step = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    if (tween) {
      const p = Math.min(1, (now - tween.t0) / tween.dur);
      current = tween.from + (tween.to - tween.from) * ease(p);
      if (p >= 1) { current = target = tween.to; tween = null; animating = false; }
    } else {
      current += (target - current) * (1 - Math.exp(-dt * 8));
      if (Math.abs(target - current) < 0.4) { current = target; animating = false; }
    }
    put(current);
    raf = animating ? requestAnimationFrame(step) : 0;
  };
  const start = () => {
    animating = true;
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
  };

  const insideScroller = (el: EventTarget | null) => {
    let n = el instanceof Element ? el : null;
    while (n && n !== document.body && n !== root) {
      const o = getComputedStyle(n).overflowY;
      if ((o === "auto" || o === "scroll") && n.scrollHeight > n.clientHeight + 1) return true;
      n = n.parentElement;
    }
    return false;
  };

  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (document.body.style.overflow === "hidden" || insideScroller(e.target)) return;
    e.preventDefault();
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 32; else if (e.deltaMode === 2) dy *= window.innerHeight;
    if (tween || !animating) { tween = null; current = window.scrollY; target = current; }
    target = clamp(target + dy);
    start();
  };

  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const a = (e.target instanceof Element ? e.target.closest('a[href^="#"]') : null) as HTMLAnchorElement | null;
    if (!a) return;
    const hash = a.getAttribute("href") || "#";
    const el = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    if (hash.length > 1 && !el) return;
    e.preventDefault();
    const from = window.scrollY;
    const to = clamp(el ? el.getBoundingClientRect().top + from : 0);
    current = from; target = to;
    tween = { from, to, t0: performance.now(), dur: Math.min(2400, 900 + Math.abs(to - from) * 0.28) };
    start();
    history.replaceState(null, "", hash);
  };

  // follow scrolls we did not start (scrollbar drag, keyboard, "back to top")
  const onScroll = () => { if (!animating) { current = target = window.scrollY; } };

  window.addEventListener("wheel", onWheel, { passive: false });
  document.addEventListener("click", onClick);
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    window.removeEventListener("wheel", onWheel);
    document.removeEventListener("click", onClick);
    window.removeEventListener("scroll", onScroll);
    cancelAnimationFrame(raf);
  };
}
