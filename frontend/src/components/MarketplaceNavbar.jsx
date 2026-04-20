import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

export default function MarketplaceNavbar() {
  const { user, logout, token } = useContext(AuthContext);
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadNotes, setUnreadNotes] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token || !user) return;

    const newSocket = io(import.meta.env.VITE_API_URL);
    setSocket(newSocket);

    newSocket.emit('subscribeToNotifications', user.id);

    newSocket.on('newNotification', (note) => {
      setNotifications((prev) => [note, ...prev]);
      setUnreadNotes((prev) => prev + 1);
    });

    fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
          setUnreadNotes(data.filter(n => !n.isRead).length);
        }
      });

    return () => newSocket.close();
  }, [token, user]);

  const isActive = (path) => {
      if (path === '/marketplace' && location.pathname.startsWith('/marketplace')) return true;
      return location.pathname === path;
  };

  const markAllRead = () => {
    setUnreadNotes(0);
  };

  return (
    <>
      {/* DESKTOP TOP BAR (Shifted to right due to Global Sidebar on md breakpoint) */}
      <nav className="fixed top-0 right-0 w-full md:w-[calc(100%-6rem)] z-50 bg-[#fff8f1]/80 backdrop-blur-xl transition-all duration-300 border-b border-on-surface/5">
        {/* On mobile, we leave some padding left so hamburger menu fits nicely */}
        <div className="flex justify-between items-center pl-20 md:pl-10 pr-6 py-4 md:py-6 w-full max-w-[1920px] mx-auto">
          <div className="flex items-center gap-12">
            <Link to="/marketplace" className="text-xl md:text-2xl font-black tracking-tighter text-[#201b0e] uppercase truncate">
              Collective
            </Link>
            <div className="hidden md:flex gap-8 items-center mt-1">
              <Link 
                to="/marketplace" 
                className={`font-['Inter'] font-bold tracking-tighter uppercase text-sm transition-all duration-300 active:scale-95 ${
                  isActive('/marketplace') 
                  ? "text-primary relative after:content-[''] after:absolute after:-right-3 after:top-1/2 after:-translate-y-1/2 after:w-2 after:h-2 after:bg-primary after:rounded-full hover:opacity-100" 
                  : "text-[#201b0e] opacity-60 hover:opacity-100 hover:text-primary"
                }`}
              >
                Exhibit
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-surface-container px-4 py-2 rounded-full border-none">
              <span className="material-symbols-outlined text-on-surface-variant mr-2 text-sm">search</span>
              <input className="bg-transparent border-none outline-none focus:ring-0 text-sm placeholder:text-on-surface-variant/50 w-48" placeholder="Search curated goods..." type="text"/>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications / Inbox Desktop */}
              <div className="relative group hidden md:block">
                <Link to="/chat" className="active:scale-95 transition-transform block relative" onMouseEnter={markAllRead}>
                  <span className={`material-symbols-outlined transition-colors ${isActive('/chat') ? 'text-primary' : 'text-[#201b0e]'}`}>mail</span>
                  {unreadNotes > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-error text-on-error text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                      {unreadNotes}
                    </span>
                  )}
                </Link>
                
                 {/* Desktop Dropdown for Notifications */}
                <div className="absolute right-0 top-full mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container-high opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[20] p-4">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-container">
                    <h4 className="font-black text-xs uppercase tracking-widest text-on-surface-variant">Activity Alerts</h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-on-surface-variant font-bold p-4 text-center italic">No new alerts yet</p>
                    ) : (
                      notifications.slice(0, 5).map((n, i) => (
                        <Link 
                          to={n.link || '/chat'} 
                          key={i} 
                          className="p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-all cursor-pointer block"
                          onClick={() => setUnreadNotes(Math.max(0, unreadNotes - 1))}
                        >
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">{n.title}</p>
                          <p className="text-xs text-on-surface font-medium leading-tight">{n.message}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Chat Icon */}
              <Link to="/chat" className="active:scale-95 transition-transform block md:hidden relative" onClick={markAllRead}>
                <span className={`material-symbols-outlined transition-colors ${isActive('/chat') ? 'text-primary' : 'text-[#201b0e]'}`}>mail</span>
                {unreadNotes > 0 && (
                   <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-error text-on-error text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                     {unreadNotes}
                   </span>
                )}
              </Link>

              {/* Profile Link (Desktop) */}
              <Link to="/profile" className="hidden md:block active:scale-95 transition-transform">
                <span className={`material-symbols-outlined transition-colors ${isActive('/profile') ? 'text-primary' : 'text-[#201b0e]'}`}>account_circle</span>
              </Link>

              {/* Logout Button */}
              <button onClick={logout} className="active:scale-95 transition-transform ml-2" title="Logout">
                <span className="material-symbols-outlined text-[#201b0e] hover:text-error transition-colors">logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION SHELL (Reduced size, no Bus transit) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-[60] bg-[#fff8f1]/90 backdrop-blur-xl border-t border-on-surface/10 pb-safe">
        <div className="flex justify-around items-center py-4 px-6 mx-auto">
          {/* Exhibit */}
          <Link to="/marketplace" className={`flex flex-col items-center gap-1 group relative transition-colors ${isActive('/marketplace') ? 'text-primary' : 'text-[#201b0e]/60'}`}>
            <span className="material-symbols-outlined">grid_view</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">Exhibit</span>
            {isActive('/marketplace') && <div className="absolute -top-1 right-0 w-1.5 h-1.5 bg-primary rounded-full"></div>}
          </Link>
          

          {/* Profile */}
          <Link to="/profile" className={`flex flex-col items-center gap-1 group relative transition-colors ${isActive('/profile') ? 'text-primary' : 'text-[#201b0e]/60'}`}>
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">Profile</span>
            {isActive('/profile') && <div className="absolute -top-1 right-0 w-1.5 h-1.5 bg-primary rounded-full"></div>}
          </Link>
        </div>
      </nav>
    </>
  );
}
