'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function LoadingScreen() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Show preloader on initial visit, auto dismiss after lines magnetize
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2200)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F0F0F] text-[#F4F1EA] overflow-hidden dark-paper-texture"
        >
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Top Line Magnetizing Down */}
            <motion.div
              initial={{ y: -180, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-12 w-[2px] h-20 bg-gradient-to-b from-[#A88434]/20 to-[#A88434]"
            />

            {/* Bottom Line Magnetizing Up */}
            <motion.div
              initial={{ y: 180, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-12 w-[2px] h-20 bg-gradient-to-t from-[#A88434]/20 to-[#A88434]"
            />

            {/* Left Line Magnetizing Right */}
            <motion.div
              initial={{ x: -180, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-12 h-[2px] w-20 bg-gradient-to-r from-[#A88434]/20 to-[#A88434]"
            />

            {/* Right Line Magnetizing Left */}
            <motion.div
              initial={{ x: 180, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-12 h-[2px] w-20 bg-gradient-to-l from-[#A88434]/20 to-[#A88434]"
            />

            {/* Central Architectural Emblem Box */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-24 h-24 border border-[#A88434] flex items-center justify-center relative bg-[#0F0F0F]/80 backdrop-blur-sm"
            >
              <div className="absolute inset-1 border border-[#A88434]/40" />
              <span className="font-serif-editorial text-2xl font-light tracking-[0.2em] text-[#A88434]">
                F4
              </span>
            </motion.div>
          </div>

          {/* Typography Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="text-center mt-6 space-y-2 px-4"
          >
            <h1 className="font-serif-editorial text-2xl sm:text-3xl tracking-[0.3em] font-light uppercase text-[#F4F1EA]">
              FRIENDS OF 4
            </h1>
            <p className="text-[10px] tracking-[0.45em] uppercase text-[#A88434] font-medium">
              STYLE OF TRADITION
            </p>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="w-24 h-[1px] bg-[#A88434]/40 mt-8 origin-center"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
