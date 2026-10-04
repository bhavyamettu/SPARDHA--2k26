// Backend: Google Apps Script web app (see backend/Code.gs + BACKEND_SETUP.md).
// Put the deployed URL in .env as VITE_REGISTRATION_ENDPOINT. If empty, falls back to the mail app.
export const REGISTRATION_ENDPOINT: string = (import.meta.env.VITE_REGISTRATION_ENDPOINT as string | undefined) ?? "";
export const REGISTRATION_EMAIL = "acm.vvit@gmail.com";

export type RegData = { name: string; email: string; phone: string; college: string; event: string; day: string; teamSize: number; website?: string };
export type RegResult =
  | { status: "sent"; id: string }
  | { status: "mail" }
  | { status: "error"; message: string; fields?: Record<string, string> };

export async function submitRegistration(d: RegData): Promise<RegResult> {
  if (REGISTRATION_ENDPOINT) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 20000);
    try {
      // text/plain avoids a CORS preflight, which Apps Script does not answer.
      const res = await fetch(REGISTRATION_ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(d), signal: ctl.signal });
      const j = await res.json();
      if (j.ok) return { status: "sent", id: j.id };
      return { status: "error", message: j.error || "Registration failed", fields: j.errors };
    } catch {
      return { status: "error", message: "Network problem — please check your connection and retry, or email " + REGISTRATION_EMAIL };
    } finally { clearTimeout(timer); }
  }
  const body = `Spardha 2K26 registration\n\nEvent: ${d.event} (${d.day})\nTeam leader: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nCollege: ${d.college}\nTeam size: ${d.teamSize}`;
  window.location.href = `mailto:${REGISTRATION_EMAIL}?subject=${encodeURIComponent(`Registration — ${d.event}`)}&body=${encodeURIComponent(body)}`;
  return { status: "mail" };
}
