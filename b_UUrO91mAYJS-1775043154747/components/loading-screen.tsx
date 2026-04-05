'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.8, delay: isVisible ? 0 : 2.2 }}
      className="fixed inset-0 z-50 bg-[#fdf9f2] flex flex-col items-center justify-center"
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center w-full px-8 flex flex-col items-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative w-32 h-32 md:w-48 md:h-48 mb-8"
        >
          <Image src="/logo.png" alt="Friends of 4 Logo" fill className="object-contain drop-shadow-sm" priority />
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-display italic text-[#1c1b1b] tracking-tight mb-2 flex flex-wrap justify-center overflow-hidden">
          {"Style Of Traditionals".split("").map((letter, i) => (
            <motion.span
              key={i}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 1.2, 
                delay: i * 0.04, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              style={{ display: "inline-block" }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </h1>
        <p className="font-body text-[10px] md:text-xs text-[#747878] uppercase tracking-[0.4em] mb-16 font-bold">
          Friends of 4
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-2xl h-[2px] bg-[#e6e2db] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="h-full gold-satin"
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
