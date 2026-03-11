import React from 'react';

// MAIN FIX: Changed prop from { onRouteSelect } to { onBusSelect }
const BusSchedule = ({ onBusSelect }) => {
  const activeBuses = [
    { id: 'BUS-01', nextSource: 'Aryabhatta', nextDest: 'TUT Block', time: '09:00 AM', status: 'Live' },
    { id: 'BUS-02', nextSource: 'Aryabhatta', nextDest: 'D Quarters', time: '09:15 AM', status: 'Departing' },
    { id: 'BUS-03', nextSource: 'IIT Patna', nextDest: 'Patna Junction', time: '10:00 AM', status: 'Scheduled' },
    { id: 'BUS-04', nextSource: 'Asima', nextDest: 'TUT Block', time: '09:10 AM', status: 'Live' },
    { id: 'BUS-05', nextSource: 'TUT Block', nextDest: 'Aryabhatta', time: '09:30 AM', status: 'Scheduled' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      {/* Mobile Drag Handle */}
      <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 md:hidden shrink-0" />
      
      <div className="flex justify-between items-center mb-3 shrink-0 px-1">
        <h2 className="text-base md:text-lg font-black text-slate-800">Active Routes</h2>
        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded-md">5 Buses Running</span>
      </div>

      <div className="flex-1 flex flex-col justify-between gap-2 overflow-hidden pb-1">
        {activeBuses.map((bus) => (
          <div 
            key={bus.id}
            // MAIN FIX: We are now passing the whole 'bus' object to App.js on click
            onClick={() => onBusSelect(bus)}
            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2 md:p-3 flex flex-col justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 active:scale-[0.98] transition-all"
          >
            <div className="flex justify-between items-center mb-1 md:mb-2">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                  {bus.id}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${bus.status === 'Live' ? 'text-green-500 animate-pulse' : 'text-slate-400'}`}>
                  {bus.status}
                </span>
              </div>
              <span className="text-blue-600 font-black text-xs">{bus.time}</span>
            </div>
            
            <div className="flex items-center justify-between text-slate-700 font-bold text-[11px] sm:text-xs md:text-sm">
              <span className="truncate w-2/5">{bus.nextSource}</span>
              <span className="text-blue-300 w-1/5 text-center">➔</span>
              <span className="truncate w-2/5 text-right">{bus.nextDest}</span>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default BusSchedule;