'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import emailjs from '@emailjs/browser'

interface NewsletterProps {
  className?: string
  variant?: 'footer' | 'section'
}

export function Newsletter({ className = '', variant = 'section' }: NewsletterProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    emailjs.init('Hox6SDFxBxOgUlMst')

    setStatus('loading')

    try {
      const templateParams = {
        email: email,
        from_email: email,
        to_name: 'Friends of 4 Admin'
      }

      console.log('Sending EmailJS with Params:', templateParams)

      const response = await emailjs.send(
        'service_d1crccn',
        'template_dqsbjbj',
        templateParams,
        'Hox6SDFxBxOgUlMst'
      )
      
      console.log('EmailJS Success:', response.status, response.text)
      setStatus('success')
      setEmail('')
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error: any) {
      console.error('EmailJS Error Details:', {
        status: error?.status,
        text: error?.text,
        message: error?.message,
        error: error
      })
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const isFooter = variant === 'footer'

  return (
    <div className={`${className} w-full max-w-md mx-auto relative`}>
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-sm font-body ${isFooter ? 'text-white' : 'text-[#1c1c18]'} italic`}
          >
            Thank you. You are now part of our tradition.
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative group flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className={`w-full bg-transparent border-b ${
                  isFooter ? 'border-white/20 text-white' : 'border-[#1c1c18]/20 text-[#1c1c18]'
                } py-4 px-2 font-body text-sm outline-none focus:border-[#a3851a] transition-all focus:ring-0`}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`absolute right-0 top-1/2 -translate-y-1/2 font-body uppercase tracking-[0.2em] text-[10px] ${
                  isFooter ? 'text-white hover:text-[#a3851a]' : 'text-[#1c1c18] hover:text-[#a3851a]'
                } transition-colors disabled:opacity-50 font-bold`}
              >
                {status === 'loading' ? 'Sending...' : 'Subscribe'}
              </button>
              <div className="absolute bottom-0 left-0 h-[1px] bg-[#a3851a] w-0 group-focus-within:w-full transition-all duration-700" />
            </div>

            {status === 'error' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-red-500 mt-2 absolute top-full left-0"
              >
                Failed to subscribe. Please try again.
              </motion.p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
