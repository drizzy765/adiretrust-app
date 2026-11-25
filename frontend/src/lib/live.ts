import type { CheckResponse, LanguageCode, PriceGuidance } from "../types";
import { ApiError, apiBase } from "./api";

export type LiveCapabilities = {
  photoCheck: boolean;
  chat: boolean;
  voice: boolean;
  sellers: boolean;
  passport: boolean;
};

const DEFAULT_CAPS: LiveCapabilities = {
  photoCheck: true,
  chat: true,
  voice: false,
  sellers: false,
  passport: false,
};

function availableFlag(value: unknown): boolean | null {
  if (value && typeof value === "object" && "available" in value) {
    const flag = (value as { available: unknown }).available;
    return typeof flag === "boolean" ? flag : null;
  }
  if (typeof value === "boolean") return value;
  return null;
}

export async function getLiveCapabilities(): Promise<LiveCapabilities> {
  const base = apiBase();
  if (!base) return { ...DEFAULT_CAPS, voice: false, sellers: false, passport: false };
  const caps: LiveCapabilities = { ...DEFAULT_CAPS };
  try {
    const response = await fetch(`${base}/capabilities`);
    if (response.ok) {
      const data: unknown = await response.json();
      if (data && typeof data === "object") {
        const source = data as Record<string, unknown>;
        const photo = availableFlag(source.photo_check ?? source.photoCheck);
        const chat = availableFlag(source.text_chat ?? source.chat);
        const voiceIn = availableFlag(source.voice_input);
        const voiceOut = availableFlag(source.voice_output);
        const voice = availableFlag(source.voice);
        if (photo !== null) caps.photoCheck = photo;
        void chat; // chat is served by the Nobus backend via the Vercel proxy
        caps.voice = voice === true || voiceIn === true || voiceOut === true;
      }
    }
  } catch {
    /* keep defaults */
  }

  try {
    const response = await fetch(`${base}/sellers`);
    if (!response.ok) {
      caps.sellers = false;
    } else {
      const data: unknown = await response.json();
      const sellers =
        data && typeof data === "object" && Array.isArray((data as { sellers?: unknown }).sellers)
          ? ((data as { sellers: unknown[] }).sellers)
          : [];
      caps.sellers = sellers.some((item) => {
        if (!item || typeof item !== "object") return false;
        const seller = item as { placeholder?: unknown; name?: unknown };
        if (seller.placeholder === true) return false;
        const name = typeof seller.name === "string" ? seller.name : "";
        return name.length > 0 && !name.toUpperCase().includes("PLACEHOLDER");
      });
    }
  } catch {
    caps.sellers = false;
  }

  caps.passport = false;
  // Voice is advertised but the live provider errors; never enable it here.
  caps.voice = false;
  return caps;
}

export function isStubResult(result: CheckResponse): boolean {
  if (result.model_version === "stub") return true;
  const stubReason = result.reasons.some((reason) => reason.toUpperCase().includes("STUB"));
  return result.label === "uncertain" && stubReason;
}

export function hasRealPrice(price: PriceGuidance): boolean {
  if (!price || price.status.toUpperCase() === "PLACEHOLDER") return false;
  const usable = (range: number[] | null | undefined) =>
    Array.isArray(range) && range.length >= 2 && typeof range[0] === "number" && typeof range[1] === "number";
  return usable(price.buy_range_ngn) || usable(price.sell_range_ngn);
}

export function publicReasons(result: CheckResponse): string[] {
  return result.reasons.filter((reason) => !reason.toUpperCase().includes("STUB")).slice(0, 4);
}

export async function sendLiveChat(
  history: ReadonlyArray<{ role: "user" | "assistant"; text: string }>,
  language: LanguageCode,
): Promise<string> {
  const base = apiBase();
  if (!base) throw new ApiError(503, "Chat is not configured.");
  const messages = history.slice(-12).map((item) => ({
    role: item.role === "assistant" ? "assistant" : "user",
    content: item.text,
  }));
  const response = await fetch(`${base}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, language }),
  });
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const data: unknown = await response.json();
      if (data && typeof data === "object" && "detail" in data) {
        const detail = (data as { detail: unknown }).detail;
        if (typeof detail === "string" && detail.trim()) message = detail;
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(response.status, message);
  }
  const data: unknown = await response.json();
  const reply =
    data && typeof data === "object" && typeof (data as { reply?: unknown }).reply === "string"
      ? (data as { reply: string }).reply.trim()
      : "";
  if (!reply) throw new ApiError(response.status, "The chat service returned an empty reply.");
  return reply;
}
