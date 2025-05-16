"use client"
import React, { createContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import config from './config'


// Define the shape of the context state
interface CustomizerContextState {
  selectedIconId: number;
  setSelectedIconId: (id: number) => void;
  activeDir: string;
  setActiveDir: (dir: string) => void;
  activeMode: string;
  setActiveMode: (mode: string) => void;
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  activeLayout: string;
  setActiveLayout: (layout: string) => void;
  isCardShadow: boolean;
  setIsCardShadow: (shadow: boolean) => void;
  isLayout: string;
  setIsLayout: (layout: string) => void;
  isBorderRadius: number;
  setIsBorderRadius: (radius: number) => void;
  isCollapse: string;
  setIsCollapse: (collapse: string) => void;
}

// Create the context with an initial value
export const CustomizerContext = createContext<CustomizerContextState | any>(undefined);

// Define the type for the children prop
interface CustomizerContextProps {
  children: ReactNode;
}
// Create the provider component
export const CustomizerContextProvider: React.FC<CustomizerContextProps> = ({ children }) => {
  const [selectedIconId, setSelectedIconId] = useState<number>(1);
  const [activeDir, setActiveDir] = useState<string>(config.activeDir);
  const [activeMode, setActiveMode] = useState<string>(config.activeMode);
  const [activeTheme, setActiveTheme] = useState<string>(config.activeTheme);
  const [activeLayout, setActiveLayout] = useState<string>(config.activeLayout);
  const [isCardShadow, setIsCardShadow] = useState<boolean>(config.isCardShadow);
  const [isLayout, setIsLayout] = useState<string>(config.isLayout);
  const [isBorderRadius, setIsBorderRadius] = useState<number>(config.isBorderRadius);
  const [isCollapse, setIsCollapse] = useState<string>(config.isCollapse);
  const [isLanguage, setIsLanguage] = useState<string>(config.isLanguage);

  // Memoize setter functions
  const setSelectedIconIdCallback = useCallback((id: number) => setSelectedIconId(id), []);
  const setActiveDirCallback = useCallback((dir: string) => setActiveDir(dir), []);
  const setActiveModeCallback = useCallback((mode: string) => setActiveMode(mode), []);
  const setActiveThemeCallback = useCallback((theme: string) => setActiveTheme(theme), []);
  const setActiveLayoutCallback = useCallback((layout: string) => setActiveLayout(layout), []);
  const setIsCardShadowCallback = useCallback((shadow: boolean) => setIsCardShadow(shadow), []);
  const setIsLayoutCallback = useCallback((layout: string) => setIsLayout(layout), []);
  const setIsBorderRadiusCallback = useCallback((radius: number) => setIsBorderRadius(radius), []);
  const setIsCollapseCallback = useCallback((collapse: string) => setIsCollapse(collapse), []);
  const setIsLanguageCallback = useCallback((lang: string) => setIsLanguage(lang), []);

  // Set attributes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      document.documentElement.setAttribute("class", activeMode);
      document.documentElement.setAttribute("dir", activeDir);
      document.documentElement.setAttribute('data-color-theme', activeTheme);
      document.documentElement.setAttribute("data-layout", activeLayout);
      document.documentElement.setAttribute("data-boxed-layout", isLayout);
      document.documentElement.setAttribute("data-sidebar-type", isCollapse);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [activeMode, activeDir, activeTheme, activeLayout, isLayout, isCollapse]);

  // Memoize context value
  const contextValue = useMemo(() => ({
    selectedIconId,
    setSelectedIconId: setSelectedIconIdCallback,
    activeDir,
    setActiveDir: setActiveDirCallback,
    activeMode,
    setActiveMode: setActiveModeCallback,
    activeTheme,
    setActiveTheme: setActiveThemeCallback,
    activeLayout,
    setActiveLayout: setActiveLayoutCallback,
    isCardShadow,
    setIsCardShadow: setIsCardShadowCallback,
    isLayout,
    setIsLayout: setIsLayoutCallback,
    isBorderRadius,
    setIsBorderRadius: setIsBorderRadiusCallback,
    isCollapse,
    setIsCollapse: setIsCollapseCallback,
    isLanguage,
    setIsLanguage: setIsLanguageCallback
  }), [
    selectedIconId, activeDir, activeMode, activeTheme, activeLayout,
    isCardShadow, isLayout, isBorderRadius, isCollapse, isLanguage,
    setSelectedIconIdCallback, setActiveDirCallback, setActiveModeCallback,
    setActiveThemeCallback, setActiveLayoutCallback, setIsCardShadowCallback,
    setIsLayoutCallback, setIsBorderRadiusCallback, setIsCollapseCallback,
    setIsLanguageCallback
  ]);

  return (
    <CustomizerContext.Provider value={contextValue}>
      {children}
    </CustomizerContext.Provider>
  );
};


