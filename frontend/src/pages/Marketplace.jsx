import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, ShoppingBag, X } from 'lucide-react';
import io from 'socket.io-client';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', price: '', description: '', listingType: 'SELL' });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://campus-connect-ljjb.onrender.com/api/products', {
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
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewItem({ title: '', price: '', description: '', listingType: 'SELL' });
        setImageFiles([]);
        setImagePreviews([]);
        fetchProducts();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to post item", error);
    }
  };

  return (
    <div className="relative overflow-hidden pt-6">
      {/* Background Organic Blobs */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary-fixed/30 organic-blob blur-3xl opacity-40 translate-x-1/4 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-secondary-fixed/30 organic-blob blur-3xl opacity-30 -translate-x-1/4 translate-y-1/4"></div>
      
      {/* Hero Section */}
      <section className="px-6 md:px-16 pt-16 pb-24 md:pb-32 max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-8 relative z-10">
          <span className="inline-block px-4 py-1 mb-6 text-[10px] tracking-[0.2em] font-bold uppercase bg-primary text-on-primary rounded-full">
            Established 2024
          </span>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-on-surface uppercase mb-8">
            The Modern<br/>
            <span className="text-primary">Campus</span><br/>
            Artifacts.
          </h1>
          <p className="text-lg md:text-xl font-medium max-w-xl text-on-surface-variant leading-relaxed">
            A curated marketplace for the avant-garde student. High-fidelity electronics, rare journals, and tactile living essentials designed for the scholarly life.
          </p>
        </div>
        
        <div className="lg:col-span-4 flex flex-col gap-6 relative z-10">
          <div className="h-64 bg-surface-container-highest overflow-hidden relative group rounded-xl">
            <img 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
              alt="featured" 
              src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1000&auto=format&fit=crop"
            />
            <div className="absolute bottom-4 left-4 text-xs font-bold tracking-widest uppercase bg-surface px-3 py-1 text-on-surface">
              Featured: Equipment
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowAddForm(true)} 
              className="flex-1 py-4 bg-primary text-on-primary font-bold uppercase text-xs tracking-widest active:scale-95 transition-transform hover:bg-[#842500]"
            >
              List an Object
            </button>
            <button className="w-16 h-14 flex items-center justify-center bg-surface-container-highest active:scale-95 transition-transform text-on-surface hover:bg-surface-variant">
              <span className="material-symbols-outlined">arrow_downward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <section className="px-6 md:px-16 py-24 bg-surface-container-low rounded-t-[3rem]">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex justify-between items-baseline mb-16 border-b-2 border-on-surface/5 pb-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-on-surface">Fresh Arrivals</h2>
            <Link to="/profile" className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary hover:text-on-surface hover:border-on-surface transition-colors">
              Manage Your Items
            </Link>
          </div>
          
          {loading ? (
             <div className="flex flex-col items-center justify-center py-32 grayscale opacity-50">
                <ShoppingBag className="w-16 h-16 animate-bounce text-on-surface-variant mb-4" />
                <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Syncing Archives...</p>
             </div>
          ) : products.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-24 h-24 bg-surface-variant rounded-full flex items-center justify-center border-4 border-surface-container mb-6">
                  <span className="material-symbols-outlined text-4xl text-on-surface/40">inventory_2</span>
                </div>
                <h3 className="text-3xl font-black uppercase text-on-surface mb-4 tracking-tighter">No Artifacts Found</h3>
                <p className="text-on-surface-variant font-medium max-w-md mx-auto leading-relaxed mb-8">
                  The archives are currently empty. Check back later or be the first to list a valuable item.
                </p>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-on-surface text-surface px-8 py-4 font-bold uppercase text-xs tracking-widest hover:bg-secondary transition-colors"
                >
                  List First Item
                </button>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {products.map((product, idx) => (
                <div key={product.id} className={`group ${idx % 4 >= 2 ? 'lg:translate-y-12' : ''}`}>
                  <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] bg-surface-container-lowest mb-6 overflow-hidden rounded-xl">
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                       <span className={`text-on-primary text-[10px] font-black uppercase px-2 py-1 tracking-tighter shadow-md ${product.listingType === 'SELL' ? 'bg-primary' : 'bg-secondary'}`}>
                         {product.listingType === 'SELL' ? 'Buy' : 'Rent'}
                       </span>
                    </div>
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0].startsWith('http') ? product.images[0] : `https://campus-connect-ljjb.onrender.com${product.images[0]}`} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-variant flex items-center justify-center text-on-surface-variant/40 group-hover:scale-105 transition-transform duration-700">
                         <span className="material-symbols-outlined text-6xl">image_not_supported</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant opacity-60 mb-1">
                        From {product.seller?.name || 'Student'}
                      </p>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-lg font-bold tracking-tight uppercase leading-none mb-2 text-on-surface hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-on-surface-variant line-clamp-1 font-medium">{product.description}</p>
                    </div>
                    <p className="font-black text-primary text-lg">₹{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[60] bg-on-background/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center p-6 border-b border-on-surface/5 bg-surface-bright">
               <h3 className="text-2xl font-black uppercase tracking-tighter text-on-surface">List an Artifact</h3>
               <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface">
                 <X className="w-6 h-6" />
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
                          <PlusCircle className="w-6 h-6 opacity-60" />
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
