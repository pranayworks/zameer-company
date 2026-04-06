'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { CartDrawer } from './cart-drawer'
import { SearchOverlay } from './search-overlay'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Men', href: '/men' },
  { label: 'Women', href: '/women' },
  { label: 'Sarees', href: '/sarees' },
  { label: 'Jewellery', href: '/jewellery' }
]

export function Header() {
  const [activeNav, setActiveNav] = useState('')
  const { isCartOpen, setIsCartOpen, totalItems } = useCart()
  const { wishlist } = useWishlist()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Sync active navigation with current route
  const pathname = usePathname()
  useEffect(() => {
    const current = navItems.find(item => item.href === pathname)
    if (current) setActiveNav(current.label)
    else setActiveNav('Home')
  }, [pathname])

  // Redirect to home on refresh - only happens once per session!
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if we already did our 'first-time' session redirect
    const hasRefreshedThisSession = sessionStorage.getItem('atelier_session_init');
    
    if (!hasRefreshedThisSession) {
      // Modern way to check for reload/refresh
      const navEntries = window.performance?.getEntriesByType('navigation');
      const isReload = navEntries && navEntries[0] && (navEntries[0] as any).type === 'reload';
      
      // Fallback for older browsers
      const isTypeReload = window.performance?.navigation?.type === 1;

      if ((isReload || isTypeReload) && pathname !== '/') {
        sessionStorage.setItem('atelier_session_init', 'true');
        window.location.href = '/';
        return;
      }
      
      // If they are on home or it wasn't a reload, mark session as initialized anyway!
      sessionStorage.setItem('atelier_session_init', 'true');
    }
  }, [pathname])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] glass-header">
      <nav className="flex justify-between items-center w-full px-4 md:px-12 py-3 md:py-6 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-4 md:gap-12">
          {/* Mobile Hamburger Button */}
          <button 
            className="md:hidden relative z-[100] text-[#1c1b1b] mr-2 p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-3xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <Link 
            href="/" 
            className="flex items-center gap-3 transition-colors group cursor-pointer"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-24 h-24 md:w-40 md:h-40 shrink-0"
            >
              <Image src="/logo.png" alt="Friends of 4 Logo" fill className="object-contain" />
            </motion.div>
            <motion.div
               whileHover={{ x: 2 }}
               className="flex flex-col max-w-[180px] sm:max-w-none"
            >
              <span className="text-xl sm:text-3xl md:text-4xl font-headline tracking-tighter text-[#1c1b1b] leading-tight mb-1 truncate sm:overflow-visible">
                Style Of Tradition
              </span>
              <span className="text-xs md:text-base font-body font-black tracking-[0.3em] uppercase text-[#a3851a] leading-none">
                Friends of 4
              </span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href}
                className={`font-body uppercase tracking-widest text-xs transition-colors duration-300 relative pb-1 cursor-pointer ${
                  activeNav === item.label
                    ? 'text-[#1c1b1b] border-b border-[#1c1b1b]'
                    : 'text-[#747878] hover:text-[#1c1c18] border-b border-transparent'
                }`}
                onClick={() => setActiveNav(item.label)}
              >
                 <motion.span whileHover={{ y: -2, display: 'inline-block' }}>
                   {item.label}
                 </motion.span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <motion.button 
             onClick={() => setIsSearchOpen(true)}
             className="text-[#1c1b1b] hover:text-[#a3851a] transition-colors"
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.95 }}
          >
            <span className="material-symbols-outlined text-2xl">search</span>
          </motion.button>

          <Link href="/account?tab=wishlist">
            <motion.div 
              className="text-[#1c1b1b] hover:text-[#a3851a] transition-colors relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="material-symbols-outlined text-2xl">favorite</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </motion.div>
          </Link>
          
          <motion.button 
            onClick={() => setIsCartOpen(true)}
            className="text-[#1c1b1b] hover:text-[#a3851a] transition-colors relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#a3851a] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </motion.button>

          <Link href="/account">
            <motion.div 
              className="text-[#1c1b1b] hover:text-[#a3851a] transition-colors cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="material-symbols-outlined text-xl md:text-2xl">person</span>
            </motion.div>
          </Link>
        </div>
      </nav>


      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div 
              className="absolute top-full left-0 right-0 min-h-screen z-[-1] bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Full Width Dropdown Menu */}
            <motion.div 
              className="absolute top-full left-0 right-0 w-full z-[100] bg-[#fdf9f2] flex flex-col px-8 py-8 shadow-2xl border-t border-[#1c1b1b]/10 origin-top"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0, scaleY: 0.95, y: -10 },
                visible: { 
                  opacity: 1, 
                  scaleY: 1, 
                  y: 0, 
                  transition: { duration: 0.3, ease: "easeOut", staggerChildren: 0.08, delayChildren: 0.1 } 
                },
                exit: { 
                  opacity: 0, scaleY: 0.95, y: -10, 
                  transition: { duration: 0.2 } 
                }
              }}
            >
              <div className="flex flex-col gap-6">
                {navItems.map((item) => (
                  <motion.div
                    key={item.label}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
                    }}
                  >
                    <Link 
                      href={item.href}
                      className="font-headline text-2xl text-[#1c1b1b] border-b border-[#1c1b1b]/10 pb-4 block"
                      onClick={() => {
                        setActiveNav(item.label)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="mt-8 pt-6 border-t border-[#1c1b1b]/10 flex flex-col gap-5 text-[#747878] font-body uppercase tracking-widest text-xs"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.4 } }
                }}
              >
                <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>Account</Link>
                <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>Track Order</Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </header>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      <SearchOverlay 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  )
}
