import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { LanguageProvider } from '@/context/LanguageContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Lydie & Elie — Wedding Invitation',
  description:
    'Join Lydie and Elie for an unforgettable celebration of love in Kinshasa.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
