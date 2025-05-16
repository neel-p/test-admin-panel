'use client';

import { useEffect, useRef } from 'react';
import { syncTokenToCookie } from '@/utils/secureStorage';
import { useRouter } from 'next/navigation';

export default function TokenSynchronizer() {
  const router = useRouter();
  const syncPerformed = useRef(false);

  useEffect(() => {
    // Only perform token check and sync once per session
    if (syncPerformed.current) return;
    
    // Check if token exists in localStorage
    const token = localStorage.getItem('user-token');
    
    if (!token) {
      // If no token in localStorage, redirect to login
      router.push('/auth/login');
      return;
    }
    
    // Sync localStorage token to cookie for server-side middleware
    syncTokenToCookie();
    syncPerformed.current = true;
  }, [router]);

  // This component doesn't render anything
  return null;
} 