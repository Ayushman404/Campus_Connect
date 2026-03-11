import React, { useState } from 'react';
import CampusMap from './components/CampusMap';
import BusSchedule from './components/BusSchedule';
import BusDetail from './components/BusDetail';

function App() {
  const [selectedBus, setSelectedBus] = useState(null);

  return (
    <div className="h-screen w-full bg-[#f0f4f8] flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* MAP SECTION: 
          Mobile: Shifts height based on selection
          Desktop: Strictly 60% width, 100% height always */}
      <div className={`transition-all duration-300 relative flex-shrink-0 w-full md:w-[60%] ${selectedBus ? 'h-[40vh] md:h-full' : 'h-[50vh] md:h-full'}`}>
        <div className="absolute top-4 left-4 z-[400] pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight drop-shadow-md">Campus Connect</h1>
          <p className="text-[10px] md:text-xs text-slate-600 font-bold uppercase tracking-widest bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full w-fit mt-1 shadow-sm">
            {selectedBus ? `Tracking ${selectedBus.id}` : 'Live Transit'}
          </p>
        </div>
        <CampusMap selectedBus={selectedBus} />
      </div>

      {/* SCHEDULE/DETAIL PANEL: 
          Mobile: Takes remaining height 
          Desktop: Strictly 40% width, full height, nice left-shadow */}
      <div className={`transition-all duration-300 w-full md:w-[40%] bg-white md:shadow-[-10px_0_30px_rgba(0,0,0,0.08)] shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-[500] flex flex-col p-4 md:p-8 ${selectedBus ? 'h-[60vh] md:h-full' : 'h-[50vh] md:h-full'} rounded-t-[24px] md:rounded-none`}>
        
        {selectedBus ? (
          <BusDetail bus={selectedBus} onBack={() => setSelectedBus(null)} />
        ) : (
          <BusSchedule onBusSelect={setSelectedBus} />
        )}

      </div>
      
    </div>
  );
}

export default App;