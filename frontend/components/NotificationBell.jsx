'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  subscribeToNotifications,
} from '@/lib/notificationsStore';

/* ─── helpers ─────────────────────────────────────────────── */
function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotifIcon({ status }) {
  if (status === 'accepted') {
    return (
      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-green-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      </div>
    );
  }
  if (status === 'rejected') {
    return (
      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-red-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          cancel
        </span>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
      <span className="material-symbols-outlined text-blue-500 text-sm">notifications</span>
    </div>
  );
}

/* ─── Single notification item ─────────────────────────────── */
function NotifItem({ notif, onClick }) {
  return (
    <div
      onClick={() => onClick(notif)}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-100 last:border-0
        ${!notif.read ? 'bg-green-50/40' : ''}`}
      style={{ animation: !notif.read ? 'notifFadeIn 0.4s ease' : 'none' }}
    >
      <NotifIcon status={notif.status} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold text-on-surface' : 'text-secondary'}`}>
          {notif.message}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {notif.orderId && (
            <span className="text-[10px] font-bold bg-gray-100 text-outline px-1.5 py-0.5 rounded-md uppercase tracking-wide">
              {notif.orderId}
            </span>
          )}
          {notif.material && (
            <span className="text-[10px] text-secondary">{notif.material}</span>
          )}
          <span className="text-[10px] text-outline ml-auto">{timeAgo(notif.timestamp)}</span>
        </div>
      </div>
      {!notif.read && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
}

/* ─── Main Bell Component ──────────────────────────────────── */
export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [animateBell, setAnimateBell] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);
  const prevUnread = useRef(0);

  const refresh = useCallback(() => {
    const notes = getNotifications();
    setNotifications(notes);
    const cnt = notes.filter(n => !n.read).length;
    setUnread(cnt);
    // Ring the bell if new notification arrived
    if (cnt > prevUnread.current) {
      setAnimateBell(true);
      setTimeout(() => setAnimateBell(false), 1000);
    }
    prevUnread.current = cnt;
  }, []);

  useEffect(() => {
    refresh();
    // Subscribe to cross-tab & same-tab updates
    const unsub = subscribeToNotifications(() => refresh());
    // Fallback polling every 3 seconds
    const timer = setInterval(refresh, 3000);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [refresh]);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleItemClick = (notif) => {
    markAsRead(notif.id);
    refresh();
    setOpen(false);
    router.push(`/notifications`);
  };

  const handleMarkAll = (e) => {
    e.stopPropagation();
    markAllAsRead();
    refresh();
  };

  const displayedNotifs = notifications.slice(0, 6);

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={bellRef}
        id="notification-bell-btn"
        onClick={() => setOpen(v => !v)}
        className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all
          ${open ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 hover:text-on-surface'}
          ${animateBell ? 'animate-[bellRing_0.6s_ease]' : ''}`}
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-xl" style={open ? { fontVariationSettings: "'FILL' 1" } : {}}>
          notifications
        </span>
        {unread > 0 && (
          <span
            id="notif-badge"
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm animate-[badgePop_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          ref={panelRef}
          id="notification-panel"
          className="absolute right-0 top-[calc(100%+8px)] w-[340px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-gray-100 z-[200] overflow-hidden"
          style={{ animation: 'notifPanelSlide 0.25s cubic-bezier(0.16,1,0.3,1)' }}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-on-surface text-sm">Notifications</span>
              {unread > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-[11px] text-primary font-semibold hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => { setOpen(false); router.push('/notifications'); }}
                className="text-[11px] text-secondary font-semibold hover:text-primary transition-colors"
              >
                See all
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto">
            {displayedNotifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-outline text-2xl">notifications_none</span>
                </div>
                <p className="font-semibold text-on-surface text-sm mb-1">All caught up!</p>
                <p className="text-xs text-secondary">Notifications will appear here when sellers act on your orders.</p>
              </div>
            ) : (
              displayedNotifs.map(n => (
                <NotifItem key={n.id} notif={n} onClick={handleItemClick} />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 6 && (
            <div className="border-t border-gray-100 px-4 py-2.5">
              <button
                onClick={() => { setOpen(false); router.push('/notifications'); }}
                className="text-xs text-primary font-semibold hover:underline w-full text-center"
              >
                View all {notifications.length} notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
