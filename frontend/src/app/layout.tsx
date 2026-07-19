import '@/styles/globals.css';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Providers } from '@/components/ui/Providers';
import MainContentWrapper from '@/components/layout/MainContentWrapper';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'MyTube – Personalized Learning',
    template: '%s | MyTube',
  },
  description: 'AI‑powered personalized learning platform',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://mytube.example.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MyTube – Personalized Learning',
    description: 'AI‑powered personalized learning platform',
    type: 'website',
    locale: 'en_US',
    siteName: 'MyTube',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyTube – Personalized Learning',
    description: 'AI‑powered personalized learning platform',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full bg-gray-900 text-white`} suppressHydrationWarning>
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
