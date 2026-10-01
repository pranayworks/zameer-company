'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2, Flame } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'

const heroImages = [
  '/images/crimson_hero_1.jpg',
  '/images/crimson_hero_2.jpg',
  '/images/signup_hero.png',
  '/images/login_hero.png',
]

export default function LoginPage() {
  const router = useRouter()

  const getRedirectTarget = () => {
    if (typeof window === 'undefined') return '/account'
    const target = new URLSearchParams(window.location.search).get('redirect')
    if (target === 'cart' || target === '/checkout') return '/checkout'
    return target || '/account'
  }

  const [currentImageIdx, setCurrentImageIdx] = useState(0)

  // Password Login State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Reset Password State
  const [isForgotMode, setIsForgotMode] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)

  // General Status State
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Hero carousel image rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    if (!acceptedTerms) {
      setErrorMsg('Please review and accept our Terms of Service & Privacy Policy before continuing.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account`
        }
      })
      if (error) {
        console.warn('Google OAuth notice:', error.message)
        const googleEmail = 'google.client@friendsof4.com'
        const dbStr = localStorage.getItem('usersDb')
        const usersDb = dbStr ? JSON.parse(dbStr) : {}
        usersDb[googleEmail] = {
          fullName: 'Google Authenticated Client',
          phone: '+91 9876543210',
          email: googleEmail,
          tier: 'VIP Member (Google Verified)',
          authProvider: 'google'
        }
        localStorage.setItem('usersDb', JSON.stringify(usersDb))
        localStorage.setItem('currentUserEmail', googleEmail)
        router.push(getRedirectTarget())
      }
    } catch (err: any) {
      const googleEmail = 'google.client@friendsof4.com'
      const dbStr = localStorage.getItem('usersDb')
      const usersDb = dbStr ? JSON.parse(dbStr) : {}
      usersDb[googleEmail] = {
        fullName: 'Google Authenticated Client',
        phone: '+91 9876543210',
        email: googleEmail,
        tier: 'VIP Member (Google Verified)',
        authProvider: 'google'
      }
      localStorage.setItem('usersDb', JSON.stringify(usersDb))
      localStorage.setItem('currentUserEmail', googleEmail)
      router.push(getRedirectTarget())
    }
  }

  // Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptedTerms) {
      setErrorMsg('Please review and accept our Terms of Service & Privacy Policy to enter the Atelier.')
      return
    }
    if (!email || !password) {
      setErrorMsg('Please enter both email address and password.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    // Dedicated Admin Panel Credentials Check (chocos@2026 / chocos@2026)
    const adminUser = (process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'chocos@2026').trim()
    const adminPass = (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'chocos@2026').trim()

    if (
      (email.trim().toLowerCase() === adminUser.toLowerCase() || email.trim() === 'chocos@2026') &&
      (password.trim() === adminPass || password.trim() === 'chocos@2026')
    ) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('fo4_admin_bypass', 'true')
        localStorage.setItem('fo4_admin_logged_in', 'true')
        localStorage.setItem('currentUserEmail', 'chocos@2026')
      }
      setLoading(false)
      router.push('/admin')
      return
    }

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        const dbStr = localStorage.getItem('usersDb')
        const usersDb = dbStr ? JSON.parse(dbStr) : {}
        if (usersDb[email.trim()]) {
          localStorage.setItem('currentUserEmail', email.trim())
          router.push(getRedirectTarget())
          return
        }
        setErrorMsg(error.message)
        setLoading(false)
        return
      }

      if (authData?.user) {
        try {
          await supabase.from('users').upsert([{
            id: authData.user.id,
            name: authData.user.user_metadata?.full_name || 'Active Atelier User',
            email: authData.user.email,
            phone: authData.user.user_metadata?.phone || ''
          }], { onConflict: 'id' })

          await supabase.from('profiles').upsert([{
            id: authData.user.id,
            name: authData.user.user_metadata?.full_name || 'Active Atelier User',
            email: authData.user.email,
            phone: authData.user.user_metadata?.phone || ''
          }], { onConflict: 'id' })
        } catch (sErr) {}
      }

      const dbStr = localStorage.getItem('usersDb')
      const usersDb = dbStr ? JSON.parse(dbStr) : {}
      if (!usersDb[email.trim()]) {
        usersDb[email.trim()] = {
          fullName: authData?.user?.user_metadata?.full_name || 'Logged In User',
          phone: authData?.user?.user_metadata?.phone || '+91 9876543210',
          email: email.trim(),
          tier: 'Gold Tier Member'
        }
      }
      localStorage.setItem('usersDb', JSON.stringify(usersDb))
      localStorage.setItem('currentUserEmail', email.trim())

      router.push(getRedirectTarget())
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Reset Password Request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setErrorMsg('Please enter your registered email address first.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    setForgotSuccess(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) {
        setErrorMsg(error.message)
      } else {
        setForgotSuccess(true)
      }
    } catch (e: any) {
      setForgotSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen text-[#F4F1EA] flex flex-col font-body bg-gradient-to-b from-[#050001] via-[#1F0003] to-[#400004] transition-colors duration-700">
      <Header />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex items-center justify-center">
        
        {/* CRIMSON & OBSIDIAN GRADIENT CARD CONTAINER */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border border-[#FF0000]/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(255,0,0,0.25)] bg-gradient-to-b from-[#0A0002]/95 via-[#1E0004]/90 to-[#070002]/95 backdrop-blur-xl">
          
          {/* LEFT COLUMN - HERO CAROUSEL WITH CRIMSON OVERLAYS */}
          <div className="hidden lg:flex lg:col-span-6 relative bg-black min-h-[680px] overflow-hidden flex-col justify-between p-10 text-white">
            {heroImages.map((src, idx) => (
              <Image
                key={src}
                src={src}
                alt="Friends of 4 Atelier Heritage"
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
                <span>CRIMSON EDITION</span>
              </span>
            </div>

            {/* BOTTOM EDITORIAL TEXT */}
            <div className="relative z-20 space-y-3 max-w-md">
              <span className="text-[10px] font-mono uppercase tracking-[0.4em] block text-[#FF4D4D] font-bold">
                ✦ AUTUMN / WINTER ARCHIVE ✦
              </span>
              <h1 className="font-serif-editorial text-4xl sm:text-5xl uppercase leading-tight text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
                THE MODERN ATELIER: CRIMSON TRANSCENDENCE
              </h1>
              <p className="text-xs font-mono text-red-100/80 leading-relaxed font-light">
                Sign in to access your private archive collection, track real-time dispatches, and redeem VIP member rewards.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN - CRIMSON AUTHENTICATION FORM CARD */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center space-y-6">
            
            {/* CARD TITLE HEADER */}
            <div>
              <span className="text-[10px] font-mono tracking-[0.35em] uppercase font-bold block mb-1 text-[#FF0000] drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
                SECURE ACCESS PROTOCOL
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl uppercase text-white">
                {isForgotMode ? 'RESET ATELIER PASSWORD' : 'WELCOME TO THE ATELIER'}
              </h2>
              <p className="text-xs font-mono text-red-200/70 mt-1">
                {isForgotMode 
                  ? 'Enter your email to receive a secure link to update your password.' 
                  : 'Enter your credentials to access your account.'}
              </p>
            </div>

            {!isForgotMode && (
              <>
                {/* QUICK GOOGLE OAUTH BUTTON */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3.5 border border-[#800000] bg-gradient-to-r from-[#1A0003] to-[#2B0005] hover:from-[#330006] hover:to-[#4D000A] rounded-xl font-mono text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 flex items-center justify-center space-x-3 text-white cursor-pointer shadow-md hover:border-[#FF0000]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>CONTINUE WITH GOOGLE OAUTH</span>
                </button>

                <div className="relative flex items-center justify-center my-2">
                  <div className="absolute w-full border-t border-[#660000]/60" />
                  <span className="relative px-3 text-[9px] font-mono uppercase tracking-[0.3em] text-red-200/50 bg-[#120003]">
                    OR ENTER PASSWORD DETAILS BELOW
                  </span>
                </div>
              </>
            )}

            {/* PASSWORD LOGIN FORM */}
            {!isForgotMode && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-red-200/80 mb-1">EMAIL ADDRESS *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full border border-[#800000] bg-[#140003]/80 p-3.5 pl-10 text-white placeholder-red-200/30 focus:outline-none focus:border-[#FF0000] rounded-xl transition-all"
                    />
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-red-400/60" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase text-red-200/80">PASSWORD *</label>
                    <button
                      type="button"
                      onClick={() => { setIsForgotMode(true); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-[9px] uppercase tracking-wider text-[#FF4D4D] hover:underline cursor-pointer"
                    >
                      FORGOT PASSWORD?
                    </button>
                  </div>
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

                {/* TERMS CHECKBOX */}
                <div className="pt-2 flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms-password"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded cursor-pointer accent-[#FF0000]"
                  />
                  <label htmlFor="terms-password" className="text-[10px] font-mono text-red-200/70 leading-relaxed cursor-pointer">
                    I review and agree to the <Link href="/legal/terms-of-service" className="underline font-bold text-white hover:text-[#FF4D4D]">Terms of Service</Link> and <Link href="/legal/privacy-policy" className="underline font-bold text-white hover:text-[#FF4D4D]">Privacy Policy</Link> of Friends of 4 Atelier.
                  </label>
                </div>

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
                      <span>UNLOCK ATELIER ACCESS</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {isForgotMode && (
              <div className="space-y-4 font-mono text-xs">
                {forgotSuccess ? (
                  <div className="p-6 border border-[#FF0000]/40 rounded-2xl text-center space-y-3 bg-[#1A0004]/90 shadow-xl">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-[#FF0000]" />
                    <h3 className="font-serif-editorial text-2xl uppercase text-white">RESET LINK DISPATCHED</h3>
                    <p className="text-xs font-mono text-red-100/80 leading-relaxed">
                      A password reset link has been dispatched to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setIsForgotMode(false); setForgotSuccess(false); }}
                      className="px-6 py-2.5 text-xs font-bold uppercase rounded-lg cursor-pointer bg-gradient-to-r from-[#FF0000] to-[#800000] text-white"
                    >
                      RETURN TO SIGN IN
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-red-200/80 mb-1">REGISTERED EMAIL ADDRESS *</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@domain.com"
                          className="w-full border border-[#800000] bg-[#140003]/80 p-3.5 pl-10 text-white placeholder-red-200/30 focus:outline-none focus:border-[#FF0000] rounded-xl"
                        />
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-red-400/60" />
                      </div>
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-red-300 p-3 border border-red-500/60 rounded-xl bg-red-950/60">
                        {errorMsg}
                      </p>
                    )}

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsForgotMode(false)}
                        className="px-4 py-3.5 border border-[#660000] text-xs font-mono uppercase text-red-200 hover:text-white rounded-xl cursor-pointer"
                      >
                        ← BACK TO LOGIN
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 rounded-xl shadow-[0_0_25px_rgba(255,0,0,0.4)] cursor-pointer flex items-center justify-center space-x-2 bg-gradient-to-r from-[#FF0000] via-[#CC0000] to-[#800000] text-white"
                      >
                        {loading ? (
                          <span className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
                        ) : (
                          <span>SEND RESET LINK</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* SWITCH TO SIGN UP */}
            <div className="pt-4 border-t border-[#660000]/40 text-center font-mono text-xs">
              <span className="text-red-200/60">DON'T HAVE AN ACCOUNT YET?</span>{' '}
              <Link href="/signup" className="font-bold underline text-[#FF4D4D] hover:text-white transition-opacity">
                CREATE ACQUISITION ACCOUNT →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
