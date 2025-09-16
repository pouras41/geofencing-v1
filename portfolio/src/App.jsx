import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker,useMap, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Risk zones
const riskZones = [
  
  { lat: 19.051, lng: 72.890, radius: 200, level: "High" },
  { lat: 19.048, lng: 72.898, radius: 250, level: "Moderate" },
  { lat: 19.0493847, lng: 72.8941718, radius: 150, level: "High" }
];

const riskColors = {
  "Very High": "red",
  High: "orange",
  Moderate: "yellow"
};

// Zoom to user component
const ZoomToUser = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 16);
  }, [position, map]);
  return null;
};

function App() {
  const [userPosition, setUserPosition] = useState(null);
  const [inRiskZone, setInRiskZone] = useState(false);
  const [userTrail, setUserTrail] = useState([]);

  // Watch position
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = [latitude, longitude];
        setUserPosition(newPos);
        setUserTrail((prev) => [...prev, newPos]);

        // Check if inside any risk zone
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
    <div className="w-full h-screen flex flex-col">
      {/* ALERT DIV */}
      <div
  className={`w-full h-25 text-white text-center p-10 font-bold text-2xl mt-3 mx-auto rounded ${
    inRiskZone ? "bg-red-600" : "bg-green-600"
  }`}
>
  {inRiskZone ? "⚠️ You are inside a risk zone!" : "✅ You are in a safe zone!"}
</div>


      {/* MAP DIV */}
      <div className="flex-1">
        <MapContainer center={[19.0493847, 72.8941718]} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {riskZones.map((zone, i) => (
            <Circle
              key={i}
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              pathOptions={{ color: riskColors[zone.level], fillOpacity: 0.3 }}
            />
          ))}

          {userPosition && <Marker position={userPosition} />}

          {userTrail.length > 1 && <Polyline positions={userTrail} color="blue" />}

          {userPosition && <ZoomToUser position={userPosition} />}
        </MapContainer>
      </div>

      {/* INFO PANEL */}
      {userPosition && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow-lg z-50">
          <p>
            <strong>Nearest risk zone distance:</strong> {nearestZoneDistance()} meters
          </p>
          <p>
            <strong>Trail points recorded:</strong> {userTrail.length}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
