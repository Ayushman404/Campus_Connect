import React, { useEffect, useState, useMemo } from 'react';
import { Map, MapMarker, MarkerContent, MarkerLabel, useMap } from './ui/map';

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

// ─── Static constants (outside component for stable references) ──────────────
const IIT_CENTER    = [84.8511, 25.5358]; // [lng, lat] — MapLibre order
const CAMPUS_BOUNDS = [[81.835, 25.525], [87.97, 27.545]];
const EMPTY_LIVE    = {};
const EMPTY_SCHEDS  = [];

/**
 * Known stop coordinates — used for dead-reckoning estimation.
 * These match the stops seeded in the database.
 */
const STOP_COORDS = {
  'Aryabhatta':   { lat: 25.540448, lng: 84.8525089 },
  'Tut Block':    { lat: 25.5327137, lng: 84.8518994 },
  'D Quarters':   { lat: 25.548993,  lng: 84.859703  },
  'Bihar Museum': { lat: 25.6111,    lng: 85.1105     },
  'Main Gate':    { lat: 25.5335149, lng: 84.8550936  },
};

/**
 * Approximate travel time in minutes between stops.
 * Campus route: Aryabhatta ↔ Tut Block via Asima (~10 min one-way).
 * D Quarters is a short on-campus detour (~8 min from Aryabhatta).
 * Patna route: Aryabhatta ↔ Bihar Museum (~150 min one-way, 2.5 hr).
 */
const ROUTE_DURATION_MINS = {
  'Aryabhatta→Tut Block':   10,
  'Tut Block→Aryabhatta':   10,
  'Aryabhatta→D Quarters':   8,
  'D Quarters→Aryabhatta':   8,
  'Aryabhatta→Bihar Museum': 150,
  'Bihar Museum→Aryabhatta': 150,
  'Aryabhatta→Main Gate':     3,
  'Main Gate→Aryabhatta':     3,
};

/** Linear interpolation helper */
function lerp(a, b, t) { return a + (b - a) * t; }

/**
 * Dead reckoning: estimate where a bus should be right now based on its schedule.
 *
 * Priority:
 *   1. Bus is mid-trip → interpolated position between stops
 *   2. Bus is waiting (next dep ≤ 60 min) → show at next departure source
 *   3. Bus just finished a trip (<= 45 min ago) → show at last arrival stop
 *   4. Nothing matches → return null
 */
function getEstimatedPosition(busNumber, allSchedules) {
  const now     = new Date();
  const day     = now.getDay();
  const dayType = (day === 0 || day === 6) ? 'WEEKEND' : 'WEEKDAY';
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const busSchedules = allSchedules
    .filter(s => s.bus.busNumber === busNumber && s.dayType === dayType)
    .sort((a, b) => a.departureTime.localeCompare(b.departureTime));

  if (busSchedules.length === 0) return null;

  // --- Pass 1: mid-trip? ---
  for (const sch of busSchedules) {
    const [h, m]   = sch.departureTime.split(':').map(Number);
    const depMins  = h * 60 + m;
    const routeKey = `${sch.source.name}→${sch.dest.name}`;
    const duration = ROUTE_DURATION_MINS[routeKey] ?? 15;
    const elapsed  = nowMins - depMins;

    if (elapsed >= 0 && elapsed <= duration) {
      const src = STOP_COORDS[sch.source.name];
      const dst = STOP_COORDS[sch.dest.name];
      if (!src || !dst) continue;
      const t = Math.min(elapsed / duration, 1);
      return {
        lat: lerp(src.lat, dst.lat, t), lng: lerp(src.lng, dst.lng, t),
        estimated: true, status: 'moving',
        progress: t, from: sch.source.name, to: sch.dest.name,
        depTime: sch.departureTime,
      };
    }
  }

  // --- Pass 2: waiting for next departure (≤ 60 min away)? ---
  for (const sch of busSchedules) {
    const [h, m]  = sch.departureTime.split(':').map(Number);
    const depMins = h * 60 + m;
    const minsUntil = depMins - nowMins;

    if (minsUntil > 0 && minsUntil <= 60) {
      const src = STOP_COORDS[sch.source.name];
      if (!src) continue;
      return {
        lat: src.lat, lng: src.lng,
        estimated: true, status: 'parked',
        from: sch.source.name, to: sch.dest.name,
        depTime: sch.departureTime, minsUntil,
      };
    }
  }

  // --- Pass 3: just finished a trip (≤ 45 min ago)? ---
  for (let i = busSchedules.length - 1; i >= 0; i--) {
    const sch = busSchedules[i];
    const [h, m]   = sch.departureTime.split(':').map(Number);
    const depMins  = h * 60 + m;
    const routeKey = `${sch.source.name}→${sch.dest.name}`;
    const duration = ROUTE_DURATION_MINS[routeKey] ?? 15;
    const arrMins  = depMins + duration;
    const sinceArr = nowMins - arrMins;

    if (sinceArr >= 0 && sinceArr <= 45) {
      const dst = STOP_COORDS[sch.dest.name];
      if (!dst) continue;
      return {
        lat: dst.lat, lng: dst.lng,
        estimated: true, status: 'parked',
        from: sch.dest.name, to: '—',
        depTime: sch.departureTime,
      };
    }
  }

  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
const CampusMap = ({ selectedBus, liveBuses = EMPTY_LIVE, allSchedules = EMPTY_SCHEDS }) => {
  const [mapCenter, setMapCenter] = useState(IIT_CENTER);
  const [mapZoom,   setMapZoom]   = useState(15);

  const busPositions = useMemo(() => {
    const positions = {};

    // Only seed with verified live GPS positions
    Object.entries(liveBuses).forEach(([id, info]) => {
      if (info?.lat && info?.lng) {
        positions[id] = { ...info, estimated: false };
      }
    });

    // Removed the "Pass 2" loop that generated estimated/dummy positions

    return positions;
  }, [liveBuses]);

  // Fly to selected bus when it changes
  useEffect(() => {
    const info = selectedBus ? busPositions[selectedBus.id] : null;
    if (info?.lng && info?.lat) {
      setMapCenter([info.lng, info.lat]);
      setMapZoom(17);
    } else {
      setMapCenter(IIT_CENTER);
      setMapZoom(15);
    }
  }, [selectedBus, busPositions]);

  return (
    <div className="h-full w-full absolute inset-0 z-0 bg-surface">
      <Map
        center={IIT_CENTER}
        zoom={15}
        minZoom={14}
        maxBounds={CAMPUS_BOUNDS}
      >
        <MapFocusController center={mapCenter} zoom={mapZoom} />

        {Object.entries(busPositions).map(([busId, info]) => {
          const isSelected  = selectedBus && (selectedBus.id === busId || selectedBus.busNumber === busId);
          const isDimmed    = selectedBus && !isSelected;
          const isLive      = !info.estimated && liveBuses[busId] && (Date.now() - liveBuses[busId].lastUpdated < 300000);
          const isEstimated = info.estimated;

          return (
            <MapMarker
              key={busId}
              longitude={info.lng}
              latitude={info.lat}
            >
              <MarkerContent>
                {/* Dot: orange+pulse = live GPS | blue = estimated | grey = unknown */}
                <div
                  className={`border-[2.5px] border-surface-bright shadow-lg rounded-full flex items-center justify-center transition-all
                    ${isSelected  ? 'w-6 h-6 bg-primary animate-pulse' :
                      isDimmed    ? 'w-3 h-3 bg-outline-variant/60' :
                      isLive      ? 'w-5 h-5 bg-primary animate-pulse' :
                      isEstimated ? 'w-5 h-5 bg-secondary' :
                                    'w-4 h-4 bg-outline-variant/50'}`}
                />
                {!isDimmed && (
                  <MarkerLabel position="bottom">
                    <span className="bg-surface-container-highest py-1.5 px-3 rounded-xl border border-on-surface/5 text-on-surface shadow-xl text-[10px] whitespace-nowrap flex items-center gap-1.5 font-black uppercase tracking-widest mt-1">
                      🚌 {busId.replace('BR01PM', 'BUS-').replace('INST-BUS-', 'INST-')}
                      {isLive      && <span className="text-primary animate-pulse ml-1 text-xs">● Live</span>}
                      {isEstimated && <span className="text-secondary ml-1 text-xs">~ Est.</span>}
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