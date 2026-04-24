'use client';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  subscribeToNotifications,
} from '@/lib/notificationsStore';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_CONFIG = {
  accepted: {
    bg: 'bg-green-50 border-green-200',
    icon: 'check_circle',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    label: 'Accepted',
    labelColor: 'text-green-700 bg-green-100',
  },
  rejected: {
    bg: 'bg-red-50 border-red-200',
    icon: 'cancel',
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100',
    label: 'Rejected',
    labelColor: 'text-red-700 bg-red-100',
  },
  order: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'notifications',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    label: 'Update',
    labelColor: 'text-blue-700 bg-blue-100',
  },
};

function NotifCard({ notif, onRead }) {
  const cfg = STATUS_CONFIG[notif.status] || STATUS_CONFIG.order;

  return (
    <div
      className={`relative rounded-2xl border p-5 transition-all cursor-pointer hover:shadow-md
        ${notif.read ? 'bg-white border-surface-container' : `${cfg.bg}`}
        ${!notif.read ? 'animate-[fadeUp_0.4s_ease]' : ''}`}
      onClick={() => onRead(notif.id)}
      style={{ animation: !notif.read ? 'fadeUp 0.4s ease' : 'none' }}
    >
      {!notif.read && (
        <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary shadow-sm" />
      )}
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
          <span className={`material-symbols-outlined ${cfg.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {cfg.icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap mb-1.5">
            <p className={`text-sm leading-snug flex-1 ${!notif.read ? 'font-bold text-on-surface' : 'font-semibold text-secondary'}`}>
              {notif.message}
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.labelColor}`}>
              {cfg.label}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-secondary">
            {notif.orderId && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">receipt_long</span>
                <span className="font-semibold text-outline">{notif.orderId}</span>
              </span>
            )}
            {notif.material && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">inventory_2</span>
                {notif.material}
              </span>
            )}
            {notif.sellerName && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">store</span>
                {notif.sellerName}
              </span>
            )}
            <span className="ml-auto flex items-center gap-1 text-outline">
              <span className="material-symbols-outlined text-xs">schedule</span>
              {timeAgo(notif.timestamp)} · {formatDate(notif.timestamp)}
            </span>
          </div>
        </div>
      </div>

      {!notif.read && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-secondary italic">Click to mark as read</span>
          <button
            onClick={e => { e.stopPropagation(); onRead(notif.id); }}
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">done</span>
            Mark read
          </button>
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');

  const refresh = useCallback(() => {
    setNotifications(getNotifications());
  }, []);

  useEffect(() => {
    refresh();
    const unsub = subscribeToNotifications(() => refresh());
    const timer = setInterval(refresh, 3000);
    return () => { unsub(); clearInterval(timer); };
  }, [refresh]);

  const handleRead = (id) => {
    markAsRead(id);
    refresh();
  };

  const handleMarkAll = () => {
    markAllAsRead();
    refresh();
  };

  const handleClear = () => {
    if (window.confirm('Clear all notifications?')) {
      clearNotifications();
      refresh();
    }
  };

  const unread = notifications.filter(n => !n.read).length;

  const TABS = [
    { key: 'ALL', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unread },
    { key: 'accepted', label: 'Accepted', count: notifications.filter(n => n.status === 'accepted').length },
    { key: 'rejected', label: 'Rejected', count: notifications.filter(n => n.status === 'rejected').length },
  ];

  const filtered = filter === 'ALL'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.status === filter);

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes bellRing {
          0%,100% { transform: rotate(0deg); }
          15%      { transform: rotate(15deg); }
          30%      { transform: rotate(-12deg); }
          45%      { transform: rotate(10deg); }
          60%      { transform: rotate(-8deg); }
          75%      { transform: rotate(5deg); }
        }
      `}</style>

      <Navbar />
      <main className="max-w-container mx-auto px-4 md:px-6 py-10 pb-32 md:pb-16 min-h-screen">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">
              Buyer Portal
            </span>
            <h1 className="text-h1 font-bold text-on-background tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                notifications
              </span>
              Notifications
            </h1>
            <p className="text-secondary text-sm mt-1">
              {unread > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" />
                  {unread} unread notification{unread !== 1 ? 's' : ''}
                </span>
              ) : (
                'You\'re all caught up!'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-2 px-4 py-2.5 border border-primary text-primary rounded-xl font-semibold text-sm hover:bg-primary-fixed/30 transition-all"
              >
                <span className="material-symbols-outlined text-sm">done_all</span>
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total',    value: notifications.length, icon: 'notifications',   color: 'bg-primary-fixed text-primary'  },
            { label: 'Unread',   value: unread,               icon: 'mark_email_unread', color: 'bg-blue-50 text-blue-600'     },
            { label: 'Accepted', value: notifications.filter(n => n.status === 'accepted').length, icon: 'check_circle',  color: 'bg-green-50 text-green-600' },
            { label: 'Rejected', value: notifications.filter(n => n.status === 'rejected').length, icon: 'cancel',        color: 'bg-red-50 text-red-600'     },
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

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-surface-container rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-outline text-4xl">notifications_none</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">No notifications yet</h3>
            <p className="text-secondary text-sm max-w-xs">
              {filter !== 'ALL'
                ? 'No notifications match this filter.'
                : 'When sellers accept or reject your orders, you\'ll see notifications here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(n => (
              <NotifCard key={n.id} notif={n} onRead={handleRead} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
