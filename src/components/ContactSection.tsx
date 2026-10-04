import { useEffect, useState } from "react";

const PHONES = ["+91 82973 40096", "+91 78426 71226", "+91 89195 73816"];
const EMAIL = "acm.vvit@gmail.com";
const INSTA = "acm_vvitu";
const ADDRESS = "Vasireddy Venkatadri International Technological University, Nambur (V), Guntur, Andhra Pradesh 522508";
const MAP_URL = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Vasireddy Venkatadri International Technological University, Nambur, Guntur");
const FEST_START = new Date("2026-10-12T09:00:00+05:30").getTime();

const TIMELINE = [
  { label: "Festival Dates", text: "October 12–13, 2026", end: new Date("2026-10-13T23:59:59+05:30").getTime() },
];

const I = {
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  insta: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" /></>,
  pin: <><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>,
  check: <path d="m5 12 5 5 9-10" />,
};
function Icon({ d, className = "" }: { d: keyof typeof I; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 ${className}`} aria-hidden>{I[d]}</svg>;
}

function Countdown({ now }: { now: number | null }) {
  if (now === null) return <div className="ct-count" aria-hidden />;
  const diff = Math.max(0, FEST_START - now);
  const parts = [["DAYS", Math.floor(diff / 864e5)], ["HRS", Math.floor(diff / 36e5) % 24], ["MIN", Math.floor(diff / 6e4) % 60], ["SEC", Math.floor(diff / 1e3) % 60]] as const;
  return (
    <div className="ct-count" role="timer" aria-label="Time until Spardha 2K26">
      {parts.map(([l, v]) => (<div key={l}><b>{String(v).padStart(2, "0")}</b><span>{l}</span></div>))}
    </div>
  );
}

export function ContactSection() {
  const [now, setNow] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", email: "", msg: "" });
  const [state, setState] = useState<"idle" | "error" | "sent">("idle");

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const copy = async (key: string, value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(key); setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600); } catch { /* clipboard unavailable */ }
  };

  const submit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email) || f.msg.trim().length < 5) { setState("error"); return; }
    const body = `${f.msg}\n\n— ${f.name} (${f.email})`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Spardha 2K26 — Query from " + f.name)}&body=${encodeURIComponent(body)}`;
    setState("sent");
  };

  const row = (id: string, icon: keyof typeof I, label: string, value: string, href: string) => (
    <div className="ct-row" key={id}>
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="ct-row-main">
        <span className="ct-ico"><Icon d={icon} /></span>
        <span><small>{label}</small><strong>{value}</strong></span>
      </a>
      <button type="button" className="ct-copy" aria-label={`Copy ${value}`} onClick={() => copy(id, value)}>
        <Icon d={copied === id ? "check" : "copy"} className="h-4 w-4" />
        <span>{copied === id ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );

  const next = TIMELINE.findIndex((t) => now !== null && t.end >= now);

  return (
    <section id="contact" className="relative overflow-hidden py-28">
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <div className="scrim mx-auto max-w-3xl px-6 py-8 text-center">
          <p className="chapter font-display text-xs font-semibold tracking-[0.5em] text-primary">CHAMBER IV</p>
          <h2 className="engraved mt-3 text-5xl font-bold md:text-6xl">CONTACT US</h2>
          <p className="mt-3 font-serif text-xl font-semibold text-parchment">Connect with us for queries, partnerships, or to join the Tech revolution.</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <div className="ct-card lg:col-span-3">
            <h3 className="ct-h">REACH US</h3>
            <div className="mt-5 space-y-3">
              {PHONES.map((p, i) => row(`p${i}`, "phone", "Call", p, `tel:${p.replace(/\s/g, "")}`))}
              {row("ig", "insta", "Instagram", `@${INSTA}`, `https://instagram.com/${INSTA}`)}
              {row("em", "mail", "Email", EMAIL, `mailto:${EMAIL}`)}
            </div>
          </div>

          <div className="ct-card lg:col-span-2">
            <h3 className="ct-h">SEND A MESSAGE</h3>
            <div className="mt-5 space-y-4">
              <label className="ct-field"><input value={f.name} onChange={(e) => { setF({ ...f, name: e.target.value }); setState("idle"); }} placeholder=" " autoComplete="name" /><span>Your name</span></label>
              <label className="ct-field"><input type="email" value={f.email} onChange={(e) => { setF({ ...f, email: e.target.value }); setState("idle"); }} placeholder=" " autoComplete="email" /><span>Your email</span></label>
              <label className="ct-field"><textarea rows={4} value={f.msg} onChange={(e) => { setF({ ...f, msg: e.target.value }); setState("idle"); }} placeholder=" " /><span>How can we help?</span></label>
              <button type="button" onClick={submit} className="ct-send">SEND MESSAGE</button>
              <p className={`ct-note ${state}`} role="status">{state === "error" ? "Please fill in your name, a valid email and a short message." : state === "sent" ? "Opening your mail app — just press send." : "Opens your email app with the message ready to send."}</p>
            </div>
          </div>

          <div className="ct-card lg:col-span-3">
            <h3 className="ct-h">IMPORTANT DATES</h3>
            <Countdown now={now} />
            <ol className="ct-tl">
              {TIMELINE.map((t, i) => {
                const done = now !== null && t.end < now;
                return (
                  <li key={t.label} className={done ? "done" : i === next ? "next" : ""}>
                    <i>{done ? <Icon d="check" className="h-3 w-3" /> : null}</i>
                    <div><small>{t.label}</small><strong>{t.text}</strong></div>
                    <em>{done ? "Completed" : i === next ? "Upcoming" : ""}</em>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="ct-card lg:col-span-2">
            <h3 className="ct-h">VENUE</h3>
            <div className="mt-5 flex gap-4">
              <span className="ct-ico shrink-0"><Icon d="pin" /></span>
              <div>
                <p className="font-semibold text-parchment">VVIT University, Guntur</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-parchment/85">{ADDRESS}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={MAP_URL} target="_blank" rel="noreferrer" className="ct-send ct-inline">GET DIRECTIONS</a>
              <button type="button" className="ct-ghost" onClick={() => copy("addr", ADDRESS)}>{copied === "addr" ? "ADDRESS COPIED" : "COPY ADDRESS"}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
