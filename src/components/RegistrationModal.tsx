import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { submitRegistration } from "@/lib/registration";

export type RegEvent = { id: string; name: string; day: string; size: [number, number] };
const sizeLabel = (n: number) => (n === 1 ? "1 Member (Individual)" : `${n} Members`);
const blank = { name: "", email: "", phone: "", college: "" };

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="reg-f"><span>{label}</span>{children}{error && <em>{error}</em>}</label>;
}

export function RegistrationModal({ open, eventId, events, onClose }: { open: boolean; eventId: string | null; events: RegEvent[]; onClose: () => void }) {
  const [ev, setEv] = useState(events[0].id);
  const [f, setF] = useState(blank);
  const [size, setSize] = useState(1);
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState<null | { status: "sent" | "mail"; id?: string }>(null);
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const first = useRef<HTMLInputElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const cur = events.find((e) => e.id === ev) ?? events[0];

  useEffect(() => { if (open) { setEv(eventId ?? events[0].id); setDone(null); setErr({}); } }, [open, eventId, events]);
  useEffect(() => { setSize((s) => Math.min(cur.size[1], Math.max(cur.size[0], s))); }, [cur]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    const prev = document.body.style.overflow;
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    first.current?.focus();
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    let p = f.phone.replace(/\D/g, "");
    if (p.length === 12 && p.startsWith("91")) p = p.slice(2);
    if (f.name.trim().length < 2) x.name = "Enter the team leader's full name";
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) x.email = "Enter a valid email address";
    if (p.length !== 10) x.phone = "Enter a 10-digit mobile number";
    if (f.college.trim().length < 2) x.college = "Enter your college / institution";
    setErr(x);
    if (Object.keys(x).length) return;
    setBusy(true);
    const r = await submitRegistration({ ...f, phone: p, event: cur.name, day: cur.day, teamSize: size, website: hp });
    if (r.status === "error") setErr({ ...(r.fields ?? {}), form: r.message });
    else setDone({ status: r.status, id: "id" in r ? r.id : undefined });
    setBusy(false);
  };
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="reg-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="reg-t" className="reg-card">
        <button type="button" aria-label="Close" className="reg-x" onClick={onClose}>✕</button>
        {done ? (
          <div className="py-6 text-center">
            <h2 id="reg-t" className="engraved text-3xl font-bold">EXPEDITION LOGGED</h2>
            <p className="mt-5 font-serif text-xl font-semibold text-parchment">{f.name.trim()}, your team is bound for <span className="gold-word">{cur.name}</span>.</p>
            <p className="mt-3 text-sm text-parchment/80">{done.status === "mail" ? "Your email app should now be open — press send to complete the registration." : <>We have received your registration. Your ID is <b className="gold-word">{done.id}</b> — a confirmation has been emailed to {f.email.trim()}.</>}</p>
            <button type="button" className="reg-go shine" onClick={onClose}>CLOSE</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 id="reg-t" className="engraved text-center text-3xl font-bold">EXPEDITION REGISTRATION</h2>
            <p className="mt-2 text-center font-display text-sm tracking-[0.1em] text-parchment/80">{eventId ? `${cur.name} · ${cur.day}` : "General Registration"}</p>
            <Field label="Team Leader Name *" error={err.name}><input ref={first} className="reg-in" value={f.name} onChange={set("name")} placeholder="Enter full name" autoComplete="name" /></Field>
            <Field label="Email Address *" error={err.email}><input className="reg-in" type="email" value={f.email} onChange={set("email")} placeholder="name@college.edu" autoComplete="email" /></Field>
            <Field label="Phone Number *" error={err.phone}><input className="reg-in" type="tel" value={f.phone} onChange={set("phone")} placeholder="+91 XXXXX XXXXX" autoComplete="tel" /></Field>
            <Field label="College / Institution *" error={err.college}><input className="reg-in" value={f.college} onChange={set("college")} placeholder="Vasireddy Venkatadri Int. Tech. Univ." /></Field>
            <Field label="Select Expedition Event *">
              <select className="reg-in" value={ev} onChange={(e) => setEv(e.target.value)}>
                {events.map((e, i) => <option key={e.id} value={e.id}>{`0${i + 1}. ${e.name.toUpperCase()} (${e.day})`}</option>)}
              </select>
            </Field>
            <Field label="Team Size">
              <select className="reg-in" value={size} onChange={(e) => setSize(+e.target.value)}>
                {Array.from({ length: cur.size[1] - cur.size[0] + 1 }, (_, k) => cur.size[0] + k).map((n) => <option key={n} value={n}>{sizeLabel(n)}</option>)}
              </select>
            </Field>
            <input tabIndex={-1} autoComplete="off" aria-hidden value={hp} onChange={(e) => setHp(e.target.value)} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
            {err.form && <p className="mt-4 text-center text-sm" style={{ color: "oklch(.72 .13 40)" }}>{err.form}</p>}
            <button type="submit" disabled={busy} className="reg-go shine">{busy ? "SENDING…" : "★ CONFIRM REGISTRATION ★"}</button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
