'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMode } from './mode-context'

interface Toast {
  id: string
  message: string
  type?: 'success' | 'info' | 'error'
  icon?: string
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info' | 'error', icon?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

function ToastList({ toasts, setToasts }: { toasts: Toast[]; setToasts: React.Dispatch<React.SetStateAction<Toast[]>> }) {
  let modeDetails = {
    title: 'ATELIER',
    accentColor: '#E5B849',
    cardBg: '#141418',
    borderColor: 'rgba(229, 184, 73, 0.35)',
    glowColor: 'rgba(229, 184, 73, 0.25)',
    fontClass: 'font-luxury'
  }

  try {
    const modeContext = useMode()
    if (modeContext?.modeDetails) {
      modeDetails = modeContext.modeDetails
    }
  } catch (e) {}

  return (
    <div className="fixed bottom-12 right-12 z-[200] flex flex-col gap-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            style={{
              backgroundColor: modeDetails.cardBg,
              borderColor: modeDetails.borderColor,
              boxShadow: `0 10px 40px ${modeDetails.glowColor || 'rgba(0,0,0,0.4)'}`
            }}
            className="pointer-events-auto border p-6 min-w-[320px] max-w-[420px] backdrop-blur-xl flex items-center gap-5 relative overflow-hidden rounded-sm"
          >
            <div 
              style={{
                borderColor: `${modeDetails.accentColor}40`,
                backgroundColor: `${modeDetails.accentColor}15`
              }}
              className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0"
            >
              <span 
                style={{ color: modeDetails.accentColor }} 
                className="material-symbols-outlined text-xl"
              >
                {toast.icon || (toast.type === 'success' ? 'check_circle' : 'info')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p 
                style={{ color: modeDetails.accentColor }} 
                className={`text-[10px] uppercase tracking-[0.25em] mb-0.5 ${modeDetails.fontClass || 'font-headline'}`}
              >
                {modeDetails.title ? `${modeDetails.title} NOTIFICATION` : 'ATELIER NOTIFICATION'}
              </p>
              <p className="font-body text-xs text-[#F4F1EA]/90 font-medium tracking-wide leading-relaxed break-words">
                {toast.message}
              </p>
            </div>
            <button 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-white/30 hover:text-white transition-colors p-1 shrink-0"
              aria-label="Close notification"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
            <div 
              style={{ backgroundColor: modeDetails.accentColor }} 
              className="absolute top-0 left-0 h-full w-1" 
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success', icon?: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type, icon }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastList toasts={toasts} setToasts={setToasts} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

