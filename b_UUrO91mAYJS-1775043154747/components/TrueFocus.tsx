'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import './TrueFocus.css'

export interface TrueFocusProps {
  sentence?: string
  separator?: string
  manualMode?: boolean
  blurAmount?: number
  borderColor?: string
  glowColor?: string
  animationDuration?: number
  pauseBetweenAnimations?: number
  className?: string
}

export default function TrueFocus({
  sentence = 'True Focus',
  separator = ' ',
  manualMode = false,
  blurAmount = 5,
  borderColor = '#E5B849',
  glowColor = 'rgba(229, 184, 73, 0.6)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  className = ''
}: TrueFocusProps) {
  const words = sentence.split(separator)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [focusRect, setFocusRect] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })

  // Accurately measure focus rect bounding box
  const updateFocusRect = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= words.length) return
    const activeEl = wordRefs.current[currentIndex]
    const containerEl = containerRef.current
    if (!activeEl || !containerEl) return

    const parentRect = containerEl.getBoundingClientRect()
    const activeRect = activeEl.getBoundingClientRect()

    if (activeRect.width > 0 && activeRect.height > 0) {
      setFocusRect({
        x: activeRect.left - parentRect.left,
        y: activeRect.top - parentRect.top,
        width: activeRect.width,
        height: activeRect.height
      })
    }
  }, [currentIndex, words.length])

  // Interval for auto mode
  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(
        () => {
          setCurrentIndex(prev => (prev + 1) % words.length)
        },
        (animationDuration + pauseBetweenAnimations) * 1000
      )
      return () => clearInterval(interval)
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length])

  // Update rect on index change, resize, font load, or layout shift
  useEffect(() => {
    updateFocusRect()
    const raf = requestAnimationFrame(updateFocusRect)
    const timer = setTimeout(updateFocusRect, 60)

    const handleResize = () => updateFocusRect()
    window.addEventListener('resize', handleResize)

    let resizeObserver: ResizeObserver | null = null
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(updateFocusRect)
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [currentIndex, updateFocusRect])

  const handleMouseEnter = (index: number) => {
    setLastActiveIndex(currentIndex)
    setCurrentIndex(index)
  }

  const handleMouseLeave = () => {
    if (manualMode && lastActiveIndex !== null) {
      setCurrentIndex(lastActiveIndex)
    }
  }

  return (
    <div className={`focus-container ${className}`.trim()} ref={containerRef}>
      {words.map((word, index) => {
        const isActive = index === currentIndex
        return (
          <span
            key={index}
            ref={el => {
              wordRefs.current[index] = el
            }}
            className={`focus-word ${isActive ? 'active' : ''}`}
            style={{
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
              opacity: isActive ? 1 : 0.6,
              transition: `filter ${animationDuration}s ease, opacity ${animationDuration}s ease`
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {word}
          </span>
        )
      })}

      <motion.div
        className="focus-frame"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: focusRect.width > 0 ? 1 : 0
        }}
        transition={{
          duration: animationDuration,
          ease: [0.16, 1, 0.3, 1]
        }}
        style={{
          '--border-color': borderColor,
          '--glow-color': glowColor
        } as React.CSSProperties}
      >
        <span className="corner top-left" />
        <span className="corner top-right" />
        <span className="corner bottom-left" />
        <span className="corner bottom-right" />
      </motion.div>
    </div>
  )
}
