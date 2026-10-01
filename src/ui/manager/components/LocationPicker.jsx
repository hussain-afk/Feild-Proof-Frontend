import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { Search, Compass, Loader2, MapPin } from "lucide-react";

// React-Leaflet default marker icon path fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Map Click Listener: Jab user map par kahin bhi click karega toh Lat/Lng update honge
function MapEventsHandler({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Re-center map view whenever new location is searched or selected
function MapRecenter({ center }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
}

export default function LocationPicker({ siteLocation, setFormData }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // Default initial coordinates (Karachi center fallback)
    const currentLat = siteLocation.latitude || 24.8607;
    const currentLng = siteLocation.longitude || 67.0011;

    // Direct Coordinates Update State Handler
    const handleSelectLocation = (lat, lng) => {
        setFormData((prev) => ({
            ...prev,
            siteLocation: {
                ...prev.siteLocation,
                latitude: lat,
                longitude: lng,
            },
        }));
    };

    // Search Area Name via Free Nominatim API
    const handleSearch = async (e) => {
        if (e) e.preventDefault(); // 👈 PAGE RELOAD PREVENT KARNE KE LIYE

        if (!searchQuery.trim()) return;

        try {
            setIsSearching(true);
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await res.json();

            if (data && data.length > 0) {
                const top = data[0];
                const lat = parseFloat(top.lat);
                const lng = parseFloat(top.lon);

                setFormData((prev) => ({
                    ...prev,
                    siteLocation: {
                        ...prev.siteLocation,
                        name: prev.siteLocation.name || searchQuery,
                        latitude: lat,
                        longitude: lng,
                    },
                }));
            } else {
                alert("Pura area name nahi mil saka. Map par manual drag/click karke location select karein.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    // Get High Accuracy Mobile GPS
    const handleGetLiveGPS = () => {
        if (!navigator.geolocation) return alert("GPS browser support nahi karta.");

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                handleSelectLocation(pos.coords.latitude, pos.coords.longitude);
            },
            () => alert("GPS Position Fetch Failed! Location access allow karein."),
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="space-y-3">
            {/* Search Input Bar & Live GPS Button */}
            {/* Search Input Bar & Live GPS Button */}
            <div className="flex gap-2">
                <div className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault(); // 👈 Enter key dabane par reload na ho
                                    handleSearch(e);
                                }
                            }}
                            placeholder="Broad area search karein (e.g. Nazimabad, Clifton)..."
                            className="w-full h-10 pl-9 pr-3 bg-[#0b1220] border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <button
                        type="button" // 👈 IMPORTANT: "submit" ke bajaye "button" rakhein
                        onClick={(e) => handleSearch(e)}
                        disabled={isSearching}
                        className="h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
                    >
                        {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search Area"}
                    </button>
                </div>

                <button
                    type="button" // 👈 IMPORTANT
                    onClick={handleGetLiveGPS}
                    className="h-10 px-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                >
                    <Compass className="w-3.5 h-3.5 text-blue-400" />
                    My GPS
                </button>
            </div>

            {/* Visual Interactive Map Canvas */}
            <div className="relative w-full h-60 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 z-0">
                <MapContainer
                    center={[currentLat, currentLng]}
                    zoom={15}
                    scrollWheelZoom={true}
                    className="w-full h-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapEventsHandler onLocationSelect={handleSelectLocation} />
                    <MapRecenter center={[currentLat, currentLng]} />

                    {/* Selected Pin Marker & Visual Geofence Radius Circle */}
                    {siteLocation.latitude && siteLocation.longitude && (
                        <>
                            <Marker position={[siteLocation.latitude, siteLocation.longitude]} />
                            <Circle
                                center={[siteLocation.latitude, siteLocation.longitude]}
                                radius={siteLocation.radiusInMeters || 100}
                                pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.25 }}
                            />
                        </>
                    )}
                </MapContainer>

                {/* Overlay Helper Text */}
                {!siteLocation.latitude && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-[1000] flex items-center justify-center text-xs text-slate-300 pointer-events-none">
                        <span className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-400 animate-bounce" /> Map par exact spot par click karke pin drop karein
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}