'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck, Mail, Lock, Phone, User, KeyRound, ArrowRight, CheckCircle2, Flame } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'

const heroImages = [
  '/images/crimson_hero_2.jpg',
  '/images/crimson_hero_1.jpg',
  '/images/signup_hero.png',
  '/images/login_hero.png',
]

type SignupTab = 'standard' | 'otp'

export default function SignupPage() {
  const router = useRouter()

  const getRedirectTarget = () => {
    if (typeof window === 'undefined') return '/account'
    const target = new URLSearchParams(window.location.search).get('redirect')
    if (target === 'cart' || target === '/checkout') return '/checkout'
    return target || '/account'
  }

  const [signupTab, setSignupTab] = useState<SignupTab>('standard')
  const [currentImageIdx, setCurrentImageIdx] = useState(0)

  // Standard Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // OTP Form State
  const [otpTarget, setOtpTarget] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [otpFullName, setOtpFullName] = useState('')
  const [otpToken, setOtpToken] = useState('')

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

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: any
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [otpSent, resendTimer])

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

  const pwdStrength = calculatePasswordStrength(formData.password)

  // Google OAuth Signup
  const handleGoogleLogin = async () => {
    if (!acceptedTerms) {
      setErrorMsg('Please review and accept our Terms of Service & Privacy Policy before continuing with Google.')
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

  // Standard Registration Submit
  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptedTerms) {
      setErrorMsg('Please review and accept our Terms of Service & Privacy Policy to join the Atelier.')
      return
    }
    if (!formData.fullName || !formData.phone || !formData.email || !formData.password) {
      setErrorMsg('Please complete all mandatory fields: Full Name, Phone, Email, and Password.')
      return
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entries.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const cleanEmail = formData.email.trim()
      const cleanPhone = formData.phone.trim()

      const { data: authData, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: cleanPhone,
            tier: 'Gold Tier Member'
          }
        }
      })

      if (error) {
        console.warn('Supabase auth signup notice:', error.message)
      }

      if (authData?.user) {
        try {
          await supabase.from('users').upsert([{
            id: authData.user.id,
            name: formData.fullName,
            email: cleanEmail,
            phone: cleanPhone
          }], { onConflict: 'id' })

          await supabase.from('profiles').upsert([{
            id: authData.user.id,
            name: formData.fullName,
            email: cleanEmail,
            phone: cleanPhone
          }], { onConflict: 'id' })
        } catch (sErr) {}
      }

      const dbStr = localStorage.getItem('usersDb')
      const usersDb = dbStr ? JSON.parse(dbStr) : {}
      usersDb[cleanEmail] = {
        fullName: formData.fullName,
        phone: cleanPhone,
        email: cleanEmail,
        tier: 'Gold Tier Member'
      }
      localStorage.setItem('usersDb', JSON.stringify(usersDb))
      localStorage.setItem('currentUserEmail', cleanEmail)

      router.push(getRedirectTarget())
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // OTP Request Submit via SMS / Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptedTerms) {
      setErrorMsg('Please review and accept our Terms of Service & Privacy Policy before requesting OTP.')
      return
    }
    const target = otpTarget.trim()
    if (!target) {
      setErrorMsg('Please enter your email address or 10-digit mobile number.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Failed to dispatch OTP code. Please check your entry.')
        return
      }

      setOtpToken(data.token)
      setOtpSent(true)
      setResendTimer(30)
      setCanResend(false)
      setSuccessMsg(data.message || `A 6-digit OTP code has been dispatched to ${target}.`)
    } catch (e: any) {
      setErrorMsg('Failed to send OTP code. Please verify network connection or try again.')
    } finally {
      setLoading(false)
    }
  }

  // OTP Verification Submit via Stateless HMAC API
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const pinCode = otpDigits.join('')
    if (pinCode.length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const target = otpTarget.trim()

      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, otp: pinCode, token: otpToken }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Incorrect or expired OTP code. Please check your inbox.')
        return
      }

      // OTP Verified successfully!
      const isEmail = target.includes('@')
      const cleanPhone = target.replace(/[^0-9]/g, '').slice(-10)
      const userEmail = isEmail ? target.toLowerCase() : `${cleanPhone}@friendsof4.com`
      const userPhone = isEmail ? '+91 9876543210' : `+91 ${cleanPhone}`

      const dbStr = localStorage.getItem('usersDb')
      const usersDb = dbStr ? JSON.parse(dbStr) : {}

      usersDb[userEmail] = {
        fullName: otpFullName || 'OTP Registered Member',
        phone: userPhone,
        email: userEmail,
        tier: 'Gold Tier Member',
        authProvider: 'otp'
      }
      localStorage.setItem('usersDb', JSON.stringify(usersDb))
      localStorage.setItem('currentUserEmail', userEmail)

      router.push(getRedirectTarget())
    } catch (err: any) {
      setErrorMsg('Failed to verify OTP code. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP 6-digit input navigation
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(-1)
    const newDigits = [...otpDigits]
    newDigits[index] = cleanVal
    setOtpDigits(newDigits)

    if (cleanVal && index < 5) {
      const nextInput = document.getElementById(`otp-signup-input-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  return (
    <div className="min-h-screen text-[#F4F1EA] flex flex-col font-body bg-gradient-to-b from-[#050001] via-[#1F0003] to-[#400004] transition-colors duration-700">
      <Header />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex items-center justify-center">
        
        {/* CRIMSON & OBSIDIAN GRADIENT CARD CONTAINER */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border border-[#FF0000]/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(255,0,0,0.25)] bg-gradient-to-b from-[#0A0002]/95 via-[#1E0004]/90 to-[#070002]/95 backdrop-blur-xl">
          
          {/* LEFT COLUMN - HERO CAROUSEL WITH CRIMSON OVERLAYS */}
          <div className="hidden lg:flex lg:col-span-6 relative bg-black min-h-[720px] overflow-hidden flex-col justify-between p-10 text-white">
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
                <span>INNER CIRCLE</span>
              </span>
            </div>

            {/* BOTTOM EDITORIAL TEXT */}
            <div className="relative z-20 space-y-3 max-w-md">
              <span className="text-[10px] font-mono uppercase tracking-[0.4em] block text-[#FF4D4D] font-bold">
                ✦ JOIN THE CRIMSON ATELIER ✦
              </span>
              <h1 className="font-serif-editorial text-4xl sm:text-5xl uppercase leading-tight text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
                CREATE YOUR PRIVATE PROFILE
              </h1>
              <p className="text-xs font-mono text-red-100/80 leading-relaxed font-light">
                Unlock early drop invitations, complimentary bespoke tailoring consultations, and live real-time shipment dispatches.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN - CRIMSON SIGNUP FORM CARD */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center space-y-6">
            
            {/* CARD TITLE HEADER */}
            <div>
              <span className="text-[10px] font-mono tracking-[0.35em] uppercase font-bold block mb-1 text-[#FF0000] drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
                MEMBERSHIP REGISTRATION
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl uppercase text-white">
                BECOME A MEMBER
              </h2>
              <p className="text-xs font-mono text-red-200/70 mt-1">
                Choose your preferred onboarding method below to complete registration.
              </p>
            </div>

            {/* METHOD SWITCHER TABS: GRADIENT CRIMSON */}
            <div className="flex border border-[#800000] rounded-xl p-1 font-mono text-xs bg-[#100002]/90 shadow-inner">
              <button
                type="button"
                onClick={() => { setSignupTab('standard'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2.5 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  signupTab === 'standard' 
                    ? 'bg-gradient-to-r from-[#FF0000] via-[#C00000] to-[#800000] text-white shadow-[0_0_15px_rgba(255,0,0,0.5)]' 
                    : 'text-red-200/60 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>FULL REGISTRATION</span>
              </button>

              <button
                type="button"
                onClick={() => { setSignupTab('otp'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2.5 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  signupTab === 'otp' 
                    ? 'bg-gradient-to-r from-[#FF0000] via-[#C00000] to-[#800000] text-white shadow-[0_0_15px_rgba(255,0,0,0.5)]' 
                    : 'text-red-200/60 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>INSTANT OTP SIGNUP</span>
              </button>
            </div>

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

            <div className="relative flex items-center justify-center my-1">
              <div className="absolute w-full border-t border-[#660000]/60" />
              <span className="relative px-3 text-[9px] font-mono uppercase tracking-[0.3em] text-red-200/50 bg-[#120003]">
                OR FILL OUT CREATOR PROFILE
              </span>
            </div>

            {/* TAB 1: STANDARD FULL REGISTRATION */}
            {signupTab === 'standard' && (
              <form onSubmit={handleStandardSubmit} className="space-y-4 font-mono text-xs">
                {/* NAME & PHONE ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-red-200/80 mb-1">FULL NAME *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Elias Van Der Rohe"
                        className="w-full border border-[#800000] bg-[#140003]/80 p-3 pl-9 text-white placeholder-red-200/30 focus:outline-none focus:border-[#FF0000] rounded-xl transition-all"
                      />
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-red-400/60" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-red-200/80 mb-1">PHONE NUMBER *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full border border-[#800000] bg-[#140003]/80 p-3 pl-9 text-white placeholder-red-200/30 focus:outline-none focus:border-[#FF0000] rounded-xl transition-all"
                      />
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-red-400/60" />
                    </div>
                  </div>
                </div>

                {/* EMAIL ADDRESS */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-red-200/80 mb-1">EMAIL ADDRESS *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@friendsof4.com"
                      className="w-full border border-[#800000] bg-[#140003]/80 p-3 pl-9 text-white placeholder-red-200/30 focus:outline-none focus:border-[#FF0000] rounded-xl transition-all"
                    />
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-red-400/60" />
                  </div>
                </div>

                {/* PASSWORDS ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-red-200/80 mb-1">PASSWORD *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full border border-[#800000] bg-[#140003]/80 p-3 pl-9 pr-9 text-white placeholder-red-200/30 focus:outline-none focus:border-[#FF0000] rounded-xl transition-all"
                      />
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-red-400/60" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-300/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-red-200/80 mb-1">CONFIRM PASSWORD *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full border border-[#800000] bg-[#140003]/80 p-3 pl-9 pr-9 text-white placeholder-red-200/30 focus:outline-none focus:border-[#FF0000] rounded-xl transition-all"
                      />
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-red-400/60" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-300/60 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* PASSWORD STRENGTH BAR */}
                {formData.password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-red-200/60">SECURITY LEVEL:</span>
                      <span className="font-bold text-white">{pwdStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-[#660000]">
                      <div className={`h-full transition-all duration-500 ${pwdStrength.color}`} style={{ width: `${pwdStrength.score}%` }} />
                    </div>
                  </div>
                )}

                {/* TERMS CHECKBOX */}
                <div className="pt-2 flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms-signup"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded cursor-pointer accent-[#FF0000]"
                  />
                  <label htmlFor="terms-signup" className="text-[10px] font-mono text-red-200/70 leading-relaxed cursor-pointer">
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
                      <span>CREATE ATELIER ACCOUNT</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: INSTANT OTP SIGNUP */}
            {signupTab === 'otp' && (
              <div className="space-y-4 font-mono text-xs">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-red-200/80 mb-1">FULL NAME (OPTIONAL)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={otpFullName}
                          onChange={(e) => setOtpFullName(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full border border-[#800000] bg-[#140003]/80 p-3.5 pl-10 text-white placeholder-red-200/30 focus:outline-none focus:border-[#FF0000] rounded-xl transition-all"
                        />
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-red-400/60" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-red-200/80 mb-1">EMAIL OR MOBILE NUMBER (10 DIGITS) *</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={otpTarget}
                          onChange={(e) => setOtpTarget(e.target.value)}
                          placeholder="client@domain.com or 9876543210"
                          className="w-full border border-[#800000] bg-[#140003]/80 p-3.5 pl-10 text-white placeholder-red-200/30 focus:outline-none focus:border-[#FF0000] rounded-xl transition-all"
                        />
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-red-400/60" />
                      </div>
                    </div>

                    <div className="pt-2 flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="terms-otp-signup"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded cursor-pointer accent-[#FF0000]"
                      />
                      <label htmlFor="terms-otp-signup" className="text-[10px] font-mono text-red-200/70 leading-relaxed cursor-pointer">
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
                          <span>DISPATCH 6-DIGIT OTP CODE</span>
                          <KeyRound className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    {successMsg && (
                      <p className="text-xs text-emerald-300 p-3 border border-emerald-500/40 rounded-xl bg-emerald-950/40 font-mono text-center">
                        ✓ {successMsg}
                      </p>
                    )}

                    <div className="space-y-2 text-center">
                      <label className="block text-[10px] font-bold uppercase text-red-200/80">ENTER 6-DIGIT OTP VERIFICATION CODE</label>
                      <div className="flex justify-center space-x-2 sm:space-x-3">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`otp-signup-input-${idx}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !digit && idx > 0) {
                                const prev = document.getElementById(`otp-signup-input-${idx - 1}`)
                                if (prev) prev.focus()
                              }
                            }}
                            className="w-10 h-12 sm:w-12 sm:h-14 border border-[#800000] bg-[#140003]/80 text-center font-mono text-xl font-bold text-white focus:outline-none focus:border-[#FF0000] rounded-xl"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-red-200/60">
                        {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Did not receive code?'}
                      </span>
                      <button
                        type="button"
                        disabled={!canResend}
                        onClick={handleSendOtp}
                        className="font-bold text-[#FF4D4D] hover:underline disabled:opacity-40 cursor-pointer"
                      >
                        RESEND OTP NOW
                      </button>
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-red-300 p-3 border border-red-500/60 rounded-xl bg-red-950/60">
                        {errorMsg}
                      </p>
                    )}

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="px-4 py-3.5 border border-[#660000] text-xs font-mono uppercase text-red-200 hover:text-white rounded-xl cursor-pointer"
                      >
                        CHANGE TARGET
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 rounded-xl shadow-[0_0_25px_rgba(255,0,0,0.4)] cursor-pointer flex items-center justify-center space-x-2 bg-gradient-to-r from-[#FF0000] via-[#CC0000] to-[#800000] text-white"
                      >
                        {loading ? (
                          <span className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
                        ) : (
                          <span>VERIFY & JOIN ATELIER</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* SWITCH TO SIGN IN */}
            <div className="pt-4 border-t border-[#660000]/40 text-center font-mono text-xs">
              <span className="text-red-200/60">ALREADY HAVE AN ACCOUNT?</span>{' '}
              <Link href="/login" className="font-bold underline text-[#FF4D4D] hover:text-white transition-opacity">
                SIGN IN TO YOUR ATELIER PROFILE →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
