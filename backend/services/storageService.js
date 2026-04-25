// ─────────────────────────────────────────────────────────────
//  storageService.js
//  Manages the Firebase Storage for CycleX
// ─────────────────────────────────────────────────────────────

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "../firebase/firebaseConfig.js";

function requireAuth() {
  if (!auth.currentUser) {
    throw new Error("AUTH_REQUIRED: User is not authenticated.");
  }
}

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 *
 * @param {File} file
 * @param {string} path - The folder path in storage
 * @returns {Promise<string>} Download URL
 */
export async function uploadImage(file, path = 'listings') {
  requireAuth();
  
  if (!file) throw new Error("uploadImage: file is required.");

  const uid = auth.currentUser.uid;
  const fileName = `${uid}_${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("[storageService] Image uploaded:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("[storageService] uploadImage error:", error);
    throw error;
  }
}
