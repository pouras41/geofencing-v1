import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Polyline, useMap, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Risk zones
const riskZones = [
  { lat: 19.051, lng: 72.890, radius: 200, level: "High" },
  { lat: 19.048, lng: 72.898, radius: 250, level: "Moderate" },
  { lat: 19.0493847, lng: 72.8941718, radius: 150, level: "Very High" },
];

const riskColors = {
  "Very High": "red",
  High: "orange",
  Moderate: "yellow",
};

// Zoom to user
const ZoomToUser = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 16);
  }, [position, map]);
  return null;
};

// Custom Tailwind marker
const createTailwindMarker = () => {
  return L.divIcon({
    className: "",
    html: `<div class="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>`,
  });
};

function App() {
  const [userPosition, setUserPosition] = useState(null);
  const [inRiskZone, setInRiskZone] = useState(false);
  const [userTrail, setUserTrail] = useState([]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = [latitude, longitude];
        setUserPosition(newPos);
        setUserTrail((prev) => [...prev, newPos]);

        let inside = false;
        riskZones.forEach((zone) => {
          const distance = L.latLng(latitude, longitude).distanceTo([zone.lat, zone.lng]);
          if (distance <= zone.radius) inside = true;
        });
        setInRiskZone(inside);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const nearestZoneDistance = () => {
    if (!userPosition) return null;
    let minDist = Infinity;
    riskZones.forEach((zone) => {
      const dist = L.latLng(userPosition).distanceTo([zone.lat, zone.lng]) - zone.radius;
      if (dist < minDist) minDist = dist;
    });
    return Math.max(minDist, 0).toFixed(1);
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-start bg-gray-100 p-2 sm:p-4 space-y-2 sm:space-y-4">
  {/* ALERT BAR */}
  <div
    className={`w-full max-w-2xl text-center py-2 sm:py-4 px-2 sm:px-4 rounded-lg font-bold text-sm sm:text-lg shadow-md ${
      inRiskZone ? "bg-red-600 text-white" : "bg-green-600 text-white"
    }`}
  >
    {inRiskZone ? "⚠️ You are inside a risk zone!" : "✅ You are in a safe zone!"}
  </div>

  {/* MAP CONTAINER */}
  <div className="w-full max-w-2xl flex-1 rounded-lg overflow-hidden shadow-lg relative flex flex-col">
    <MapContainer
      center={[19.0493847, 72.8941718]}
      zoom={15}
      className="w-full flex-1"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {riskZones.map((zone, i) => (
        <Circle
          key={i}
          center={[zone.lat, zone.lng]}
          radius={zone.radius}
          pathOptions={{ color: riskColors[zone.level], fillOpacity: 0.3 }}
        />
      ))}

      {userPosition && <Marker position={userPosition} icon={createTailwindMarker()} />}
      {userTrail.length > 1 && <Polyline positions={userTrail} color="blue" />}
      {userPosition && <ZoomToUser position={userPosition} />}
    </MapContainer>

    {/* INFO PANEL BELOW MAP */}
    {userPosition && (
      <div className="mt-2 w-full bg-neutral-700 p-4 rounded-lg shadow-md text-white font-medium space-y-1 text-center text-xs sm:text-base">
        <p>
          <strong>Nearest risk zone distance:</strong> {nearestZoneDistance()} meters
        </p>
        <p>
          <strong>Trail points recorded:</strong> {userTrail.length}
        </p>
      </div>
    )}
  </div>
</div>
  );
}

export default App;
