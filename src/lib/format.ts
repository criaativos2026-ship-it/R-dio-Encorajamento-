import { TIMEZONE } from "./constants";

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("pt-BR", { timeZone: TIMEZONE, ...opts });
const dayKey = fmt({ year: "numeric", month: "2-digit", day: "2-digit" });

/** Data de hoje (AAAA-MM-DD) no fuso de São Carlos. */
export function todayISO(now = new Date()) {
  const [d, m, y] = dayKey.format(now).split("/");
  return `${y}-${m}-${d}`;
}

/** Hora atual (HH:MM) no fuso de São Carlos — sempre do servidor, nunca do aparelho. */
export function clockNow(now = new Date()) {
  return fmt({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now);
}

export function hourNow(now = new Date()) {
  return Number(fmt({ hour: "2-digit", hourCycle: "h23" }).format(now));
}

export function greeting(now = new Date()) {
  const h = hourNow(now);
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export function time(d: Date) {
  return fmt({ hour: "2-digit", minute: "2-digit" }).format(d).replace(":", "h");
}

/** "Hoje, 08h14" · "Ontem, 20h03" · "12 nov, 19h40" */
export function when(d: Date, now = new Date()) {
  const key = dayKey.format(d);
  if (key === dayKey.format(now)) return `Hoje, ${time(d)}`;
  if (key === dayKey.format(new Date(now.getTime() - 864e5))) return `Ontem, ${time(d)}`;
  return `${fmt({ day: "numeric", month: "short" }).format(d).replace(".", "").replace(" de ", " ")}, ${time(d)}`;
}

/** "Domingo · 23 nov" a partir de AAAA-MM-DD. */
export function serviceDate(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" }).format(d);
  const day = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", timeZone: "UTC" }).format(d).replace(".", "").replace(" de ", " ");
  return `${weekday.split("-")[0].replace(/^./, (c) => c.toUpperCase())} · ${day}`;
}

export function dayHeading(d: Date) {
  const now = new Date();
  const key = dayKey.format(d);
  if (key === dayKey.format(now)) return "Hoje";
  if (key === dayKey.format(new Date(now.getTime() - 864e5))) return "Ontem";
  return fmt({ weekday: "long", day: "numeric", month: "long" }).format(d);
}

export function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0];
}
