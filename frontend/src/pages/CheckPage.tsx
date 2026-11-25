import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ApiError, checkCloth } from "../lib/api";
import { cn, formatNgnRange, modelNotLoaded, verdictOf } from "../lib/format";
import { EASE, usePrefersReducedMotion } from "../lib/motion";
import type { CheckResponse } from "../types";
import { CameraIcon, UploadIcon } from "../components/Icons";
import { PlaceholderPill } from "../components/PlaceholderPill";

type Phase = "idle" | "reading" | "result" | "error";

const toneClass = {
  genuine: "text-genuine",
  print: "text-print",
  uncertain: "text-uncertain",
} as const;

export function CheckPage() {
  const reduce = usePrefersReducedMotion();
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [scanDone, setScanDone] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (phase !== "reading") return;
    const wait = reduce ? 0 : 1800;
    const timer = window.setTimeout(() => setScanDone(true), wait);
    return () => window.clearTimeout(timer);
  }, [phase, preview, reduce]);

  useEffect(() => {
    if (phase === "reading" && scanDone && result) setPhase("result");
  }, [phase, scanDone, result]);

  function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Upload an image file.");
      setPhase("error");
      return;
    }
    const id = ++requestId.current;
    setError(null);
    setResult(null);
    setScanDone(false);
    setPhase("reading");
    const url = URL.createObjectURL(file);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return url;
    });
    void checkCloth(file)
      .then((data) => {
        if (requestId.current !== id) return;
        setResult(data);
      })
      .catch((err: unknown) => {
        if (requestId.current !== id) return;
        setError(err instanceof ApiError ? err.message : "Could not reach the check service.");
        setPhase("error");
      });
  }

  function reset() {
    requestId.current += 1;
    setPhase("idle");
    setResult(null);
    setError(null);
    setScanDone(false);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }

  return (
    <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
      {phase === "idle" ? <Hero onCamera={() => cameraRef.current?.click()} onUpload={() => uploadRef.current?.click()} /> : null}
      <input ref={cameraRef} className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event) => onFile(event.target.files?.[0])} />
      <input ref={uploadRef} className="sr-only" type="file" accept="image/*" onChange={(event) => onFile(event.target.files?.[0])} />

      {preview ? (
        <div className="relative mx-auto w-full max-w-3xl">
          <img src={preview} alt="Cloth photograph ready to check" className="aspect-[3/4] max-h-[70dvh] w-full object-cover" />
          {phase === "reading" ? <ScanOverlay showMotion={!reduce && !scanDone} /> : null}
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-xl px-4">
        {phase === "error" && error ? (
          <p className="mt-4 rounded-[16px] border border-cloth bg-resist px-5 py-4 text-base text-ink" role="alert">
            {error}
          </p>
        ) : null}
        {phase === "result" && result ? <ResultCard result={result} /> : null}
        {phase !== "idle" ? (
          <button type="button" onClick={reset} className="mt-4 mb-6 text-base font-semibold text-indigo-dye">
            Check another cloth
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Hero({ onCamera, onUpload }: { onCamera: () => void; onUpload: () => void }) {
  return (
    <section className="relative min-h-[calc(100dvh-7.5rem)]">
      <img
        src="/hero.jpg"
        alt="Indigo adire cloth with white resist patterns, from a workshop photograph"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-resist via-resist/95 to-transparent px-4 pt-24 pb-4">
        <div className="mx-auto max-w-xl">
          <p className="text-[13px] leading-[1.4] text-muted">Workshop photograph. Not a check result.</p>
          <h1 className="mt-2 font-display text-[2rem] leading-[1.1] font-semibold text-indigo-ink sm:text-[2.5rem]">
            Photograph the cloth
          </h1>
          <p className="mt-3 max-w-[38ch] text-base leading-normal text-ink">
            Front, then the back if you can. A close edge or resist line helps.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onCamera} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-indigo-dye px-5 py-3 text-base font-semibold text-resist">
              <CameraIcon className="h-5 w-5" />
              Take a photo
            </button>
            <button type="button" onClick={onUpload} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-indigo-dye bg-resist px-5 py-3 text-base font-semibold text-indigo-dye">
              <UploadIcon className="h-5 w-5" />
              Upload a photo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScanOverlay({ showMotion }: { showMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden={!showMotion}>
      {showMotion ? (
        <>
          <motion.div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 55%, #1C3F8A 0%, transparent 62%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0.08, 0.28, 0] }}
            transition={{ duration: 1.8, ease: EASE }}
          />
          <motion.div
            className="absolute inset-x-0 h-[2px] bg-indigo-dye"
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 0.9, ease: EASE, repeat: 1 }}
          />
        </>
      ) : null}
      <p role="status" className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-resist/95 px-4 py-2 text-sm font-medium text-indigo-ink">
        Reading the cloth…
      </p>
    </div>
  );
}

function ResultCard({ result }: { result: CheckResponse }) {
  const reduce = usePrefersReducedMotion();
  const missing = modelNotLoaded(result);
  const verdict = verdictOf(result.label);
  const tone = missing ? "uncertain" : verdict.tone;
  const headline = missing ? "Model not loaded." : verdict.title;
  const buy = formatNgnRange(result.price_guidance.buy_range_ngn);
  const sell = formatNgnRange(result.price_guidance.sell_range_ngn);
  const placeholder = result.price_guidance.status.toUpperCase() === "PLACEHOLDER" || (!buy && !sell);
  const percent = Math.max(0, Math.min(100, Math.round(result.confidence * (result.confidence <= 1 ? 100 : 1))));

  const sections = [
    <motion.div key="stamp" {...fade(0, reduce)}>
      <p className={cn("font-display text-[2rem] leading-[1.1] font-semibold", toneClass[tone])}>{headline}</p>
      {missing ? <p className="mt-2 text-base leading-normal text-ink">Uncertain. No score from a trained model.</p> : null}
    </motion.div>,
    <motion.div key="confidence" {...fade(0.08, reduce)}>
      {missing ? (
        <div>
          <p className="text-[13px] leading-[1.4] text-muted">Confidence</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-indigo-mist" />
        </div>
      ) : (
        <ConfidenceMeter percent={percent} />
      )}
    </motion.div>,
    <motion.div key="reasons" {...fade(0.16, reduce)}>
      <h2 className="text-base font-semibold text-indigo-ink">Reasons</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {result.reasons.slice(0, 4).map((reason) => (
          <li key={reason} className="flex gap-3 text-base leading-normal text-ink">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-dye" />
            <span className="max-w-[60ch]">{reason}</span>
          </li>
        ))}
      </ul>
    </motion.div>,
    <motion.div key="price" {...fade(0.24, reduce)}>
      <div className="rounded-[16px] bg-cloth/70 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[13px] leading-[1.4] font-medium text-muted">Price guidance</h2>
          {placeholder ? <PlaceholderPill /> : null}
        </div>
        {buy ? <p className="mt-3 font-mono text-sm text-ink">Buy {buy}</p> : null}
        {sell ? <p className="mt-1 font-mono text-sm text-ink">Sell {sell}</p> : null}
        <p className="mt-2 max-w-[60ch] text-[13px] leading-[1.4] text-muted">{result.price_guidance.note}</p>
      </div>
    </motion.div>,
    <motion.p key="note" {...fade(0.32, reduce)} className="text-[13px] leading-[1.4] text-kola">
      This is not a certificate.
    </motion.p>,
  ];

  return (
    <article className="mt-4 rounded-[16px] border border-cloth bg-resist px-5 py-6" aria-live="polite">
      <Stamp reduce={reduce} tone={tone}>
        {sections[0]}
      </Stamp>
      <div className="mt-6 flex flex-col gap-6">{sections.slice(1)}</div>
    </article>
  );
}

function Stamp({ children, reduce, tone }: { children: ReactNode; reduce: boolean; tone: string }) {
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.86, rotate: -3 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.4, ease: EASE }}
      data-tone={tone}
    >
      {children}
    </motion.div>
  );
}

function fade(delay: number, reduce: boolean) {
  return {
    initial: { opacity: 0, y: reduce ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0.2 : 0.4, delay: reduce ? 0 : delay, ease: EASE },
  };
}

function ConfidenceMeter({ percent }: { percent: number }) {
  const reduce = usePrefersReducedMotion();
  const labelId = useId();
  const value = useMotionValue(reduce ? percent : 0);
  const text = useTransform(value, (current) => `${Math.round(current)}`);

  useEffect(() => {
    if (reduce) {
      value.set(percent);
      return;
    }
    const controls = animate(value, percent, { duration: 0.7, ease: EASE });
    return () => controls.stop();
  }, [percent, reduce, value]);

  return (
    <div>
      <p id={labelId} className="text-[13px] leading-[1.4] text-muted">
        Confidence
      </p>
      <p className="mt-2 font-mono text-[2rem] leading-none font-medium text-indigo-ink">
        <motion.span>{text}</motion.span>
        <span className="text-lg">%</span>
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-indigo-mist" role="meter" aria-labelledby={labelId} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <motion.div
          className="h-full bg-indigo-dye"
          initial={{ width: reduce ? `${percent}%` : "0%" }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
        />
      </div>
    </div>
  );
}
