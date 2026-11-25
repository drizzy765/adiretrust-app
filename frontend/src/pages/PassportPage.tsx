import { useEffect, useState, type FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, getPassport, resolvePhotoUrl } from "../lib/api";
import { formatRecordDate, recorded } from "../lib/format";
import type { PassportResponse } from "../types";
import { PlaceholderPill } from "../components/PlaceholderPill";

export function PassportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(id ?? "");
  const [record, setRecord] = useState<PassportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    const pending = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void getPassport(id)
        .then(setRecord)
        .catch((err: unknown) => {
          setRecord(null);
          setError(err instanceof ApiError ? err.message : "Could not load this passport.");
        })
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(pending);
  }, [id]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = draft.trim();
    if (!next) return;
    navigate(`/passport/${encodeURIComponent(next)}`);
  }

  const pageUrl = typeof window !== "undefined" && record ? `${window.location.origin}/passport/${encodeURIComponent(record.id)}` : record?.id ?? "";

  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <h1 className="font-display text-[2rem] leading-[1.1] font-semibold text-indigo-ink">Adire Passport</h1>
      <p className="mt-2 max-w-[42ch] text-base leading-normal text-ink">A public record for a consented piece. Not a government document.</p>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="public-id">Public ID</label>
        <input
          id="public-id"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Public ID"
          className="min-h-12 flex-1 rounded-full border border-cloth bg-resist px-4 text-base text-ink"
        />
        <button type="button" onClick={() => draft.trim() && navigate(`/passport/${encodeURIComponent(draft.trim())}`)} className="min-h-12 rounded-full bg-indigo-dye px-5 text-base font-semibold text-resist">
          Open
        </button>
      </form>

      {!id ? <p className="mt-6 text-[13px] leading-[1.4] text-muted">Enter a public ID. Issued records are not in this demo yet.</p> : null}
      {loading ? <p className="mt-6 text-base text-muted">Loading record…</p> : null}
      {error ? <p className="mt-6 text-base text-ink" role="alert">{error}</p> : null}

      {record && !loading ? (
        <article className="relative mt-6 overflow-hidden rounded-[16px] border border-cloth bg-resist">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-indigo-dye" aria-hidden="true" />
          <div className="px-6 py-6 pl-7">
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-[1.375rem] leading-tight font-semibold text-indigo-ink">Cloth record</p>
              {record.status.toUpperCase().includes("PLACEHOLDER") ? <PlaceholderPill /> : null}
            </div>
            <dl className="mt-5 grid grid-cols-1 gap-4">
              <Field label="Public ID" value={record.id} mono />
              {record.artisan_name ? <Field label="Artisan" value={record.artisan_name} /> : null}
              <Field label="Workshop" value={recorded(record.workshop)} />
              <Field label="Market" value={recorded(record.market)} />
              <Field label="Date" value={formatRecordDate(record.date)} />
            </dl>
            {record.note ? <p className="mt-4 max-w-[60ch] text-[13px] leading-[1.4] text-muted">{record.note}</p> : null}
            <div className="mt-5">
              <h2 className="text-[13px] leading-[1.4] font-medium text-muted">Photos</h2>
              {record.photo_urls.length === 0 ? (
                <p className="mt-2 text-base text-ink">No photos on this record.</p>
              ) : (
                <ul className="mt-3 flex gap-3 overflow-auto">
                  {record.photo_urls.map((url) => (
                    <li key={url} className="shrink-0">
                      <img src={resolvePhotoUrl(url)} alt="" className="h-28 w-24 rounded-[16px] border border-cloth object-cover" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {record.maps_url ? (
              <a className="mt-4 inline-flex text-base font-semibold text-indigo-dye" href={record.maps_url} target="_blank" rel="noopener noreferrer">
                Open in Google Maps
              </a>
            ) : null}
            <div className="mt-6 border-t border-dashed border-cloth pt-6">
              <div className="inline-flex rounded-[4px] border-4 border-gold bg-resist p-2">
                <QRCodeSVG value={pageUrl} size={148} bgColor="#F7F4EC" fgColor="#0B1F4A" level="M" />
              </div>
              <p className="mt-3 font-mono text-sm text-indigo-ink">{record.id}</p>
            </div>
            <p className="mt-5 text-[13px] leading-[1.4] text-kola">This is not a certificate.</p>
          </div>
        </article>
      ) : null}
      <p className="mt-4 text-[13px] text-muted">
        <Link to="/" className="font-semibold text-indigo-dye">Back to the check</Link>
      </p>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[13px] leading-[1.4] text-muted">{label}</dt>
      <dd className={mono ? "mt-1 font-mono text-base text-indigo-ink" : "mt-1 text-base text-ink"}>{value}</dd>
    </div>
  );
}
