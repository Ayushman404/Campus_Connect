import React, { useState } from 'react';
import CampusMap from '../components/CampusMap';
import BusSchedule from '../components/BusSchedule';
import BusDetail from '../components/BusDetail';

function Dashboard() {
  const [selectedBus, setSelectedBus] = useState(null);

  return (
    <div className="h-full w-full bg-surface flex flex-col md:flex-row overflow-hidden font-body">
      
      {/* MAP SECTION: 
          Mobile: Shifts height based on selection
          Desktop: Strictly 60% width, 100% height always */}
      <div className={`transition-all duration-700 relative flex-shrink-0 w-full md:w-[60%] ${selectedBus ? 'h-[40vh] md:h-full' : 'h-[50vh] md:h-full'}`}>
        <div className="absolute top-4 left-4 z-[400] pointer-events-none">
          <p className="text-[10px] md:text-xs text-on-surface-variant font-black uppercase tracking-[0.2em] bg-surface/90 backdrop-blur-md px-4 py-2 rounded-full w-fit shadow-lg border border-on-surface/5">
            {selectedBus ? `Tracking Live • ${selectedBus.id}` : 'Live Transit • Campus'}
          </p>
        </div>
        <CampusMap selectedBus={selectedBus} />
      </div>

      {/* SCHEDULE/DETAIL PANEL: 
          Mobile: Takes remaining height 
          Desktop: Strictly 40% width, full height, nice left-shadow */}
      <div className={`transition-all duration-700 w-full md:w-[40%] bg-surface-container-lowest md:shadow-[-20px_0_40px_rgba(32,27,14,0.06)] shadow-[0_-10px_30px_rgba(32,27,14,0.04)] z-[500] flex flex-col p-6 md:p-8 ${selectedBus ? 'h-[60vh] md:h-[calc(100vh-80px)]' : 'h-[50vh] md:h-[calc(100vh-80px)]'} rounded-t-[3rem] md:rounded-tl-[3rem] md:rounded-none border-t md:border-t-0 md:border-l border-on-surface/5`}>
        
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
