// ─────────────────────────────────────────────────────────────
//  backend/index.js
//  Central export barrel — import everything from here
//  instead of individual service paths.
// ─────────────────────────────────────────────────────────────

// ── Firebase core instances ──────────────────────────────────
export { db, auth, storage } from "./firebase/firebaseConfig.js";

// ── Authentication ────────────────────────────────────────────
export {
  signupUser,
  loginUser,
  logoutUser,
  observeAuthState,
  getCurrentUser,
} from "./services/authService.js";

// ── Users ─────────────────────────────────────────────────────
export {
  addUser,
  getUser,
  updateUser,
  deleteUser,
  listenToUser,
} from "./services/userService.js";

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
} from "./services/listingService.js";

// ── Orders ────────────────────────────────────────────────────
export {
  ORDER_STATUS,
  placeOrder,
  updateOrderStatus,
  getOrder,
  getMyOrders,
  listenToMyOrders,
  listenToOrdersForListing,
} from "./services/orderService.js";

// ── Notifications ─────────────────────────────────────────────
export {
  sendNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  listenToMyNotifications,
  listenToUnreadCount,
} from "./services/notificationService.js";

// ── Storage ───────────────────────────────────────────────────
export {
  uploadImage,
} from "./services/storageService.js";
