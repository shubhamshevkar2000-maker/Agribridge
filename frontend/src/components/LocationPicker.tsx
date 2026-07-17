"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Leaflet + Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function LocationPicker({
  onLocationSelect,
}: {
  onLocationSelect: (loc: [number, number]) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const defaultUrl = "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png";
  const fallbackUrl =
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";
  const finalFallbackUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

  const [tileUrl, setTileUrl] = useState(defaultUrl);
  const [tileError, setTileError] = useState<string | null>(null);
  const [tileErrorCount, setTileErrorCount] = useState(0);

  useEffect(() => {
    if (position) {
      onLocationSelect(position);
    }
  }, [position, onLocationSelect]);

  const defaultCenter: [number, number] = [20.5937, 78.9629];

  const handleTileError = () => {
    setTileErrorCount((count) => count + 1);
  };

  useEffect(() => {
    if (tileErrorCount === 0) return;

    if (tileUrl === defaultUrl && tileErrorCount > 3) {
      setTileUrl(fallbackUrl);
      setTileError(
        "OpenStreetMap tiles failed to load. Switching to a fallback provider.",
      );
      setTileErrorCount(0);
    } else if (tileUrl === fallbackUrl && tileErrorCount > 3) {
      setTileUrl(finalFallbackUrl);
      setTileError("Fallback tile provider failed. Trying another provider.");
      setTileErrorCount(0);
    } else if (tileUrl === finalFallbackUrl && tileErrorCount > 3) {
      setTileError(
        "Map tiles are unavailable. Please check your network and reload the page.",
      );
    }
  }, [tileErrorCount, tileUrl]);

  return (
    <div className="relative h-[300px] w-full rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={defaultCenter}
        zoom={4}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url={tileUrl}
          eventHandlers={{
            tileerror: handleTileError,
          }}
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      {tileError && (
        <div className="absolute inset-x-0 bottom-0 mx-4 mb-4 rounded-2xl bg-destructive/90 px-4 py-3 text-sm text-white shadow-lg shadow-destructive/30 backdrop-blur-sm">
          {tileError}
        </div>
      )}
    </div>
  );
}
