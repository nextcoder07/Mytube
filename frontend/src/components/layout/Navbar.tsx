'use client';
// src/components/layout/Navbar.tsx
import React from "react";
import Link from "next/link";
import { MoonIcon, SunIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { useSidebar } from "@/context/SidebarContext";
import AuthButton from '@/components/auth/AuthButton';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-50 bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2 md:px-6">
        <div className="flex items-center space-x-2">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Desktop sidebar expand toggle (visible only when collapsed) */}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="hidden md:flex p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Expand Sidebar"
              aria-label="Expand sidebar"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 4.5v15m6-15v15m-12-3V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5z"
                />
              </svg>
            </button>
          )}

          <Link href="/" className="flex items-center space-x-2 ml-1">
            {//<Image src="/logo.svg" alt="Mytube" width={32} height={32} priority />}
}
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Mytube
            </span>
          </Link>
          <Link href="/auth" className="ml-4 hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-300 hover:underline">
            Sign in / Register
          </Link>
          <nav className="hidden md:flex items-center space-x-3 ml-4">
            <Link href="/auth" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Sign in</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <AuthButton />
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
