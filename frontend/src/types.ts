export type VerdictLabel = "genuine_hand_dyed" | "factory_print" | "uncertain";

export type LanguageCode = "en" | "yo" | "ha" | "ig" | "pcm";

export interface PriceGuidance {
  status: string;
  note: string;
  buy_range_ngn: number[] | null;
  sell_range_ngn: number[] | null;
}

export interface CheckResponse {
  label: string;
  confidence: number;
  reasons: string[];
  price_guidance: PriceGuidance;
  model_version: string;
  filename: string | null;
}

export interface Seller {
  id: string;
  name: string;
  market: string;
  city: string;
  lat: number;
  lng: number;
  maps_url: string;
  placeholder: boolean;
  note: string;
}

export interface SellersResponse {
  sellers: Seller[];
  note: string;
}

export interface PassportResponse {
  id: string;
  status: string;
  note: string;
  artisan_name: string | null;
  workshop: string | null;
  market: string | null;
  date: string | null;
  photo_urls: string[];
  maps_url: string | null;
}

export interface Capabilities {
  chat: boolean;
  /** null means the server did not say; try voice and fall back on 503. */
  voice: boolean | null;
  languages: LanguageCode[];
  model_version?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  fromVoice?: boolean;
}
