// ─────────────────────────────────────────────────────────────
//  backend/index.js
//  Central export barrel — import everything from here
//  instead of individual service paths.
// ─────────────────────────────────────────────────────────────

// ── Firebase core instances ──────────────────────────────────
export { db, auth, storage } from "../lib/firebaseConfig.js";

// ── Authentication ────────────────────────────────────────────
export {
  signupUser,
  loginUser,
  logoutUser,
  observeAuthState,
  getCurrentUser,
} from "./authService.js";

// ── Users ─────────────────────────────────────────────────────
export {
  addUser,
  getUser,
  updateUser,
  deleteUser,
  listenToUser,
} from "./userService.js";

// ── Listings ──────────────────────────────────────────────────
export {
  addListing,
  getListing,
  getAllActiveListings,
  getMyListings,
  updateListing,
  deleteListing,
  listenToActiveListings,
  listenToMyListings,
} from "./listingService.js";

// ── Orders ────────────────────────────────────────────────────
export {
  ORDER_STATUS,
  placeOrder,
  updateOrderStatus,
  getOrder,
  getMyOrders,
  listenToMyOrders,
  listenToOrdersForListing,
  listenToSellerOrders,
} from "./orderService.js";

// ── Notifications ─────────────────────────────────────────────
export {
  sendNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  listenToMyNotifications,
  listenToUnreadCount,
} from "./notificationService.js";

// ── Storage ───────────────────────────────────────────────────
export {
  uploadImage,
} from "./storageService.js";
