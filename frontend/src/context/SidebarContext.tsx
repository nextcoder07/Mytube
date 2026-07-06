'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  width: number;
  setWidth: (value: number) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsedState] = useState(false);
  const [width, setWidthState] = useState(256); // default 256px / w-64
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load configuration from localStorage on mount
  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem('sidebar_collapsed');
      if (savedCollapsed !== null) {
        setIsCollapsedState(JSON.parse(savedCollapsed));
      }
      const savedWidth = localStorage.getItem('sidebar_width');
      if (savedWidth !== null) {
        setWidthState(JSON.parse(savedWidth));
      }
    } catch (e) {
      console.warn('Failed to load sidebar settings from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  const setIsCollapsed = (value: boolean) => {
    setIsCollapsedState(value);
    try {
      localStorage.setItem('sidebar_collapsed', JSON.stringify(value));
    } catch (e) {
      console.warn('Failed to save sidebar_collapsed to localStorage:', e);
    }
  };

  const setWidth = (value: number) => {
    // Keep width within safe boundaries
    const clamped = Math.max(180, Math.min(480, value));
    setWidthState(clamped);
    try {
      localStorage.setItem('sidebar_width', JSON.stringify(clamped));
    } catch (e) {
      console.warn('Failed to save sidebar_width to localStorage:', e);
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed: isLoaded ? isCollapsed : false, // Avoid hydration mismatch
        setIsCollapsed,
        width: isLoaded ? width : 256,
        setWidth,
        isMobileOpen,
        setIsMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
