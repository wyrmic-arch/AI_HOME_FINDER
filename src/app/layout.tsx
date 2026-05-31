import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

/*
 * Root layout — wraps every page.
 *
 * - Inter font for clean, professional typography
 * - Metadata for SEO (refined in V2 with dynamic OG images)
 * - Global background and text colors applied at the body level
 */
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Home Finder',
  description:
    'Find affordable housing near your workplace — powered by smart matching for the South African market.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
