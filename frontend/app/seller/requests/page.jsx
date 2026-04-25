'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { listenToSellerOrders, updateOrderStatus, sendNotification } from '@/services/index.js';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  bg: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  accepted: { label: 'Accepted', bg: 'bg-green-50 text-green-700 border-green-200',   dot: 'bg-green-500' },
  rejected: { label: 'Rejected', bg: 'bg-red-50 text-red-700 border-red-200',         dot: 'bg-red-500'   },
};

/* ─── Toast ───────────────────────────────────────────────────────── */
function Toast({ msg, type = 'success', onClose }) {
  const bg = type === 'error' ? 'bg-error' : type === 'accept' ? 'bg-green-600' : type === 'reject' ? 'bg-error' : 'bg-primary';
  return (
    <div className={`fixed top-6 right-6 z-[300] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm ${bg} animate-[slideIn_0.3s_ease]`}>
      <span className="material-symbols-outlined">
        {type === 'accept' ? 'check_circle' : type === 'reject' ? 'cancel' : 'notifications'}
      </span>
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}

/* ─── Status Badge ────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ─── Request Card ────────────────────────────────────────────────── */
function RequestCard({ req, onAccept, onReject, accepting }) {
  const isPending  = req.status === 'pending';
  const isAccepted = req.status === 'accepted';
  const isRejected = req.status === 'rejected';
  const isLoading  = accepting === req.id;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md
      ${isAccepted ? 'border-green-200' : isRejected ? 'border-red-200' : 'border-surface-container'}`}>
      <div className="flex flex-col md:flex-row md:items-start gap-4">

        {/* Avatar */}
        <div className={`w-12 h-12 rounded-xl ${req.avatarColor} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
          {req.avatar}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-on-surface">{req.buyerName || req.buyer}</h3>
            <StatusBadge status={req.status} />
          </div>
          <p className="text-xs text-secondary mb-3">{req.buyerCompany || req.company} · {req.location} · {req.date}</p>

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-surface-container-low rounded-xl p-3">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Material</p>
              <p className="text-sm font-semibold text-on-surface">{req.material}</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-3">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Quantity</p>
              <p className="text-sm font-semibold text-on-surface">{req.quantity}</p>
            </div>
            <div className="bg-primary-fixed/30 rounded-xl p-3">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Offered Price</p>
              <p className="text-sm font-bold text-primary">₹{req.price.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Message */}
          {req.message && (
            <div className="flex items-start gap-2 text-sm text-secondary bg-surface-container-low rounded-xl px-3 py-2.5 mb-3">
              <span className="material-symbols-outlined text-outline text-sm flex-shrink-0 mt-0.5">chat_bubble</span>
              <span className="italic">"{req.message}"</span>
            </div>
          )}

          {/* Order ID chip */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold bg-gray-100 text-outline px-2 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">receipt_long</span>
              {req.id}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {isPending && (
              <>
                <button
                  onClick={() => onAccept(req)}
                  disabled={isLoading}
                  id={`accept-btn-${req.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 active:scale-95 transition-all shadow-sm shadow-green-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                  )}
                  {isLoading ? 'Accepting…' : 'Accept Order'}
                </button>
                <button
                  onClick={() => onReject(req)}
                  disabled={isLoading}
                  id={`reject-btn-${req.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-error text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  Reject
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant text-secondary rounded-xl font-semibold text-sm hover:border-primary hover:text-primary transition-all">
                  <span className="material-symbols-outlined text-sm">chat</span>
                  Message
                </button>
              </>
            )}
            {isAccepted && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-semibold text-sm border border-green-200">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Order Accepted — Buyer Notified ✅
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant text-secondary rounded-xl font-semibold text-sm hover:border-primary hover:text-primary transition-all">
                  <span className="material-symbols-outlined text-sm">chat</span>
                  Message Buyer
                </button>
              </div>
            )}
            {isRejected && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-semibold text-sm border border-red-200">
                <span className="material-symbols-outlined text-sm">cancel</span>
                Order Rejected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter]     = useState('ALL');
  const [toast, setToast]       = useState(null);
  const [accepting, setAccepting] = useState(null); // orderId being processed

  // Load from Firebase
  useEffect(() => {
    let unsubOrders = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        try {
          unsubOrders = listenToSellerOrders((data) => setRequests(data));
        } catch (error) {
          console.error("Failed to listen to orders:", error);
        }
      } else {
        setRequests([]);
        if (unsubOrders) unsubOrders();
      }
    });

    return () => {
      unsubAuth();
      if (unsubOrders) unsubOrders();
    };
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  /**
   * Accept order → POST /api/orders/accept → persist notification → update state
   */
  const handleAccept = async (req) => {
    setAccepting(req.id);
    try {
      // 1. Update Firebase order status
      await updateOrderStatus(req.id, 'accepted');

      // 2. Send notification directly via Firebase
      if (req.buyerId) {
        try {
          await sendNotification(
            req.buyerId,
            `Your order for ${req.material || 'materials'} has been accepted`,
            'accepted'
          );
        } catch (notifErr) {
          console.error("Failed to notify buyer:", notifErr);
        }
      }

      showToast('✅ Order accepted! Buyer has been notified.', 'accept');
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to accept order', 'error');
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (req) => {
    setAccepting(req.id);
    try {
      // 1. Update Firebase order status
      await updateOrderStatus(req.id, 'rejected');

      // 2. Send notification directly via Firebase
      if (req.buyerId) {
        try {
          await sendNotification(
            req.buyerId,
            `Your order for ${req.material || 'materials'} was rejected`,
            'rejected'
          );
        } catch (notifErr) {
          console.error("Failed to notify buyer:", notifErr);
        }
      }

      showToast('Order rejected. Buyer has been notified.', 'reject');
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to reject order', 'error');
    } finally {
      setAccepting(null);
    }
  };

  /* Counts */
  const counts = useMemo(() => ({
    ALL:      requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }), [requests]);

  const filtered = useMemo(() =>
    filter === 'ALL' ? requests : requests.filter(r => r.status === filter),
    [requests, filter]
  );

  const TABS = [
    { key: 'ALL',      label: 'All',      count: counts.ALL      },
    { key: 'pending',  label: 'Pending',  count: counts.pending  },
    { key: 'accepted', label: 'Accepted', count: counts.accepted },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeUp  { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <Navbar />
      <main className="max-w-container mx-auto px-4 md:px-6 py-10 pb-32 md:pb-14 min-h-screen">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">Seller Portal</span>
            <h1 className="text-h1 font-bold text-on-background tracking-tight">Buyer Requests</h1>
            <p className="text-secondary mt-1 text-sm">
              {counts.pending > 0 && (
                <span className="inline-flex items-center gap-1 text-yellow-700 font-semibold mr-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                  {counts.pending} pending
                </span>
              )}
              {requests.length} total request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => router.push('/seller/my-listings')}
            className="border border-primary text-primary font-semibold px-5 py-3.5 rounded-xl flex items-center gap-2 hover:bg-primary-fixed/40 transition-all w-fit"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            My Listings
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total',    value: counts.ALL,      icon: 'inbox',         color: 'bg-primary-fixed text-primary' },
            { label: 'Pending',  value: counts.pending,  icon: 'pending',       color: 'bg-yellow-50 text-yellow-600'  },
            { label: 'Accepted', value: counts.accepted, icon: 'check_circle',  color: 'bg-green-50 text-green-600'    },
            { label: 'Rejected', value: counts.rejected, icon: 'cancel',        color: 'bg-red-50 text-red-600'        },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-surface-container shadow-sm flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.color}`}>
                <span className="material-symbols-outlined text-sm">{s.icon}</span>
              </div>
              <div>
                <p className="text-xl font-bold text-on-surface">{s.value}</p>
                <p className="text-xs text-secondary">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 🔔 Info Banner */}
        <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
          <span className="material-symbols-outlined text-blue-500 flex-shrink-0 mt-0.5">info</span>
          <p className="text-sm text-blue-700">
            <span className="font-bold">Real-time notifications enabled.</span>{' '}
            When you accept or reject an order, the buyer is instantly notified via their notification bell.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all border
                ${filter === tab.key
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-secondary border-outline-variant hover:border-primary hover:text-primary'}`}
            >
              {tab.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-surface-container text-outline'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-surface-container rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-outline text-4xl">inbox</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">No {filter !== 'ALL' ? filter : ''} requests</h3>
            <p className="text-secondary text-sm">
              {filter !== 'ALL' ? 'Try switching to a different filter.' : 'Buyer requests will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(req => (
              <RequestCard
                key={req.id}
                req={req}
                onAccept={handleAccept}
                onReject={handleReject}
                accepting={accepting}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
