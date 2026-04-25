// ─────────────────────────────────────────────────────────────
//  listingService.js
//  Manages the `listings` collection in Firestore
//  Collection path: /listings/{listingId}
// ─────────────────────────────────────────────────────────────

import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
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

// ── Schema ────────────────────────────────────────────────────
// /listings/{listingId}
// {
//   material  : string          e.g. "Copper", "Aluminium"
//   quantity  : number          (kg or units)
//   price     : number          (per unit / kg)
//   sellerId  : string          Firebase Auth UID
//   status    : "active" | "sold" | "archived"
//   createdAt : Timestamp
//   updatedAt : Timestamp
// }

// ── Add Listing ──────────────────────────────────────────────

/**
 * Creates a new listing.
 * @param {string} material
 * @param {number} quantity
 * @param {number} price
 * @param {string} sellerId  - Must match auth.currentUser.uid
 * @param {Array<string>} imageUrls
 * @returns {Promise<string>} New document ID
 */
export async function addListing(material, quantity, price, sellerId, imageUrls = []) {
  requireAuth();

  if (auth.currentUser.uid !== sellerId) {
    throw new Error("PERMISSION_DENIED: sellerId must match authenticated user.");
  }

  const docRef = await addDoc(collection(db, "listings"), {
    material,
    quantity: Number(quantity),
    price:    Number(price),
    sellerId,
    imageUrls,
    status:   "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  console.log("[listingService] Listing created:", docRef.id);
  return docRef.id;
}

// ── Get Single Listing ───────────────────────────────────────

/**
 * @param {string} listingId
 * @returns {Promise<{id: string, ...} | null>}
 */
export async function getListing(listingId) {
  requireAuth();

  const snap = await getDoc(doc(db, "listings", listingId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Get All Active Listings ───────────────────────────────────

/**
 * Returns all active listings (marketplace view — any auth'd user).
 * @returns {Promise<Array<{id: string, ...}>>}
 */
export async function getAllActiveListings() {
  requireAuth();

  const q = query(
    collection(db, "listings"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Get Listings by Seller ────────────────────────────────────

/**
 * Returns all listings owned by the authenticated seller.
 * @returns {Promise<Array<{id: string, ...}>>}
 */
export async function getMyListings() {
  requireAuth();

  const uid = auth.currentUser.uid;
  const q   = query(
    collection(db, "listings"),
    where("sellerId", "==", uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Update Listing ────────────────────────────────────────────

/**
 * Sellers may only update their own listings.
 * @param {string} listingId
 * @param {Partial<{material:string, quantity:number, price:number, status:string}>} updates
 * @returns {Promise<void>}
 */
export async function updateListing(listingId, updates) {
  requireAuth();

  const existing = await getListing(listingId);
  if (!existing) throw new Error("Listing not found.");

  if (existing.sellerId !== auth.currentUser.uid) {
    throw new Error("PERMISSION_DENIED: You can only update your own listings.");
  }

  await updateDoc(doc(db, "listings", listingId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  console.log("[listingService] Listing updated:", listingId);
}

// ── Delete Listing ────────────────────────────────────────────

/**
 * @param {string} listingId
 * @returns {Promise<void>}
 */
export async function deleteListing(listingId) {
  requireAuth();

  const existing = await getListing(listingId);
  if (!existing) throw new Error("Listing not found.");

  if (existing.sellerId !== auth.currentUser.uid) {
    throw new Error("PERMISSION_DENIED: You can only delete your own listings.");
  }

  await deleteDoc(doc(db, "listings", listingId));
  console.log("[listingService] Listing deleted:", listingId);
}

// ── Real-Time: All Active Listings ───────────────────────────

/**
 * Subscribes to live updates for all active listings.
 * Ideal for the marketplace page.
 *
 * @param {(listings: Array<{id:string,...}>) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function listenToActiveListings(callback) {
  requireAuth();

  const q = query(
    collection(db, "listings"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const listings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(listings);
  });
}

// ── Real-Time: Seller's Own Listings ─────────────────────────

/**
 * Subscribes to live updates for the authenticated seller's listings.
 * @param {(listings: Array<{id:string,...}>) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function listenToMyListings(callback) {
  requireAuth();

  const uid = auth.currentUser.uid;
  const q   = query(
    collection(db, "listings"),
    where("sellerId", "==", uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const listings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(listings);
  });
}
