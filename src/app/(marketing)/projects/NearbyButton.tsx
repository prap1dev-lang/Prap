"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation, Loader2 } from "lucide-react";

// Requests the device's real-time GPS location, reverse-geocodes it to a
// city/area via /api/geocode, and reloads the projects list filtered to that
// location. Falls back to a searchable area term when the city isn't one of
// the catalogue cities.
const KNOWN_CITIES = ["Noida", "Greater Noida", "Yamuna Expressway"];

export default function NearbyButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function useMyLocation() {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Location is not supported on this device.");
      return;
    }
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
          const body = await res.json().catch(() => ({}));
          if (!res.ok || !body.ok) throw new Error(body.error || "Could not detect your area.");

          const params = new URLSearchParams();
          if (KNOWN_CITIES.includes(body.city)) {
            params.set("city", body.city);
          } else if (body.locality || body.city) {
            // Not a catalogue city — search by the locality/area name instead.
            params.set("q", body.locality || body.city);
          }
          params.set("near", body.locality ? `${body.locality}, ${body.city}` : body.city || "your area");
          router.push(`/projects?${params.toString()}`);
        } catch (e: any) {
          setError(e?.message || "Could not detect your area.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enable it in your browser settings."
            : "Couldn't get your location. Try again.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div className="md:col-span-12">
      <button
        type="button"
        onClick={useMyLocation}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium transition disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
        {loading ? "Detecting your location…" : "Use my current location"}
      </button>
      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
}
