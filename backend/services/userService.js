// ─────────────────────────────────────────────────────────────
//  userService.js
//  Manages the `users` collection in Firestore
//  Collection path: /users/{uid}
// ─────────────────────────────────────────────────────────────

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
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
// /users/{uid}
// {
//   name      : string
//   email     : string
//   role      : "buyer" | "seller"
//   createdAt : Timestamp
//   updatedAt : Timestamp
// }

// ── Add / Create User ────────────────────────────────────────

/**
 * Creates a user document in Firestore.
 * The document ID is the Firebase Auth UID so it matches Auth state.
 *
 * @param {string} uid   - Firebase Auth UID (from UserCredential.user.uid)
 * @param {string} name
 * @param {string} email
 * @param {"buyer"|"seller"} role
 * @returns {Promise<void>}
 */
export async function addUser(uid, name, email, role) {
  if (!uid) throw new Error("addUser: uid is required.");

  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    name,
    email,
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  console.log("[userService] User document created:", uid);
}

// ── Get User ─────────────────────────────────────────────────

/**
 * Fetches a single user document.
 * @param {string} uid
 * @returns {Promise<{id: string, ...} | null>}
 */
export async function getUser(uid) {
  requireAuth();

  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() };
}

// ── Update User ───────────────────────────────────────────────

/**
 * Updates allowed fields of the caller's own profile.
 * Enforces "users can only modify their own data" rule.
 *
 * @param {string} uid
 * @param {{ name?: string, role?: string }} updates
 * @returns {Promise<void>}
 */
export async function updateUser(uid, updates) {
  requireAuth();

  if (auth.currentUser.uid !== uid) {
    throw new Error("PERMISSION_DENIED: You can only update your own profile.");
  }

  await updateDoc(doc(db, "users", uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  console.log("[userService] User document updated:", uid);
}

// ── Delete User ───────────────────────────────────────────────

/**
 * Deletes the caller's own user document.
 * @param {string} uid
 * @returns {Promise<void>}
 */
export async function deleteUser(uid) {
  requireAuth();

  if (auth.currentUser.uid !== uid) {
    throw new Error("PERMISSION_DENIED: You can only delete your own profile.");
  }

  await deleteDoc(doc(db, "users", uid));
  console.log("[userService] User document deleted:", uid);
}

// ── Real-Time Listener ────────────────────────────────────────

/**
 * Subscribes to live updates for a user document.
 * @param {string} uid
 * @param {(data: object | null) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function listenToUser(uid, callback) {
  requireAuth();

  const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });

  return unsub;
}
