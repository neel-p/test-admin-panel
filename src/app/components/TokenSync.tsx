"use client";

import { useEffect } from "react";
import { syncTokenToCookie } from "@/utils/secureStorage";

export default function TokenSync() {
  useEffect(() => {
    // Sync token on initial load
    syncTokenToCookie();

    // Set up event listener for storage changes (when token changes in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user-token") {
        syncTokenToCookie();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // This component doesn't render anything
  return null;
} 