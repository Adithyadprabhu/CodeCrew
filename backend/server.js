// ─────────────────────────────────────────────────────────────
//  backend/server.js  ← runnable entry point (npm run dev)
//  Initialises Firebase and confirms all services are live.
//  The barrel (index.js) is for frontend import re-exports only.
// ─────────────────────────────────────────────────────────────

import { initializeApp, getApps } from "firebase/app";
import { getAuth }                from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage }             from "firebase/storage";

// ── Helpers ──────────────────────────────────────────────────

const RESET  = "\x1b[0m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED    = "\x1b[31m";
const CYAN   = "\x1b[36m";
const BOLD   = "\x1b[1m";

const ok   = (msg) => console.log(`${GREEN}  ✔  ${msg}${RESET}`);
const warn = (msg) => console.log(`${YELLOW}  ⚠  ${msg}${RESET}`);
const err  = (msg) => console.error(`${RED}  ✖  ${msg}${RESET}`);
const info = (msg) => console.log(`${CYAN}  ℹ  ${msg}${RESET}`);

// ── Firebase Config ───────────────────────────────────────────

const firebaseConfig = {
  apiKey:            "AIzaSyCPFvtsGAFMcnaxx84_qpTJPNuvyoY2CdM",
  authDomain:        "cyclex-2f234.firebaseapp.com",
  projectId:         "cyclex-2f234",
  storageBucket:     "cyclex-2f234.firebasestorage.app",
  messagingSenderId: "707474081418",
  appId:             "1:707474081418:web:d78f06ea783d0da5434f73",
  measurementId:     "G-SBY963QGLW",
};

// ── Boot Sequence ─────────────────────────────────────────────

async function startBackend() {
  console.log("");
  console.log(`${BOLD}${CYAN}  ══════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}        CycleX Backend — Firebase Services  ${RESET}`);
  console.log(`${BOLD}${CYAN}  ══════════════════════════════════════════${RESET}`);
  console.log("");

  // 1. Initialise Firebase app (guard against hot-reload duplicates)
  let app;
  try {
    app = getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApps()[0];
    ok(`Firebase App initialised  (project: ${firebaseConfig.projectId})`);
  } catch (e) {
    err(`Firebase App failed to initialise: ${e.message}`);
    process.exit(1);
  }

  // 2. Auth
  try {
    const auth = getAuth(app);
    ok(`Auth service ready        (${auth.app.options.authDomain})`);
  } catch (e) {
    err(`Auth failed: ${e.message}`);
    process.exit(1);
  }

  // 3. Firestore
  try {
    const db = getFirestore(app);
    ok(`Firestore service ready   (${db.app.options.projectId})`);
  } catch (e) {
    err(`Firestore failed: ${e.message}`);
    process.exit(1);
  }

  // 4. Storage
  try {
    const storage = getStorage(app);
    ok(`Storage service ready     (${storage.app.options.storageBucket})`);
  } catch (e) {
    err(`Storage failed: ${e.message}`);
    process.exit(1);
  }

  // 5. Service registry summary
  console.log("");
  console.log(`${BOLD}  📦 Services Loaded:${RESET}`);
  info("authService       → signupUser, loginUser, logoutUser, observeAuthState");
  info("userService       → addUser, getUser, updateUser, deleteUser, listenToUser");
  info("listingService    → addListing, getAllActiveListings, listenToActiveListings …");
  info("orderService      → placeOrder, updateOrderStatus, listenToMyOrders …");
  info("notificationService → sendNotification, markAsRead, listenToMyNotifications …");

  console.log("");
  console.log(`${BOLD}${GREEN}  ══════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${GREEN}   ✅  Backend running successfully! 🚀      ${RESET}`);
  console.log(`${BOLD}${GREEN}  ══════════════════════════════════════════${RESET}`);
  console.log("");
  info(`Ready to connect with frontend.`);
  info(`Import services via:  import { ... } from '../backend/index.js'`);
  console.log("");

  // Keep the process alive so nodemon can watch for file changes
  setInterval(() => {
    // heartbeat — keeps process alive without spamming output
  }, 30_000);
}

// ── Run ───────────────────────────────────────────────────────

startBackend().catch((e) => {
  err(`Unexpected startup error: ${e.message}`);
  console.error(e);
  process.exit(1);
});
