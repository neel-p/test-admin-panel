'use client'
import type { NextPage } from "next";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const UserList = dynamic(() => import('../UserList'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
});


const Page = () => {
  return (
      <UserList />
  );
};

export default Page;
