'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { listenToMyOrders } from '@/services/index.js';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  bg: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400', icon: 'pending' },
  accepted: { label: 'Accepted', bg: 'bg-green-50 text-green-700 border-green-200',   dot: 'bg-green-500', icon: 'check_circle' },
  rejected: { label: 'Rejected', bg: 'bg-red-50 text-red-700 border-red-200',         dot: 'bg-red-500',   icon: 'cancel' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function OrderCard({ order }) {
  const isAccepted = order.status === 'accepted';
  const isRejected = order.status === 'rejected';

  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md
      ${isAccepted ? 'border-green-200' : isRejected ? 'border-red-200' : 'border-surface-container'}`}>
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${order.avatarColor} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
          {order.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-on-surface">{order.buyerName}</h3>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-secondary mb-3">{order.buyerCompany} · {order.location} · {order.date}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="bg-surface-container-low rounded-xl p-3">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Material</p>
              <p className="text-sm font-semibold text-on-surface">{order.material}</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-3">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Quantity</p>
              <p className="text-sm font-semibold text-on-surface">{order.quantity}</p>
            </div>
            <div className="bg-primary-fixed/30 rounded-xl p-3">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Price</p>
              <p className="text-sm font-bold text-primary">₹{order.price.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-3">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Seller</p>
              <p className="text-sm font-semibold text-on-surface">{order.sellerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-gray-100 text-outline px-2 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">receipt_long</span>
              {order.id}
            </span>
            {isAccepted && (
              <span className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Seller has accepted your order
              </span>
            )}
            {isRejected && (
              <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">cancel</span>
                Seller declined this order
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const unsub = listenToMyOrders((data) => {
      const mapped = data.map(d => ({
        ...d,
        buyerName: 'My Company',
        buyerCompany: 'My Company',
        sellerName: 'Seller',
        material: 'Material (Listing ID: ' + d.listingId + ')',
        quantity: 'N/A',
        price: 0,
        location: 'Local',
        date: d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : 'Just now',
        avatar: 'M',
        avatarColor: 'bg-primary',
      }));
      setOrders(mapped);
    });
    return () => unsub();
  }, []);

  const counts = {
    ALL: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    accepted: orders.filter(o => o.status === 'accepted').length,
    rejected: orders.filter(o => o.status === 'rejected').length,
  };

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  const TABS = [
    { key: 'ALL',      label: 'All',      count: counts.ALL      },
    { key: 'pending',  label: 'Awaiting', count: counts.pending  },
    { key: 'accepted', label: 'Accepted', count: counts.accepted },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      <Navbar />
      <main className="max-w-container mx-auto px-4 md:px-6 py-10 pb-32 md:pb-16 min-h-screen">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">Buyer Portal</span>
            <h1 className="text-h1 font-bold text-on-background tracking-tight">My Orders</h1>
            <p className="text-secondary text-sm mt-1">Track the status of your material orders</p>
          </div>
          <Link
            href="/market"
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all w-fit"
          >
            <span className="material-symbols-outlined text-sm">storefront</span>
            Browse Marketplace
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total',    value: counts.ALL,      icon: 'receipt_long',  color: 'bg-primary-fixed text-primary' },
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

        {/* Tabs */}
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

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-surface-container rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-outline text-4xl">receipt_long</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">No orders found</h3>
            <p className="text-secondary text-sm">
              {filter !== 'ALL' ? 'No orders match this filter.' : 'Your orders will appear here once you contact sellers.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
