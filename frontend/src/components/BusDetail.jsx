import React from 'react';

const BusDetail = ({ bus, onBack }) => {
  // Mock Driver Data based on the bus selected
  const driver = { 
    name: 'Ramesh Kumar', 
    phone: '+91 9876543210', 
    busNo: 'BR 01 PB 1234' 
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Bar with Back Button */}
      <div className="flex items-center gap-4 mb-6 shrink-0 px-2">
        <button 
          onClick={onBack}
          className="bg-surface-container-highest w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary hover:text-on-primary text-on-surface active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight leading-none mb-1">{bus.id}</h2>
          <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] animate-pulse">● Live Transit</p>
        </div>
      </div>

      {/* Driver & Bus Info Card */}
      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5 flex items-center justify-between mb-8 shrink-0 shadow-sm mx-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-surface rounded-full flex items-center justify-center text-2xl shadow-sm border border-outline-variant/50">👨🏽‍✈️</div>
          <div>
            <h3 className="text-sm font-black uppercase text-on-surface tracking-wide">{driver.name}</h3>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">{driver.busNo}</p>
          </div>
        </div>
        <a href={`tel:${driver.phone}`} className="bg-primary hover:bg-[#842500] w-12 h-12 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center">
           <span className="material-symbols-outlined text-on-primary">call</span>
        </a>
      </div>

      {/* Upcoming Schedule Header */}
      <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4 px-2 shrink-0 border-b border-on-surface/5 pb-2">Mission Log</h3>

      {/* Scrollable Skeleton List for College Sheet Timetable */}
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
        {/* Mocking 5 upcoming trips for the skeleton */}
        {[1, 2, 3, 4, 5].map((item, index) => (
          <div key={item} className="flex gap-6 group">
            {/* Timeline Line & Dot */}
            <div className="flex flex-col items-center">
              <div className={`w-3.5 h-3.5 rounded-full mt-1 ${index === 0 ? 'bg-primary ring-4 ring-primary/20 animate-pulse' : 'bg-outline-variant/50'} z-10 transition-colors`}></div>
              {index !== 4 && <div className="w-0.5 h-full bg-outline-variant/30 -my-2 transition-colors group-hover:bg-primary/20"></div>}
            </div>
            {/* Route Info Skeleton */}
            <div className={`flex-1 pb-6 ${index === 0 ? 'opacity-100' : 'opacity-60 hover:opacity-100 transition-opacity'}`}>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">{10 + index}:00 AM</div>
              <div className="bg-surface-container-low border border-surface-container rounded-xl p-4 group-hover:border-outline-variant/30 transition-colors shadow-sm">
                <div className="flex justify-between items-center text-xs font-bold text-on-surface uppercase tracking-wide">
                  <span className="truncate w-2/5">{index % 2 === 0 ? 'Aryabhatta' : 'TUT Building'}</span>
                  <span className="text-outline-variant/50 w-1/5 text-center px-1">—</span>
                  <span className="truncate w-2/5 text-right font-black">{index % 2 === 0 ? 'TUT Building' : 'Aryabhatta'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusDetail;