"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import React, { Suspense, useContext , memo} from "react";
import Sidebar from "./layout/vertical/sidebar/Sidebar";
import Header from "./layout/vertical/header/Header";
import  TokenSynchronizer from '@/app/components/TokenSynchronizer'
import { CustomizerContext } from "@/app/context/customizerContext";
import dynamic from "next/dynamic";
// Dynamically import components to reduce initial bundle size
// const Sidebar = dynamic(() => import("./layout/vertical/sidebar/Sidebar"), {
//   ssr: false
// });
// const Header = dynamic(() => import("./layout/vertical/header/Header"), {
//   ssr: false
// });



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
      {children}
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
	<Suspense>
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
	</Suspense>
  );
}

Layout.displayName = 'Layout';