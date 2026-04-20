import React from 'react';

const BusDetail = ({ bus, onBack, allSchedules }) => {
  // Real Driver Data from the database (fallback to Staff/Manager if null)
  const driver = {
    name: bus.bus?.driverName || bus.driverName || 'Bus Staff',
    phone: bus.bus?.driverContact || bus.driverContact || null,
    role: 'Driver / Staff'
  };

  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;
  const currentDayType = isWeekend ? 'WEEKEND' : 'WEEKDAY';

  // Filter all schedules for this specific bus AND current day type
  const mySchedules = allSchedules
    .filter(s =>
      s.bus.busNumber === (bus.busNumber || bus.id) &&
      s.dayType === currentDayType
    )
    .sort((a, b) => a.departureTime.localeCompare(b.departureTime));

  const nowStr = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');

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
          <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight leading-none mb-1">
            {(bus.busNumber || bus.id).replace('BR01PM', 'BUS-')}
          </h2>
          <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${bus.status?.startsWith('Live') ? 'text-primary animate-pulse' : 'text-on-surface-variant/40'}`}>
            ● {bus.status || 'Scheduled'}
          </p>
        </div>
      </div>

      {/* Driver & Bus Info Card */}
      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5 flex items-center justify-between mb-8 shrink-0 shadow-sm mx-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-surface rounded-full flex items-center justify-center text-2xl shadow-sm border border-outline-variant/50">👨🏽‍✈️</div>
          <div>
            <h3 className="text-sm font-black uppercase text-on-surface tracking-wide">{driver.name}</h3>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">{driver.role}</p>
          </div>
        </div>
        {driver.phone ? (
          <a href={`tel:${driver.phone}`} className="bg-primary hover:bg-[#842500] w-12 h-12 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary">call</span>
          </a>
        ) : (
          <div className="bg-surface-container-highest w-12 h-12 rounded-full shadow-sm flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant opacity-50">phone_disabled</span>
          </div>
        )}
      </div>

      {/* Upcoming Schedule Header */}
      <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4 px-2 shrink-0 border-b border-on-surface/5 pb-2">Mission Log</h3>

      {/* Scrollable List from College Sheet Timetable */}
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
        {mySchedules.length > 0 ? (
          mySchedules.map((item, index) => {
            const isNext = item.departureTime >= nowStr &&
              (index === 0 || mySchedules[index - 1].departureTime < nowStr);

            return (
              <div key={`${item.id}-${index}`} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className={`w-3.5 h-3.5 rounded-full mt-1 ${isNext ? 'bg-primary ring-4 ring-primary/20 animate-pulse' : 'bg-outline-variant/50'} z-10 transition-colors`}></div>
                  {index !== mySchedules.length - 1 && <div className="w-0.5 h-full bg-outline-variant/30 -my-2 transition-colors group-hover:bg-primary/20"></div>}
                </div>
                <div className={`flex-1 pb-6 ${item.departureTime >= nowStr ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                    {item.departureTime}
                  </div>
                  <div className="bg-surface-container-low border border-surface-container rounded-xl p-4 group-hover:border-outline-variant/30 transition-colors shadow-sm">
                    <div className="flex justify-between items-center text-xs font-bold text-on-surface uppercase tracking-wide">
                      <span className="truncate w-2/5">{item.source.name}</span>
                      <span className="text-outline-variant/50 w-1/5 text-center px-1">—</span>
                      <span className="truncate w-2/5 text-right font-black">{item.dest.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-on-surface-variant/60 text-xs py-10 italic">No missions logged for this bus.</p>
        )}
      </div>
    </div>
  );
};

export default BusDetail;