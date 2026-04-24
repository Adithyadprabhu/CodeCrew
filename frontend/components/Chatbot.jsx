'use client';
import { useState, useEffect, useRef } from 'react';

/* ─── Rule-based AI response engine ─────────────────────────── */
const RESPONSES = [
  { keys: ['hello', 'hi', 'hey', 'greet'],           reply: "👋 Hello! I'm EcoBot, your recycling assistant. How can I help you today?" },
  { keys: ['price', 'cost', 'rate', 'value'],         reply: "💰 Prices depend on material type and quantity. Check the Marketplace for live listings or use the AI Detect feature for price suggestions." },
  { keys: ['sell', 'listing', 'add material'],        reply: "🏷️ To sell materials, go to the Seller Dashboard → Add New Material. Upload images and our AI will detect and price your material automatically!" },
  { keys: ['buy', 'purchase', 'marketplace', 'market'], reply: "🛒 Browse the Marketplace to find recyclable materials from verified sellers. Filter by type, location, and price." },
  { keys: ['recycle', 'recyclable', 'waste'],         reply: "♻️ Recyclable materials include plastic (PET, HDPE), metal (aluminum, copper), paper, cardboard, glass, and organic waste." },
  { keys: ['plastic', 'pet', 'hdpe', 'polymer'],      reply: "🧴 Plastic materials like PET and HDPE are in high demand. Clean and sorted plastic typically fetches ₹8–15/kg depending on grade." },
  { keys: ['metal', 'aluminum', 'steel', 'copper'],   reply: "🔧 Metals have high recycling value. Aluminum scrap goes for ₹80–120/kg, copper for ₹400–600/kg. Use AI Detect for exact pricing." },
  { keys: ['paper', 'cardboard', 'occ'],              reply: "📦 Cardboard (OCC) and paper are common recyclables. OCC typically fetches ₹6–12/kg depending on moisture and grade." },
  { keys: ['detect', 'ai', 'analyze', 'scan'],        reply: "🤖 Our AI Detection feature uses computer vision to identify your material type, grade, and estimate market value. Just upload a photo!" },
  { keys: ['account', 'sign in', 'login', 'register', 'signup'], reply: "🔐 You can sign in as a Buyer or Seller from the top-right corner. Each role has a tailored dashboard." },
  { keys: ['seller', 'dashboard'],                    reply: "📊 The Seller Dashboard gives you analytics, your listings, buyer requests, and the ability to add new materials — all in one place." },
  { keys: ['request', 'buyer request', 'order'],      reply: "📥 Sellers can view and manage incoming Buyer Requests from the Seller Dashboard → Requests page. Accept or reject with one click." },
  { keys: ['location', 'city', 'delivery', 'pickup'], reply: "📍 Listings include location info. Buyers and sellers coordinate pickup/delivery directly. Filter Marketplace listings by city." },
  { keys: ['help', 'support', 'contact'],             reply: "🆘 Need support? Browse the Marketplace, use AI Detect, or check the Seller Dashboard. For more help, use the chat feature." },
  { keys: ['thank', 'thanks', 'great', 'awesome'],    reply: "😊 You're welcome! Let me know if you have any more questions about EcoCycle AI." },
  { keys: ['bye', 'goodbye', 'see you'],              reply: "👋 Goodbye! Have a great day and keep recycling! 🌱" },
];

const QUICK_QUESTIONS = [
  'How do I sell?',
  'What can I recycle?',
  'How does AI Detect work?',
  'What are current prices?',
];

function getBotResponse(message) {
  const lower = message.toLowerCase();
  for (const { keys, reply } of RESPONSES) {
    if (keys.some(k => lower.includes(k))) return reply;
  }
  return "🤔 I'm not sure about that. Try asking about selling, buying, prices, or recyclable materials. Or type 'help' for options!";
}

/* ─── Message bubble ─────────────────────────────────────────── */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-white text-sm" style={{ fontSize: '14px' }}>eco</span>
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-primary text-white rounded-tr-sm'
            : 'bg-white text-on-surface border border-surface-container rounded-tl-sm shadow-sm'
          }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

/* ─── Typing indicator ───────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-2 items-end">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>eco</span>
      </div>
      <div className="bg-white border border-surface-container rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Chatbot component ─────────────────────────────────── */
export default function Chatbot() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, role: 'bot', text: "👋 Hi! I'm EcoBot. Ask me about selling, buying, recyclable materials, or pricing!" }
  ]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);
  const [unread, setUnread]   = useState(0);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  /* Auto-scroll to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  /* Focus input when opened */
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    /* Simulate network delay */
    setTimeout(() => {
      const botReply = { id: Date.now() + 1, role: 'bot', text: getBotResponse(trimmed) };
      setTyping(false);
      setMessages(prev => [...prev, botReply]);
      if (!open) setUnread(u => u + 1);
    }, 800 + Math.random() * 500);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ id: 0, role: 'bot', text: "👋 Hi! I'm EcoBot. Ask me about selling, buying, recyclable materials, or pricing!" }]);
  };

  return (
    <>
      <style>{`
        @keyframes chatOpen { from { opacity:0; transform:scale(0.92) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes chatPop  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        .chat-window { animation: chatOpen 0.25s cubic-bezier(.34,1.56,.64,1) both; }
        .bounce-dot  { animation: bounce 1s infinite; }
      `}</style>

      {/* ── Floating Chat Button ── */}
      <div className="fixed bottom-6 right-6 z-[500] flex flex-col items-end gap-3">
        {/* Greeting bubble (shown when closed) */}
        {!open && (
          <div className="bg-white border border-surface-container rounded-2xl rounded-br-sm px-4 py-2.5 shadow-lg text-sm font-medium text-on-surface max-w-[180px] text-right animate-[chatOpen_0.3s_ease]">
            Ask EcoBot anything! 🌱
          </div>
        )}

        <button
          onClick={() => setOpen(o => !o)}
          className="relative w-14 h-14 bg-primary text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
          aria-label="Open AI Chatbot"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {open ? 'close' : 'smart_toy'}
          </span>
          {unread > 0 && !open && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* ── Chat Window ── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[499] w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-3xl shadow-2xl border border-surface-container overflow-hidden flex flex-col chat-window"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="bg-primary px-5 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm">EcoBot</h3>
              <p className="text-white/70 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                Online · AI Assistant
              </p>
            </div>
            <button onClick={clearChat} title="Clear chat" className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white">
              <span className="material-symbols-outlined text-sm">restart_alt</span>
            </button>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-surface-container-low">
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0 border-t border-surface-container bg-white scrollbar-none">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 bg-primary-fixed/40 text-primary rounded-full hover:bg-primary-fixed transition-all whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-surface-container bg-white flex items-center gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything…"
              className="flex-1 bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-40 active:scale-95 transition-all flex-shrink-0"
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
