// ─────────────────────────────────────────────────────────────
//  notificationService.js
//  Manages the `notifications` collection in Firestore
//  Collection path: /notifications/{notificationId}
// ─────────────────────────────────────────────────────────────

import {
  collection,
  addDoc,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "../lib/firebaseConfig.js";

// ── Guard ─────────────────────────────────────────────────────

function requireAuth() {
  if (!auth.currentUser) {
    throw new Error("AUTH_REQUIRED: User is not authenticated.");
  }
}

// ── Schema ────────────────────────────────────────────────────
// /notifications/{notificationId}
// {
//   userId    : string    Target recipient UID
//   message   : string
//   read      : boolean
//   type      : string    Optional: "order" | "listing" | "system"
//   createdAt : Timestamp
// }

// ── Send Notification ─────────────────────────────────────────

/**
 * Creates a notification document for a given user.
 * Any authenticated user can send a notification (e.g. system, order events).
 *
 * @param {string} userId   - Target recipient's Firebase Auth UID
 * @param {string} message
 * @param {string} [type="system"]  - Notification type tag
 * @returns {Promise<string>} New notification document ID
 */
export async function sendNotification(userId, message, type = "system") {
  requireAuth();

  if (!userId || !message) {
    throw new Error("sendNotification: userId and message are required.");
  }

  const docRef = await addDoc(collection(db, "notifications"), {
    userId,
    message,
    type,
    read:      false,
    createdAt: serverTimestamp(),
  });

  console.log("[notificationService] Notification sent:", docRef.id, "→ user:", userId);
  return docRef.id;
}

// ── Get Notifications for Auth'd User ────────────────────────

/**
 * Fetches all notifications for the currently authenticated user.
 * @returns {Promise<Array<{id:string,...}>>}
 */
export async function getMyNotifications() {
  requireAuth();

  const q    = query(
    collection(db, "notifications"),
    where("userId", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Mark Notification as Read ─────────────────────────────────

/**
 * Marks a single notification as read.
 * Only the recipient can do this.
 *
 * @param {string} notificationId
 * @returns {Promise<void>}
 */
export async function markAsRead(notificationId) {
  requireAuth();

  await updateDoc(doc(db, "notifications", notificationId), { read: true });
  console.log("[notificationService] Marked as read:", notificationId);
}

// ── Mark All Notifications as Read ───────────────────────────

/**
 * Bulk-marks all of the authenticated user's notifications as read.
 * @returns {Promise<void>}
 */
export async function markAllAsRead() {
  requireAuth();

  const notifications = await getMyNotifications();
  const unread        = notifications.filter((n) => !n.read);

  const updates = unread.map((n) =>
    updateDoc(doc(db, "notifications", n.id), { read: true })
  );

  await Promise.all(updates);
  console.log("[notificationService] Marked all as read for user:", auth.currentUser.uid);
}

// ── Delete Notification ───────────────────────────────────────

/**
 * Deletes a notification — only the recipient may do this.
 * @param {string} notificationId
 * @returns {Promise<void>}
 */
export async function deleteNotification(notificationId) {
  requireAuth();
  await deleteDoc(doc(db, "notifications", notificationId));
  console.log("[notificationService] Deleted:", notificationId);
}

// ── Real-Time Listener ────────────────────────────────────────

/**
 * Subscribes to live notifications for the authenticated user.
 * Ideal for a notification bell / toast system.
 *
 * @param {(notifications: Array<{id:string,...}>) => void} callback
 * @returns {() => void} Unsubscribe function
 *
 * Usage:
 *   const unsubscribe = listenToMyNotifications((notifs) => setNotifs(notifs));
 *   // Call unsubscribe() on component unmount.
 */
export function listenToMyNotifications(callback) {
  requireAuth();

  const q = query(
    collection(db, "notifications"),
    where("userId", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(notifs);
  });
}

// ── Real-Time Unread Count ────────────────────────────────────

/**
 * Streams the live count of unread notifications for the current user.
 * Useful for notification badge.
 *
 * @param {(count: number) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function listenToUnreadCount(callback) {
  requireAuth();

  const q = query(
    collection(db, "notifications"),
    where("userId",  "==", auth.currentUser.uid),
    where("read",    "==", false)
  );

  return onSnapshot(q, (snap) => {
    callback(snap.size);
  });
}
