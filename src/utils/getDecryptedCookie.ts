// utils/getDecryptedCookie.ts
import { cookies } from 'next/headers';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'alris-admin-panel'; // Must match your encryption key

export async function getDecryptedCookie(key: string) {
	const cookieStore: any = await cookies();
	const encrypted = cookieStore.get(key)?.value;

	if (!encrypted) {
		console.error('Cookie not found:', key);
		return null;
	}

	try {
		const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
		const decrypted = bytes.toString(CryptoJS.enc.Utf8);
		
		if (!decrypted) {
			console.error('Decryption resulted in empty string');
			return null;
		}

		try {
			const payload = JSON.parse(decrypted);
			
			// Check expiration
			if (payload.expiresAt && Date.now() > payload.expiresAt) {
				console.error('Cookie expired:', new Date(payload.expiresAt));
				return null;
			}

			try {
				return JSON.parse(payload.value);
			} catch (err) {
				console.error('Failed to parse payload value:', err);
				return null;
			}
		} catch (err) {
			console.error('Failed to parse decrypted data:', err, 'Decrypted string:', decrypted);
			return null;
		}
	} catch (err) {
		console.error('Cookie decryption failed:', err);
		return null;
	}
}
