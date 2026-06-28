"use client";
import { useEffect, useRef, useState } from "react";

// A DB-backed suggestion (e.g. an existing project) shown above Google results.
export interface DbSuggestion {
  id: string;
  label: string;       // primary line (project name)
  sublabel?: string;   // secondary line (builder · location)
}

// Structured result emitted when a place is picked (or typed).
export interface PlaceResult {
  formatted: string;   // full formatted address
  lat?: number;
  lng?: number;
  pincode?: string;
  locality?: string;   // sector / sub-locality / neighbourhood
  city?: string;
  state?: string;
  name?: string;       // establishment / project name if the place is a POI
}

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// ── Singleton script loader (load the Maps JS + Places library once) ──
let mapsPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if ((window as any).google?.maps?.places) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  if (!MAPS_KEY) return Promise.reject(new Error("Maps key missing"));

  mapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("google-maps-places");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Maps script failed")));
      return;
    }
    const s = document.createElement("script");
    s.id = "google-maps-places";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&region=IN&language=en`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Maps script failed"));
    document.head.appendChild(s);
  });
  return mapsPromise;
}

/** Pull a structured PlaceResult out of a Google PlaceResult. */
function parsePlace(place: any): PlaceResult {
  const get = (type: string, short = false) => {
    const c = (place.address_components || []).find((x: any) => x.types.includes(type));
    return c ? (short ? c.short_name : c.long_name) : undefined;
  };
  return {
    formatted: place.formatted_address || place.name || "",
    lat: place.geometry?.location?.lat?.(),
    lng: place.geometry?.location?.lng?.(),
    pincode: get("postal_code"),
    locality:
      get("sublocality_level_1") ||
      get("sublocality") ||
      get("neighborhood") ||
      get("locality"),
    city: get("locality") || get("administrative_area_level_2"),
    state: get("administrative_area_level_1"),
    name: place.name,
  };
}

/**
 * A Google-Places-backed search input for address / locality fields. When the
 * user picks a suggestion, `onSelect` receives structured components (lat/lng,
 * pincode, locality, city). Falls back to a plain text input (still editable,
 * emitting `onChange`) when no Maps key is configured.
 */
export default function PlacesAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  types,
  className = "input",
  dbSuggest,
  onPickDb,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (place: PlaceResult) => void;
  placeholder?: string;
  // e.g. ["geocode"], ["establishment"], or ["(regions)"] — defaults to broad.
  types?: string[];
  className?: string;
  // Optional DB-backed suggestions shown ABOVE the Google ones (e.g. existing
  // projects matching "DLF"). Called debounced as the user types.
  dbSuggest?: (q: string) => Promise<DbSuggestion[]>;
  onPickDb?: (s: DbSuggestion) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(!MAPS_KEY);
  const [dbResults, setDbResults] = useState<DbSuggestion[]>([]);
  const [showDb, setShowDb] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!MAPS_KEY) {
      setFailed(true);
      return;
    }
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !inputRef.current) return;
        const g = (window as any).google;
        acRef.current = new g.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "in" },
          fields: ["address_components", "formatted_address", "geometry", "name"],
          ...(types ? { types } : {}),
        });
        acRef.current.addListener("place_changed", () => {
          const place = acRef.current.getPlace();
          if (!place) return;
          const parsed = parsePlace(place);
          if (parsed.formatted) onChange(parsed.formatted);
          onSelect(parsed);
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced DB suggestions as the user types.
  useEffect(() => {
    if (!dbSuggest) return;
    const q = value.trim();
    if (q.length < 2) {
      setDbResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await dbSuggest(q);
        setDbResults(r);
        setShowDb(r.length > 0);
      } catch {
        setDbResults([]);
      }
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        className={className}
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowDb(true); }}
        onFocus={() => dbResults.length && setShowDb(true)}
        onBlur={() => setTimeout(() => setShowDb(false), 150)}
        placeholder={placeholder}
        // Prevent the browser's native autofill dropdown from fighting Google's.
        autoComplete="off"
      />
      {!failed && !ready && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-400">
          loading…
        </span>
      )}

      {/* DB suggestions (e.g. existing projects) shown above Google's dropdown */}
      {dbSuggest && showDb && dbResults.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-ink-200 bg-white shadow-lg overflow-hidden">
          <li className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400 bg-ink-50">
            Your projects
          </li>
          {dbResults.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                // onMouseDown (not onClick) fires before the input's onBlur.
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(s.label);
                  onPickDb?.(s);
                  setShowDb(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-brand-50 transition"
              >
                <p className="text-sm font-medium text-ink-900">{s.label}</p>
                {s.sublabel && <p className="text-xs text-ink-500">{s.sublabel}</p>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
