// src/components/layout/Sidebar.tsx
import React from "react";
import Link from "next/link";
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
  return (
    <aside className="hidden md:block w-64 bg-gray-900/40 backdrop-blur-lg border-r border-gray-800 overflow-y-auto">
      <nav className="flex flex-col p-4 space-y-1.5">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-violet-600/20 hover:text-white hover:border-l-4 hover:border-violet-500 transition-all duration-200"
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
