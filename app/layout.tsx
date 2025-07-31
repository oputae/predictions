import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/app/providers/Web3Provider';
import { FarcasterProvider } from '@/app/providers/FarcasterProvider';
import { ToastProvider } from '@/app/providers/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Crypto Prediction Markets',
  description: 'Bet on cryptocurrency price movements with USDC on Base',
  openGraph: {
    title: 'Crypto Prediction Markets',
    description: 'Bet on cryptocurrency price movements with USDC on Base',
    images: ['/og-default.png'],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${process.env.NEXT_PUBLIC_URL}/api/frame/image`,
    'fc:frame:button:1': 'View Markets',
    'fc:frame:button:1:action': 'post',
    'fc:frame:button:1:target': `${process.env.NEXT_PUBLIC_URL}/api/frame/markets`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <FarcasterProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </FarcasterProvider>
        </Web3Provider>
      </body>
    </html>
  );
}