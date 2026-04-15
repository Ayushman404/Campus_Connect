import React, { useState, useEffect } from 'react';
import CampusMap from '../components/CampusMap';
import BusSchedule from '../components/BusSchedule';
import BusDetail from '../components/BusDetail';

function Dashboard() {
  const [selectedBus, setSelectedBus] = useState(null);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/buses/schedules');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setSchedules(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch schedules:', err);
        setSchedules([]); // Ensure it stays an array
      }
    };
    fetchSchedules();
  }, []);

  return (
    <div className="h-full w-full bg-surface flex flex-col md:flex-row overflow-hidden font-body">

      <div className={`transition-all duration-700 relative flex-shrink-0 w-full md:w-[60%] ${selectedBus ? 'h-[40vh] md:h-full' : 'h-[50vh] md:h-full'}`}>
        <div className="absolute top-4 left-4 z-[400] pointer-events-none">
          <p className="text-[10px] md:text-xs text-on-surface-variant font-black uppercase tracking-[0.2em] bg-surface/90 backdrop-blur-md px-4 py-2 rounded-full w-fit shadow-lg border border-on-surface/5">
            {selectedBus ? `Tracking Live • ${selectedBus.busNumber || selectedBus.id}` : 'Live Transit • Campus'}
          </p>
        </div>
        <CampusMap selectedBus={selectedBus} allSchedules={schedules} />

        {/* Map Legend — floating overlay, always visible on all screen sizes */}
        <div className="absolute bottom-10 right-3 z-[400] pointer-events-none bg-surface/90 backdrop-blur-md rounded-xl px-3 py-2 border border-on-surface/5 shadow-lg flex flex-col gap-1.5">
          <span className="text-[8px] font-black uppercase tracking-[0.15em] text-on-surface-variant/50 mb-0.5">Map Key</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(255,87,34,0.5)] shrink-0" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant">Live GPS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant">Estimated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-outline-variant/50 shrink-0" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant">No Active Trip</span>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-700 w-full md:w-[40%] bg-surface-container-lowest md:shadow-[-20px_0_40px_rgba(32,27,14,0.06)] shadow-[0_-10px_30px_rgba(32,27,14,0.04)] z-[500] flex flex-col p-6 md:p-8 ${selectedBus ? 'h-[60vh] md:h-[calc(100vh-80px)]' : 'h-[50vh] md:h-[calc(100vh-80px)]'} rounded-t-[3rem] md:rounded-tl-[3rem] md:rounded-none border-t md:border-t-0 md:border-l border-on-surface/5`}>

        {selectedBus ? (
          <BusDetail
            bus={selectedBus}
            allSchedules={schedules}
            onBack={() => setSelectedBus(null)}
          />
        ) : (
          <BusSchedule
            allSchedules={schedules}
            onBusSelect={setSelectedBus}
          />
        )}

      </div>

    </div>
  );
}

export default Dashboard;
