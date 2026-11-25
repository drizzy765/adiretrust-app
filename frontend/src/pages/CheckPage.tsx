import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { ApiError, checkCloth } from "../lib/api";
import { cn, formatNgnRange, verdictOf } from "../lib/format";
import { hasRealPrice, isStubResult, publicReasons } from "../lib/live";
import { EASE, usePrefersReducedMotion } from "../lib/motion";
import { downloadResultCard } from "../lib/result-card";
import type { CheckResponse } from "../types";
import { CameraIcon, UploadIcon } from "../components/Icons";

type Phase = "idle" | "reading" | "result" | "error";

const TIPS = [
  "Front of the cloth",
  "The reverse, if you can",
  "A close edge or resist line",
] as const;

const SAMPLE = {
  src: "/hero.jpg",
  name: "workshop-cloth.jpg",
  caption: "A workshop photograph of Adire cloth.",
} as const;

const toneClass = {
  genuine: "text-genuine",
  print: "text-print",
  uncertain: "text-uncertain",
} as const;

const toneSurface = {
  genuine: "border-genuine/25 bg-[#f3f8f5]",
  print: "border-print/25 bg-[#fbf3f3]",
  uncertain: "border-uncertain/30 bg-[#f8f4e8]",
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
  const [dragging, setDragging] = useState(false);
  const [tips, setTips] = useState<boolean[]>(() => TIPS.map(() => false));
  const [saving, setSaving] = useState(false);

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

  async function useSample() {
    try {
      const response = await fetch(SAMPLE.src);
      if (!response.ok) throw new Error("missing");
      const blob = await response.blob();
      onFile(new File([blob], SAMPLE.name, { type: blob.type || "image/jpeg" }));
    } catch {
      setError("Could not load the sample photograph.");
      setPhase("error");
    }
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    onFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-10 pb-20 sm:px-8">
      <p className="text-xs font-medium tracking-[0.18em] text-indigo-ink/60 uppercase">Cloth check</p>
      <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] font-medium text-indigo-ink">
        Photograph the cloth
      </h1>
      <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-muted">
        Front, then the back if you can. A close edge or resist line helps.
      </p>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold text-indigo-ink">Capture tips</legend>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {TIPS.map((tip, index) => (
            <li key={tip}>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-cloth/80 bg-[#fffaf3] px-4 py-3 text-sm leading-snug text-ink">
                <input
                  type="checkbox"
                  checked={tips[index]}
                  onChange={() =>
                    setTips((current) => current.map((value, i) => (i === index ? !value : value)))
                  }
                  className="mt-0.5 size-4 accent-[#1b2a6b]"
                />
                {tip}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative mt-8 overflow-hidden rounded-2xl border-2 border-dashed transition",
          dragging ? "border-gold bg-gold/10" : "border-cloth bg-[#fffaf3]",
          preview ? "border-solid" : "",
        )}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Cloth photograph ready to check" className="aspect-[3/4] max-h-[70dvh] w-full object-cover" />
            {phase === "reading" ? <ScanOverlay showMotion={!reduce && !scanDone} /> : null}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-16 text-center">
            <p className="font-display text-2xl text-indigo-ink">{dragging ? "Drop the photo to check it" : "Drop a photo here"}</p>
            <p className="mt-2 text-sm text-muted">Or take a photo, upload one, or try the sample.</p>
          </div>
        )}
      </div>

      <input ref={cameraRef} className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event) => onFile(event.target.files?.[0])} />
      <input ref={uploadRef} className="sr-only" type="file" accept="image/*" onChange={(event) => onFile(event.target.files?.[0])} />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={() => cameraRef.current?.click()} className="btn-primary">
          <CameraIcon className="h-5 w-5" />
          Take a photo
        </button>
        <button type="button" onClick={() => uploadRef.current?.click()} className="btn-secondary text-indigo-ink">
          <UploadIcon className="h-5 w-5" />
          Upload a photo
        </button>
        <button type="button" onClick={() => void useSample()} className="btn-secondary text-indigo-ink">
          Try a sample
        </button>
      </div>
      <p className="mt-2 text-[13px] text-muted">{SAMPLE.caption}</p>

      {phase === "error" && error ? (
        <p className="shadow-card mt-6 rounded-2xl border border-cloth bg-[#fffaf3] px-5 py-4 text-base text-ink" role="alert">
          {error}
        </p>
      ) : null}
      {phase === "result" && result ? (
        <ResultCard
          result={result}
          preview={preview}
          saving={saving}
          onSave={async () => {
            setSaving(true);
            try {
              const stub = isStubResult(result);
              await downloadResultCard({
                headline: stub ? "Model is warming up" : verdictOf(result.label).title,
                body: stub
                  ? "The hosted model is being redeployed, so this photo could not be scored yet. This is not an authenticity result."
                  : "A decision aid with a confidence score. This is not a certificate.",
                reasons: stub ? [] : publicReasons(result),
                previewUrl: preview,
                confidenceLabel: stub
                  ? null
                  : `Confidence ${Math.max(0, Math.min(100, Math.round(result.confidence * (result.confidence <= 1 ? 100 : 1))))}%`,
              });
            } catch {
              setError("Could not save the result card.");
            } finally {
              setSaving(false);
            }
          }}
        />
      ) : null}
      {phase !== "idle" ? (
        <button type="button" onClick={reset} className="mt-5 text-base font-semibold text-indigo-ink underline decoration-gold decoration-2 underline-offset-4">
          Check another cloth
        </button>
      ) : null}

      <section className="shadow-card mt-14 rounded-2xl border border-cloth/80 bg-[#fffaf3] px-6 py-7">
        <h2 className="font-display text-2xl font-medium text-indigo-ink">How confident are we?</h2>
        <dl className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
          <div>
            <dt className="text-xs tracking-wide text-muted uppercase">Test images</dt>
            <dd className="font-display text-3xl text-indigo-ink">27</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-muted uppercase">Correct</dt>
            <dd className="font-display text-3xl text-indigo-ink">27</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-muted uppercase">Prints called genuine</dt>
            <dd className="font-display text-3xl text-indigo-ink">0</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-muted uppercase">Real photos</dt>
            <dd className="font-display text-3xl text-indigo-ink">181</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          81 genuine, 100 prints. Small dataset, split by image. See model/EVAL.md in the repo for details.
        </p>
      </section>
    </div>
  );
}

function ScanOverlay({ showMotion }: { showMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden={!showMotion}>
      {showMotion ? (
        <>
          <motion.div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 55%, #1b2a6b 0%, transparent 62%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0.08, 0.28, 0] }}
            transition={{ duration: 1.8, ease: EASE }}
          />
          <motion.div
            className="absolute inset-x-0 h-[2px] bg-gold"
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

function ResultCard({
  result,
  preview,
  saving,
  onSave,
}: {
  result: CheckResponse;
  preview: string | null;
  saving: boolean;
  onSave: () => Promise<void>;
}) {
  const reduce = usePrefersReducedMotion();
  const stub = isStubResult(result);
  const verdict = verdictOf(result.label);
  const tone = stub ? "uncertain" : verdict.tone;
  const reasons = publicReasons(result);
  const buy = formatNgnRange(result.price_guidance.buy_range_ngn);
  const sell = formatNgnRange(result.price_guidance.sell_range_ngn);
  const showPrice = hasRealPrice(result.price_guidance);
  const percent = Math.max(0, Math.min(100, Math.round(result.confidence * (result.confidence <= 1 ? 100 : 1))));

  if (stub) {
    return (
      <article className={cn("shadow-card mt-8 rounded-2xl border-2 px-6 py-7", toneSurface.uncertain)} aria-live="polite">
        <p className="font-display text-[2rem] leading-[1.1] font-medium text-indigo-ink">Model is warming up</p>
        <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-ink">
          The hosted model is being redeployed, so this photo could not be scored yet. This is not an authenticity result.
        </p>
        {preview ? <p className="mt-3 text-sm text-muted">Your photo is ready below when the model is back.</p> : null}
        <button type="button" onClick={() => void onSave()} disabled={saving} className="btn-primary mt-6">
          {saving ? "Saving…" : "Download a card"}
        </button>
      </article>
    );
  }

  return (
    <article className={cn("shadow-card mt-8 rounded-2xl border-2 px-6 py-7", toneSurface[tone])} aria-live="polite">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduce ? 0.2 : 0.4, ease: EASE }}
      >
        <p className={cn("font-display text-[2rem] leading-[1.1] font-medium", toneClass[tone])}>{verdict.title}</p>
      </motion.div>
      <div className="mt-6 flex flex-col gap-6">
        <ConfidenceMeter percent={percent} />
        {reasons.length > 0 ? (
          <div>
            <h2 className="text-base font-semibold text-indigo-ink">Reasons</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {reasons.map((reason) => (
                <li key={reason} className="flex gap-3 text-base leading-normal text-ink">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-dye" />
                  <span className="max-w-[60ch]">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {showPrice ? (
          <div className="rounded-2xl bg-resist/70 px-4 py-4">
            <h2 className="text-[13px] leading-[1.4] font-medium text-muted">Price guidance</h2>
            {buy ? <p className="mt-3 font-mono text-sm text-ink">Buy {buy}</p> : null}
            {sell ? <p className="mt-1 font-mono text-sm text-ink">Sell {sell}</p> : null}
            <p className="mt-2 max-w-[60ch] text-[13px] leading-[1.4] text-muted">{result.price_guidance.note}</p>
          </div>
        ) : null}
        <p className="text-[13px] leading-[1.4] text-kola">This is not a certificate.</p>
        <button type="button" onClick={() => void onSave()} disabled={saving} className="btn-primary self-start">
          {saving ? "Saving…" : "Download a card"}
        </button>
      </div>
    </article>
  );
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
      <p className="mt-2 font-display text-[2rem] leading-none font-medium text-indigo-ink">
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
