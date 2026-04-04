import type { Metadata } from 'next'
import { Noto_Serif, Inter, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LoadingScreen } from '@/components/loading-screen'
import './fonts.css'
import './globals.css'

const notoSerif = Noto_Serif({ subsets: ["latin"], variable: '--font-headline' });
const inter = Inter({ subsets: ["latin"], variable: '--font-body' });
const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display' 
});

export const metadata: Metadata = {
  title: 'Friends of 4 | Style of Tradition',
  description: 'Premium traditional and contemporary fashion for every generation',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

import { CartProvider } from '@/context/cart-context'
import { WishlistProvider } from '@/context/wishlist-context'
import { ToastProvider } from '@/context/toast-context'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${notoSerif.variable} ${inter.variable} ${cormorant.variable}`}>
       <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="font-body bg-[#fdf9f2] text-[#1c1c18] antialiased" style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <LoadingScreen />
              {children}
              <Analytics />
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
