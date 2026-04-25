// ─────────────────────────────────────────────────────────────
//  orderService.js
//  Manages the `orders` collection in Firestore
//  Collection path: /orders/{orderId}
// ─────────────────────────────────────────────────────────────

import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "../firebase/firebaseConfig.js";

// ── Guard ─────────────────────────────────────────────────────

function requireAuth() {
  if (!auth.currentUser) {
    throw new Error("AUTH_REQUIRED: User is not authenticated.");
  }
}

// ── Valid Order Statuses ──────────────────────────────────────

export const ORDER_STATUS = Object.freeze({
  PENDING:   "pending",
  CONFIRMED: "confirmed",
  SHIPPED:   "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
});

// ── Schema ────────────────────────────────────────────────────
// /orders/{orderId}
// {
//   buyerId   : string   Firebase Auth UID
//   listingId : string   Reference to /listings/{id}
//   status    : OrderStatus
//   createdAt : Timestamp
//   updatedAt : Timestamp
// }

// ── Place Order ───────────────────────────────────────────────

/**
 * Places a new order for a listing.
 * Caller must be authenticated; buyerId is taken directly from auth state.
 *
 * @param {string} listingId
 * @returns {Promise<string>} New order document ID
 */
export async function placeOrder(listingId) {
  requireAuth();

  const buyerId = auth.currentUser.uid;

  // Validate the listing exists and is active
  const listingSnap = await getDoc(doc(db, "listings", listingId));
  if (!listingSnap.exists()) {
    throw new Error(`placeOrder: Listing "${listingId}" does not exist.`);
  }
  if (listingSnap.data().status !== "active") {
    throw new Error(`placeOrder: Listing "${listingId}" is no longer active.`);
  }
  if (listingSnap.data().sellerId === buyerId) {
    throw new Error("placeOrder: You cannot purchase your own listing.");
  }

  const docRef = await addDoc(collection(db, "orders"), {
    buyerId,
    sellerId: listingSnap.data().sellerId,
    listingId,
    status:    ORDER_STATUS.PENDING,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  console.log("[orderService] Order placed:", docRef.id);
  return docRef.id;
}

// ── Update Order Status ───────────────────────────────────────

/**
 * Updates the status of an order.
 * Only the seller of the associated listing OR the buyer may update status,
 * depending on context (e.g. buyer can cancel; seller can confirm / ship).
 *
 * @param {string} orderId
 * @param {string} status  - Must be one of ORDER_STATUS values
 * @returns {Promise<void>}
 */
export async function updateOrderStatus(orderId, status) {
  requireAuth();

  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new Error(`updateOrderStatus: Invalid status "${status}".`);
  }

  const orderSnap = await getDoc(doc(db, "orders", orderId));
  if (!orderSnap.exists()) {
    throw new Error(`updateOrderStatus: Order "${orderId}" does not exist.`);
  }

  const order   = orderSnap.data();
  const uid     = auth.currentUser.uid;
  const isBuyer = order.buyerId === uid;

  // Fetch the associated listing to determine the seller
  const listingSnap = await getDoc(doc(db, "listings", order.listingId));
  const isSeller    = listingSnap.exists() && listingSnap.data().sellerId === uid;

  if (!isBuyer && !isSeller) {
    throw new Error("PERMISSION_DENIED: You are not associated with this order.");
  }

  await updateDoc(doc(db, "orders", orderId), {
    status,
    updatedAt: serverTimestamp(),
  });

  console.log("[orderService] Order status updated:", orderId, "→", status);
}

// ── Get Single Order ──────────────────────────────────────────

/**
 * @param {string} orderId
 * @returns {Promise<{id:string,...} | null>}
 */
export async function getOrder(orderId) {
  requireAuth();

  const snap = await getDoc(doc(db, "orders", orderId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Get Buyer's Orders ────────────────────────────────────────

/**
 * Returns all orders placed by the authenticated buyer.
 * @returns {Promise<Array<{id:string,...}>>}
 */
export async function getMyOrders() {
  requireAuth();

  const q    = query(
    collection(db, "orders"),
    where("buyerId", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Real-Time: Buyer's Orders ─────────────────────────────────

/**
 * Subscribes to live updates for the authenticated buyer's orders.
 * @param {(orders: Array<{id:string,...}>) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function listenToMyOrders(callback) {
  requireAuth();

  const q = query(
    collection(db, "orders"),
    where("buyerId", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ── Real-Time: Orders for a Listing (Seller view) ─────────────

/**
 * Subscribes to live updates for all orders on a specific listing.
 * Useful for a seller's order management panel.
 *
 * @param {string} listingId
 * @param {(orders: Array<{id:string,...}>) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function listenToOrdersForListing(listingId, callback) {
  requireAuth();

  const q = query(
    collection(db, "orders"),
    where("listingId", "==", listingId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ── Real-Time: Seller's Orders ────────────────────────────────

/**
 * Subscribes to live updates for all orders where the current user is the seller.
 * @param {(orders: Array<{id:string,...}>) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function listenToSellerOrders(callback) {
  requireAuth();

  // Note: this requires 'sellerId' on orders, or querying orders via listings.
  // Assuming 'sellerId' is saved on the order for easier querying:
  const q = query(
    collection(db, "orders"),
    where("sellerId", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
