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
  metadataBase: new URL('https://friendsof4.in'),
  title: {
    default: 'Friends of 4 | Style of Traditional',
    template: '%s | Friends of 4',
  },
  description: 'Premium traditional and contemporary fashion for every generation. Shop our exclusive collection of sarees, menswear, womenswear and jewellery.',
  keywords: ['traditional fashion', 'contemporary fashion', 'sarees', 'kurtas', 'jewellery', 'ethnic wear', 'indian fashion', 'premium clothing'],
  authors: [{ name: 'Friends of 4' }],
  creator: 'Friends of 4',
  publisher: 'Friends of 4',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Friends of 4 | Style of Traditional',
    description: 'Premium traditional and contemporary fashion for every generation. Discover exquisite collections today.',
    url: 'https://friendsof4.in',
    siteName: 'Friends of 4',
    images: [
      {
        url: '/images/logo.png',
        width: 800,
        height: 600,
        alt: 'Friends of 4 Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Friends of 4 | Style of Traditional',
    description: 'Premium traditional and contemporary fashion for every generation.',
    images: ['/images/logo.png'],
  },
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
  verification: {
    google: 'H8W4h5u-I9f6Xv4Vv4v4v4v4v4v4v4v4v4v4v4v4v4', // Placeholder - please replace with actual Search Console tag
  },
}

import { CartProvider } from '@/context/cart-context'
import { WishlistProvider } from '@/context/wishlist-context'
import { ToastProvider } from '@/context/toast-context'
import { FloatingConcierge } from '@/components/floating-concierge'

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
              <FloatingConcierge />
              <Analytics />
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
