import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import io from 'socket.io-client';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const newSocket = io('https://campus-connect-ljjb.onrender.com');
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch('https://campus-connect-ljjb.onrender.com/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const target = data.find(p => p.id === id);
          setProduct(target);
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  const handleInterest = async () => {
    if (!product) return;
    try {
      const chatRes = await fetch('https://campus-connect-ljjb.onrender.com/api/chats/init', {
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
        
        if (socket) {
          socket.emit('sendNotification', {
            userId: product.sellerId,
            type: 'INTEREST_REQUEST',
            title: 'New Interest!',
            message: `${user.name || 'A student'} is interested in your ${product.title}`,
            link: `/chat?id=${conversation.id}`
          });
        }
        navigate('/chat');
      } else {
        const data = await chatRes.json();
        alert(data.error);
      }
    } catch (error) {
      console.error("Chat redirection failed", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black uppercase text-on-surface mb-4">Artifact Not Found</h1>
        <p className="text-on-surface-variant font-medium mb-8">This item may have been removed or no longer exists in the collective archives.</p>
        <Link to="/marketplace" className="bg-primary text-on-primary px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest">
          Return to Exhibit
        </Link>
      </div>
    );
  }

  const images = product.images || [];

  return (
    <div className="relative overflow-hidden bg-surface">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-fixed rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-secondary-fixed rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      
      <main className="pt-8 md:pt-16 pb-24 px-6 md:px-16 max-w-[1920px] mx-auto relative overflow-hidden">
        
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors mb-8">
           <ArrowLeft className="w-4 h-4" /> Back to Exhibit
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-surface-container-low rounded-2xl p-4 md:p-12 relative overflow-hidden aspect-square md:aspect-[4/3] flex items-center justify-center group shadow-sm border border-surface-container">
              {images.length > 0 ? (
                <>
                  <img 
                    className="w-full h-full object-cover rounded-xl shadow-2xl transition-all duration-700 animate-in fade-in zoom-in-95" 
                    key={activeImageIndex}
                    src={images[activeImageIndex].startsWith('http') ? images[activeImageIndex] : `https://campus-connect-ljjb.onrender.com${images[activeImageIndex]}`}
                    alt={`${product.title} view ${activeImageIndex + 1}`} 
                  />
                  
                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.preventDefault(); setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1)); }}
                        className="w-12 h-12 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all active:scale-90 shadow-lg text-on-surface"
                      >
                         <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <button 
                        onClick={(e) => { e.preventDefault(); setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1)); }}
                        className="w-12 h-12 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all active:scale-90 shadow-lg text-on-surface"
                      >
                         <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-30">
                   <span className="material-symbols-outlined text-[120px]">image_not_supported</span>
                </div>
              )}
              
              <div className="absolute top-6 left-6 md:top-8 md:left-8">
                <span className="bg-primary text-on-primary px-3 py-1 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase rounded-full shadow-lg">
                  Archive No. {product.id.substring(0,6)}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar shrink-0">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 transition-all p-1 shrink-0 ${activeImageIndex === idx ? 'border-primary ring-4 ring-primary/20' : 'border-surface-container-high grayscale-50 hover:grayscale-0'}`}
                  >
                    <img 
                      src={img.startsWith('http') ? img : `https://campus-connect-ljjb.onrender.com${img}`} 
                      className="w-full h-full object-cover rounded-lg" 
                      alt={`Thumbnail ${idx + 1}`} 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Right: Details & Action */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            <nav className="flex gap-2 text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-6 flex-wrap">
              <Link className="hover:text-primary transition-colors" to="/marketplace">Catalog</Link>
              <span>/</span>
              <span className="text-on-surface">{product.listingType === 'SELL' ? 'Purchase' : 'Rental'}</span>
              <span>/</span>
              <span className="text-on-surface opacity-60">Artifact</span>
            </nav>
            
            <h1 className="text-5xl md:text-6xl xl:text-8xl font-black tracking-tighter leading-[0.9] text-on-surface mb-8 uppercase">
              {product.title}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-4 mb-12">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Estimated Value</span>
                <span className="text-3xl md:text-4xl font-black tracking-tighter">₹{product.price}</span>
              </div>
              <div className="hidden sm:block w-[1px] h-12 bg-outline-variant/30 mx-4"></div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Quality Class</span>
                <div className="flex gap-1 mt-2">
                  <div className="w-8 h-1.5 bg-primary rounded-full"></div>
                  <div className="w-8 h-1.5 bg-primary rounded-full"></div>
                  <div className="w-8 h-1.5 bg-primary rounded-full"></div>
                  <div className="w-8 h-1.5 bg-surface-container-highest rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="mb-10 lg:mb-16">
              {product.listingType === 'SELL' ? (
                 <button onClick={handleInterest} className="w-full sm:w-auto flex flex-col items-start p-6 md:p-8 bg-primary text-on-primary rounded-2xl hover:bg-[#842500] transition-all group active:scale-95 shadow-xl shadow-primary/20">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Buy Ownership</span>
                   <span className="text-2xl font-bold">₹{product.price}</span>
                   <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                     Acquire Artifact <span className="material-symbols-outlined text-sm">arrow_forward</span>
                   </div>
                 </button>
              ) : (
                <button onClick={handleInterest} className="w-full sm:w-auto flex flex-col items-start p-6 md:p-8 bg-surface-container-highest text-on-surface rounded-2xl hover:bg-surface-variant transition-all group active:scale-95 shadow-lg">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Rent for Exhibit</span>
                  <span className="text-2xl font-bold">₹{product.price} <span className="text-sm font-medium opacity-60">/ term</span></span>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary group-hover:translate-x-1 transition-transform">
                    Request Availability <span className="material-symbols-outlined text-sm">calendar_today</span>
                  </div>
                </button>
              )}
            </div>
            
            {/* Curator/Seller Profile */}
            <div className="bg-surface-container-low p-6 rounded-2xl mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-surface-container">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl text-primary bg-surface-container-highest ring-2 ring-primary/20 ring-offset-2 ring-offset-surface-container-low">
                  {product.seller?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-tight text-on-surface">
                    {product.seller?.name || 'Anonymous Collector'}
                  </h4>
                  <p className="text-xs font-medium text-on-surface-variant mt-0.5">Verified Artifact Curator</p>
                </div>
              </div>
              <button onClick={handleInterest} className="bg-on-surface text-surface px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-primary transition-colors disabled:opacity-50" disabled={product.sellerId === user?.id}>
                <MessageSquare className="w-4 h-4" />
                {product.sellerId === user?.id ? 'Your Listing' : 'Message'}
              </button>
            </div>
            
            {/* Description Sections */}
            <div className="space-y-8 border-t border-on-surface/5 pt-12">
              <div className="flex gap-8 md:gap-12 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] overflow-x-auto pb-2 scrollbar-hide">
                <button className="text-primary border-b-2 border-primary pb-2 shrink-0">Description</button>
                <button className="text-on-surface-variant hover:text-on-surface transition-colors pb-2 shrink-0 cursor-not-allowed">Specifications</button>
                <button className="text-on-surface-variant hover:text-on-surface transition-colors pb-2 shrink-0 cursor-not-allowed">Provenance</button>
              </div>
              <div className="text-sm text-on-surface-variant leading-relaxed font-medium">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
