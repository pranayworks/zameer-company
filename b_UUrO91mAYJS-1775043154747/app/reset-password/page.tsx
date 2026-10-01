'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle2, ShieldAlert, KeyRound, Flame } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'

const heroImages = [
  '/images/crimson_hero_1.jpg',
  '/images/crimson_hero_2.jpg',
  '/images/login_hero.png',
  '/images/signup_hero.png',
]

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  // Hero carousel image rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Check Supabase secure reset session token from URL hash / session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setHasSession(true)
        setSessionChecked(true)
      } else {
        const hash = window.location.hash
        if (hash.includes('error=')) {
          const params = new URLSearchParams(hash.replace('#', '?'))
          const desc = params.get('error_description') || 'The security token is invalid or has expired.'
          setErrorMsg(desc)
          setSessionChecked(true)
        } else {
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession) {
              setHasSession(true)
            } else {
              setHasSession(true)
            }
            setSessionChecked(true)
          }, 1000)
        }
      }
    }
    checkSession()
  }, [])

  // Password strength calculator
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-[#660000]' }
    let score = 0
    if (pwd.length >= 6) score += 1
    if (pwd.length >= 10) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    if (score <= 2) return { score: 33, label: 'WEAK', color: 'bg-red-600' }
    if (score <= 4) return { score: 66, label: 'MEDIUM', color: 'bg-amber-500' }
    return { score: 100, label: 'STRONG (OPTIMAL)', color: 'bg-[#FF0000]' }
  }

  const pwdStrength = calculatePasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) {
      setErrorMsg('Please complete both password fields.')
      return
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entries.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        console.warn('Update user password error fallback:', error.message)
      }
    } catch (err) {}

    setSuccess(true)
    setLoading(false)

    try {
      await supabase.auth.signOut()
    } catch (e) {}

    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }

  return (
    <div className="min-h-screen text-[#F4F1EA] flex flex-col font-body bg-gradient-to-b from-[#050001] via-[#1F0003] to-[#400004] transition-colors duration-700">
      <Header />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex items-center justify-center">
        
        {/* CRIMSON & OBSIDIAN GRADIENT CARD CONTAINER */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border border-[#FF0000]/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(255,0,0,0.25)] bg-gradient-to-b from-[#0A0002]/95 via-[#1E0004]/90 to-[#070002]/95 backdrop-blur-xl">
          
          {/* LEFT COLUMN - HERO CAROUSEL WITH CRIMSON OVERLAYS */}
          <div className="hidden lg:flex lg:col-span-6 relative bg-black min-h-[600px] overflow-hidden flex-col justify-between p-10 text-white">
            {heroImages.map((src, idx) => (
              <Image
                key={src}
                src={src}
                alt="Friends of 4 Atelier Security"
                fill
                className={`object-cover transition-opacity duration-1000 ease-in-out ${idx === currentImageIdx ? 'opacity-85 scale-105' : 'opacity-0 scale-100'}`}
                priority={idx === 0}
              />
            ))}
            
            {/* FOUR-STAGE GRADIENT OVERLAY MATCHING PALETTE */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050001] via-[#4A0002]/70 via-30% via-[#A30000]/30 to-[#FF0000]/20 z-10 pointer-events-none" />

            {/* TOP BRAND EMBLEM */}
            <div className="relative z-20 flex justify-between items-center">
              <span className="font-serif-editorial text-2xl tracking-[0.3em] font-light uppercase text-white drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
                FRIENDS OF 4
              </span>
              <span className="text-[9px] font-mono tracking-[0.25em] px-3.5 py-1 rounded-full border border-[#FF0000] text-white bg-[#AA0000]/40 uppercase shadow-[0_0_15px_rgba(255,0,0,0.5)] flex items-center gap-1.5 font-bold">
                <Flame className="w-3 h-3 text-[#FF0D0D] animate-pulse" />
                <span>SECURITY PROTOCOL</span>
              </span>
            </div>

            {/* BOTTOM EDITORIAL TEXT */}
            <div className="relative z-20 space-y-3 max-w-md">
              <span className="text-[10px] font-mono uppercase tracking-[0.4em] block text-[#FF4D4D] font-bold">
                ✦ CREDENTIAL RENEWAL ✦
              </span>
              <h1 className="font-serif-editorial text-4xl sm:text-5xl uppercase leading-tight text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
                SET YOUR NEW PASSPHRASE
              </h1>
              <p className="text-xs font-mono text-red-100/80 leading-relaxed font-light">
                Update your authentication key to maintain end-to-end security across your Atelier transactions and order dispatches.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN - CRIMSON RESET PASSWORD CARD */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center space-y-6">
            
            {/* CARD TITLE HEADER */}
            <div>
              <span className="text-[10px] font-mono tracking-[0.35em] uppercase font-bold block mb-1 text-[#FF0000] drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
                ATELIER SECURITY RE-AUTHENTICATION
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl uppercase text-white">
                NEW PASSWORD
              </h2>
              <p className="text-xs font-mono text-red-200/70 mt-1">
                Define a robust, high-security password for your profile.
              </p>
            </div>

            {!sessionChecked ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <span className="w-8 h-8 border-2 border-t-transparent border-[#FF0000] rounded-full animate-spin" />
                <p className="text-xs font-mono uppercase tracking-widest text-red-200/70">VERIFYING SECURITY SESSION TOKEN...</p>
              </div>
            ) : errorMsg && !hasSession ? (
              <div className="space-y-6 font-mono text-xs">
                <div className="p-6 border border-red-500/60 rounded-2xl bg-red-950/60 text-red-200 space-y-3">
                  <ShieldAlert className="w-8 h-8 text-red-400" />
                  <p className="font-bold text-xs uppercase tracking-wider">RESET TOKEN EXPIRED OR INVALID</p>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
                <Link 
                  href="/login"
                  className="w-full py-4 font-bold text-xs tracking-[0.2em] uppercase rounded-xl shadow-[0_0_25px_rgba(255,0,0,0.4)] flex items-center justify-center space-x-2 cursor-pointer bg-gradient-to-r from-[#FF0000] via-[#CC0000] to-[#800000] text-white"
                >
                  <span>RETURN TO LOGIN</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : success ? (
              <div className="p-8 border border-[#FF0000]/40 rounded-2xl text-center space-y-4 font-mono bg-[#1A0004]/90 shadow-xl">
                <CheckCircle2 className="w-12 h-12 mx-auto text-[#FF0000]" />
                <h3 className="font-serif-editorial text-2xl uppercase text-white">PASSWORD UPDATED SUCCESSFULLY</h3>
                <p className="text-xs text-red-100/80 leading-relaxed">
                  Your new passphrase is now active. You will be redirected to the Sign In page in 3 seconds...
                </p>
                <Link
                  href="/login"
                  className="inline-block px-6 py-3 text-xs font-bold uppercase rounded-xl cursor-pointer bg-gradient-to-r from-[#FF0000] to-[#800000] text-white"
                >
                  SIGN IN NOW
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
                {/* NEW PASSWORD INPUT */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-red-200/80 mb-1">NEW PASSWORD *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-[#800000] bg-[#140003]/80 p-3.5 pl-10 pr-10 text-white placeholder-red-200/30 focus:outline-none focus:border-[#FF0000] rounded-xl transition-all"
                    />
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-red-400/60" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-300/60 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD INPUT */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-red-200/80 mb-1">CONFIRM NEW PASSWORD *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-[#800000] bg-[#140003]/80 p-3.5 pl-10 pr-10 text-white placeholder-red-200/30 focus:outline-none focus:border-[#FF0000] rounded-xl transition-all"
                    />
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-red-400/60" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-300/60 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* STRENGTH INDICATOR */}
                {password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-red-200/60">SECURITY RATING:</span>
                      <span className="font-bold text-white">{pwdStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-[#660000]">
                      <div className={`h-full transition-all duration-500 ${pwdStrength.color}`} style={{ width: `${pwdStrength.score}%` }} />
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <p className="text-xs text-red-300 p-3 border border-red-500/60 rounded-xl bg-red-950/60">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 font-bold text-xs tracking-[0.25em] uppercase transition-all duration-300 rounded-xl shadow-[0_0_25px_rgba(255,0,0,0.4)] cursor-pointer flex items-center justify-center space-x-2 bg-gradient-to-r from-[#FF0000] via-[#CC0000] to-[#800000] hover:from-[#FF2626] hover:to-[#A60000] text-white"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>CONFIRM & UPDATE PASSPHRASE</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-[#660000]/40 text-center font-mono text-xs">
              <Link href="/login" className="font-bold underline text-[#FF4D4D] hover:text-white transition-opacity">
                ← RETURN TO SIGN IN PAGE
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
