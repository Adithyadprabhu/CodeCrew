// Notifications store – localStorage + BroadcastChannel for real-time cross-tab sync
const KEY = 'ecocycle_notifications';
const CHANNEL = 'ecocycle_notifications_channel';

// BroadcastChannel for real-time cross-tab communication
let _channel = null;
function getChannel() {
  if (typeof window === 'undefined') return null;
  if (!_channel) {
    try { _channel = new BroadcastChannel(CHANNEL); } catch { _channel = null; }
  }
  return _channel;
}

export function getNotifications() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveNotifications(notifications) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
}

export function addNotification(notification) {
  const current = getNotifications();
  // Deduplicate by orderId + type
  const isDup = current.some(
    n => n.orderId === notification.orderId && n.type === notification.type && n.status === notification.status
  );
  if (isDup) return current;

  const newNote = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    read: false,
    timestamp: new Date().toISOString(),
    ...notification,
  };
  const next = [newNote, ...current];
  saveNotifications(next);

  // Broadcast to other tabs
  const ch = getChannel();
  if (ch) ch.postMessage({ type: 'NEW_NOTIFICATION', notification: newNote });

  return next;
}

export function markAsRead(id) {
  const next = getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
  saveNotifications(next);
  return next;
}

export function markAllAsRead() {
  const next = getNotifications().map(n => ({ ...n, read: true }));
  saveNotifications(next);
  return next;
}

export function clearNotifications() {
  saveNotifications([]);
  return [];
}

export function getUnreadCount() {
  return getNotifications().filter(n => !n.read).length;
}

export function subscribeToNotifications(callback) {
  if (typeof window === 'undefined') return () => {};

  try {
    // Listen to BroadcastChannel events (cross-tab)
    const ch = getChannel();
    const bcHandler = () => {
      try {
        callback(getNotifications());
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    };
    if (ch) ch.addEventListener('message', bcHandler);

    // Also poll storage events (same-tab fallback)
    const storageHandler = (e) => {
      if (e.key === KEY) {
        try {
          callback(getNotifications());
        } catch (error) {
          console.error('Error in storage notification handler:', error);
        }
      }
    };
    window.addEventListener('storage', storageHandler);

    return () => {
      if (ch) ch.removeEventListener('message', bcHandler);
      window.removeEventListener('storage', storageHandler);
    };
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return () => {};
  }
}
