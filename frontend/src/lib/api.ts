import type {
  Capabilities,
  CheckResponse,
  LanguageCode,
  PassportResponse,
  PriceGuidance,
  Seller,
  SellersResponse,
} from "../types";
import { LANGUAGES } from "./languages";
import { mockChatReply, mockCheck, mockPassport, MOCK_SELLERS } from "./mocks";

const LANGUAGE_CODES = new Set<string>(LANGUAGES.map((item) => item.code));

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function apiBase(): string {
  return (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");
}

export function isMockMode(): boolean {
  return apiBase() === "";
}

export function isVoiceUnavailable(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 501 || error.status === 503);
}

function apiUrl(path: string): string {
  const base = apiBase();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "detail" in data) {
      const detail = (data as { detail: unknown }).detail;
      if (typeof detail === "string" && detail.trim()) return detail;
      if (Array.isArray(detail)) {
        const text = detail
          .map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object" && "msg" in item && typeof item.msg === "string") return item.msg;
            return "";
          })
          .filter(Boolean)
          .join(" ");
        if (text) return text;
      }
    }
  } catch {
    /* response was not JSON */
  }
  if (response.status === 503) return "That service is not available.";
  return `Request failed (${response.status}).`;
}

function asNumberPair(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const [low, high] = value;
  if (typeof low !== "number" || typeof high !== "number") return null;
  return [low, high];
}

function asPrice(value: unknown): PriceGuidance {
  const source = value && typeof value === "object" ? (value as Partial<PriceGuidance>) : {};
  return {
    status: typeof source.status === "string" ? source.status : "PLACEHOLDER",
    note:
      typeof source.note === "string" && source.note.trim()
        ? source.note
        : "Price guidance is not available.",
    buy_range_ngn: asNumberPair(source.buy_range_ngn),
    sell_range_ngn: asNumberPair(source.sell_range_ngn),
  };
}

function asCheck(value: unknown, filename: string | null): CheckResponse {
  const source = value && typeof value === "object" ? (value as Partial<CheckResponse>) : {};
  const reasons = Array.isArray(source.reasons) ? source.reasons.filter((item): item is string => typeof item === "string") : [];
  return {
    label: typeof source.label === "string" ? source.label : "uncertain",
    confidence: typeof source.confidence === "number" ? source.confidence : 0,
    reasons,
    price_guidance: asPrice(source.price_guidance),
    model_version: typeof source.model_version === "string" ? source.model_version : "",
    filename: typeof source.filename === "string" ? source.filename : filename,
  };
}

function asLanguage(value: unknown): LanguageCode | null {
  return typeof value === "string" && LANGUAGE_CODES.has(value) ? (value as LanguageCode) : null;
}

export async function getHealth(): Promise<"mock" | "ok" | "down"> {
  if (isMockMode()) return "mock";
  try {
    const response = await fetch(apiUrl("/health"));
    if (!response.ok) return "down";
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "status" in data && (data as { status: unknown }).status === "ok") {
      return "ok";
    }
    return "down";
  } catch {
    return "down";
  }
}

export async function checkCloth(file: File): Promise<CheckResponse> {
  if (isMockMode()) return mockCheck(file.name);
  const body = new FormData();
  body.append("image", file, file.name);
  const response = await fetch(apiUrl("/check"), { method: "POST", body });
  if (!response.ok) throw new ApiError(response.status, await errorMessage(response));
  return asCheck(await response.json(), file.name);
}

export async function getSellers(): Promise<SellersResponse> {
  if (isMockMode()) return MOCK_SELLERS;
  const response = await fetch(apiUrl("/sellers"));
  if (!response.ok) throw new ApiError(response.status, await errorMessage(response));
  const data: unknown = await response.json();
  const source = data && typeof data === "object" ? (data as Partial<SellersResponse>) : {};
  const sellers = Array.isArray(source.sellers)
    ? source.sellers.map(asSeller).filter((item): item is Seller => item !== null)
    : [];
  return {
    sellers,
    note: typeof source.note === "string" ? source.note : "",
  };
}

function asSeller(value: unknown): Seller | null {
  if (!value || typeof value !== "object") return null;
  const seller = value as Partial<Seller>;
  if (typeof seller.id !== "string" || typeof seller.name !== "string") return null;
  if (typeof seller.lat !== "number" || typeof seller.lng !== "number") return null;
  return {
    id: seller.id,
    name: seller.name,
    market: typeof seller.market === "string" ? seller.market : "",
    city: typeof seller.city === "string" ? seller.city : "",
    lat: seller.lat,
    lng: seller.lng,
    maps_url:
      typeof seller.maps_url === "string" && seller.maps_url
        ? seller.maps_url
        : `https://www.google.com/maps?q=${seller.lat},${seller.lng}`,
    placeholder: seller.placeholder === true,
    note: typeof seller.note === "string" ? seller.note : "",
  };
}

export async function getPassport(id: string): Promise<PassportResponse> {
  if (isMockMode()) return mockPassport(id);
  const response = await fetch(apiUrl(`/passport/${encodeURIComponent(id)}`));
  if (!response.ok) throw new ApiError(response.status, await errorMessage(response));
  const data: unknown = await response.json();
  const source = data && typeof data === "object" ? (data as Partial<PassportResponse>) : {};
  return {
    id: typeof source.id === "string" ? source.id : id,
    status: typeof source.status === "string" ? source.status : "PLACEHOLDER",
    note: typeof source.note === "string" ? source.note : "",
    artisan_name: typeof source.artisan_name === "string" ? source.artisan_name : null,
    workshop: typeof source.workshop === "string" ? source.workshop : null,
    market: typeof source.market === "string" ? source.market : null,
    date: typeof source.date === "string" ? source.date : null,
    photo_urls: Array.isArray(source.photo_urls) ? source.photo_urls.filter((item): item is string => typeof item === "string") : [],
    maps_url: typeof source.maps_url === "string" ? source.maps_url : null,
  };
}

export async function getCapabilities(): Promise<Capabilities> {
  const fallback: Capabilities = { chat: true, voice: null, languages: LANGUAGES.map((item) => item.code) };
  if (isMockMode()) return { chat: true, voice: false, languages: fallback.languages };
  try {
    const response = await fetch(apiUrl("/capabilities"));
    if (!response.ok) return fallback;
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return fallback;
    const source = data as Record<string, unknown>;
    const languages = Array.isArray(source.languages)
      ? source.languages.map(asLanguage).filter((item): item is LanguageCode => item !== null)
      : fallback.languages;
    let voice: boolean | null = null;
    if (typeof source.voice === "boolean") voice = source.voice;
    else if (typeof source.speech === "boolean") voice = source.speech;
    return {
      chat: typeof source.chat === "boolean" ? source.chat : true,
      voice,
      languages: languages.length > 0 ? languages : fallback.languages,
      model_version: typeof source.model_version === "string" ? source.model_version : undefined,
    };
  } catch {
    return fallback;
  }
}

function readTextField(data: unknown, keys: string[]): string {
  if (!data || typeof data !== "object") return "";
  const source = data as Record<string, unknown>;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export async function sendChat(message: string, language: LanguageCode): Promise<string> {
  if (isMockMode()) return mockChatReply(language);
  const response = await fetch(apiUrl("/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language }),
  });
  if (!response.ok) throw new ApiError(response.status, await errorMessage(response));
  const reply = readTextField(await response.json(), ["reply", "message", "text", "answer", "content"]);
  if (!reply) throw new ApiError(response.status, "The chat service returned an empty reply.");
  return reply;
}

export async function transcribeAudio(blob: Blob, language: LanguageCode): Promise<string> {
  if (isMockMode()) throw new ApiError(503, "Voice is not configured.");
  const body = new FormData();
  const type = blob.type || "audio/webm";
  const ext = type.includes("mp4") ? "m4a" : type.includes("wav") ? "wav" : "webm";
  body.append("audio", blob, `speech.${ext}`);
  body.append("language", language);
  const response = await fetch(apiUrl("/voice/transcribe"), { method: "POST", body });
  if (!response.ok) throw new ApiError(response.status, await errorMessage(response));
  const text = readTextField(await response.json(), ["text", "transcript", "message"]);
  if (!text) throw new ApiError(response.status, "No words came back from that recording.");
  return text;
}

export async function speakText(text: string, language: LanguageCode): Promise<Blob> {
  if (isMockMode()) throw new ApiError(503, "Voice is not configured.");
  const response = await fetch(apiUrl("/voice/speech"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  if (!response.ok) throw new ApiError(response.status, await errorMessage(response));
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("audio/")) {
    throw new ApiError(502, "Voice did not return audio.");
  }
  return response.blob();
}

export function resolvePhotoUrl(url: string): string {
  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) return url;
  const base = apiBase();
  if (!base) return url;
  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
}
