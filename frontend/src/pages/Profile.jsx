import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, ShieldCheck, MapPin, Phone, Text, Save, AlertCircle, LogOut, ShoppingBag, MessageSquare } from 'lucide-react';

export default function Profile() {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Local form state for editing
  const [bio, setBio] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setBio(data.bio || '');
        setContactNumber(data.contactNumber || '');
      } else {
        setError(data.error || 'Failed to load profile');
      }
    } catch (err) {
      setError('Server error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio, contactNumber })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Profile updated successfully!');
        setProfile({ ...profile, bio, contactNumber });
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError('Server error updating profile');
    }
  };

  const handleMarkAsSold = async (productId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}/sold`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess('Item marked as sold!');
        fetchProfile(); // Refresh list
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess('Listing deleted!');
        fetchProfile(); // Refresh list
      }
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="animate-pulse text-blue-600 font-bold text-lg tracking-widest">SYNCHRONIZING PROFILE...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-4 md:p-8 animate-in fade-in duration-500 overflow-auto">
      <div className="max-w-5xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Profile Dashboard</h2>
          <div className="bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Session</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* LEFT COL: USER CARD */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <User className="w-20 h-20 rotate-12" />
              </div>
              <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-xl shadow-blue-200 border-4 border-white">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{profile?.name}</h3>
              <div className="mt-2 px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {profile?.role || 'IIT Patna Student'}
              </div>
              
              <div className="mt-8 w-full space-y-4 pt-8 border-t border-slate-50 text-left">
                <div className="flex items-center gap-3 group/item">
                  <div className="p-2 bg-slate-50 rounded-lg group-hover/item:bg-blue-50 transition-colors">
                    <Mail className="w-4 h-4 text-slate-400 group-hover/item:text-blue-500" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600 truncate">{profile?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600">Verified identity</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COL: SETUP & DETAILS */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex-1 relative">
              <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                <h4 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Text className="w-5 h-5 text-blue-600" />
                  About & Contact
                </h4>
                {success && <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1 animate-bounce">Saved <Save className="w-3 h-3" /></span>}
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 mb-6">
                  <AlertCircle className="w-5 h-5" /> {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Personal Bio</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-5 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all min-h-[120px] resize-none leading-relaxed"
                      placeholder="Share a bit about yourself with the campus community..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contact WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] p-4 pl-12 text-sm font-black outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                        placeholder="+91-XXXXX-XXXXX"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                      />
                    </div>
                 </div>

                 <div className="flex items-end">
                    <button 
                      type="submit"
                      className="w-full bg-blue-600 text-white rounded-[1.5rem] p-4 font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-500 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-blue-100"
                    >
                      <Save className="w-4 h-4" />
                      UPDATE PROFILE
                    </button>
                 </div>
              </div>
            </form>
          </div>
        </div>

        {/* BOTTOM SECTION: MY LISTINGS */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Your Listings</h3>
            <div className="h-px flex-1 bg-slate-200 hidden sm:block"></div>
          </div>
          
          {profile?.products?.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-16 text-center shadow-sm">
               <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">You haven't posted any items yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {profile?.products?.map((item) => (
                 <div key={item.id} className={`bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-5 flex flex-col relative group transition-all ${item.status !== 'AVAILABLE' ? 'opacity-60 grayscale' : ''}`}>
                   <div className="relative h-40 bg-slate-100 rounded-3xl mb-4 overflow-hidden">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} className="w-full h-full object-cover" alt={item.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center grayscale opacity-20">
                           <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                         <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider shadow-md ${item.status === 'AVAILABLE' ? 'bg-green-500 text-white' : 'bg-slate-800 text-white'}`}>
                            {item.status === 'AVAILABLE' ? 'Live' : item.status.replace('_', ' ')}
                         </span>
                         <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[8px] font-black uppercase tracking-wider text-slate-800 shadow-sm border border-white">
                            {item.listingType}
                         </span>
                      </div>
                   </div>

                   <div className="flex-1">
                      <h4 className="font-black text-slate-800 text-lg line-clamp-1 mb-1">{item.title}</h4>
                      <p className="text-blue-600 font-black text-sm mb-4">₹{item.price.toLocaleString()}</p>
                   </div>

                   <div className="flex gap-2 mt-2 pt-4 border-t border-slate-50">
                      <Link 
                        to="/chat"
                        className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0"
                        title="View Product Chats"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Chats</span>
                      </Link>
                      {item.status === 'AVAILABLE' && (
                        <button 
                          onClick={() => handleMarkAsSold(item.id)}
                          className="flex-1 bg-slate-100 text-slate-600 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                        >
                          Mark Sold
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete"
                      >
                        <LogOut className="w-5 h-5 rotate-90" />
                      </button>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
