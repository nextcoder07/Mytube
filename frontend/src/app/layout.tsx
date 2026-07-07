// src/app/layout.tsx
import '@/styles/globals.css';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Providers } from '@/components/ui/Providers';
import MainContentWrapper from '@/components/layout/MainContentWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-gray-900 text-white" suppressHydrationWarning>
      <head>
        <title>MyTube – Personalized Learning</title>
        <meta name="description" content="AI‑powered personalized learning platform" />
      </head>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden relative">
              <MainContentWrapper>
                <div className="flex-1 p-4 lg:p-8">
                  {children}
                </div>
              </MainContentWrapper>
            </main>
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
