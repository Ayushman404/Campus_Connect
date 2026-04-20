import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function Profile() {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Add item form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', price: '', description: '', listingType: 'SELL' });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Local form state for editing
  const [bio, setBio] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('https://campus-connect-ljjb.onrender.com/api/users/profile', {
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      alert("Maximum 5 images allowed per artifact.");
      return;
    }

    const newFiles = [...imageFiles, ...files];
    const newPreviews = [...imagePreviews, ...files.map(file => URL.createObjectURL(file))];
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleRemoveImage = (index) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleMakeThumbnail = (index) => {
    if (index === 0) return;
    
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    
    // Swap/Move to 0
    const [targetFile] = newFiles.splice(index, 1);
    const [targetPreview] = newPreviews.splice(index, 1);
    
    newFiles.unshift(targetFile);
    newPreviews.unshift(targetPreview);
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newItem.title);
    formData.append('price', newItem.price);
    formData.append('description', newItem.description);
    formData.append('listingType', newItem.listingType);
    
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('https://campus-connect-ljjb.onrender.com/api/products', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewItem({ title: '', price: '', description: '', listingType: 'SELL' });
        setImageFiles([]);
        setImagePreviews([]);
        fetchProfile(); // Refresh list to show new item
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to post item", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('https://campus-connect-ljjb.onrender.com/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio, contactNumber })
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditing(false);
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
      const res = await fetch(`https://campus-connect-ljjb.onrender.com/api/products/${productId}/sold`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProfile(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`https://campus-connect-ljjb.onrender.com/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProfile(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-surface pb-24">
      {/* Background Organic Blobs */}
      <div className="absolute top-40 -left-20 w-96 h-96 bg-primary rounded-full blur-[80px] opacity-15 pointer-events-none -z-10"></div>
      <div className="absolute top-80 right-0 w-[500px] h-[500px] bg-secondary rounded-full blur-[80px] opacity-15 pointer-events-none -z-10"></div>
      
      <main className="pt-16 md:pt-24 px-6 md:px-16 max-w-[1920px] mx-auto relative overflow-hidden">
        
        {/* Top Profile Section */}
        <section className="mb-24 grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left Column: Avatar & Name sticky */}
          <div className="md:col-span-4">
            <div className="md:sticky md:top-32 space-y-8">
              <div className="relative w-32 h-32 md:w-48 md:h-48 mb-8 group">
                <div className="w-full h-full bg-surface-container-highest rounded-xl flex items-center justify-center text-4xl md:text-6xl font-black text-on-surface uppercase border-2 border-primary">
                  {profile?.name?.charAt(0) || '?'}
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary flex items-center justify-center rounded-lg hover:bg-[#842500] transition-colors shadow-lg active:scale-95">
                    <span className="material-symbols-outlined text-on-primary">edit</span>
                  </button>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none uppercase break-words">
                {profile?.name?.split(' ').map((n, i) => (
                   <span key={i} className="block">{n}</span>
                ))}
              </h1>
              <div className="inline-block bg-primary text-on-primary px-3 py-1 font-bold text-xs uppercase tracking-widest mt-4">
                 Verified Curator
              </div>
            </div>
          </div>
          
          {/* Right Column: Bio & Details */}
          <div className="md:col-span-7 md:col-start-6">
            <div className="bg-surface-container-low p-8 md:p-12 space-y-12 rounded-xl">
              
              {!isEditing ? (
                <>
                  <div>
                    <span className="text-primary font-black tracking-widest uppercase text-xs mb-4 block">Manifesto / Bio</span>
                    <p className="text-xl md:text-2xl leading-snug font-medium max-w-2xl text-on-surface">
                      {profile?.bio || "No manifesto provided. A mysterious curator indeed."}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-on-surface/10 pt-8">
                    <div>
                      <span className="text-on-surface-variant font-black tracking-widest uppercase text-[10px] mb-2 block">Direct Email</span>
                      <a href={`mailto:${profile?.email}`} className="text-sm md:text-lg font-bold hover:text-primary transition-colors truncate block">
                        {profile?.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-on-surface-variant font-black tracking-widest uppercase text-[10px] mb-2 block">Dispatch Number</span>
                      <p className="text-sm md:text-lg font-bold">{profile?.contactNumber || "Not Available"}</p>
                    </div>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black uppercase text-on-surface">Edit Dossier</h3>
                    {error && <span className="text-xs text-error font-bold bg-error-container px-3 py-1">{error}</span>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant">Manifesto / Bio</label>
                    <textarea 
                      className="w-full bg-surface-container p-4 outline-none focus:ring-2 focus:ring-primary rounded-xl font-medium resize-none h-32"
                      placeholder="Declare your curatorial vision..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant">Dispatch Number</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-container p-4 outline-none focus:ring-2 focus:ring-primary rounded-xl font-bold"
                      placeholder="+91 XXXXX XXXXX"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 font-black uppercase text-xs tracking-widest text-on-surface hover:bg-surface-variant active:scale-95 transition-all">Cancel</button>
                    <button type="submit" className="px-6 py-3 bg-primary text-on-primary font-black uppercase text-xs tracking-widest hover:bg-[#842500] active:scale-95 transition-all rounded-lg">Update Records</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
        
        {/* Bottom Section: Listings */}
        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-16 border-b-2 border-on-surface/20 pb-4">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-on-surface">My Archives</h2>
            <span className="font-black text-xl tracking-tighter text-on-surface-variant">({profile?.products?.length || '00'})</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {profile?.products?.map((item) => (
              <div key={item.id} className={`bg-surface-container-lowest p-6 flex flex-col h-full group rounded-xl shadow-sm border border-surface-container ${item.status !== 'AVAILABLE' ? 'opacity-70 grayscale' : ''}`}>
                <div className="relative mb-6 overflow-hidden aspect-[4/5] bg-surface-container flex items-center justify-center rounded-lg">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0].startsWith('http') ? item.images[0] : `https://campus-connect-ljjb.onrender.com${item.images[0]}`} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  ) : (
                    <span className="material-symbols-outlined text-6xl opacity-30">image_not_supported</span>
                  )}
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full text-on-primary ${item.status === 'AVAILABLE' ? 'bg-primary' : 'bg-on-surface'}`}>
                      {item.status === 'AVAILABLE' ? 'Active' : 'Archived'}
                    </span>
                  </div>
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-xl font-black tracking-tight uppercase mb-1 text-on-surface line-clamp-2">{item.title}</h3>
                  <p className="text-secondary font-bold mb-4">₹{item.price}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  {item.status === 'AVAILABLE' ? (
                    <>
                      <button onClick={() => handleDelete(item.id)} className="bg-surface-container-highest text-on-surface py-3 text-[10px] font-black tracking-widest uppercase hover:bg-error hover:text-white transition-colors active:scale-95 rounded">
                        Unlist
                      </button>
                      <button onClick={() => handleMarkAsSold(item.id)} className="bg-on-surface text-surface py-3 text-[10px] font-black tracking-widest uppercase hover:bg-primary transition-colors active:scale-95 rounded">
                        Sold
                      </button>
                    </>
                  ) : (
                    <button className="col-span-2 bg-surface-container text-on-surface-variant py-3 text-[10px] font-black tracking-widest uppercase cursor-not-allowed rounded">
                        Listing Closed
                    </button>
                  )}
                </div>
                <div className="mt-2">
                  <Link to="/chat" className="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary py-3 text-[10px] font-black tracking-widest uppercase hover:bg-[#113b88] transition-colors active:scale-95 rounded">
                     <MessageSquare className="w-4 h-4" /> Chats
                  </Link>
                </div>
              </div>
            ))}
            
            {/* Add New Box */}
            <div 
              onClick={() => setShowAddForm(true)}
              className="bg-surface-container p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary border-2 border-dashed border-outline-variant hover:bg-surface-container-high transition-colors rounded-xl min-h-[300px]"
            >
              <span className="material-symbols-outlined text-4xl mb-4 text-primary">add_circle</span>
              <h3 className="text-xl font-black tracking-tight uppercase mb-1 text-on-surface">New Exhibit</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-on-surface">Publish an artifact</p>
            </div>
            
          </div>
        </section>
      </main>

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[60] bg-on-background/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center p-6 border-b border-on-surface/5 bg-surface-bright">
               <h3 className="text-2xl font-black uppercase tracking-tighter text-on-surface">List an Artifact</h3>
               <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface">
                 <span className="material-symbols-outlined">close</span>
               </button>
             </div>
             
             <form onSubmit={handleAddItem} className="p-6 md:p-8 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Headline Title</label>
                    <input 
                      type="text" 
                      required 
                      autoFocus
                      placeholder="e.g. Vintage Task Light / Textbook" 
                      className="w-full bg-surface-container border-none rounded-xl p-4 text-on-surface placeholder:text-on-surface/30 focus:ring-2 focus:ring-primary outline-none font-bold"
                      value={newItem.title} 
                      onChange={(e) => setNewItem({...newItem, title: e.target.value})} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Pricing (₹)</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="e.g. 500" 
                      className="w-full bg-surface-container border-none rounded-xl p-4 text-on-surface placeholder:text-on-surface/30 focus:ring-2 focus:ring-primary outline-none font-bold appearance-none"
                      value={newItem.price} 
                      onChange={(e) => setNewItem({...newItem, price: e.target.value})} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Transaction Method</label>
                    <select 
                      className="w-full bg-surface-container border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary outline-none font-bold block appearance-none"
                      value={newItem.listingType} 
                      onChange={(e) => setNewItem({...newItem, listingType: e.target.value})}
                    >
                      <option value="SELL">Purchase Outright</option>
                      <option value="RENT">Rental Agreement</option>
                    </select>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Photographic Evidence</label>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{imageFiles.length}/5 Images</span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-surface-container group/img">
                           <img src={preview} className="w-full h-full object-cover" alt={`Preview ${index}`} />
                           
                           {/* Overlay Controls */}
                           <div className="absolute inset-0 bg-on-surface/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                              <button 
                                type="button"
                                onClick={() => handleMakeThumbnail(index)}
                                className={`px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded ${index === 0 ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface hover:bg-primary hover:text-on-primary'}`}
                              >
                                {index === 0 ? 'Main Cover' : 'Set as Main'}
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="p-1 bg-error text-on-error rounded-full hover:scale-110 transition-transform"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                           </div>
                           
                           {index === 0 && (
                             <div className="absolute top-2 left-2 bg-primary text-on-primary text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                               Thumbnail
                             </div>
                           )}
                        </div>
                      ))}
                      
                      {imageFiles.length < 5 && (
                        <div className="relative aspect-square border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low hover:bg-surface-container hover:border-outline transition-all cursor-pointer flex flex-col items-center justify-center text-on-surface-variant gap-1 overflow-hidden">
                          <ImageIcon className="w-6 h-6 opacity-60" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Add Photo</span>
                          <input 
                            type="file" 
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                    
                    {imageFiles.length === 0 && (
                      <div className="bg-surface-container-low p-8 rounded-xl border-2 border-dashed border-outline-variant text-center space-y-2">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">No items selected</p>
                         <p className="text-[9px] font-medium opacity-30">Minimum 1 photograph recommended for higher conversion.</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Detailed Context</label>
                    <textarea 
                      required 
                      placeholder="Provide provenance, condition notes, and specific terms..." 
                      className="w-full bg-surface-container border-none rounded-xl p-4 text-on-surface placeholder:text-on-surface/30 focus:ring-2 focus:ring-primary outline-none font-medium resize-none h-32"
                      value={newItem.description} 
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-on-surface/5 mt-2">
                  <button type="submit" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest active:scale-95 transition-transform hover:bg-[#842500]">
                    Finalize Entry
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
}
