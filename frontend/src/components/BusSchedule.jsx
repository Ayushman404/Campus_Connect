import React, { useEffect, useState, useMemo } from 'react';

const BusSchedule = ({ onBusSelect, allSchedules, liveBuses = {} }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // 1 minute interval
    return () => clearInterval(timer);
  }, []);

  // 1. Fleet Header Data — only buses that run on the current day type
  const uniqueBuses = useMemo(() => {
    const day = new Date().getDay();
    const currentDayType = (day === 0 || day === 6) ? 'WEEKEND' : 'WEEKDAY';
    const seen = new Set();
    return (allSchedules || [])
      .filter(s => s.dayType === currentDayType)
      .reduce((acc, s) => {
        if (!seen.has(s.bus.busNumber)) {
          seen.add(s.bus.busNumber);
          acc.push({
            id: s.bus.busNumber,
            busNumber: s.bus.busNumber,
            driverName: s.bus.driverName,
            driverContact: s.bus.driverContact
          });
        }
        return acc;
      }, []);
  }, [allSchedules]);

  const liveFleetCount = useMemo(() => {
    return uniqueBuses.filter(bus => {
      const info = liveBuses[bus.id];
      return info && (Date.now() - info.lastUpdated < 300000);
    }).length;
  }, [uniqueBuses, liveBuses, currentTime]);

  // 2. Upcoming Schedule Data
  const top6 = useMemo(() => {
    const day = currentTime.getDay();
    const isWeekend = day === 0 || day === 6;
    const currentDayType = isWeekend ? 'WEEKEND' : 'WEEKDAY';
    const nowStr = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');

    if (!Array.isArray(allSchedules)) return [];

    const upcoming = allSchedules
      .filter(s => s.dayType === currentDayType && s.departureTime >= nowStr)
      .sort((a, b) => a.departureTime.localeCompare(b.departureTime)) // Fix: Sort after filtering
      .slice(0, 6);

    return upcoming.map(sch => {
      const busId = sch.bus.busNumber;
      const info = liveBuses[busId];
      const isLive = info && (Date.now() - info.lastUpdated < 300000);

      let status = 'Not Live';
      if (isLive) {
        status = nowStr >= sch.departureTime ? 'Live and Running' : 'Live and Scheduled';
      }

      return {
        ...sch,
        id: busId,
        nextSource: sch.source.name,
        nextDest: sch.dest.name,
        time: sch.departureTime,
        status: status
      };
    });
  }, [allSchedules, liveBuses, currentTime]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-4 md:hidden shrink-0" />
      
      {/* FLEET HEADER */}
      <div className="mb-8 shrink-0">
        <div className="flex justify-between items-end mb-3 px-1">
          <h2 className="text-xl md:text-2xl font-black text-on-surface uppercase tracking-tight leading-none">Bus Fleet</h2>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none">
             {liveFleetCount} / {uniqueBuses.length} LIVE
          </span>
        </div>
        
        <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 px-1">
          {uniqueBuses.map((bus) => {
            const info = liveBuses[bus.id];
            const isLive = info && (Date.now() - info.lastUpdated < 300000);
            
            return (
              <button 
                key={bus.id}
                onClick={() => onBusSelect(bus)}
                className="flex items-center gap-2 bg-surface-container border border-outline-variant/30 px-3 py-2 rounded-xl hover:bg-surface-container-high hover:border-primary/40 active:scale-95 transition-all shrink-0"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(255,87,34,0.6)]' : 'bg-outline-variant/50'} transition-colors`}></div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black uppercase text-on-surface tracking-wider leading-tight">{bus.id.replace('BR01PM', 'BUS-')}</span>
                  <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest opacity-80 leading-tight">{bus.driverName || 'Staff'}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* CLOSEST DEPARTURES */}
      <div className="flex justify-between items-center mb-4 shrink-0 px-1">
        <h2 className="text-xl md:text-2xl font-black text-on-surface uppercase tracking-tight">Closest Departures</h2>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pb-4 pr-1">
        {top6.length === 0 ? (
          <p className="text-center text-on-surface-variant/60 text-xs py-10 italic">No remaining departures for today.</p>
        ) : top6.map((bus, idx) => (
          <div 
            key={`${bus.id}-${bus.time}-${idx}`}
            onClick={() => onBusSelect(bus)}
            className="bg-surface-container border border-outline-variant/30 rounded-2xl p-4 md:p-5 flex flex-col justify-center cursor-pointer hover:bg-surface-container-high hover:border-primary/40 active:scale-[0.98] transition-all group shrink-0"
          >
            <div className="flex justify-between items-center mb-2 md:mb-3">
              <div className="flex items-center gap-3">
                <span className="bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  {bus.id.replace('BR01PM', 'BUS-')}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${bus.status.startsWith('Live') ? 'text-primary animate-pulse' : 'text-on-surface-variant/60'}`}>
                  {bus.status}
                </span>
              </div>
              <span className="text-on-surface-variant font-black text-xs uppercase tracking-widest">{bus.time}</span>
            </div>
            
            <div className="flex items-center justify-between text-on-surface font-bold text-xs sm:text-sm md:text-base">
              <span className="truncate w-2/5 group-hover:text-primary transition-colors">{bus.nextSource}</span>
              <span className="text-outline-variant/50 w-1/5 text-center px-2">—</span>
              <span className="truncate w-2/5 text-right group-hover:text-primary transition-colors">{bus.nextDest}</span>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default BusSchedule;