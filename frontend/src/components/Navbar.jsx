import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Map, ShoppingBag, User, LogOut, Bell, MessageSquare } from 'lucide-react';
import io from 'socket.io-client';

export default function Navbar() {
  const { user, logout, token } = useContext(AuthContext);
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadNotes, setUnreadNotes] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token || !user) return;

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('subscribeToNotifications', user.id);

    newSocket.on('newNotification', (note) => {
      setNotifications((prev) => [note, ...prev]);
      setUnreadNotes((prev) => prev + 1);
      // Optional: Play a sound or show browser toast here
    });

    // Fetch initial notifications
    fetch('http://localhost:5000/api/notifications', {
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

  const isActive = (path) => location.pathname === path;

  const markAllRead = () => {
    setUnreadNotes(0);
    // Optional: Call API to mark as read
  };

  return (
    <nav className="sticky top-0 z-[1000] w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-2 rounded-xl">
           <Map className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block tracking-tight">Campus Connect</h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-4 bg-slate-100 p-1 rounded-2xl">
        <Link 
          to="/" 
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            isActive('/') ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Map className="w-4 h-4" />
          <span className="hidden lg:block">Live Map</span>
        </Link>
        <Link 
          to="/marketplace" 
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            isActive('/marketplace') ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden lg:block">Marketplace</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <div className="relative group">
          <button 
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative"
            onMouseEnter={markAllRead}
          >
            <Bell className="w-5 h-5" />
            {unreadNotes > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadNotes}
              </span>
            )}
          </button>
          
          {/* Dropdown UI */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[2000] p-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
               <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Activity Alerts</h4>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-3">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold p-4 text-center italic">No new alerts yet</p>
              ) : (
                notifications.slice(0, 5).map((n, i) => (
                  <Link 
                    to={n.link || '/chat'} 
                    key={i} 
                    className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer block border border-transparent hover:border-blue-100"
                    onClick={() => setUnreadNotes(Math.max(0, unreadNotes - 1))}
                  >
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">{n.title}</p>
                    <p className="text-xs text-slate-600 font-medium leading-tight">{n.message}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <Link to="/profile" className="flex items-center gap-2 group">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'Student'}</p>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight">IITP Student</p>
          </div>
          <div className={`p-2 rounded-full border-2 transition-all ${
            isActive('/profile') ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-slate-50 text-slate-400 group-hover:border-slate-200'
          }`}>
            <User className="w-5 h-5" />
          </div>
        </Link>
        
        <button 
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
