'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const history = [
  { label: 'How to recycle PET?', time: '2 hours ago', active: true },
  { label: 'Local composting sites', time: 'Yesterday', active: false },
  { label: 'Plastic identification', time: 'Oct 12', active: false },
];

const suggestions = [
  'Find a recycling center',
  'Is this plastic recyclable?',
  'What is EcoCycle AI?',
  'Composting 101',
];

type Message = {
  id: number;
  role: 'ai' | 'user';
  text: string;
  time: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'ai',
    text: "Hello! I'm your EcoCycle assistant. I can help you identify materials, find local recycling rules, or suggest ways to reduce waste. What's on your mind today?",
    time: '10:02 AM',
  },
  {
    id: 2,
    role: 'user',
    text: 'Can I recycle coffee cups from most cafes?',
    time: '10:05 AM',
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', text: input, time: now },
      {
        id: Date.now() + 1,
        role: 'ai',
        text: "Thanks for your question! Our AI is processing your request. In the meantime, remember that most recycling programmes accept clean, dry materials sorted by type.",
        time: now,
      },
    ]);
    setInput('');
  };

  return (
    <>
      <Navbar />
      <main className="max-w-container mx-auto pt-6 pb-32 md:pb-8 px-4 md:px-12">
        <div className="flex flex-col md:flex-row gap-6">

          {/* ── Sidebar ── */}
          <aside className="hidden md:flex flex-col w-72 shrink-0 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-h3 font-semibold mb-4 text-primary">History</h3>
              <div className="space-y-3">
                {history.map(({ label, time, active }) => (
                  <button
                    key={label}
                    className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-all hover:bg-surface-container ${
                      active
                        ? 'bg-surface-container-low border-l-4 border-primary'
                        : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="block truncate">{label}</span>
                    <span className="text-xs text-secondary opacity-70">{time}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-primary-fixed/20 p-6 rounded-xl border border-primary/20">
              <span className="material-symbols-outlined text-primary mb-2 block">tips_and_updates</span>
              <h4 className="font-semibold text-primary mb-1">Eco Tip</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Rinsing food containers before recycling prevents contamination of entire batches!
              </p>
            </div>
          </aside>

          {/* ── Chat Canvas ── */}
          <div className="flex-1 flex flex-col h-[680px] bg-white rounded-2xl shadow-sm overflow-hidden border border-surface-variant">

            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-surface-variant flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">smart_toy</span>
                </div>
                <div>
                  <h2 className="font-semibold text-on-surface text-lg">Eco Assistant</h2>
                  <p className="text-xs text-primary font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
                    AI Online
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                <span className="material-symbols-outlined text-secondary">more_vert</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/30">
              <div className="flex justify-center">
                <span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-bold text-secondary uppercase tracking-widest">
                  Today
                </span>
              </div>

              {messages.map((msg) =>
                msg.role === 'ai' ? (
                  <div key={msg.id} className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl chat-bubble-ai shadow-sm border border-surface-variant">
                      <p className="text-body-md text-on-surface">{msg.text}</p>
                      {msg.id === 2 && (
                        <ul className="space-y-2 text-sm text-on-surface-variant mt-3">
                          {[
                            { icon: 'check_circle', color: 'text-primary', text: '<strong>Plastic Lids:</strong> Usually recyclable (check for the #5 symbol).' },
                            { icon: 'cancel', color: 'text-error', text: '<strong>Paper Cups:</strong> Most are lined with plastic film, making them non-recyclable in standard bins.' },
                            { icon: 'check_circle', color: 'text-primary', text: '<strong>Cardboard Sleeves:</strong> 100% recyclable! Just toss them in the paper bin.' },
                          ].map(({ icon, color, text }) => (
                            <li key={text} className="flex items-start gap-2">
                              <span className={`material-symbols-outlined ${color} text-sm mt-0.5`}>{icon}</span>
                              <span dangerouslySetInnerHTML={{ __html: text }} />
                            </li>
                          ))}
                          <div className="mt-4 p-3 bg-surface-container-low rounded-lg border-l-4 border-primary">
                            <p className="text-xs italic">Pro Tip: The best option is always bringing your own reusable cup!</p>
                          </div>
                        </ul>
                      )}
                      <span className="text-[10px] text-secondary mt-2 block">{msg.time}</span>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex flex-row-reverse gap-3 max-w-[85%] ml-auto">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary text-sm">person</span>
                    </div>
                    <div className="bg-primary text-white p-4 rounded-2xl chat-bubble-user shadow-sm">
                      <p className="text-body-md">{msg.text}</p>
                      <span className="text-[10px] text-primary-fixed-dim mt-2 block text-right">{msg.time}</span>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Suggested Questions */}
            <div className="px-6 py-3 overflow-x-auto whitespace-nowrap bg-white border-t border-surface-variant flex gap-2 scrollbar-hide">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="px-4 py-2 rounded-full border border-primary/30 text-primary text-xs font-medium hover:bg-primary-fixed transition-colors flex-shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-white">
              <div className="relative flex items-center gap-3">
                <button className="p-3 bg-surface-container-low rounded-xl text-secondary hover:text-primary transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined">add_a_photo</span>
                </button>
                <div className="relative flex-1">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder="Ask anything about sustainability..."
                    className="w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-4 pr-12 text-body-md focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-secondary/50"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary">
                    <span className="material-symbols-outlined">mic</span>
                  </button>
                </div>
                <button
                  onClick={send}
                  className="p-3.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
