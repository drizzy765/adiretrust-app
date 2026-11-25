import { useEffect, useRef, useState } from "react";
import { ApiError } from "../lib/api";
import { cn } from "../lib/format";
import { LANGUAGES, languageLabel } from "../lib/languages";
import { sendLiveChat } from "../lib/live";
import type { ChatMessage, LanguageCode } from "../types";

export function ChatPage() {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, pending]);

  async function submit(text: string) {
    const message = text.trim();
    if (!message || pending) return;
    setError(null);
    setDraft("");
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", text: message };
    const history = [...messages, userMessage];
    setMessages(history);
    setPending(true);
    try {
      const reply = await sendLiveChat(history, language);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: reply }]);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not reach the chat service.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-xl flex-col">
      <div className="px-5 pt-8 sm:px-6">
        <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-[1.1] font-medium text-indigo-ink">
          Ask in your language
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">Text stays on screen. Choose a language, then ask a question.</p>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Language">
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              type="button"
              aria-pressed={language === item.code}
              onClick={() => setLanguage(item.code)}
              className={cn(
                "min-h-10 rounded-full px-4 text-sm font-semibold transition",
                language === item.code ? "bg-indigo-ink text-resist" : "border border-indigo-ink text-indigo-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={scroller} className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-5 py-2 sm:px-6" aria-live="polite">
        {messages.length === 0 ? (
          <p className="text-base leading-relaxed text-muted">
            Ask how to photograph a cloth, or what this check can and cannot tell you. Language: {languageLabel(language)}.
          </p>
        ) : null}
        {messages.map((message) => (
          <p
            key={message.id}
            className={cn(
              "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-base leading-normal",
              message.role === "user" ? "ml-auto bg-indigo-ink text-resist" : "mr-auto bg-[#fffaf3] text-ink shadow-card",
            )}
          >
            {message.text}
          </p>
        ))}
        {pending ? <p className="text-[13px] text-muted">Sending…</p> : null}
        {error ? <p className="text-base text-ink" role="alert">{error}</p> : null}
      </div>
      <form
        className="border-t border-cloth bg-resist px-5 py-4 sm:px-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(draft);
        }}
      >
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="chat-draft">Message</label>
          <input
            id="chat-draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message"
            className="min-h-12 min-w-0 flex-1 rounded-full border border-cloth bg-[#fffaf3] px-4 text-base text-ink"
          />
          <button type="submit" disabled={pending || !draft.trim()} className="btn-primary min-h-12 px-5 disabled:opacity-50">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
