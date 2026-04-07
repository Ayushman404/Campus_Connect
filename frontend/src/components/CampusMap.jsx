import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Default big icon for main buses
const mainBusIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

// Small dot icon for unselected buses
const dotIcon = L.divIcon({
  className: 'bg-slate-400 w-3 h-3 rounded-full border-2 border-white shadow-sm',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const socket = io('http://localhost:5000');

// Camera controller to focus on the selected bus
const MapFocusController = ({ selectedBus, activeBuses }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedBus && activeBuses[selectedBus.id]) {
      const [lat, lng] = activeBuses[selectedBus.id];
      // Fly to the bus and zoom in
      map.flyTo([lat, lng], 17, { duration: 1.5 });
    } else if (!selectedBus) {
      // Zoom out slightly to see all campus when back button is pressed
      map.flyTo([25.5358, 84.8511], 15, { duration: 1.5 });
    }
  }, [selectedBus, activeBuses, map]);

  return null;
};

const CampusMap = ({ selectedBus }) => {
  const iitpCenter = [25.5358, 84.8511];
  
  // Define bounds to keep the view restricted to the campus area
  // Roughly: [South-West Lat/Lng, North-East Lat/Lng]
  const campusBounds = [
    [25.5250, 81.8350], // Southwest corner
    [27.5450, 87.9700]  // Northeast corner
  ];

  const [activeBuses, setActiveBuses] = useState({});

  useEffect(() => {
    // Dummy active buses data for testing
    setActiveBuses({
      'BUS-01': [25.5358, 84.8511],
      'BUS-02': [25.5360, 84.8520],
      'BUS-03': [25.5340, 84.8500],
      'BUS-04': [25.5370, 84.8530],
      'BUS-05': [25.5350, 84.8490]
    });

    socket.on('busMoved', (data) => {
      setActiveBuses(prev => ({ ...prev, [data.busId]: [data.lat, data.lng] }));
    });
    return () => socket.off('busMoved');
  }, []);

  return (
    <div className="h-full w-full z-0">
      <MapContainer 
        center={iitpCenter} 
        zoom={15} 
        minZoom={14}               // 1. Prevents zooming out too far
        maxBounds={campusBounds}    // 2. Prevents panning away from campus
        maxBoundsViscosity={1.0}    // 3. Makes the boundary "hard" so map bounces back
        zoomControl={false} 
        className="h-full w-full"
      >
        
        {/* Handles the zooming logic */}
        <MapFocusController selectedBus={selectedBus} activeBuses={activeBuses} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {Object.entries(activeBuses).map(([busId, coords]) => {
          const isSelected = selectedBus && selectedBus.id === busId;
          const isDimmed = selectedBus && !isSelected;
          
          return (
            <Marker 
              key={busId} 
              position={coords} 
              icon={isDimmed ? dotIcon : mainBusIcon}
              zIndexOffset={isSelected ? 1000 : 0} 
            >
              {!isDimmed && (
                <Popup>🚌 {busId} <span className="text-green-500">● Live</span></Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default CampusMap;