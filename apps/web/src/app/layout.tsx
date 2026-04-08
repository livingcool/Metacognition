import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { LivingBackground } from '@/components/LivingBackground';
import '../styles/globals.css';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Mirror — Metacognition Machine',
  description: 'Grounded intelligence for self-directed reflection.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable}`}>
        <body className="font-sans bg-[#000000] text-slate-100 selection:bg-violet-500/30 overflow-x-hidden antialiased">
          <LivingBackground />
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
