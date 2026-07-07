'use client';

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import {
  HomeIcon,
  PlayCircleIcon,
  MagnifyingGlassIcon,
  QueueListIcon,
  UserIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Squares2X2Icon,
  ChevronLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Dashboard", href: "/dashboard", icon: Squares2X2Icon },
  { name: "Feed", href: "/feed", icon: PlayCircleIcon },
  { name: "Search", href: "/search", icon: MagnifyingGlassIcon },
  { name: "Playlists", href: "/playlist", icon: QueueListIcon },
  { name: "Notes", href: "/notes", icon: DocumentTextIcon },
  { name: "AI Chat", href: "/chat", icon: ChatBubbleLeftRightIcon },
  { name: "Progress", href: "/progress", icon: ChartBarIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
  { name: "Settings", href: "/settings", icon: CogIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const {
    isCollapsed,
    setIsCollapsed,
    width,
    setWidth,
    isMobileOpen,
    setIsMobileOpen,
  } = useSidebar();

  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        setWidth(e.clientX);
      }
    },
    [isResizing, setWidth]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // Sidebar content component to reuse for desktop & mobile drawer
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-950/90 dark:bg-gray-900/60 backdrop-blur-lg border-r border-gray-200 dark:border-gray-800 relative group/sidebar">
      {/* Header section with toggle button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</span>

        {/* Collapse Button (Desktop) */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        {/* Close Button (Mobile) */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          title="Close Navigation"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)} // Auto-close drawer on link click
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/20 border-l-4 border-violet-400"
                  : "text-gray-400 hover:text-white hover:bg-violet-600/10 hover:border-l-4 hover:border-violet-500/50"
                }`}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Resizing handle (Desktop only) */}
      <div
        onMouseDown={startResizing}
        className="hidden md:block absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-violet-500/50 active:bg-violet-500 transition-colors z-30"
      />
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar — outer aside is a flex-layout width spacer */}
      <aside
        style={{
          width: isCollapsed ? "0px" : `${width}px`,
          transition: isResizing ? "none" : "width 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className={`hidden md:block h-full relative overflow-hidden flex-shrink-0 ${isCollapsed ? "border-r-0" : ""
          }`}
      >
        {/* Fixed inner container: pinned below navbar, spans to bottom of viewport */}
        <div
          className="fixed top-[57px] bottom-0 left-0 z-30 overflow-hidden"
          style={{
            width: isCollapsed ? "0px" : `${width}px`,
            transition: isResizing ? "none" : "width 250ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Constant-width wrapper prevents content from squishing during collapse animation */}
          <div className="h-full" style={{ width: `${width}px` }}>
            <SidebarContent />
          </div>
        </div>
      </aside>

      {/* 2. Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* 3. Mobile Sidebar Overlay Drawer */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-64 h-full transform transition-transform duration-300 ease-in-out ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
