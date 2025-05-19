import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { decrypt, encrypt } from "./cryptoUtils";
import { getDecryptedData } from "./secureStorage";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
	retryCount?: number;
}


const api1 = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL1,
  headers: {
    "Content-Type": "application/json",
  },
});

api1.interceptors.response.use(undefined, async (error: AxiosError) => {
	const config = error.config as CustomAxiosRequestConfig;

	// If we don't have a config or retry count is exceeded, reject
	if (!config || !config.retryCount) {
		return Promise.reject(error);
	}

	return api1(config);
});

// Add retry count to all requests
api1.interceptors.request.use((config: CustomAxiosRequestConfig) => {
	return config;
});

// Request interceptor
api1.interceptors.request.use(
  (config: any) => {
    try {
      const localData = getDecryptedData("user", "cookie");
      
      if (!localData?.uuid) {
        throw new Error("UUID not found in secure storage");
      }

      if (!localData?.token) {
        throw new Error("Authorization token not found");
      }

      // Always set headers
      const newConfig = {
        ...config,
        headers: {
          ...config.headers,
          "X-shield-id": btoa(localData.uuid),
          "Authorization": `Bearer ${localData.token}`,
        },
      };

      // Encrypt payload if data exists
      if (config.data) {
        const base64UUID = btoa(localData.uuid);
        const dataString = JSON.stringify(config.data.body);
        const encryptedData = encrypt(dataString, base64UUID);

        if (!encryptedData) {
          throw new Error("Failed to encrypt request payload");
        }

         newConfig.data = {
            body: encryptedData,
            header: {
              "X-shield-id": base64UUID
            }
		};
      }

      return newConfig;
    } catch (error) {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
api1.interceptors.response.use(
  (response: any) => {
    try {
      const localData = getDecryptedData("user", "cookie");
      
      if (!localData?.uuid) {
        throw new Error("UUID not found in secure storage");
      }

      const base64UUID = btoa(localData.uuid);
      const encryptedData = response.data.body;
      
      if (typeof encryptedData !== "string") {
        throw new Error("Invalid encrypted response format");
      }
      
      const decryptedData = decrypt(encryptedData, base64UUID);

      if (!decryptedData) {
        throw new Error("Failed to decrypt response");
      }
      return {
        ...response,
        data: JSON.parse(decryptedData),
      };
    } catch (error) {
      console.error("Response interceptor error:", error);
      const customError: any = new Error("Response processing failed");
      customError.isDecryptionError = true;
      return Promise.reject(customError);
    }
  },
  (error: AxiosError) => {
    // Handle HTTP errors
    if (error.response) {
      console.error("API Error Response:", error.response.data);
    }
	if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('user-token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api1;