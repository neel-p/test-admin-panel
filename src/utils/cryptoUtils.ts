import CryptoJS from "crypto-js";

const SECRET_KEY: any = process.env.NEXT_PUBLIC_SECRET_KEY;

const generateKeyFromSecret = (): string => {
  const hash = CryptoJS.MD5(SECRET_KEY).toString();
  return hash.substring(0, 16);
};

const generateIVFromUUID = (base64UUID: string): string => {
  const plainUUID = CryptoJS.enc.Base64.parse(base64UUID).toString(
    CryptoJS.enc.Utf8
  );
  const hash = CryptoJS.MD5(plainUUID).toString();
  return hash.substring(16, 32);
};

export const encrypt = (value: string, base64UUID: string): string | null => {
  try {
    const keyString = generateKeyFromSecret();
    const ivString = generateIVFromUUID(base64UUID);

    const key = CryptoJS.enc.Utf8.parse(keyString);
    const iv = CryptoJS.enc.Utf8.parse(ivString);

    const encrypted = CryptoJS.AES.encrypt(value, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

export const decrypt = (
  encryptedValue: string,
  base64UUID: string
): string | null => {
  try {
    const keyString = generateKeyFromSecret();
    const ivString = generateIVFromUUID(base64UUID);

    const key = CryptoJS.enc.Utf8.parse(keyString);
    const iv = CryptoJS.enc.Utf8.parse(ivString);

    const decrypted = CryptoJS.AES.decrypt(encryptedValue, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};
