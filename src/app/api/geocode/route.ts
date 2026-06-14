import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Reverse-geocode a device GPS coordinate into a human area + city using the
// Google Geocoding API. The API key stays server-side. Returns:
//   { ok, city, locality, formatted }
// `city` is normalised toward the cities the catalogue uses when possible.
// Ordered most-specific first so "Greater Noida" matches before "Noida"
// (both contain the "Noida" substring).
const KNOWN_CITIES = ["Greater Noida", "Yamuna Expressway", "Ghaziabad", "Gurgaon", "Noida", "Delhi"];

function pickComponent(components: any[], types: string[]): string {
  for (const t of types) {
    const c = components.find((comp) => comp.types?.includes(t));
    if (c) return c.long_name as string;
  }
  return "";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  if (!lat || !lng) {
    return NextResponse.json({ ok: false, error: "Missing lat/lng" }, { status: 400 });
  }

  const key = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, error: "Geocoding not configured" }, { status: 500 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}&language=en&region=in`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (data.status !== "OK" || !data.results?.length) {
      return NextResponse.json({ ok: false, error: `Geocoding failed: ${data.status}` }, { status: 502 });
    }

    // Prefer a result that has locality/admin info.
    const result =
      data.results.find((r: any) =>
        r.address_components?.some((c: any) => c.types?.includes("locality")),
      ) || data.results[0];
    const comps = result.address_components || [];

    const rawCity = pickComponent(comps, [
      "locality",
      "administrative_area_level_2",
      "administrative_area_level_1",
    ]);
    const locality = pickComponent(comps, [
      "sublocality_level_1",
      "sublocality",
      "neighborhood",
    ]);

    // Normalise to a catalogue city when the geocoded city contains its name.
    const matched = KNOWN_CITIES.find((c) =>
      `${rawCity} ${result.formatted_address}`.toLowerCase().includes(c.toLowerCase()),
    );

    return NextResponse.json({
      ok: true,
      city: matched || rawCity,
      locality,
      formatted: result.formatted_address,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Geocoding error" }, { status: 500 });
  }
}
