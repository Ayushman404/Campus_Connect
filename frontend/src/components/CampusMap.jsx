import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Map, MapMarker, MarkerContent, MarkerLabel, useMap } from './ui/map';

const socket = io('https://campus-connect-ljjb.onrender.com');

// MapController uses the map context to fly to new centers
const MapFocusController = ({ center, zoom }) => {
  const { map } = useMap();
  useEffect(() => {
    if (map && center) {
      map.flyTo({ center, zoom, duration: 1500 });
    }
  }, [map, center, zoom]);
  return null;
};

const CampusMap = ({ selectedBus }) => {
  // MapLibre requires coordinates in [longitude, latitude] order
  const iitpCenterLngLat = [84.8511, 25.5358];
  
  // Bounds [Southwest [lng, lat], Northeast [lng, lat]]
  const campusBounds = [
    [81.8350, 25.5250],
    [87.9700, 27.5450]
  ];

  const [activeBuses, setActiveBuses] = useState({});
  const [mapCenter, setMapCenter] = useState(iitpCenterLngLat);
  const [mapZoom, setMapZoom] = useState(15);

  useEffect(() => {
    // Initial static positions [lng, lat]
    setActiveBuses({
      'IITP-BUS-01': [84.8511, 25.5358],
      'IITP-BUS-02': [84.8520, 25.5360],
      'IITP-BUS-03': [84.8500, 25.5340],
      'IITP-BUS-04': [84.8530, 25.5370],
      'IITP-BUS-05': [84.8490, 25.5350]
    });

    socket.on('busMoved', (data) => {
      setActiveBuses(prev => ({ ...prev, [data.busId]: [data.lng, data.lat] }));
    });
    return () => socket.off('busMoved');
  }, []);

  // Sync the map center/zoom with the selected bus
  useEffect(() => {
    if (selectedBus && activeBuses[selectedBus.id]) {
      setMapCenter(activeBuses[selectedBus.id]);
      setMapZoom(17);
    } else {
      setMapCenter(iitpCenterLngLat);
      setMapZoom(15);
    }
  }, [selectedBus, activeBuses]);

  return (
    <div className="h-full w-full absolute inset-0 z-0 bg-surface">
      <Map 
        center={iitpCenterLngLat} 
        zoom={15} 
        minZoom={14}
        maxBounds={campusBounds}
      >
        <MapFocusController center={mapCenter} zoom={mapZoom} />

        {Object.entries(activeBuses).map(([busId, coords]) => {
          const isSelected = selectedBus && selectedBus.id === busId;
          const isDimmed = selectedBus && !isSelected;
          
          return (
            <MapMarker 
              key={busId} 
              longitude={coords[0]} 
              latitude={coords[1]}
            >
              <MarkerContent>
                <div 
                  className={`border-[2.5px] border-surface-bright shadow-lg rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'w-6 h-6 bg-primary animate-pulse' : (isDimmed ? 'w-3 h-3 bg-outline-variant/60' : 'w-5 h-5 bg-primary')
                  }`}
                />
                {!isDimmed && (
                  <MarkerLabel position="bottom">
                    <span className="bg-surface-container-highest py-1.5 px-3 rounded-xl border border-on-surface/5 text-on-surface shadow-xl text-[10px] whitespace-nowrap flex items-center gap-1.5 font-black uppercase tracking-widest mt-1">
                      🚌 {busId.replace('IITP-', '')} <span className="text-primary animate-pulse ml-1 text-xs">●</span> Live
                    </span>
                  </MarkerLabel>
                )}
              </MarkerContent>
            </MapMarker>
          );
        })}
      </Map>
    </div>
  );
};

export default CampusMap;