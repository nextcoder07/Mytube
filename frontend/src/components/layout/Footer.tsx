import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
      © {new Date().getFullYear()} MyTube. All rights reserved.
    </footer>
  );
}
