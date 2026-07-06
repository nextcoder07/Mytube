'use client';
// src/components/ui/Providers.tsx
import React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

import { SidebarProvider } from '@/context/SidebarContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
