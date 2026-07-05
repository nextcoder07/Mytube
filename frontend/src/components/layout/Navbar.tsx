'use client';
// src/components/layout/Navbar.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="sticky top-0 z-50 bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="Mytube" width={32} height={32} priority />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Mytube
          </span>
        </Link>
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
      </nav>
    </header>
  );
}
