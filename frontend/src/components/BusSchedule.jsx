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
      <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-4 md:hidden shrink-0" />
      
      <div className="flex justify-between items-center mb-6 shrink-0 px-1">
        <h2 className="text-xl md:text-2xl font-black text-on-surface uppercase tracking-tight">Active Routes</h2>
        <span className="text-[10px] bg-primary text-on-primary font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">5 Routes</span>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-hidden custom-scrollbar pb-4">
        {activeBuses.map((bus) => (
          <div 
            key={bus.id}
            onClick={() => onBusSelect(bus)}
            className="flex-1 bg-surface-container border border-outline-variant/30 rounded-2xl p-4 md:p-5 flex flex-col justify-center cursor-pointer hover:bg-surface-container-high hover:border-primary/40 active:scale-[0.98] transition-all group"
          >
            <div className="flex justify-between items-center mb-2 md:mb-3">
              <div className="flex items-center gap-3">
                <span className="bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  {bus.id}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${bus.status === 'Live' ? 'text-primary animate-pulse' : 'text-on-surface-variant/60'}`}>
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