'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);
    setTimeout(() => router.push('/auth'), 400);
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100%{ box-shadow:0 0 0 0 rgba(65,103,67,0.4); } 70%{ box-shadow:0 0 0 14px rgba(65,103,67,0); } }
        .fade-in  { animation: fadeIn 0.6s ease both; }
        .fade-in-2{ animation: fadeIn 0.6s 0.15s ease both; }
        .fade-in-3{ animation: fadeIn 0.6s 0.3s ease both; }
        .btn-pulse:not(:disabled):hover { animation: pulse 1.4s infinite; }
      `}</style>

      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">

        {/* Logo mark */}
        <div className="fade-in mb-8 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span
              className="material-symbols-outlined text-white text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
          </div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary/70">
            EcoCycle AI
          </p>
        </div>

        {/* Tagline */}
        <h1 className="fade-in-2 text-2xl md:text-3xl font-bold text-on-surface tracking-tight text-center mb-10 max-w-xs leading-snug">
          Turning waste into&nbsp;value.
        </h1>

        {/* Start button */}
        <div className="fade-in-3">
          <button
            onClick={handleStart}
            disabled={loading}
            className="btn-pulse relative px-14 py-4 text-base font-bold bg-primary text-white rounded-full shadow-xl shadow-primary/30 hover:opacity-90 active:scale-95 transition-all disabled:opacity-70 flex items-center gap-3"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting…
              </>
            ) : (
              <>
                Start
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </>
            )}
          </button>
        </div>

      </main>
    </>
  );
}
