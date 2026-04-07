import React, { useState } from 'react';
import CampusMap from '../components/CampusMap';
import BusSchedule from '../components/BusSchedule';
import BusDetail from '../components/BusDetail';

function Dashboard() {
  const [selectedBus, setSelectedBus] = useState(null);

  return (
    <div className="h-full w-full bg-[#f0f4f8] flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* MAP SECTION: 
          Mobile: Shifts height based on selection
          Desktop: Strictly 60% width, 100% height always */}
      <div className={`transition-all duration-300 relative flex-shrink-0 w-full md:w-[60%] ${selectedBus ? 'h-[40vh] md:h-full' : 'h-[50vh] md:h-full'}`}>
        <div className="absolute top-4 left-4 z-[400] pointer-events-none">
          <p className="text-[10px] md:text-xs text-slate-600 font-extrabold uppercase tracking-[0.2em] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full w-fit shadow-lg shadow-slate-200/50 border border-slate-100">
            {selectedBus ? `Tracking Live • ${selectedBus.id}` : 'Live Transit • IIT Patna'}
          </p>
        </div>
        <CampusMap selectedBus={selectedBus} />
      </div>

      {/* SCHEDULE/DETAIL PANEL: 
          Mobile: Takes remaining height 
          Desktop: Strictly 40% width, full height, nice left-shadow */}
      <div className={`transition-all duration-300 w-full md:w-[40%] bg-white md:shadow-[-20px_0_40px_rgba(0,0,0,0.06)] shadow-[0_-10px_30px_rgba(0,0,0,0.04)] z-[500] flex flex-col p-4 md:p-8 ${selectedBus ? 'h-[60vh] md:h-full' : 'h-[50vh] md:h-full'} rounded-t-[32px] md:rounded-none border-t md:border-t-0 md:border-l border-slate-100`}>
        
        {selectedBus ? (
          <BusDetail bus={selectedBus} onBack={() => setSelectedBus(null)} />
        ) : (
          <BusSchedule onBusSelect={setSelectedBus} />
        )}

      </div>
      
    </div>
  );
}

export default Dashboard;
