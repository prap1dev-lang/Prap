import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/property-insights
 *
 * Given a property address and/or PIN code, geocodes it (Google Geocoding API,
 * key already configured) and finds the nearest neighbourhood points of
 * interest using the free Overpass / OpenStreetMap API (no key needed):
 *   railway station, metro, airport, school, play school (kindergarten),
 *   temple (mandir), hospital, shopping mall, EV charging station.
 *
 * Returns straight-line distances (km) + a generated summary sentence so the
 * admin can auto-fill a project's connectivity details and description.
 */

const Body = z.object({
  address: z.string().optional().default(""),
  pincode: z.string().optional().default(""),
  city: z.string().optional().default(""),
  // When the address was picked via Google Places we already have exact
  // coordinates — use them directly instead of re-geocoding a fuzzy string.
  lat: z.number().optional(),
  lng: z.number().optional(),
});

type Poi = { name: string; km: number };
type Insights = Partial<Record<
  "railwayStation" | "metro" | "airport" | "school" | "playSchool" | "temple" | "hospital" | "mall" | "evCharging",
  Poi
>>;

// Categories with their Overpass selectors + search radius (metres).
const CATEGORIES: { key: keyof Insights; label: string; selectors: string[]; radius: number }[] = [
  { key: "railwayStation", label: "Railway station", selectors: ['["railway"="station"]'], radius: 25000 },
  { key: "metro", label: "Metro", selectors: ['["station"="subway"]', '["railway"="station"]["station"="subway"]'], radius: 20000 },
  { key: "airport", label: "Airport", selectors: ['["aeroway"="aerodrome"]'], radius: 60000 },
  { key: "school", label: "School", selectors: ['["amenity"="school"]'], radius: 8000 },
  { key: "playSchool", label: "Play school", selectors: ['["amenity"="kindergarten"]'], radius: 8000 },
  { key: "temple", label: "Temple", selectors: ['["amenity"="place_of_worship"]["religion"="hindu"]'], radius: 12000 },
  { key: "hospital", label: "Hospital", selectors: ['["amenity"="hospital"]'], radius: 12000 },
  { key: "mall", label: "Shopping mall", selectors: ['["shop"="mall"]'], radius: 15000 },
  { key: "evCharging", label: "EV charging", selectors: ['["amenity"="charging_station"]'], radius: 15000 },
];

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

async function geocode(query: string): Promise<{ lat: number; lng: number; formatted: string } | null> {
  const key = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!key) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${key}&region=in&language=en`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  const r = data?.results?.[0];
  if (data?.status !== "OK" || !r) return null;
  return { lat: r.geometry.location.lat, lng: r.geometry.location.lng, formatted: r.formatted_address };
}

async function overpassNearby(lat: number, lng: number): Promise<Insights> {
  const maxRadius = Math.max(...CATEGORIES.map((c) => c.radius));
  // Build one union query across all categories at the maximum radius; we
  // filter by per-category radius afterwards.
  const parts: string[] = [];
  for (const c of CATEGORIES) {
    for (const sel of c.selectors) {
      parts.push(`node${sel}(around:${maxRadius},${lat},${lng});`);
      parts.push(`way${sel}(around:${maxRadius},${lat},${lng});`);
    }
  }
  const ql = `[out:json][timeout:25];(${parts.join("")});out center tags;`;

  // overpass-api.de frequently rate-limits (429) or times out. Try several
  // public mirrors in turn so the nearby lookup stays reliable.
  const MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  ];
  let elements: any[] = [];
  let lastErr = "";
  for (const endpoint of MIRRORS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(ql)}`,
        cache: "no-store",
      });
      if (!res.ok) {
        lastErr = `Overpass ${res.status} @ ${endpoint}`;
        continue;
      }
      const data = await res.json().catch(() => ({ elements: [] }));
      elements = data.elements ?? [];
      if (elements.length) break; // got results — stop trying mirrors
    } catch (e: any) {
      lastErr = e?.message || `Overpass fetch failed @ ${endpoint}`;
    }
  }
  if (!elements.length && lastErr) throw new Error(lastErr);

  const out: Insights = {};
  for (const el of elements) {
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (typeof elLat !== "number" || typeof elLng !== "number") continue;
    const tags = el.tags ?? {};
    const km = haversineKm(lat, lng, elLat, elLng);
    const name = tags.name || tags["name:en"] || "";

    for (const c of CATEGORIES) {
      if (km > c.radius / 1000) continue;
      const matches = c.selectors.some((sel) => selectorMatches(sel, tags));
      if (!matches) continue;
      const cur = out[c.key];
      if (!cur || km < cur.km) out[c.key] = { name: name || c.label, km: Math.round(km * 10) / 10 };
    }
  }
  return out;
}

// Tiny matcher for our fixed Overpass selectors of the form ["k"="v"]...
function selectorMatches(selector: string, tags: Record<string, string>): boolean {
  const pairs = [...selector.matchAll(/\["([^"]+)"="([^"]+)"\]/g)];
  return pairs.every(([, k, v]) => tags[k] === v);
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { address, pincode, city, lat, lng } = parsed.data;

  try {
    // Prefer exact coordinates from Google Places; fall back to geocoding text.
    let geo: { lat: number; lng: number; formatted: string } | null = null;
    if (typeof lat === "number" && typeof lng === "number") {
      geo = { lat, lng, formatted: address || `${lat},${lng}` };
    } else {
      const query = [address, pincode, city, "India"].filter(Boolean).join(", ");
      if (!query.replace(/India/g, "").trim().replace(/,/g, "")) {
        return NextResponse.json({ ok: false, error: "Enter an address or PIN code first." }, { status: 400 });
      }
      geo = await geocode(query);
    }
    if (!geo) {
      return NextResponse.json({ ok: false, error: "Could not locate that address / PIN code." }, { status: 404 });
    }

    let insights: Insights = {};
    try {
      insights = await overpassNearby(geo.lat, geo.lng);
    } catch (e: any) {
      // Geocoding still succeeded — return location with empty POIs.
      console.error("[property-insights] overpass failed:", e?.message);
    }

    // Human-readable list + summary for the description.
    const order: (keyof Insights)[] = [
      "metro", "railwayStation", "airport", "school", "playSchool", "temple", "hospital", "mall", "evCharging",
    ];
    const labelOf: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));
    const list = order
      .filter((k) => insights[k])
      .map((k) => ({ key: k, label: labelOf[k], name: insights[k]!.name, km: insights[k]!.km, text: formatDistance(insights[k]!.km) }));

    const summary =
      list.length > 0
        ? `Well connected — ${list.slice(0, 5).map((i) => `${i.label.toLowerCase()} ${i.text}`).join(", ")}.`
        : "";

    return NextResponse.json({
      ok: true,
      lat: geo.lat,
      lng: geo.lng,
      formatted: geo.formatted,
      insights: list,
      summary,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Lookup failed" }, { status: 500 });
  }
}
