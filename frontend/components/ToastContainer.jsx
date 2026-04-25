'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToNotifications, getNotifications } from '@/lib/notificationsStore';

/* ─── Individual Toast ─────────────────────────────────────── */
function Toast({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 350);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    const t = setTimeout(dismiss, 5000);
    return () => clearTimeout(t);
  }, [dismiss]);

  const isAccepted = toast.status === 'accepted';
  const isRejected = toast.status === 'rejected';

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border min-w-[300px] max-w-[380px] cursor-pointer transition-all
        ${isAccepted ? 'bg-white border-green-200' : isRejected ? 'bg-white border-red-200' : 'bg-white border-gray-200'}
        ${exiting ? 'animate-[toastExit_0.35s_ease_forwards]' : 'animate-[toastEnter_0.4s_cubic-bezier(0.16,1,0.3,1)]'}`}
      onClick={dismiss}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
        ${isAccepted ? 'bg-green-100' : isRejected ? 'bg-red-100' : 'bg-blue-100'}`}>
        <span
          className={`material-symbols-outlined text-lg ${isAccepted ? 'text-green-600' : isRejected ? 'text-red-500' : 'text-blue-500'}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isAccepted ? 'check_circle' : isRejected ? 'cancel' : 'notifications'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${isAccepted ? 'text-green-600' : isRejected ? 'text-red-500' : 'text-blue-500'}`}>
          {isAccepted ? '✅ Order Accepted' : isRejected ? '❌ Order Declined' : '🔔 Notification'}
        </p>
        <p className="text-sm font-semibold text-on-surface leading-snug">{toast.message}</p>
        {toast.orderId && (
          <p className="text-[11px] text-secondary mt-1">Order ID: <span className="font-bold">{toast.orderId}</span></p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 rounded-b-2xl ${isAccepted ? 'bg-green-400' : isRejected ? 'bg-red-400' : 'bg-blue-400'}`}
        style={{ animation: 'toastProgress 5s linear forwards', width: '100%' }}
      />
    </div>
  );
}

/* ─── Toast Container ──────────────────────────────────────── */
export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const seenIds = useRef(new Set());

  const addToast = useCallback((notif) => {
    if (seenIds.current.has(notif.id)) return;
    seenIds.current.add(notif.id);
    setToasts(prev => [...prev, notif]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    // On mount, mark existing notifications as seen (don't toast them)
    const existing = getNotifications();
    existing.forEach(n => seenIds.current.add(n.id));

    // Subscribe to new notifications
    const unsub = subscribeToNotifications((notes) => {
      notes.forEach(n => {
        if (!seenIds.current.has(n.id)) {
          addToast(n);
        }
      });
    });
    return unsub;
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastEnter {
          from { transform: translateX(120%) scale(0.9); opacity: 0; }
          to   { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes toastExit {
          from { transform: translateX(0) scale(1); opacity: 1; }
          to   { transform: translateX(120%) scale(0.9); opacity: 0; }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      <div
        id="toast-container"
        className="fixed bottom-6 right-6 z-[500] flex flex-col gap-3 items-end"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map(t => (
          <div key={t.id} className="relative">
            <Toast toast={t} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </>
  );
}
