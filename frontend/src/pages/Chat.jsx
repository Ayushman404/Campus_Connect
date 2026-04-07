import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { Send, User, ShoppingBag, ChevronLeft, MessageSquare, Clock, Mail, Phone } from 'lucide-react';
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
        
        // Check for ?id=... in URL
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

  // 2. Fetch Conversations and handle deep linking
  useEffect(() => {
    fetchConversations();
  }, [location.search]);

  // 3. Handle Active Chat Selection
  const selectChat = async (chat) => {
    setActiveChat(chat);
    // Optimistic fast-render with whatever we have
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

  // 4. Socket Listeners for Messages
  useEffect(() => {
    if (!socket) return;

    socket.on('receiveMessage', (message) => {
      if (activeChat && message.conversationId === activeChat.id) {
        setMessages((prev) => [...prev, message]);
      }
      // Update sidebar preview
      fetchConversations();
    });

    return () => socket.off('receiveMessage');
  }, [socket, activeChat]);

  // 5. Scroll to Bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 6. Send Message
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
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
      {!activeChat ? (
        /* CONVERSATION LIST (INBOX) */
        <div className="flex-1 max-w-4xl mx-auto flex flex-col bg-white shadow-sm h-full">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-blue-600" />
                Inbox
              </h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1 ml-11">Recent conversations</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-25">
                <ShoppingBag className="w-20 h-20 mb-4" />
                <p className="font-bold uppercase tracking-widest text-xs">No active Chats</p>
              </div>
            ) : (
              conversations.map((chat) => {
                const otherUser = chat.buyerId === user.id ? chat.seller : chat.buyer;
                const lastMsg = chat.messages?.[0];
                return (
                  <div 
                    key={chat.id} 
                    onClick={() => selectChat(chat)}
                    className="p-6 border-b border-slate-50 cursor-pointer transition-all hover:bg-blue-50/30 flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 rounded-3xl bg-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center text-blue-600 font-black text-xl shadow-lg shadow-blue-100/50">
                      {otherUser?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tight">{otherUser?.name}</h4>
                        <span className="text-[10px] text-slate-400 font-black uppercase">
                          {lastMsg && formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mb-1">
                        Discussing: <span className="text-indigo-600 font-bold">{chat.product?.title}</span>
                      </p>
                      <p className="text-sm text-slate-400 truncate italic">
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
          
          {/* LEFT PANEL: PRODUCT DETAILS */}
          <div className="w-full md:w-80 lg:w-[400px] border-r border-slate-200 bg-white flex flex-col p-8 overflow-y-auto">
            <button 
              onClick={() => setActiveChat(null)}
              className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-blue-600 mb-8 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Inbox
            </button>

            <div className="space-y-6">
              <div className="aspect-square bg-slate-100 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100">
                {activeChat.product?.images?.[0] ? (
                  <img src={activeChat.product.images[0]} className="w-full h-full object-cover" alt={activeChat.product.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <ShoppingBag className="w-16 h-16" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 text-blue-600 font-black text-3xl mb-1 mt-4">
                  <span>₹{activeChat.product?.price?.toLocaleString()}</span>
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-4 uppercase">{activeChat.product?.title}</h3>
                
                <div className="h-px bg-slate-100 w-full mb-6"></div>
                
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Item Description</label>
                <div className="text-slate-600 text-sm font-medium leading-relaxed bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                  {activeChat.product?.description || 'No description provided.'}
                </div>

                <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-900/20">
                  <label className="text-[9px] font-bold opacity-50 uppercase tracking-widest mb-4 block">Seller Information</label>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-xl shadow-inner border border-white/10">
                      {(activeChat.buyerId === user.id ? activeChat.seller : activeChat.buyer)?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-black">{(activeChat.buyerId === user.id ? activeChat.seller : activeChat.buyer)?.name}</p>
                      <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Campus Member</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-5 border-t border-white/10">
                    {(activeChat.buyerId === user.id ? activeChat.seller : activeChat.buyer)?.contactNumber ? (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-white/5 rounded-xl border border-white/10"><Phone className="w-4 h-4 text-blue-400" /></div>
                        <span className="font-bold text-slate-200 tracking-wide">{(activeChat.buyerId === user.id ? activeChat.seller : activeChat.buyer)?.contactNumber}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-sm">
                         <div className="p-2 bg-white/5 rounded-xl border border-white/10"><Mail className="w-4 h-4 text-emerald-400" /></div>
                         <span className="font-bold text-slate-200 truncate">{(activeChat.buyerId === user.id ? activeChat.seller : activeChat.buyer)?.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE CHAT WINDOW */}
          <div className="flex-1 flex flex-col bg-slate-50 relative">
            {/* MOBILE ONLY: CHAT HEADER INFO */}
            <div className="md:hidden p-4 bg-white border-b border-slate-200 flex items-center gap-4">
               <button onClick={() => setActiveChat(null)}><ChevronLeft className="w-6 h-6 text-slate-400" /></button>
               <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
                 {(activeChat.buyerId === user.id ? activeChat.seller : activeChat.buyer)?.name?.charAt(0)}
               </div>
               <span className="font-bold text-slate-800 truncate">{(activeChat.buyerId === user.id ? activeChat.seller : activeChat.buyer)?.name}</span>
            </div>

            {/* MESSAGE THREAD */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.map((msg, i) => {
                const isMine = msg.senderId === user.id;
                return (
                  <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-5 py-3.5 rounded-[1.5rem] shadow-sm text-sm font-medium leading-relaxed ${
                      isMine ? 'bg-blue-600 text-white rounded-br-none shadow-blue-100' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                    }`}>
                      {msg.text}
                      <p className={`text-[8px] mt-1.5 font-bold uppercase tracking-widest opacity-40 text-right ${isMine ? 'text-white' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-6">
              <form onSubmit={handleSendMessage} className="bg-white p-2 rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 flex items-center gap-2 pr-3">
                <input 
                  type="text" 
                  placeholder="Ask a question or offer a price..." 
                  className="flex-1 bg-transparent px-4 py-3 text-sm focus:ring-0 outline-none font-semibold text-slate-700"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-lg disabled:opacity-20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
