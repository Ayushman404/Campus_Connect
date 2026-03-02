import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// --- ICONS (Same as before) ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  className: 'smooth-marker' 
});

const stopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const socket = io('http://localhost:5000');

// --- NEW: THE CAMERA CONTROLLER ---
// This listens for clicks from the Schedule component and flies the map
const MapController = ({ focusedRoute, stops }) => {
  const map = useMap();

  useEffect(() => {
    if (focusedRoute && stops.length > 0) {
      const source = stops.find(s => s.name === focusedRoute.source.name);
      const dest = stops.find(s => s.name === focusedRoute.dest.name);
      
      if (source && dest) {
        // Create a bounding box around the two stops and fly to it
        const bounds = L.latLngBounds(
          [source.lat, source.lng],
          [dest.lat, dest.lng]
        );
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
      }
    }
  }, [focusedRoute, stops, map]);

  return null;
};

const CampusMap = ({ focusedRoute }) => {
  const iitpCenter = [25.5358, 84.8511];
  const [activeBuses, setActiveBuses] = useState({});
  const [stops, setStops] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/buses/live')
      .then(res => res.json())
      .then(data => {
        const initial = {};
        data.forEach(bus => initial[bus.busNumber] = [bus.lat, bus.lng]);
        setActiveBuses(initial);
      });

    fetch('http://localhost:5000/api/buses/stops')
      .then(res => res.json())
      .then(data => setStops(data));

    socket.on('busMoved', (data) => {
      setActiveBuses(prev => ({ ...prev, [data.busId]: [data.lat, data.lng] }));
    });

    return () => socket.off('busMoved');
  }, []);

  return (
    // Neomorphic Map Container
    <div className="h-[80vh] w-full rounded-3xl overflow-hidden shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] border-4 border-white z-0 relative">
      <MapContainer center={iitpCenter} zoom={16} className="h-full w-full z-0">
        
        {/* Insert the Camera Controller */}
        <MapController focusedRoute={focusedRoute} stops={stops} />

        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stops.map((stop) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopIcon}>
            <Popup><div className="font-bold text-red-600">🚏 {stop.name}</div></Popup>
          </Marker>
        ))}

        {Object.entries(activeBuses).map(([busId, coords]) => (
          <Marker key={busId} position={coords}>
            <Popup>
              <div className="text-center font-bold text-blue-600">
                🚌 {busId} <br /><span className="text-green-500 text-xs uppercase tracking-widest">● Live</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CampusMap;