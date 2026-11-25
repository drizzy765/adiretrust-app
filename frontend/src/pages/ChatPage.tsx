import { useEffect, useRef, useState } from "react";
import { ApiError, getCapabilities, isVoiceUnavailable, sendChat, speakText, transcribeAudio } from "../lib/api";
import { cn } from "../lib/format";
import { LANGUAGES, languageLabel } from "../lib/languages";
import type { ChatMessage, LanguageCode } from "../types";

export function ChatPage() {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceOn, setVoiceOn] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const pendingTimer = window.setTimeout(() => {
      void getCapabilities().then((caps) => {
        if (caps.voice === false) setVoiceOn(false);
        else setVoiceOn(true);
      });
    }, 0);
    return () => window.clearTimeout(pendingTimer);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, pending]);

  async function submit(text: string, fromVoice: boolean) {
    const message = text.trim();
    if (!message || pending) return;
    setError(null);
    setDraft("");
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", text: message, fromVoice };
    setMessages((current) => [...current, userMessage]);
    setPending(true);
    try {
      const reply = await sendChat(message, language);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: reply }]);
      if (fromVoice && voiceOn && language !== "en") {
        try {
          const blob = await speakText(reply, language);
          const url = URL.createObjectURL(blob);
          const player = new Audio(url);
          audio.current = player;
          player.onended = () => URL.revokeObjectURL(url);
          await player.play();
        } catch (err: unknown) {
          if (isVoiceUnavailable(err)) setVoiceOn(false);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not reach the chat service.");
    } finally {
      setPending(false);
    }
  }

  async function startTalk() {
    if (!voiceOn || listening || pending) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
        void transcribeAudio(blob, language)
          .then((text) => submit(text, true))
          .catch((err: unknown) => {
            if (isVoiceUnavailable(err)) {
              setVoiceOn(false);
              setError("Voice is unavailable. Type instead.");
            } else {
              setError(err instanceof ApiError ? err.message : "Could not transcribe that. Type instead.");
            }
          });
      };
      recorder.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setError("Microphone is blocked. Type instead.");
    }
  }

  function stopTalk() {
    if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop();
    setListening(false);
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem-4rem-env(safe-area-inset-bottom))] w-full max-w-xl flex-col">
      <div className="px-4 pt-6">
        <h1 className="font-display text-[2rem] leading-[1.1] font-semibold text-indigo-ink">Ask in your language</h1>
        <p className="mt-2 text-[13px] leading-[1.4] text-muted">Text stays on screen. Speech is optional.</p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Language">
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              type="button"
              aria-pressed={language === item.code}
              onClick={() => setLanguage(item.code)}
              className={cn(
                "min-h-10 rounded-full px-3 text-sm font-semibold",
                language === item.code ? "bg-indigo-dye text-resist" : "border border-indigo-dye text-indigo-dye",
              )}
            >
              <span className="sr-only">{item.label}</span>
              <span aria-hidden="true">{item.short}</span>
            </button>
          ))}
        </div>
      </div>
      <div ref={scroller} className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-4 py-2" aria-live="polite">
        {messages.length === 0 ? (
          <p className="text-base leading-normal text-muted">
            Ask how to photograph a cloth, or what this check can and cannot tell you. Language: {languageLabel(language)}.
          </p>
        ) : null}
        {messages.map((message) => (
          <p
            key={message.id}
            className={cn(
              "max-w-[85%] rounded-[16px] px-4 py-3 text-base leading-normal",
              message.role === "user" ? "ml-auto bg-indigo-dye text-resist" : "mr-auto bg-indigo-mist text-ink",
            )}
          >
            {message.text}
          </p>
        ))}
        {pending ? <p className="text-[13px] text-muted">Sending…</p> : null}
        {error ? <p className="text-base text-ink" role="alert">{error}</p> : null}
      </div>
      <form
        className="border-t border-cloth bg-resist px-4 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(draft, false);
        }}
      >
        {voiceOn === false ? <p className="mb-2 text-[13px] leading-[1.4] text-muted">Voice is unavailable. Type instead.</p> : null}
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="chat-draft">Message</label>
          <input
            id="chat-draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message"
            className="min-h-12 min-w-0 flex-1 rounded-full border border-cloth bg-resist px-4 text-base text-ink"
          />
          <button type="submit" disabled={pending || !draft.trim()} className="min-h-12 rounded-full bg-indigo-dye px-4 text-base font-semibold text-resist disabled:opacity-50">
            Send
          </button>
        </div>
        {voiceOn ? (
          <button
            type="button"
            className="mt-2 min-h-12 w-full rounded-full border border-indigo-dye text-base font-semibold text-indigo-dye"
            aria-pressed={listening}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              void startTalk();
            }}
            onPointerUp={stopTalk}
            onPointerCancel={stopTalk}
            onKeyDown={(event) => {
              if ((event.key === " " || event.key === "Enter") && !listening) {
                event.preventDefault();
                void startTalk();
              }
            }}
            onKeyUp={(event) => {
              if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                stopTalk();
              }
            }}
          >
            {listening ? "Listening…" : "Hold to talk"}
          </button>
        ) : null}
      </form>
    </div>
  );
}
