import type { CheckResponse, VerdictLabel } from "../types";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const VERDICTS: Record<VerdictLabel, { title: string; tone: VerdictLabel }> = {
  genuine_hand_dyed: { title: "Genuine hand-dyed", tone: "genuine_hand_dyed" },
  factory_print: { title: "Factory print", tone: "factory_print" },
  uncertain: { title: "Uncertain", tone: "uncertain" },
};

export function verdictOf(label: string): { title: string; tone: "genuine" | "print" | "uncertain" } {
  if (label === "genuine_hand_dyed") return { title: VERDICTS.genuine_hand_dyed.title, tone: "genuine" };
  if (label === "factory_print") return { title: VERDICTS.factory_print.title, tone: "print" };
  return { title: "Uncertain", tone: "uncertain" };
}

export function modelNotLoaded(result: CheckResponse): boolean {
  return result.model_version === "stub" || result.confidence === 0;
}

export function formatNgnRange(range: number[] | null | undefined): string | null {
  if (!range || range.length < 2) return null;
  const [low, high] = range;
  if (typeof low !== "number" || typeof high !== "number" || Number.isNaN(low) || Number.isNaN(high)) {
    return null;
  }
  const fmt = new Intl.NumberFormat("en-NG");
  return `₦${fmt.format(low)}–₦${fmt.format(high)}`;
}

export function formatRecordDate(value: string | null): string {
  if (!value) return "Not recorded";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(parsed));
}

export function recorded(value: string | null | undefined): string {
  const text = value?.trim();
  return text ? text : "Not recorded";
}
