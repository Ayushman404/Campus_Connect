import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function GlobalSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  // Common styling for links
  const baseClasses = "flex items-center justify-center w-12 h-12 rounded-2xl transition-all relative group";

  // Check if marketplace apps are active
  const isMarketplaceActive = location.pathname.startsWith('/marketplace') || 
                              location.pathname.startsWith('/product') || 
                              location.pathname.startsWith('/profile') || 
                              location.pathname.startsWith('/chat');
  
  return (
    <>
      {/* Mobile Hamburger Toggle (Always visible on mobile) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[9999] bg-surface-container-highest w-12 h-12 rounded-xl shadow-lg border border-on-surface/5 flex items-center justify-center active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-on-surface">
          {isOpen ? 'close' : 'grid_view'}
        </span>
      </button>

      {/* Main Sidebar */}
      <nav className={`
        fixed md:static inset-y-0 left-0 z-[9990] 
        w-24 bg-surface border-r border-on-surface/5
        flex flex-col items-center py-8 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* App Logo / Top Icon */}
        <div className="w-14 h-14 bg-surface-container-lowest rounded-[1.5rem] flex items-center justify-center text-on-surface font-black shadow-sm border border-outline-variant/30 mb-8 cursor-pointer hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-[28px]">token</span>
        </div>

        {/* Links */}
        <div className="flex-1 flex flex-col gap-6 w-full px-5 mt-4">
          <NavLink 
            to="/bus" 
            onClick={closeMenu}
            className={({isActive}) => `
              ${baseClasses} 
              ${isActive ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface hover:scale-105'}
            `}
          >
            <span className="material-symbols-outlined text-[24px]">directions_bus</span>
            {/* Tooltip */}
            <span className="absolute left-16 bg-on-surface text-surface text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl">
              Live Transit
            </span>
          </NavLink>

          <NavLink 
            to="/marketplace" 
            onClick={closeMenu}
            className={() => `
              ${baseClasses} 
              ${isMarketplaceActive ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface hover:scale-105'}
            `}
          >
            <span className="material-symbols-outlined text-[24px]">storefront</span>
            <span className="absolute left-16 bg-on-surface text-surface text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl">
              Collective
            </span>
          </NavLink>
        </div>
      </nav>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[9980]"
          onClick={closeMenu}
        />
      )}
    </>
  );
}
