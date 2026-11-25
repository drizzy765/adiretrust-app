import type { CheckResponse, LanguageCode, PassportResponse, SellersResponse } from "../types";
import { languageLabel } from "./languages";

/** Same five fixture pins as backend/main.py. Not real stalls or artisans. */
export const MOCK_SELLERS: SellersResponse = {
  note: "All entries are PLACEHOLDER fixtures, not real artisans or shops.",
  sellers: [
    {
      id: "placeholder-itoku-01",
      name: "PLACEHOLDER — Itoku Market stall A",
      market: "Itoku Market",
      city: "Abeokuta, Ogun State",
      lat: 7.1605,
      lng: 3.3478,
      maps_url: "https://www.google.com/maps?q=7.1605,3.3478",
      placeholder: true,
      note: "PLACEHOLDER fixture for demo pins. Not a real stall, artisan, or listing.",
    },
    {
      id: "placeholder-itoku-02",
      name: "PLACEHOLDER — Itoku Market stall B",
      market: "Itoku Market",
      city: "Abeokuta, Ogun State",
      lat: 7.1612,
      lng: 3.3486,
      maps_url: "https://www.google.com/maps?q=7.1612,3.3486",
      placeholder: true,
      note: "PLACEHOLDER fixture for demo pins. Not a real stall, artisan, or listing.",
    },
    {
      id: "placeholder-kemta-01",
      name: "PLACEHOLDER — Kemta workshop",
      market: "Kemta Adire Market",
      city: "Abeokuta, Ogun State",
      lat: 7.1479,
      lng: 3.3514,
      maps_url: "https://www.google.com/maps?q=7.1479,3.3514",
      placeholder: true,
      note: "PLACEHOLDER fixture for demo pins. Not a real workshop or artisan.",
    },
    {
      id: "placeholder-asero-01",
      name: "PLACEHOLDER — Asero Market stall",
      market: "Asero Market",
      city: "Abeokuta, Ogun State",
      lat: 7.175,
      lng: 3.386,
      maps_url: "https://www.google.com/maps?q=7.1750,3.3860",
      placeholder: true,
      note: "PLACEHOLDER fixture for demo pins. Not a real stall or artisan.",
    },
    {
      id: "placeholder-cooperative-01",
      name: "PLACEHOLDER — Adire cooperative booth",
      market: "Ogun Tech Hub area (demo pin)",
      city: "Kobape, Abeokuta, Ogun State",
      lat: 7.089,
      lng: 3.383,
      maps_url: "https://www.google.com/maps?q=7.0890,3.3830",
      placeholder: true,
      note: "PLACEHOLDER fixture for demo pins. Not a real cooperative listing.",
    },
  ],
};

export function mockCheck(filename: string | null): CheckResponse {
  return {
    label: "uncertain",
    confidence: 0,
    reasons: [
      "STUB: no trained model is loaded. This is a placeholder response, not an authenticity result.",
      "Capture protocol (for the real model): photograph the front, the reverse, and a close edge or resist line.",
    ],
    price_guidance: {
      status: "PLACEHOLDER",
      note: "Not a real market quote. Buy/sell guidance will be added only after a trained model and local price sources are in place.",
      buy_range_ngn: null,
      sell_range_ngn: null,
    },
    model_version: "stub",
    filename,
  };
}

export function mockPassport(id: string): PassportResponse {
  return {
    id,
    status: "PLACEHOLDER",
    note: "QR Adire Passport records have not been issued yet. This stub does not identify a real artisan or piece.",
    artisan_name: null,
    workshop: null,
    market: null,
    date: null,
    photo_urls: [],
    maps_url: null,
  };
}

export function mockChatReply(language: LanguageCode): string {
  const languageName = languageLabel(language);
  return `This screen is not connected to the language service (${languageName}). Photograph the front, the reverse, and a close edge. This is not a certificate, and there is no price until a real source is connected.`;
}
