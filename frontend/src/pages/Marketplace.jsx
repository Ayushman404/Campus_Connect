import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, ShoppingBag, IndianRupee, Tag, User as UserIcon, MessageSquare, AlertCircle, Image as ImageIcon } from 'lucide-react';
import io from 'socket.io-client';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', price: '', description: '', listingType: 'SELL' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  // 1. Initialize Socket for Notifications
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // 2. FETCH PRODUCTS FROM BACKEND ON LOAD
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Only show products NOT belonging to the current user
        const filtered = data.filter(p => p.sellerId !== user?.id && p.status === 'AVAILABLE');
        setProducts(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 3. ADD A NEW ITEM TO DATABASE
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    // Use FormData for file upload
    const formData = new FormData();
    formData.append('title', newItem.title);
    formData.append('price', newItem.price);
    formData.append('description', newItem.description);
    formData.append('listingType', newItem.listingType);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewItem({ title: '', price: '', description: '', listingType: 'SELL' });
        setImageFile(null);
        setImagePreview(null);
        fetchProducts();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to post item", error);
    }
  };

  const handleInterest = async (product) => {
    try {
      // 1. Initialize/Fetch Conversation
      const chatRes = await fetch('http://localhost:5000/api/chats/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          productId: product.id, 
          sellerId: product.sellerId 
        })
      });

      if (chatRes.ok) {
        const conversation = await chatRes.json();
        
        // 2. Send Real-time Notification to Seller
        if (socket) {
          socket.emit('sendNotification', {
            userId: product.sellerId,
            type: 'INTEREST_REQUEST',
            title: 'New Interest!',
            message: `${user.name || 'A student'} is interested in your ${product.title}`,
            link: `/chat?id=${conversation.id}`
          });
        }

        // 3. Redirect Buyer to Chat
        navigate('/chat');
      } else {
        const data = await chatRes.json();
        alert(data.error);
      }
    } catch (error) {
      console.error("Chat redirection failed", error);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">IITP Marketplace</h2>
            <p className="text-slate-500 font-semibold mt-1 flex items-center gap-2">
               <ShoppingBag className="w-4 h-4 text-blue-600" />
               Current active listings available for you
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Link 
               to="/profile" 
               className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
             >
               <UserIcon className="w-5 h-5 text-slate-400" />
               Manage My Listings
             </Link>
             <button 
               onClick={() => setShowAddForm(!showAddForm)} 
               className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
                 showAddForm ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-200'
               }`}
             >
               {showAddForm ? 'Close Form' : <><PlusCircle className="w-5 h-5" /> Post New Item</>}
             </button>
          </div>
        </div>

        {/* POST FORM */}
        {showAddForm && (
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-slate-200/50 mb-12 border border-slate-100 animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 underline decoration-blue-500 decoration-4 underline-offset-8">Create New Listing</h3>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">What are you listing?</label>
                <input type="text" placeholder="e.g. Scientific Calculator" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Price (₹)</label>
                <input type="number" placeholder="500" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Type</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none" value={newItem.listingType} onChange={(e) => setNewItem({...newItem, listingType: e.target.value})}>
                  <option value="SELL">Sell Forever</option>
                  <option value="RENT">Rent for Now</option>
                </select>
              </div>

              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Upload Photo</label>
                <div className="relative group/file">
                  <div className="flex items-center justify-center w-full min-h-[140px] border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100 hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/file:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-bold uppercase tracking-widest">Change Image</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 p-4">
                        <PlusCircle className="w-8 h-8 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Image File</span>
                        <span className="text-[10px] text-slate-400">JPG, PNG, WEBP up to 5MB</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Item Description</label>
                <textarea 
                  placeholder="Tell us about the condition, usage, and any other details..." 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all min-h-[140px] resize-none"
                  value={newItem.description} 
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})} 
                />
              </div>
              
              <button type="submit" className="bg-slate-900 text-white p-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all md:col-span-2 lg:col-span-4 mt-2 shadow-xl shadow-slate-200">
                LIST ON MARKETPLACE
              </button>
            </form>
          </div>
        )}

        {/* PRODUCTS GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale">
            <ShoppingBag className="w-16 h-16 animate-bounce text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-20 px-8 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No items listed yet</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Be the first to list something! Your classmates are waiting.</p>
            <button onClick={() => setShowAddForm(true)} className="text-blue-600 font-bold hover:underline">Get started now &rarr;</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300">
                      <ShoppingBag className="w-12 h-12 mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">No Preview Available</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-1.5 text-[10px] font-black rounded-full shadow-lg backdrop-blur-md uppercase tracking-wider ${
                      product.listingType === 'SELL' ? 'bg-indigo-600/90 text-white' : 'bg-amber-500/90 text-white'
                    }`}>
                      {product.listingType}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center gap-1 text-blue-600 font-black text-2xl mb-1">
                      <IndianRupee className="w-5 h-5" />
                      {product.price.toLocaleString()}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{product.title}</h3>
                    <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed mb-4">{product.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-6 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seller</span>
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0 capitalize">
                          {product.seller?.name?.charAt(0) || <UserIcon className="w-3 h-3" />}
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncate">{product.seller?.name || 'IITP Student'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleInterest(product)}
                      className="bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-95"
                    >
                      <MessageSquare className="w-3 h-3" />
                      CHAT
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
