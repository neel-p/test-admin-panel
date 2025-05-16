// utils/auth.ts
import CryptoJS from "crypto-js";

const SECRET_KEY = "alris-admin-panel"; // should be env variable

export function encryptToken(token: string): string {
  return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
}

export function decryptToken(cipherText: string): string | null {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
}
