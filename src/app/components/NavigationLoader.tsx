'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let loadingTimeout: NodeJS.Timeout;
    
    // Start loading
    const startLoading = () => {
      setIsLoading(true);
      setProgress(0);
      
      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          // Progress incrementally, slowing down as it approaches 90%
          if (prevProgress >= 90) {
            return prevProgress; // Hold at 90% until complete
          }
          return Math.min(90, prevProgress + (10 - prevProgress / 10));
        });
      }, 100);
    };
    
    // Complete loading
    const completeLoading = () => {
      clearInterval(progressInterval);
      setProgress(100);
      
      // After reaching 100%, hide the loader
      const hideTimeout = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 500);
      
      return hideTimeout;
    };
    
    // Track all network requests (both fetch and XHR)
    let pendingFetchCount = 0;
    
    // 1. Track Fetch API requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      pendingFetchCount++;
      if (pendingFetchCount === 1) {
        startLoading();
      }
      
      return originalFetch.apply(this, args)
        .finally(() => {
          pendingFetchCount--;
          if (pendingFetchCount === 0) {
            completeLoading();
          }
        });
    } as typeof window.fetch;
    
    // 2. Track XMLHttpRequest requests
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(...args) {
      // Store the method to identify the request later
      (this as any)._method = args[0];
      return originalXHROpen.apply(this, args);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
      pendingFetchCount++;
      if (pendingFetchCount === 1) {
        startLoading();
      }
      
      // Handle response
      this.addEventListener('loadend', () => {
        pendingFetchCount--;
        if (pendingFetchCount === 0) {
          completeLoading();
        }
      });
      
      return originalXHRSend.apply(this, args);
    };
    
    // Add delay to prevent flashing for fast loads
    loadingTimeout = setTimeout(() => {
      if (pendingFetchCount > 0) {
        startLoading();
      }
    }, 100);
    
    return () => {
      // Cleanup
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
      clearInterval(progressInterval);
      clearTimeout(loadingTimeout);
    };
  }, [pathname, searchParams]); // Restart on route change

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
      <div 
        className="h-full bg-primary animate-loading-bar" 
        style={{ width: `${progress}%`, transition: 'width 0.2s ease-out' }}
      ></div>
    </div>
  );
} 