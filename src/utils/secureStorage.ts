import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

const SECRET_KEY = "alris-admin-panel"; // Preferably from ENV

type StorageType = "localStorage" | "cookie";

interface EncryptedPayload {
  value: string;
  expiresAt?: number; // timestamp
}

export function setEncryptedData(
  key: string,
  data: any,
  storage: StorageType = "localStorage",
  expiresInMinutes?: number
) {
  if (typeof window === "undefined") return;
  
  const payload: EncryptedPayload = {
    value: JSON.stringify(data),
  };

  if (expiresInMinutes) {
    const now = Date.now();
    payload.expiresAt = now + expiresInMinutes * 60 * 1000;
  }

  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    SECRET_KEY
  ).toString();

  if (storage === "localStorage") {
    localStorage.setItem(key, encrypted);
  } else {
    Cookies.set(key, encrypted, {
      expires: expiresInMinutes ? expiresInMinutes / 1440 : undefined, // cookie expiration in days
      secure: true,
      sameSite: "Strict",
    });
  }
}

export function getDecryptedData(
  key: string,
  storage: StorageType = "localStorage"
): any | null {
  if (typeof window === "undefined") return null;
  
  let encrypted = "";

  if (storage === "localStorage") {
    encrypted = localStorage.getItem(key) || "";
  } else {
    encrypted = Cookies.get(key) || "";
  }

  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    const payload: EncryptedPayload = JSON.parse(decrypted);

    // Expiry check
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      removeEncryptedData(key, storage);
      return null;
    }

    return JSON.parse(payload.value);
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
}

export function removeEncryptedData(
  key: string,
  storage: StorageType = "localStorage"
) {
  if (typeof window === "undefined") return;
  
  if (storage === "localStorage") {
    localStorage.removeItem(key);
  } else {
    Cookies.remove(key);
  }
}

export function removeStorage() {
  if (typeof window === "undefined") return;
  
  // Remove only project-specific localStorage items
  const projectKeys = ["user", "selectClient", 'user-token', 'client-storage'];
  projectKeys.forEach(key => {
    localStorage.removeItem(key);
  });

  // Remove only project-specific cookies
	const projectCookies = ["user", "selectClient", 'user-token', 'client-storage'];
  projectCookies.forEach(cookie => {
    Cookies.remove(cookie);
  });

  // Also remove any encrypted data using our encryption functions
  projectKeys.forEach(key => {
    removeEncryptedData(key, "localStorage");
  });
  Cookies.remove("user-token");
  projectCookies.forEach(cookie => {
    removeEncryptedData(cookie, "cookie");
  });
}

export function syncTokenToCookie() {
  if (typeof window === "undefined") return;
  
  // Check if cookie already exists to avoid unnecessary operations
  const existingCookie = Cookies.get("user-token");
  const token = localStorage.getItem("user-token");
  
  // Only set cookie if token exists and cookie doesn't match
  if (token && token !== existingCookie) {
    Cookies.set("user-token", token, {
      expires: 1, // 1 day
      secure: true,
      sameSite: "Strict",
    });
  }
}