import { CustomizerContextProvider } from "@/app/context/customizerContext";
import customTheme from "@/utils/theme/custom-theme";
import { Flowbite, ThemeModeScript } from "flowbite-react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import { ToastProvider } from "./components/toast/ToastManager";
import "./css/globals.css";
import TokenSync from "./components/TokenSync";
import NextTopLoader from "nextjs-toploader";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alris Admin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta />
        <ThemeModeScript />
      </head>
      <body className={`${inter.className}`}>
        <Flowbite theme={{ theme: customTheme }}>
			{/* <NextTopLoader    color="var(--color-primary)"
        showSpinner={false}
        height={3}
        speed={200}
        crawlSpeed={100}
        showAtBottom={false} /> */}
          <CustomizerContextProvider>
            <ToastProvider>
              <TokenSync />
              {children}
            </ToastProvider>
          </CustomizerContextProvider>
        </Flowbite>
      </body>
    </html>
  );
}
