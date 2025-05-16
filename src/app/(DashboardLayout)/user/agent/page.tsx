
'use client'
// import { Metadata } from "next";
import dynamic from 'next/dynamic';

const AgentList = dynamic(() => import('./AgentList'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
});

const page = () => {
  return (
      <AgentList />
  );
};

export default page;
