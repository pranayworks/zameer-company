'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/cart-context'
import { useMode } from '@/context/mode-context'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart = [], removeFromCart, updateQuantity, subtotal = 0 } = useCart()
  const { modeDetails } = useMode()
  const [promoCode, setPromoCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')

  const freeShippingThreshold = 10000
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100)
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (promoCode.toUpperCase() === 'ARCHIVE10') {
      setAppliedDiscount(subtotal * 0.1)
      setPromoError('')
    } else {
      setPromoError('Invalid promo code. Try ARCHIVE10')
    }
  }

  const finalTotal = Math.max(0, subtotal - appliedDiscount)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          />

          {/* SLIDE-OUT DRAWER */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-[101] h-full w-full max-w-md text-[#F4F1EA] shadow-2xl flex flex-col border-l transition-colors duration-700 dark-paper-texture"
            style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
          >
            {/* DRAWER HEADER */}
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: modeDetails.borderColor }}>
              <div>
                <h2 className="font-serif-editorial text-2xl tracking-[0.2em] font-light uppercase text-[#F4F1EA]">
                  YOUR BAG
                </h2>
                <p className="text-[10px] tracking-[0.3em] uppercase font-semibold" style={{ color: modeDetails.accentColor }}>
                  {cart.length} DISTINCT PIECES
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#D6CEBE] hover:opacity-80 transition-colors"
                aria-label="Close Bag"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* LIVE FREE SHIPPING PROGRESS BAR */}
            <div className="p-4 border-b" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-[#D6CEBE]">
                  {remainingForFreeShipping > 0
                    ? `Add ₹${remainingForFreeShipping.toLocaleString('en-IN')} for Free Express Worldwide Delivery`
                    : '🎉 You have unlocked Free Express Worldwide Delivery!'}
                </span>
                <span className="font-mono text-[11px] font-bold" style={{ color: modeDetails.accentColor }}>
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full"
                  style={{ backgroundColor: modeDetails.accentColor }}
                />
              </div>
            </div>

            {/* DRAWER BODY / ITEM LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y" style={{ borderColor: modeDetails.borderColor }}>
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <span className="material-symbols-outlined text-5xl opacity-50" style={{ color: modeDetails.accentColor }}>
                    shopping_bag
                  </span>
                  <p className="font-serif-editorial text-xl tracking-[0.15em] text-[#D6CEBE]">
                    YOUR BAG IS EMPTY
                  </p>
                  <p className="text-xs text-[#D6CEBE]/60 max-w-xs">
                    Explore our Streetwear, Luxury Archive, or Traditional curations to add statement pieces.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2.5 border text-xs tracking-[0.2em] uppercase font-bold rounded transition-all duration-300"
                    style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg, borderColor: modeDetails.accentColor }}
                  >
                    EXPLORE COLLECTIONS
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.id}-${item.selectedSize || idx}`} className="pt-6 first:pt-0 flex space-x-4">
                    {/* ITEM IMAGE */}
                    <div className="relative w-20 h-24 border flex-shrink-0 overflow-hidden rounded" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                      <Image
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name || 'Garment'}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* ITEM DETAILS */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif-editorial text-lg tracking-[0.05em] text-[#F4F1EA] leading-tight">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                            className="text-[#D6CEBE]/50 hover:text-red-400 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                        <p className="text-[11px] tracking-[0.15em] uppercase mt-0.5 font-bold" style={{ color: modeDetails.accentColor }}>
                          SIZE: {item.selectedSize || 'Standard'}
                        </p>
                        <p className="font-mono text-xs text-[#D6CEBE] mt-1">
                          {typeof item.price === 'number' ? `₹${item.price.toLocaleString('en-IN')}` : item.price}
                        </p>
                      </div>

                      {/* QUANTITY CONTROLS */}
                      <div className="flex items-center space-x-3 mt-3">
                        <div className="flex items-center border rounded" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                          <button
                            onClick={() => updateQuantity(item.id, -1, item.selectedSize, item.selectedColor)}
                            className="px-2 py-0.5 text-xs text-[#D6CEBE] hover:opacity-80"
                          >
                            -
                          </button>
                          <span className="px-3 py-0.5 text-xs font-mono text-[#F4F1EA]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1, item.selectedSize, item.selectedColor)}
                            className="px-2 py-0.5 text-xs text-[#D6CEBE] hover:opacity-80"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* DRAWER FOOTER */}
            {cart.length > 0 && (
              <div className="p-6 border-t space-y-4" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                <p className="text-[10px] text-center text-[#D6CEBE]/70 uppercase tracking-[0.15em] py-1 border-b" style={{ borderColor: modeDetails.borderColor }}>
                  VIP Promo & Coupon codes apply directly at Checkout
                </p>

                {/* TOTAL SUMMARY */}
                <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: modeDetails.borderColor }}>
                  <div className="flex justify-between text-xs text-[#D6CEBE]">
                    <span>SUBTOTAL</span>
                    <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-[#F4F1EA]">
                    <span className="font-serif-editorial tracking-[0.1em]">ESTIMATED TOTAL</span>
                    <span className="font-mono font-bold" style={{ color: modeDetails.accentColor }}>₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* CHECKOUT BUTTON */}
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full text-center py-3.5 font-bold text-xs tracking-[0.25em] uppercase transition-all shadow-lg rounded"
                  style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                >
                  PROCEED TO SECURE CHECKOUT
                </Link>
                <p className="text-[9px] text-center text-[#D6CEBE]/50 uppercase tracking-[0.2em]">
                  INCLUDES 24H UNBOXING GUARANTEE & INSURED COURIER
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

