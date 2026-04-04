'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
      <div className="fixed bottom-12 right-12 z-[200] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto bg-[#1c1c18] border border-[#a3851a]/30 shadow-[0_10px_40px_rgba(0,0,0,0.3)] p-6 min-w-[320px] backdrop-blur-xl flex items-center gap-5"
            >
              <div className="w-10 h-10 rounded-full border border-[#a3851a]/20 flex items-center justify-center bg-[#a3851a]/5">
                <span className="material-symbols-outlined text-[#a3851a] text-xl">
                  {toast.icon || (toast.type === 'success' ? 'check_circle' : 'info')}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-headline text-[10px] uppercase tracking-[0.3em] text-[#a3851a] mb-0.5">Atelier Notification</p>
                <p className="font-body text-xs text-white/90 font-medium tracking-wide leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-white/20 hover:text-white/60 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
              <div className="absolute top-0 left-0 h-full w-0.5 bg-[#a3851a]" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
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
