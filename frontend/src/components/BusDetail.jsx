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
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <button 
          onClick={onBack}
          className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-800">{bus.id}</h2>
          <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">● Currently Running</p>
        </div>
      </div>

      {/* Driver & Bus Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between mb-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-slate-100">👨🏽‍✈️</div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{driver.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{driver.busNo}</p>
          </div>
        </div>
        <a href={`tel:${driver.phone}`} className="bg-blue-600 p-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center">
           <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
        </a>
      </div>

      {/* Upcoming Schedule Header */}
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1 shrink-0">Upcoming Schedule</h3>

      {/* Scrollable Skeleton List for College Sheet Timetable */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar">
        {/* Mocking 5 upcoming trips for the skeleton */}
        {[1, 2, 3, 4, 5].map((item, index) => (
          <div key={item} className="flex gap-4">
            {/* Timeline Line & Dot */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500 ring-4 ring-blue-100' : 'bg-slate-300'} z-10`}></div>
              {index !== 4 && <div className="w-0.5 h-full bg-slate-200 -my-1"></div>}
            </div>
            {/* Route Info Skeleton */}
            <div className={`flex-1 pb-4 ${index === 0 ? 'opacity-100' : 'opacity-60'}`}>
              <div className="text-xs font-bold text-blue-600 mb-0.5">{10 + index}:00 AM</div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                  <span className="truncate">{index % 2 === 0 ? 'Aryabhatta' : 'TUT Block'}</span>
                  <span className="text-slate-300 text-xs">➔</span>
                  <span className="truncate">{index % 2 === 0 ? 'TUT Block' : 'Aryabhatta'}</span>
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