'use client';

import dynamic from "next/dynamic";

// Import NavigationLoader with no SSR to avoid hydration issues
const NavigationLoader = dynamic(
  () => import("./NavigationLoader"),
  { ssr: false }
);

export default function NavigationLoaderWrapper() {
  return <NavigationLoader />;
} 