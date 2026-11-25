import type { LanguageCode } from "../types";

export const LANGUAGES: ReadonlyArray<{ code: LanguageCode; label: string; short: string }> = [
  { code: "en", label: "English", short: "EN" },
  { code: "yo", label: "Yoruba", short: "YO" },
  { code: "ha", label: "Hausa", short: "HA" },
  { code: "ig", label: "Igbo", short: "IG" },
  { code: "pcm", label: "Pidgin", short: "PCM" },
];

export function languageLabel(code: LanguageCode): string {
  return LANGUAGES.find((item) => item.code === code)?.label ?? code;
}
