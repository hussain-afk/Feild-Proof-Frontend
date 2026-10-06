import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, LocateFixed, Loader2, MapPin, Satellite, Map as MapIcon } from "lucide-react";

/**
 * Free map picker (OpenStreetMap + Leaflet). No Google API key, no billing.
 *
 * Install once:  npm i leaflet
 *
 * Use it exactly like before:
 *   <LocationPicker siteLocation={formData.siteLocation} setFormData={setFormData} />
 *
 * Four ways to set the site:
 *   1. Search a place name (two free search services, results near the map view come first)
 *   2. Paste coordinates or a Google Maps link (for small places that are not on the map data)
 *   3. Switch to Satellite and click the ground / drag the pin
 *   4. "Use my current location"
 */

const DEFAULT_CENTER = [24.8607, 67.0011]; // Karachi, used until a point is chosen

const pinIcon = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#0ea5e9;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.45)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

const hasNumber = (v) => v !== "" && v != null && Number.isFinite(Number(v));

const MESSAGE_STYLE = {
  info: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  warn: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  error: "border-red-500/20 bg-red-500/10 text-red-300",
};

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#0b1220] text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

// Read "24.86, 67.00" or a Google Maps link and return [lat, lng] (or null)
function parseCoordinates(text) {
  let t = text.trim();
  try {
    t = decodeURIComponent(t);
  } catch {
    /* keep the text as it is */
  }

  const patterns = [
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // exact place in a Google link
    /@(-?\d+\.\d+),(-?\d+\.\d+)/, // map centre in a Google link
    /[?&](?:q|ll|query|destination)=(-?\d+\.\d+)[, +]+(-?\d+\.\d+)/, // ?q=lat,lng
    /(-?\d+\.\d+)\s*[,\s]\s*(-?\d+\.\d+)/, // plain "lat, lng"
  ];

  for (const pattern of patterns) {
    const m = t.match(pattern);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return [lat, lng];
    }
  }
  return null;
}

function LocationPicker({ siteLocation, setFormData }) {
  const mapEl = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const circle = useRef(null);
  const streetLayer = useRef(null);
  const satelliteLayer = useRef(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [pasteText, setPasteText] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [satellite, setSatellite] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }
  const searchRequestRef = useRef(0);

  const hasPoint = hasNumber(siteLocation?.latitude) && hasNumber(siteLocation?.longitude);
  const lat = Number(siteLocation?.latitude);
  const lng = Number(siteLocation?.longitude);
  const radius = Number(siteLocation?.radiusInMeters) || 100;

  // Save the chosen point in the form (kept in a ref so map events never go stale)
  const setPointRef = useRef();
  useEffect(() => {
    setPointRef.current = (la, ln) =>
      setFormData((prev) => ({
        ...prev,
        siteLocation: {
          ...prev.siteLocation,
          latitude: Number(la.toFixed(6)),
          longitude: Number(ln.toFixed(6)),
        },
      }));
  }, [setFormData]);

  // ---------- Create the map once ----------
  useEffect(() => {
    const m = L.map(mapEl.current, { scrollWheelZoom: false }).setView(
      hasPoint ? [lat, lng] : DEFAULT_CENTER,
      hasPoint ? 16 : 11
    );

    streetLayer.current = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(m);

    satelliteLayer.current = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Tiles &copy; Esri" }
    );

    m.on("click", (e) => setPointRef.current(e.latlng.lat, e.latlng.lng));
    map.current = m;

    // The map sits inside a modal, so fix its size once the modal has opened
    const t = setTimeout(() => m.invalidateSize(), 250);

    return () => {
      clearTimeout(t);
      m.remove();
      map.current = marker.current = circle.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Street / Satellite switch ----------
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (satellite) {
      m.removeLayer(streetLayer.current);
      satelliteLayer.current.addTo(m);
    } else {
      m.removeLayer(satelliteLayer.current);
      streetLayer.current.addTo(m);
    }
  }, [satellite]);

  // ---------- Keep the pin and radius circle in sync with the form ----------
  useEffect(() => {
    const m = map.current;
    if (!m || !hasPoint) return;

    const pos = [lat, lng];

    if (!marker.current) {
      marker.current = L.marker(pos, { icon: pinIcon, draggable: true }).addTo(m);
      marker.current.on("dragend", () => {
        const p = marker.current.getLatLng();
        setPointRef.current(p.lat, p.lng);
      });
      circle.current = L.circle(pos, {
        radius,
        color: "#0ea5e9",
        weight: 2,
        fillOpacity: 0.15,
      }).addTo(m);
    } else {
      marker.current.setLatLng(pos);
      circle.current.setLatLng(pos);
      circle.current.setRadius(radius);
    }

    m.fitBounds(circle.current.getBounds(), { maxZoom: 18, padding: [20, 20] });
  }, [hasPoint, lat, lng, radius]);

  // ---------- 1. Search by name ----------
  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;

    setSearching(true);
    setMessage(null);
    setResults([]);
    const requestId = ++searchRequestRef.current;

    const enc = encodeURIComponent(q);
    const bounds = map.current?.getBounds();
    const center = map.current?.getCenter();

    // Prefer places inside / near the part of the map the manager is looking at
    const viewbox = bounds
      ? `&viewbox=${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()},${bounds.getSouth()}`
      : "";
    const near = center ? `&lat=${center.lat}&lon=${center.lng}` : "";

    try {
      const [nominatim, photon] = await Promise.allSettled([
        fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${enc}${viewbox}`
        ).then((r) => {
          if (!r.ok) throw new Error(`Nominatim returned ${r.status}`);
          return r.json();
        }),
        fetch(`https://photon.komoot.io/api/?limit=5&q=${enc}${near}`).then((r) => {
          if (!r.ok) throw new Error(`Photon returned ${r.status}`);
          return r.json();
        }),
      ]);

      if (requestId !== searchRequestRef.current) return;
      const found = [];

    // Photon forgives spelling mistakes and finds small places better
      if (photon.status === "fulfilled") {
        (photon.value.features || []).forEach((f) => {
          const p = f.properties || {};
          const coordinates = f.geometry?.coordinates;
          if (!Array.isArray(coordinates) || coordinates.length < 2) return;
          found.push({
            lat: Number(coordinates[1]),
            lng: Number(coordinates[0]),
            label: [p.name, p.street, p.district, p.city, p.country].filter(Boolean).join(", "),
          });
        });
      }

      if (nominatim.status === "fulfilled") {
        (nominatim.value || []).forEach((r) =>
          found.push({ lat: Number(r.lat), lng: Number(r.lon), label: r.display_name })
        );
      }

    // Remove the same place when both services return it
      const seen = new Set();
      const unique = found.filter((r) => {
        if (!Number.isFinite(r.lat) || !Number.isFinite(r.lng)) return false;
        const key = `${r.lat.toFixed(3)},${r.lng.toFixed(3)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setResults(unique.slice(0, 6));

      if (unique.length === 0) {
        setMessage({
          type: "warn",
          text:
            nominatim.status === "rejected" && photon.status === "rejected"
              ? "Search failed. Check your internet and try again."
              : "Not found on the map data. Switch to Satellite view and click the ground, or paste its coordinates below.",
        });
      }
    } catch {
      if (requestId === searchRequestRef.current) {
        setMessage({ type: "error", text: "Search failed. Check your internet and try again." });
      }
    } finally {
      if (requestId === searchRequestRef.current) setSearching(false);
    }
  };

  const pickResult = (r) => {
    setPointRef.current(r.lat, r.lng);
    setResults([]);
    setMessage({ type: "info", text: `Selected: ${r.label}` });
  };

  // ---------- 2. Paste coordinates or a Google Maps link ----------
  const handlePaste = () => {
    const point = parseCoordinates(pasteText);
    if (!point) {
      setMessage({
        type: "error",
        text: "Could not read that. Paste coordinates like 24.8607, 67.0011 or a full Google Maps link (short maps.app.goo.gl links do not work).",
      });
      return;
    }
    setPointRef.current(point[0], point[1]);
    setResults([]);
    setPasteText("");
    setMessage({ type: "info", text: "Location set from the pasted coordinates." });
  };

  // ---------- 4. Use the device GPS ----------
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: "error", text: "Your browser does not support location access." });
      return;
    }

    setLocating(true);
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setPointRef.current(latitude, longitude);
        setMessage(
          accuracy > 100
            ? {
                type: "warn",
                text: `Your location is only accurate to about ${Math.round(accuracy)} m. Drag the pin or click the map to set the exact spot.`,
              }
            : {
                type: "info",
                text: `Using your current location (accurate to about ${Math.round(accuracy)} m).`,
              }
        );
        setLocating(false);
      },
      (error) => {
        const texts = {
          1: "Location permission was blocked. Allow it in your browser settings, then try again.",
          2: "Your location is not available right now. Turn on GPS or search for the place instead.",
          3: "Getting your location took too long. Try again or search for the place.",
        };
        setMessage({ type: "error", text: texts[error.code] || "Could not get your location." });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-3">
      <span className="block text-xs font-medium text-slate-300">Pin the site on the map</span>

      {/* Search (no <form> here, because this sits inside the task form) */}
      <div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Search a place, e.g. Kaleem Qazi Ground"
              aria-label="Search a place"
              className={`${inputClass} pl-9 pr-3`}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </button>
        </div>

        {results.length > 0 && (
          <ul className="mt-2 max-h-48 divide-y divide-slate-800 overflow-y-auto rounded-lg border border-slate-800 bg-[#0b1220]">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pickResult(r)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs text-slate-300 transition hover:bg-slate-800"
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" />
                  <span>{r.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Paste coordinates or a Google Maps link */}
      <div>
        <div className="flex gap-2">
          <input
            type="text"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handlePaste();
              }
            }}
            placeholder="Can't find it? Paste coordinates or a Google Maps link"
            aria-label="Paste coordinates or a Google Maps link"
            className={`${inputClass} px-3`}
          />
          <button
            type="button"
            onClick={handlePaste}
            disabled={!pasteText.trim()}
            className="h-10 shrink-0 rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Set
          </button>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          In Google Maps, press and hold the spot (or right-click on a computer) and copy the
          numbers it shows.
        </p>
      </div>

      {/* Map tools */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="flex h-9 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          Use my current location
        </button>

        <button
          type="button"
          onClick={() => setSatellite((s) => !s)}
          className="flex h-9 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
        >
          {satellite ? <MapIcon className="h-4 w-4" /> : <Satellite className="h-4 w-4" />}
          {satellite ? "Street view" : "Satellite view"}
        </button>
      </div>

      {/* Map */}
      <div
        ref={mapEl}
        className="isolate h-72 w-full overflow-hidden rounded-lg border border-slate-800"
      />

      {message && (
        <p className={`rounded-lg border px-3 py-2 text-xs ${MESSAGE_STYLE[message.type]}`}>
          {message.text}
        </p>
      )}

      <p className="text-xs text-slate-500">
        {hasPoint
          ? `Selected: ${lat}, ${lng}. Click the map or drag the pin to adjust.`
          : "No location selected yet. Search a place, paste coordinates, or click the map."}
      </p>
    </div>
  );
}

export default LocationPicker;