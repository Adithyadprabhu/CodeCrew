// ─────────────────────────────────────────────────────────────
//  authService.js
//  Handles Firebase Authentication for CycleX
//  Connected to: cyclex-2f234
// ─────────────────────────────────────────────────────────────

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../firebase/firebaseConfig.js";

// ── Helpers ──────────────────────────────────────────────────

/**
 * Returns the currently signed-in user or null.
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Throws an error if no user is signed in.
 * Use this guard at the top of any protected service call.
 */
function requireAuth() {
  if (!auth.currentUser) {
    throw new Error("AUTH_REQUIRED: User is not authenticated.");
  }
}

// ── Sign Up ──────────────────────────────────────────────────

/**
 * Creates a new Firebase Auth user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function signupUser(email, password) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("[authService] Sign-up successful:", credential.user.uid);
    return credential;
  } catch (error) {
    console.error("[authService] signupUser error:", error.code, error.message);
    throw error;
  }
}

// ── Login ────────────────────────────────────────────────────

/**
 * Signs an existing user in with email + password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function loginUser(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    console.log("[authService] Login successful:", credential.user.uid);
    return credential;
  } catch (error) {
    console.error("[authService] loginUser error:", error.code, error.message);
    throw error;
  }
}

// ── Logout ───────────────────────────────────────────────────

/**
 * Signs the current user out.
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  requireAuth();
  try {
    await signOut(auth);
    console.log("[authService] User signed out.");
  } catch (error) {
    console.error("[authService] logoutUser error:", error.code, error.message);
    throw error;
  }
}

// ── Auth State Observer ──────────────────────────────────────

/**
 * Subscribes to Firebase Auth state changes.
 * @param {(user: import("firebase/auth").User | null) => void} callback
 * @returns {() => void}  Unsubscribe function
 *
 * Usage:
 *   const unsubscribe = observeAuthState((user) => { ... });
 *   // Call unsubscribe() when no longer needed.
 */
export function observeAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("[authService] Auth state: signed in as", user.uid);
    } else {
      console.log("[authService] Auth state: signed out");
    }
    callback(user);
  });
}
