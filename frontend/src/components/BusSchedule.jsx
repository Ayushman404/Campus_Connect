import React, { useEffect, useState } from 'react';

const BusSchedule = ({ onRouteSelect }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Hardcoded for testing the single bus view
  const activeTab = 'INSTI-BUS-01';
  const driver = { name: 'Abhav Arora (Driver)', phone: '+91 96967XXXXX', rating: '⭐ 2.3' };
  useEffect(() => {
    fetch('http://localhost:5000/api/buses/schedules')
      .then(res => res.json())
      .then(data => setSchedules(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-[80vh] gap-6">
      
      {/* 1. Neomorphic Bus Selector Tab */}
      <div className="bg-[#f0f4f8] p-2 rounded-2xl shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex gap-2">
        <button className="flex-1 bg-white shadow-[4px_4px_10px_#d1d9e6,-4px_-4px_10px_#ffffff] text-blue-600 font-bold py-3 rounded-xl transition-all">
          {activeTab}
        </button>
        <button className="flex-1 text-slate-400 font-semibold py-3 rounded-xl hover:bg-slate-200/50 transition-all">
          BUS-02
        </button>
      </div>

      {/* 2. Driver Info Card (Skeuomorphic touches) */}
      <div className="bg-white rounded-3xl p-5 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] border border-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl shadow-inner border-2 border-white">
            👨🏽‍✈️
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">{driver.name}</h3>
            <p className="text-sm text-slate-500 font-medium">{driver.phone} • {driver.rating}</p>
          </div>
        </div>
      </div>

      {/* 3. Interactive Schedule List */}
      <div className="flex-1 bg-white rounded-3xl p-5 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] overflow-y-auto border border-white">
        <h3 className="font-bold text-slate-800 mb-4 px-1 text-lg">Morning Loop</h3>
        
        {loading ? (
          <p className="text-slate-400 text-center mt-10 animate-pulse">Loading schedule...</p>
        ) : (
          <div className="space-y-4">
            {schedules.map((sched) => (
              <div 
                key={sched.id} 
                onClick={() => onRouteSelect(sched)}
                className="group cursor-pointer p-4 rounded-2xl border-2 border-transparent hover:border-blue-100 hover:bg-blue-50/50 hover:shadow-[4px_4px_10px_#d1d9e6,-4px_-4px_10px_#ffffff] transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black tracking-wider text-slate-400 uppercase">Departure</span>
                  <span className="bg-blue-100 text-blue-700 font-black px-3 py-1 rounded-full text-sm shadow-sm">
                    {sched.departureTime}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700 font-semibold mt-3">
                  <span className="w-2/5 truncate">{sched.source.name}</span>
                  <span className="text-blue-400 group-hover:scale-125 transition-transform">➔</span>
                  <span className="w-2/5 text-right truncate">{sched.dest.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default BusSchedule;