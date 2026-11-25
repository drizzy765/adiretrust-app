import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";
import { ApiError, getSellers } from "../lib/api";
import { cn } from "../lib/format";
import { usePrefersReducedMotion } from "../lib/motion";
import type { Seller, SellersResponse } from "../types";
import { LocateIcon } from "../components/Icons";
import { PlaceholderPill } from "../components/PlaceholderPill";
import "leaflet/dist/leaflet.css";

const ABEOKUTA: [number, number] = [7.15, 3.36];

export function SellersPage() {
  const [data, setData] = useState<SellersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationNote, setLocationNote] = useState<string | null>(null);

  useEffect(() => {
    const pending = window.setTimeout(() => {
      void getSellers()
        .then(setData)
        .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Could not load sellers."));
    }, 0);
    return () => window.clearTimeout(pending);
  }, []);

  const selected = data?.sellers.find((seller) => seller.id === selectedId) ?? null;

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationNote("This browser has no location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLocationNote(null);
      },
      () => setLocationNote("Location is off. The list still shows the stalls."),
    );
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem-4rem-env(safe-area-inset-bottom))] flex-col">
      <div className="relative min-h-0 flex-1">
        <MapContainer center={ABEOKUTA} zoom={12} className="h-full w-full" scrollWheelZoom>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {data ? <FitOnce sellers={data.sellers} /> : null}
          {data?.sellers.map((seller) => (
            <SellerPin key={seller.id} seller={seller} selected={seller.id === selectedId} onSelect={setSelectedId} />
          ))}
          {userLocation ? <CircleMarker center={userLocation} radius={7} pathOptions={{ color: "#0B1F4A", weight: 2, fillColor: "#3A5FB0", fillOpacity: 1 }} /> : null}
          <PanTo seller={selected} user={userLocation} />
        </MapContainer>
        <button type="button" onClick={useMyLocation} className="absolute top-3 left-3 z-[500] inline-flex min-h-11 items-center gap-2 rounded-full bg-indigo-dye px-4 py-2 text-sm font-semibold text-resist shadow-none">
          <LocateIcon className="h-4 w-4" />
          Use my location
        </button>
      </div>
      <section aria-label="Stall details" className="max-h-[46%] overflow-auto border-t border-cloth bg-resist px-4 pt-4 pb-3">
        <h1 className="font-display text-[1.375rem] leading-tight font-semibold text-indigo-ink">Sellers</h1>
        {data?.note ? <p className="mt-1 max-w-[60ch] text-[13px] leading-[1.4] text-muted">{data.note}</p> : null}
        {error ? <p className="mt-2 text-base text-ink" role="alert">{error}</p> : null}
        {locationNote ? <p className="mt-2 text-[13px] text-muted">{locationNote}</p> : null}
        {!data && !error ? <p className="mt-3 text-base text-muted">Loading stalls…</p> : null}
        <ul className="mt-3 flex flex-col gap-2">
          {data?.sellers.map((seller) => (
            <li key={seller.id}>
              <button
                type="button"
                onClick={() => setSelectedId(seller.id)}
                className={cn(
                  "w-full rounded-[16px] border px-4 py-3 text-left",
                  seller.id === selectedId ? "border-indigo-dye bg-indigo-mist/50" : "border-cloth bg-resist",
                )}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="text-base font-semibold text-indigo-ink">{seller.name}</span>
                  {seller.placeholder ? <PlaceholderPill /> : null}
                </span>
                <span className="mt-1 block text-[13px] leading-[1.4] text-muted">
                  {seller.market}
                  {seller.city ? ` · ${seller.city}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {selected ? (
          <div className="mt-3 border-t border-cloth pt-3">
            <p className="text-base leading-normal text-ink">{selected.note}</p>
            <a className="mt-3 inline-flex min-h-11 items-center text-base font-semibold text-indigo-dye" href={selected.maps_url} target="_blank" rel="noopener noreferrer">
              Open in Google Maps
            </a>
          </div>
        ) : (
          <p className="mt-3 text-[13px] leading-[1.4] text-muted">Choose a pin for stall details.</p>
        )}
      </section>
    </div>
  );
}

function SellerPin({ seller, selected, onSelect }: { seller: Seller; selected: boolean; onSelect: (id: string) => void }) {
  const reduce = usePrefersReducedMotion();
  const [shown, setShown] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, [reduce]);

  return (
    <CircleMarker
      center={[seller.lat, seller.lng]}
      radius={9}
      pathOptions={{
        color: selected ? "#C9A227" : "#0B1F4A",
        weight: selected ? 2 : 1,
        fillColor: selected ? "#C9A227" : "#1C3F8A",
        fillOpacity: shown ? 1 : 0,
        opacity: shown ? 1 : 0,
      }}
      eventHandlers={{ click: () => onSelect(seller.id) }}
    />
  );
}

function FitOnce({ sellers }: { sellers: Seller[] }) {
  const map = useMap();
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (done || sellers.length === 0) return;
    const bounds = sellers.map((seller) => [seller.lat, seller.lng] as [number, number]);
    map.fitBounds(bounds, { padding: [28, 28] });
    setDone(true);
  }, [done, map, sellers]);
  return null;
}

function PanTo({ seller, user }: { seller: Seller | null; user: [number, number] | null }) {
  const map = useMap();
  const reduce = usePrefersReducedMotion();
  useEffect(() => {
    const target = seller ? ([seller.lat, seller.lng] as [number, number]) : user;
    if (!target) return;
    if (reduce) map.setView(target, Math.max(map.getZoom(), 14));
    else map.flyTo(target, Math.max(map.getZoom(), 14), { duration: 0.45 });
  }, [seller, user, map, reduce]);
  return null;
}
