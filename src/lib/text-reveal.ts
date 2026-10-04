/**
 * Living text: headings rise word-by-word out of a mask, paragraphs fade in word-by-word
 * as they scroll into view, and cards/tiles ease up in a stagger. Respects reduced motion via CSS.
 */
export function initTextReveal(): () => void {
  if (typeof window === "undefined") return () => {};
  const TITLES = "section:not(#home) h2";
  const WORDS = "section:not(#home) .scrim > p:not(.chapter), .slab > p:not(.chapter)";
  const BLOCKS = "section:not(#home) h3, section:not(#home) .stone, section:not(#home) .chapter, #contact .ct-card, .slab-wrap, .slab .tile";
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

  const split = (root: HTMLElement, cls: string, mask: boolean) => {
    let i = 0;
    const walk = (node: Node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          (n.textContent || "").split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const span = document.createElement("span");
            span.className = cls; span.textContent = part;
            span.style.setProperty("--i", String(Math.min(i++, 45)));
            if (mask) { const w = document.createElement("span"); w.className = "w"; w.appendChild(span); frag.appendChild(w); }
            else frag.appendChild(span);
          });
          (n as ChildNode).replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(root);
  };

  document.querySelectorAll<HTMLElement>(TITLES).forEach((el) => {
    if (!el.dataset.rv) {
      el.dataset.rv = "1"; el.setAttribute("aria-label", el.textContent || "");
      split(el, "wi", true); el.classList.add("rv-title");
    }
    if (!el.classList.contains("in")) io.observe(el);
  });
  document.querySelectorAll<HTMLElement>(WORDS).forEach((el) => {
    if (!el.dataset.rv) { el.dataset.rv = "1"; split(el, "wd", false); el.classList.add("rv-words"); }
    if (!el.classList.contains("in")) io.observe(el);
  });
  document.querySelectorAll<HTMLElement>(BLOCKS).forEach((el, i) => {
    if (!el.dataset.rv) {
      el.dataset.rv = "1"; el.classList.add("reveal");
      if (el.classList.contains("stone") || el.classList.contains("tile")) el.classList.add("reveal-pop");
      el.style.transitionDelay = `${(i % 4) * 90}ms`;
      el.addEventListener("transitionend", () => { el.style.transitionDelay = ""; }, { once: true });
    }
    if (!el.classList.contains("in")) io.observe(el);
  });
  return () => io.disconnect();
}
