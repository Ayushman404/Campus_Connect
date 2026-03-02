import React, { useState } from 'react';
import CampusMap from './components/CampusMap';
import BusSchedule from './components/BusSchedule';

function App() {
  // Shared State: When a schedule item is clicked, we store its coordinates here
  const [focusedRoute, setFocusedRoute] = useState(null);

  return (
    // Neomorphic soft background
    <div className="min-h-screen bg-[#f0f4f8] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8 pl-2">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight drop-shadow-sm">Campus Connect</h1>
          <p className="text-slate-500 font-medium mt-1">Live Transit & Timetable</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <CampusMap focusedRoute={focusedRoute} />
          </div>

          {/* Schedule Section */}
          <div className="lg:col-span-1">
            <BusSchedule onRouteSelect={setFocusedRoute} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;