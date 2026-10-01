import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond, Orbitron, Italiana, Rozha_One } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LoadingScreen } from '@/components/loading-screen'
import './fonts.css'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"], 
  variable: '--font-body' 
})

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display' 
})

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-streetwear'
})

const italiana = Italiana({
  subsets: ["latin"],
  weight: ['400'],
  variable: '--font-luxury'
})

const rozha = Rozha_One({
  subsets: ["latin"],
  weight: ['400'],
  variable: '--font-traditional'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://friendsof4.in'),
  title: {
    default: 'Friends of 4 | Style of Tradition',
    template: '%s | Friends of 4',
  },
  description: 'Independent Indian D2C Luxury Fashion House. Avant-garde minimalist meets tactile heritage across Streetwear, Luxury Archive, and Traditional curations.',
  keywords: ['Friends of 4', 'Luxury Fashion', 'Indian Streetwear', 'Traditional Heritage', 'Avant-Garde Fashion', 'Style of Tradition', 'Architectural Sarees', 'Heavyweight Tees'],
  authors: [{ name: 'Friends of 4' }],
  creator: 'Friends of 4',
  publisher: 'Friends of 4',
  openGraph: {
    title: 'Friends of 4 | Style of Tradition',
    description: 'Independent Indian D2C Luxury Fashion House.',
    url: 'https://friendsof4.in',
    siteName: 'Friends of 4',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Friends of 4 | Style of Tradition',
    description: 'Independent Indian D2C Luxury Fashion House.',
  }
}

import { CartProvider } from '@/context/cart-context'
import { WishlistProvider } from '@/context/wishlist-context'
import { ToastProvider } from '@/context/toast-context'
import { ModeProvider } from '@/context/mode-context'
import { ConciergeButton } from '@/components/concierge-button'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${orbitron.variable} ${italiana.variable} ${rozha.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Italiana&family=Rozha+One&family=Orbitron:wght@400;500;600;700;800;900&family=Chakra+Petch:wght@400;600;700&display=swap" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="font-body bg-[#F4F1EA] text-[#0F0F0F] antialiased paper-texture" style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}>
        <ModeProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <LoadingScreen />
                {children}
                <ConciergeButton />
                <Analytics />
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </ModeProvider>
      </body>
    </html>
  )
}
