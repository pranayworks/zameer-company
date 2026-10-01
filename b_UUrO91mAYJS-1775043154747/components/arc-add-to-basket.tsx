'use client'

import React, { useRef, useState } from 'react'
import { motion, useAnimate } from 'framer-motion'
import { useCart } from '@/context/cart-context'
import { Product } from '@/data/products'

interface ArcAddToBasketProps {
  product: Product
  selectedSize?: string
  className?: string
}

interface FlyingItem {
  id: number
  startX: number
  startY: number
  targetX: number
  targetY: number
  image: string
}

export function ArcAddToBasket({ product: prod, selectedSize, className }: ArcAddToBasketProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [flyingItem, setFlyingItem] = useState<FlyingItem | null>(null)
  const [isFlying, setIsFlying] = useState(false)
  const [scope, animate] = useAnimate()
  const { addToCart } = useCart()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isFlying) return
    setIsFlying(true)

    // Calculate source position (button or card)
    const btnRect = buttonRef.current?.getBoundingClientRect()
    const startX = btnRect ? btnRect.left + btnRect.width / 2 - 24 : window.innerWidth / 2 - 24
    const startY = btnRect ? btnRect.top - 20 : window.innerHeight / 2 - 24

    // Calculate target position (#header-bag-button in top header)
    const headerBag = document.getElementById('header-bag-button') || document.querySelector('header')
    const targetRect = headerBag?.getBoundingClientRect()
    const targetX = targetRect ? targetRect.left + targetRect.width / 2 - 24 : window.innerWidth - 80
    const targetY = targetRect ? targetRect.top + targetRect.height / 2 - 24 : 20

    const item: FlyingItem = {
      id: Date.now(),
      startX,
      startY,
      targetX,
      targetY,
      image: prod.image,
    }

    setFlyingItem(item)

    // Animate header bag icon bounce feedback upon arrival
    setTimeout(async () => {
      const headerBagEl = document.getElementById('header-bag-button')
      if (headerBagEl) {
        try {
          await animate(
            headerBagEl,
            { scale: [1, 1.25, 0.95, 1.05, 1], rotate: [0, -5, 5, 0] },
            { duration: 0.45, ease: 'easeOut' }
          )
        } catch {
          // ignore if scope unmounted
        }
      }

      // Add to global cart context
      addToCart({
        id: prod.id,
        title: prod.title,
        price: prod.price,
        rawPrice: prod.rawPrice,
        image: prod.image,
        selectedSize: selectedSize || prod.sizes[0] || 'Standard',
        quantity: 1,
      })

      setFlyingItem(null)
      setIsFlying(false)
    }, 600)
  }

  return (
    <div ref={scope} className={`relative w-full ${className || ''}`}>
      {/* FLYING ARC OVERLAY PORTAL (FIXED VIEWPORT Z-[99999] PREVENTS CARD OVERFLOW CLIPPING) */}
      {flyingItem && (
        <motion.div
          key={flyingItem.id}
          style={{
            position: 'fixed',
            left: flyingItem.startX,
            top: flyingItem.startY,
            width: 60,
            height: 80,
            zIndex: 99999,
            pointerEvents: 'none',
          }}
          initial={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            x: [0, (flyingItem.targetX - flyingItem.startX) * 0.5, flyingItem.targetX - flyingItem.startX],
            y: [
              0,
              (flyingItem.targetY - flyingItem.startY) * 0.5 - 140,
              flyingItem.targetY - flyingItem.startY,
            ],
            scale: [1, 0.8, 0.2],
            opacity: [1, 1, 0.9, 0],
            rotate: [0, -20, 360],
          }}
          transition={{
            duration: 0.65,
            ease: [0.74, 0.18, 0.93, 0.69],
          }}
          className="rounded-md overflow-hidden border-2 border-[#A88434] shadow-[0_15px_35px_rgba(168,132,52,0.6)] bg-[#0F0F0F]"
        >
          <img src={flyingItem.image} alt={prod.title} className="w-full h-full object-cover" />
        </motion.div>
      )}

      {/* ACTION BUTTON */}
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={handleAddToCart}
        disabled={isFlying}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className={`w-full py-3 px-4 font-sans text-[11px] font-semibold tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center space-x-2 border ${
          isFlying
            ? 'bg-[#A88434] text-[#0F0F0F] border-[#A88434] opacity-80 cursor-wait'
            : 'bg-[#0F0F0F] text-[#F4F1EA] border-[#A88434]/40 hover:bg-[#A88434] hover:text-[#0F0F0F] hover:border-[#A88434]'
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">
          {isFlying ? 'sync' : 'shopping_bag'}
        </span>
        <span>{isFlying ? 'ADDING TO BAG...' : `ADD TO BAG — ${prod.price}`}</span>
      </motion.button>
    </div>
  )
}
