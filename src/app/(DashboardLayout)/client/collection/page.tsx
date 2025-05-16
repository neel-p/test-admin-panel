'use client'
// import { Metadata } from "next";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';


// Lazy load the ClientForm component
const CollectionListTab = dynamic(() => import('./CollectionListTab'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
});


const page = () => {
  return (
      <CollectionListTab />
  );
};

export default page;
