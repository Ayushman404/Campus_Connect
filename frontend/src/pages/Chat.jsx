import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { Send, ChevronLeft, ShoppingBag, Phone, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Chat() {
  const { user, token } = useContext(AuthContext);
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef();

  // 1. Initialize Socket
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    if (user) {
      newSocket.emit('subscribeToNotifications', user.id);
    }

    return () => newSocket.close();
  }, [user]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setConversations(data);
        
        // deep linking
        const params = new URLSearchParams(location.search);
        const chatId = params.get('id');
        if (chatId) {
          const targeted = data.find(c => c.id === chatId);
          if (targeted) selectChat(targeted);
        }
      }
    } catch (err) {
      console.error("Failed to load chats");
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [location.search]);

  const selectChat = async (chat) => {
    setActiveChat(chat);
    setMessages(chat.messages || []);
    if (socket) {
      socket.emit('joinRoom', chat.id);
    }

    try {
      const res = await fetch(`http://localhost:5000/api/chats/${chat.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const fullMessages = await res.json();
        setMessages(fullMessages);
      }
    } catch (err) {
      console.error("Failed to load full chat history:", err);
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('receiveMessage', (message) => {
      if (activeChat && message.conversationId === activeChat.id) {
        setMessages((prev) => [...prev, message]);
      }
      fetchConversations();
    });
    return () => socket.off('receiveMessage');
  }, [socket, activeChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !socket) return;

    const messageData = {
      conversationId: activeChat.id,
      senderId: user.id,
      text: newMessage
    };

    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  return (
    <div className="flex bg-surface h-[calc(100vh-6rem)] overflow-hidden relative">
      {/* Background Organic Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 organic-blob blur-3xl rounded-full pointer-events-none -z-10"></div>
      
      {!activeChat ? (
        /* CONVERSATION LIST (INBOX) */
        <div className="flex-1 max-w-4xl mx-auto flex flex-col h-full overflow-hidden px-6">
          <div className="py-8 md:py-12 border-b-2 border-on-surface/10 flex items-end justify-between shrink-0">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter uppercase leading-none">
                Dispatch <br/> Inbox
              </h2>
            </div>
            <span className="font-black text-xl md:text-2xl tracking-tighter text-on-surface-variant">
              ({conversations.length.toString().padStart(2, '0')})
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto py-8 space-y-4 custom-scrollbar">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                <span className="material-symbols-outlined text-6xl mb-4">move_to_inbox</span>
                <p className="font-black uppercase tracking-widest text-xs">No active Communications</p>
              </div>
            ) : (
              conversations.map((chat) => {
                const otherUser = chat.buyerId === user.id ? chat.seller : chat.buyer;
                const lastMsg = chat.messages?.[0];
                return (
                  <div 
                    key={chat.id} 
                    onClick={() => selectChat(chat)}
                    className="p-6 bg-surface-container-lowest border border-surface-container rounded-2xl cursor-pointer transition-all hover:bg-surface-container-low flex flex-col sm:flex-row items-center gap-6 group"
                  >
                    <div className="w-16 h-16 shrink-0 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface font-black text-2xl group-hover:bg-primary group-hover:text-on-primary transition-colors border border-outline-variant">
                      {otherUser?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-row justify-between items-baseline mb-1">
                        <h4 className="font-black text-on-surface text-lg uppercase tracking-tight truncate pr-4">{otherUser?.name}</h4>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest whitespace-nowrap">
                          {lastMsg ? formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: true }) : 'New'}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium mb-2 uppercase tracking-widest">
                        Artifact: <span className="text-primary font-black">{chat.product?.title}</span>
                      </p>
                      <p className="text-sm font-medium text-on-surface truncate pr-8">
                        {lastMsg ? lastMsg.text : 'Click to start chatting...'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ACTIVE CHAT LAYOUT: [PRODUCT INFO | CHAT MESSAGES] */
        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
          
          {/* LEFT PANEL: PRODUCT DETAILS (Desktop Only or Toggle) */}
          <div className="hidden md:flex md:w-80 lg:w-96 border-r-2 border-on-surface/5 bg-surface-container-lowest flex-col p-6 overflow-y-auto custom-scrollbar shrink-0">
            <button 
              onClick={() => setActiveChat(null)}
              className="flex items-center gap-2 text-on-surface-variant font-black uppercase text-[10px] tracking-widest hover:text-primary mb-8 transition-colors group shrink-0"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retreat to Inbox
            </button>

            <div className="space-y-6">
              <div className="aspect-square bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30 flex items-center justify-center shrink-0">
                {activeChat.product?.images?.[0] ? (
                  <img 
                    src={activeChat.product.images[0].startsWith('http') ? activeChat.product.images[0] : `http://localhost:5000${activeChat.product.images[0]}`} 
                    className="w-full h-full object-cover" 
                    alt={activeChat.product.title} 
                  />
                ) : (
                  <span className="material-symbols-outlined text-4xl opacity-30">image_not_supported</span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-black text-on-surface tracking-tighter leading-none mb-1 uppercase">{activeChat.product?.title}</h3>
                <div className="flex items-center gap-2 text-primary font-black text-xl mb-6">
                  <span>₹{activeChat.product?.price}</span>
                </div>
                
                <div className="h-0.5 bg-outline-variant/30 w-full mb-6"></div>
                
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 block">Context Details</label>
                <div className="text-on-surface-variant text-sm font-medium leading-relaxed bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                  {activeChat.product?.description || 'No description provided.'}
                </div>

                <div className="mt-8 p-6 bg-surface-container-highest rounded-xl text-on-surface border border-outline-variant">
                  <label className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-4 block">Correspondent Info</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-black text-xl text-on-primary shrink-0">
                      {(activeChat.buyerId === user.id ? activeChat.seller : activeChat.buyer)?.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-black truncate">{(activeChat.buyerId === user.id ? activeChat.seller : activeChat.buyer)?.name}</p>
                      <p className="text-[10px] text-primary font-bold tracking-widest uppercase">Member Entity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE CHAT WINDOW */}
          <div className="flex-1 flex flex-col bg-surface relative overflow-hidden">
            {/* CHAT HEADER */}
            <div className="p-4 bg-surface-container-lowest border-b-2 border-on-surface/5 flex items-center justify-between shadow-sm z-10">
               <div className="flex items-center gap-4">
                 <button onClick={() => setActiveChat(null)} className="md:hidden">
                    <ChevronLeft className="w-6 h-6 text-on-surface-variant hover:text-primary transition-colors" />
                 </button>
                 <div className="h-10 w-10 bg-surface-container-highest rounded-full flex items-center justify-center text-primary font-black border border-outline-variant/50 shrink-0">
                   {(activeChat.buyerId === user.id ? activeChat.seller : activeChat.buyer)?.name?.charAt(0)}
                 </div>
                 <div className="flex flex-col">
                   <span className="font-black text-on-surface uppercase tracking-tight text-sm leading-none">
                     {(activeChat.buyerId === user.id ? activeChat.seller : activeChat.buyer)?.name}
                   </span>
                   <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">Active Transmission</span>
                 </div>
               </div>
               
               <button 
                 onClick={() => setActiveChat(null)}
                 className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
                 title="Close Chat"
               >
                 <ChevronLeft className="w-5 h-5" />
               </button>
            </div>

            {/* MESSAGE THREAD */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 flex flex-col custom-scrollbar">
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-12">
                   <Mail className="w-12 h-12 mb-4" />
                   <p className="font-bold uppercase tracking-widest text-xs text-center">Empty transcript.<br/>Begin correspondence below.</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.senderId === user.id;
                return (
                  <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-5 py-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                      isMine 
                        ? 'bg-primary text-on-primary rounded-br-none' 
                        : 'bg-surface-container-highest text-on-surface border border-outline-variant/30 rounded-bl-none'
                    }`}>
                      {msg.text}
                      <p className={`text-[8px] mt-2 font-black uppercase tracking-widest text-right ${isMine ? 'text-on-primary/60' : 'text-on-surface-variant/60'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} className="h-px shrink-0" />
            </div>

            {/* INPUT AREA */}
            <div className="p-6 md:p-8 border-t-2 border-on-surface/5 bg-surface-bright shrink-0">
              <form onSubmit={handleSendMessage} className="bg-surface-container p-2 rounded-2xl flex items-center gap-2 pr-2 border border-outline-variant/30 focus-within:border-primary/50 transition-colors">
                <input 
                  type="text" 
                  placeholder="Draft transmission..." 
                  className="flex-1 bg-transparent px-4 py-3 text-sm focus:ring-0 outline-none font-semibold text-on-surface placeholder:text-on-surface-variant/50 border-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 flex items-center justify-center bg-primary text-on-primary rounded-xl hover:bg-[#842500] active:scale-95 transition-all disabled:opacity-30 shadow-md"
                >
                  <Send className="w-5 h-5 -ml-1 translate-y-px" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
