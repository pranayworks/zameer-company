'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { useMode, BrandMode } from '@/context/mode-context'
import { Search, Heart, ShoppingBag, X, Menu, SlidersHorizontal, LayoutGrid, Sparkles, MessageCircleCode, Truck, User } from 'lucide-react'
import { CartDrawer } from '@/components/cart-drawer'
import { SearchOverlay } from '@/components/search-overlay'
import { WishlistDrawer } from '@/components/wishlist-drawer'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { cart = [] } = useCart()
  const { wishlist = [] } = useWishlist()
  const { mode, setMode, modeDetails } = useMode()

  const handleModeChange = (targetMode: BrandMode) => {
    setMode(targetMode)
    if (pathname && pathname.startsWith('/product/')) {
      router.push('/shop')
    }
  }
  
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0)
  const wishlistCount = wishlist.length

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const modeOptions: { id: BrandMode; label: string }[] = [
    { id: 'streetwear', label: 'STREETWEAR' },
    { id: 'archive', label: 'LUXURY ARCHIVE' },
    { id: 'traditional', label: 'TRADITIONAL' }
  ]

  const handleWhatsAppClick = () => {
    const phoneNumber = '9550447883'
    const message = encodeURIComponent('Hi friends of 4 . i need your help')
    window.open(`https://wa.me/91${phoneNumber}?text=${message}`, '_blank')
  }

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out text-[#F4F1EA]"
        style={{
          backgroundColor: isScrolled ? modeDetails.headerBg : 'transparent',
          borderBottom: isScrolled ? `1px solid ${modeDetails.borderColor}` : '1px solid transparent',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          paddingTop: isScrolled ? '0.75rem' : '1.15rem',
          paddingBottom: isScrolled ? '0.75rem' : '1.15rem',
          boxShadow: isScrolled ? '0 20px 40px rgba(0,0,0,0.5)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* LEFT: BRAND WORDMARK & DYNAMIC TAGLINE */}
          <Link href="/" className="group flex flex-col items-start">
            <span className="font-serif-editorial text-2xl sm:text-3xl tracking-[0.25em] font-light uppercase transition-colors duration-300">
              FRIENDS OF 4
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={mode}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.25 }}
                className="text-[9px] sm:text-[10px] tracking-[0.4em] uppercase font-medium font-sans transition-colors duration-500"
                style={{ color: modeDetails.accentColor }}
              >
                {modeDetails.tagline}
              </motion.span>
            </AnimatePresence>
          </Link>

          {/* CENTER: 3-MODE ECOSYSTEM SWITCHER (DESKTOP) */}
          <div 
            className="hidden lg:flex items-center p-1 rounded-full shadow-inner transition-colors duration-700"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.4)',
              border: `1px solid ${modeDetails.borderColor}`
            }}
          >
            {modeOptions.map((item) => {
              const isActive = mode === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleModeChange(item.id)}
                  className={`relative px-5 py-1.5 text-[11px] font-medium tracking-[0.2em] uppercase transition-all duration-300 rounded-full cursor-pointer ${
                    isActive ? 'font-semibold' : 'text-[#D6CEBE]/70 hover:text-[#F4F1EA]'
                  }`}
                  style={{ color: isActive ? modeDetails.themeBg : undefined }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeModePill"
                      className="absolute inset-0 rounded-full shadow-md"
                      style={{ backgroundColor: modeDetails.accentColor }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* RIGHT: ESSENTIAL ACTIONS */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* LIVE ORDER TRACKING LINK */}
            <Link
              href="/track-order"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1 text-[10px] font-mono tracking-wider uppercase font-bold rounded-full border transition-all hover:opacity-90"
              style={{ borderColor: modeDetails.borderColor, color: modeDetails.accentColor }}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>TRACK ORDER</span>
            </Link>

            {/* USER PROFILE LINK */}
            <Link
              href="/profile"
              className="p-1.5 text-[#F4F1EA] transition-colors relative hover:opacity-80 cursor-pointer flex items-center"
              aria-label="My Account & Orders"
              title="My Atelier Profile & Orders"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>
            
            {/* SEARCH TRIGGER */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 text-[#F4F1EA] transition-colors flex items-center space-x-1 hover:opacity-80 cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* WISHLIST DRAWER TRIGGER */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-1.5 text-[#F4F1EA] transition-colors relative hover:opacity-80 cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
              {wishlistCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow"
                  style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* BAG TRIGGER */}
            <button
              id="header-bag-button"
              onClick={() => setIsCartOpen(true)}
              className="group relative flex items-center space-x-2 px-3.5 py-1.5 transition-all duration-300 rounded-full cursor-pointer"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: `1px solid ${modeDetails.borderColor}`
              }}
            >
              <ShoppingBag 
                className="w-4 h-4 stroke-[1.75] transition-colors"
                style={{ color: modeDetails.accentColor }}
              />
              <span className="text-[10px] font-semibold tracking-[0.15em] text-[#F4F1EA] uppercase font-mono">
                BAG ({cartCount})
              </span>
            </button>

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#F4F1EA] cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE OVERLAY NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 pt-28 px-6 flex flex-col justify-between pb-24 text-[#F4F1EA] overflow-y-auto"
            style={{ backgroundColor: modeDetails.themeBg }}
          >
            <div className="space-y-6">
              <div className="border-b pb-4" style={{ borderColor: modeDetails.borderColor }}>
                <p 
                  className="text-[10px] font-mono tracking-[0.3em] uppercase mb-1 font-semibold"
                  style={{ color: modeDetails.accentColor }}
                >
                  ACTIVE ECOSYSTEM MODE
                </p>
                <p className="font-serif-editorial text-2xl uppercase text-[#F4F1EA] font-bold">
                  {modeOptions.find(m => m.id === mode)?.label}
                </p>
              </div>

              {/* MOBILE MENU LINKS */}
              <nav className="flex flex-col space-y-4 font-serif-editorial text-2xl uppercase tracking-[0.1em]">
                <Link 
                  href="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:opacity-80 py-1 border-b"
                  style={{ borderColor: `${modeDetails.borderColor}30` }}
                >
                  HOME ARCHIVE
                </Link>
                <Link 
                  href="/shop" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:opacity-80 py-1 border-b"
                  style={{ borderColor: `${modeDetails.borderColor}30` }}
                >
                  ALL COLLECTIONS
                </Link>
                <Link 
                  href="/track-order" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:opacity-80 py-1 border-b flex items-center justify-between font-mono font-bold"
                  style={{ color: modeDetails.accentColor, borderColor: `${modeDetails.borderColor}30` }}
                >
                  <span>LIVE ORDER TRACKING</span>
                  <Truck className="w-4 h-4" />
                </Link>
                <Link 
                  href="/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:opacity-80 py-1 border-b flex items-center justify-between font-mono font-bold"
                  style={{ color: modeDetails.accentColor, borderColor: `${modeDetails.borderColor}30` }}
                >
                  <span>MY PROFILE & ORDERS</span>
                  <User className="w-4 h-4" />
                </Link>
                <Link 
                  href="/visionaries" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:opacity-80 py-1 border-b"
                  style={{ borderColor: `${modeDetails.borderColor}30` }}
                >
                  VISIONARIES & ATELIER
                </Link>
                <Link 
                  href="/contact" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:opacity-80 py-1 border-b"
                  style={{ borderColor: `${modeDetails.borderColor}30` }}
                >
                  CONTACT & SUPPORT
                </Link>
                <Link 
                  href="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:opacity-80 py-1 border-b text-xs font-mono font-bold"
                  style={{ color: modeDetails.accentColor, borderColor: `${modeDetails.borderColor}30` }}
                >
                  COMMAND CENTER (ADMIN)
                </Link>
              </nav>

              {/* CONCIERGE WHATSAPP DIRECT BUTTON */}
              <button
                onClick={handleWhatsAppClick}
                className="w-full py-3.5 px-4 rounded-xl border flex items-center justify-center gap-3 font-mono text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
                style={{ backgroundColor: '#25D366', color: '#FFFFFF', borderColor: '#25D366' }}
              >
                <MessageCircleCode className="w-5 h-5" />
                <span>WHATSAPP CONCIERGE (9550447883)</span>
              </button>
            </div>

            <div className="border-t pt-6 text-center space-y-1 font-mono" style={{ borderColor: modeDetails.borderColor }}>
              <p className="text-[10px] text-[#D6CEBE]/70 uppercase tracking-[0.2em]">
                INDEPENDENT INDIAN D2C LUXURY FASHION HOUSE
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: modeDetails.accentColor }}>
                FRIENDS OF 4 © {new Date().getFullYear()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINIMALIST SEARCH OVERLAY */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* WISHLIST DRAWER */}
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

      {/* CART DRAWER */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* REDESIGNED MOBILE BOTTOM FLOATING DOCK (PERFECT PHONE UX & THUMB ACCESSIBILITY) */}
      <div className="lg:hidden fixed bottom-3 left-4 right-4 z-40">
        <div 
          className="backdrop-blur-xl border rounded-full py-2.5 px-4 flex items-center justify-between shadow-2xl transition-colors duration-700"
          style={{
            backgroundColor: `${modeDetails.cardBg}F0`,
            borderColor: modeDetails.accentColor,
            boxShadow: `0 10px 30px ${modeDetails.glowColor}`
          }}
        >
          {/* 1-TAP MODE TOGGLE */}
          <button
            onClick={() => {
              const nextMode: BrandMode = mode === 'streetwear' ? 'archive' : mode === 'archive' ? 'traditional' : 'streetwear'
              handleModeChange(nextMode)
            }}
            className="flex items-center space-x-1 px-3 py-1 rounded-full border text-[10px] font-mono tracking-wider uppercase font-bold cursor-pointer transition-all"
            style={{
              backgroundColor: modeDetails.accentColor,
              color: modeDetails.themeBg,
              borderColor: modeDetails.accentColor
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{mode.slice(0, 6)}</span>
          </button>

          {/* SHOP COLLECTION LINK */}
          <Link
            href="/shop"
            className="flex flex-col items-center text-[#F4F1EA] hover:opacity-80"
          >
            <LayoutGrid className="w-4 h-4 stroke-[1.75]" />
            <span className="text-[8px] font-mono tracking-wider uppercase">SHOP</span>
          </Link>

          {/* SEARCH TRIGGER */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center text-[#F4F1EA] hover:opacity-80 cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[1.75]" />
            <span className="text-[8px] font-mono tracking-wider uppercase">SEARCH</span>
          </button>

          {/* WISHLIST DRAWER TRIGGER */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative flex flex-col items-center text-[#F4F1EA] hover:opacity-80 cursor-pointer"
          >
            <Heart className="w-4 h-4 stroke-[1.75]" />
            <span className="text-[8px] font-mono tracking-wider uppercase">WISHLIST</span>
            {wishlistCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
              >
                {wishlistCount}
              </span>
            )}
          </button>

          {/* BAG DRAWER TRIGGER */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex flex-col items-center text-[#F4F1EA] hover:opacity-80 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
            <span className="text-[8px] font-mono tracking-wider uppercase font-bold">BAG</span>
            {cartCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
