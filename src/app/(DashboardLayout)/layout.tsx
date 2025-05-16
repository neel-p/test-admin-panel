"use client";
import React, { Suspense, useContext, memo } from "react";
import dynamic from "next/dynamic";
import { CustomizerContext } from "@/app/context/customizerContext";

// Dynamically import components to reduce initial bundle size
const Sidebar = dynamic(() => import("./layout/vertical/sidebar/Sidebar"), {
  loading: () => <Loader />,
  ssr: false
});

const Header = dynamic(() => import("./layout/vertical/header/Header"), {
  loading: () => <Loader />,
  ssr: false
});


const TokenSynchronizer = dynamic(() => import("@/app/components/TokenSynchronizer"), {
  ssr: false
});

const Loader = memo(() => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
));
Loader.displayName = 'Loader';

const ContentContainer = memo(({ 
  isLayout, 
  activeLayout, 
  children 
}: { 
  isLayout: string; 
  activeLayout: string; 
  children: React.ReactNode;
}) => (
  <div
    className={` ${isLayout == "full"
      ? "w-full py-[30px] md:px-[30px] px-5"
      : "container mx-auto py-[30px]"
      } ${activeLayout == "horizontal" ? 'xl:mt-3' : ''}
    `}
  >
    <Suspense fallback={<Loader />}>
      {children}
    </Suspense>
  </div>
));
ContentContainer.displayName = 'ContentContainer';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { activeLayout, isLayout } = useContext(CustomizerContext);
  
  return (
    <div className="flex w-full min-h-screen">
      <TokenSynchronizer />
      <div className="page-wrapper flex w-full">
        {activeLayout === "vertical" && (
          <Sidebar />
        )}
        <div className="body-wrapper w-full bg-lightgray dark:bg-dark">
          <Header layoutType={activeLayout === "horizontal" ? "horizontal" : "vertical"} />
          <ContentContainer isLayout={isLayout} activeLayout={activeLayout}>
            {children}
          </ContentContainer>
        </div>
      </div>
    </div>
  );
}