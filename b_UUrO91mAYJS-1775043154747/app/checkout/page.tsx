'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/context/cart-context'
import { supabase, getSessionUser } from '@/lib/supabase'
import Link from 'next/link'
import { useMode } from '@/context/mode-context'
import { downloadInvoicePDF } from '@/lib/admin-helpers'

declare global {
  interface Window {
    Razorpay: any
  }
}

type CheckoutStep = 'summary' | 'address' | 'paying' | 'success'

interface DetailedAddress {
  name: string
  email: string
  phone: string
  flatNo: string
  area: string
  landmark: string
  pincode: string
  city: string
  state: string
  saveAsDefault: boolean
}

export interface CompletedOrderSummary {
  orderId: string
  date: string
  items: Array<{
    name: string
    size?: string
    color?: string
    quantity: number
    price: number
    image?: string
  }>
  customerName: string
  email: string
  phone: string
  address: string
  subtotal: number
  discountAmount: number
  shippingFee: number
  finalTotal: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, subtotal, placeOrder, totalItems, clearCart } = useCart()
  const { modeDetails } = useMode()

  const [step, setStep] = useState<CheckoutStep>('summary')
  const [loading, setLoading] = useState(true)
  const [paymentError, setPaymentError] = useState('')
  const [orderId, setOrderId] = useState('')
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderSummary | null>(null)
  const [shippingMethod, setShippingMethod] = useState<'Standard' | 'Express'>('Standard')
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR')
  const [rzpInstance, setRzpInstance] = useState<any>(null)
  
  // DETAILED ADDRESS FORM STATE
  const [addressForm, setAddressForm] = useState<DetailedAddress>({
    name: '',
    email: '',
    phone: '',
    flatNo: '',
    area: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    saveAsDefault: true,
  })

  // DISCOUNT / SINGLE-USE COUPON STATES
  const [couponInput, setCouponInput] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [couponError, setCouponError] = useState('')

  const exchangeRate = currency === 'USD' ? 0.012 : 1.0

  const shippingFee = shippingMethod === 'Express' ? 150 : 0
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee)

  const formatPrice = (amount: number) => {
    if (currency === 'USD') {
      return `$${(amount * exchangeRate).toFixed(2)} USD`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  // Load saved default address on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fo4_saved_default_address')
        if (saved) {
          const parsed = JSON.parse(saved)
          setAddressForm(prev => ({
            ...prev,
            ...parsed,
            saveAsDefault: true,
          }))
        }
      } catch (e) {}
    }
  }, [])

  // Load user session profile as fallback & protect checkout page
  useEffect(() => {
    const fetchProfile = async () => {
      const { user } = await getSessionUser()
      const localEmail = typeof window !== 'undefined' ? localStorage.getItem('currentUserEmail') : null

      if (!user && !localEmail) {
        // User is not logged in — redirect immediately to /login?redirect=/checkout
        router.push('/login?redirect=/checkout')
        return
      }

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setAddressForm(prev => ({
          ...prev,
          name: prev.name || profileData?.name || user.user_metadata?.full_name || '',
          email: prev.email || profileData?.email || user.email || '',
          phone: prev.phone || profileData?.phone || '',
        }))
      } else if (localEmail) {
        const dbStr = localStorage.getItem('usersDb')
        const usersDb = dbStr ? JSON.parse(dbStr) : {}
        const localUser = usersDb[localEmail]
        if (localUser) {
          setAddressForm(prev => ({
            ...prev,
            name: prev.name || localUser.fullName || '',
            email: prev.email || localUser.email || localEmail,
            phone: prev.phone || localUser.phone || '',
          }))
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  // Single-use Per Account Coupon Application Logic
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    const code = couponInput.trim().toUpperCase()
    if (!code) return

    // 1. Check if coupon was deleted by admin
    let deletedCodes: string[] = []
    try {
      deletedCodes = JSON.parse(localStorage.getItem('fo4_deleted_coupons') || '[]')
    } catch {}

    if (deletedCodes.includes(code)) {
      setCouponError(`Coupon code [${code}] is no longer active or has been removed by Atelier.`)
      return
    }

    // 2. Check if coupon has already been redeemed by THIS account
    const userEmail = (addressForm.email || localStorage.getItem('currentUserEmail') || 'guest').toLowerCase().trim()
    let perAccountUsed: string[] = []
    try {
      perAccountUsed = JSON.parse(localStorage.getItem(`fo4_used_coupons_${userEmail}`) || '[]')
    } catch {}

    if (perAccountUsed.includes(code)) {
      setCouponError(`You have already redeemed coupon code [${code}] on this account. Each coupon is single-use per account.`)
      return
    }

    // Verify code against valid coupons
    let activeCoupons: Record<string, { type: 'percent' | 'fixed'; val: number }> = {
      'WELCOME10': { type: 'percent', val: 10 },
      'HERITAGE20': { type: 'percent', val: 20 },
      'STREETWEAR15': { type: 'percent', val: 15 },
      'ARCHIVE10': { type: 'fixed', val: 1000 },
    }

    try {
      const adminCoupons = JSON.parse(localStorage.getItem('fo4_admin_coupons') || '{}')
      activeCoupons = { ...activeCoupons, ...adminCoupons }
    } catch {}

    if (activeCoupons[code]) {
      const rule = activeCoupons[code]
      const disc = rule.type === 'percent' ? (subtotal * rule.val) / 100 : Math.min(subtotal, rule.val)
      setDiscountAmount(disc)
      setAppliedCoupon(code)
      setCouponError('')
    } else {
      setCouponError('Invalid promo coupon code. Try WELCOME10, HERITAGE20, or STREETWEAR15.')
    }
  }

  // Load Razorpay script dynamically if missing
  const loadRazorpaySDK = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false)
      if ((window as any).Razorpay) return resolve(true)

      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true))
        existingScript.addEventListener('error', () => resolve(false))
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  useEffect(() => {
    loadRazorpaySDK()
  }, [])

  const handleDirectCODOrder = async () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.flatNo || !addressForm.pincode) {
      setPaymentError('Please fill in all mandatory dispatch address details (Name, Phone, Flat/Building, Pin Code).')
      return
    }

    setPaymentError('')
    setStep('paying')

    const fullFormattedAddress = `${addressForm.flatNo}, ${addressForm.area}${addressForm.landmark ? ', Landmark: ' + addressForm.landmark : ''}, ${addressForm.city}, ${addressForm.state} - ${addressForm.pincode} [COD / Direct Order]`
    
    if (addressForm.saveAsDefault && typeof window !== 'undefined') {
      try {
        localStorage.setItem('fo4_saved_default_address', JSON.stringify(addressForm))
      } catch {}
    }

    const customerProfile = {
      name: addressForm.name,
      email: addressForm.email,
      phone: addressForm.phone,
      address: fullFormattedAddress,
      userId: 'guest'
    }

    const paymentId = `COD-${Date.now().toString().slice(-6)}`
    setOrderId(paymentId)

    const snapshotItems = cart.map(item => ({
      name: item.name || item.title || 'Archival Piece',
      size: item.selectedSize || 'Standard',
      color: item.selectedColor || 'Default',
      quantity: item.quantity,
      price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 4800,
      image: item.image
    }))

    setCompletedOrder({
      orderId: paymentId,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: snapshotItems,
      customerName: addressForm.name || 'Valued Client',
      email: addressForm.email || '',
      phone: addressForm.phone || '',
      address: fullFormattedAddress,
      subtotal,
      discountAmount,
      shippingFee,
      finalTotal
    })

    await placeOrder(shippingMethod, shippingFee, customerProfile)
    setStep('success')
  }

  const handlePay = async () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.flatNo || !addressForm.pincode) {
      setPaymentError('Please fill in all mandatory dispatch address details (Name, Phone, Flat/Building, Pin Code).')
      return
    }

    setPaymentError('')
    setStep('paying')

    // Format full address
    const fullFormattedAddress = `${addressForm.flatNo}, ${addressForm.area}${addressForm.landmark ? ', Landmark: ' + addressForm.landmark : ''}, ${addressForm.city}, ${addressForm.state} - ${addressForm.pincode}`
    
    // Save default address to localStorage
    if (addressForm.saveAsDefault && typeof window !== 'undefined') {
      try {
        localStorage.setItem('fo4_saved_default_address', JSON.stringify(addressForm))
      } catch {}
    }

    // Record coupon redemption (Per Account + Global Analytics Log)
    if (appliedCoupon && typeof window !== 'undefined') {
      try {
        const userEmail = (addressForm.email || localStorage.getItem('currentUserEmail') || 'guest').toLowerCase().trim()
        
        // 1. Per-account redemption key
        const perAccountKey = `fo4_used_coupons_${userEmail}`
        const perAccUsed = JSON.parse(localStorage.getItem(perAccountKey) || '[]')
        if (!perAccUsed.includes(appliedCoupon)) {
          perAccUsed.push(appliedCoupon)
          localStorage.setItem(perAccountKey, JSON.stringify(perAccUsed))
        }

        // 2. Global coupon redemptions count
        const used = JSON.parse(localStorage.getItem('fo4_used_coupons') || '[]')
        used.push(appliedCoupon)
        localStorage.setItem('fo4_used_coupons', JSON.stringify(used))

        // 3. Detailed redemption log for admin table
        const redemptions = JSON.parse(localStorage.getItem('fo4_coupon_redemptions') || '[]')
        redemptions.unshift({
          email: userEmail,
          code: appliedCoupon,
          discount: discountAmount,
          timestamp: new Date().toISOString()
        })
        localStorage.setItem('fo4_coupon_redemptions', JSON.stringify(redemptions))
      } catch {}
    }

    const customerProfile = {
      name: addressForm.name,
      email: addressForm.email,
      phone: addressForm.phone,
      address: fullFormattedAddress,
      userId: 'guest'
    }

    const sdkLoaded = await loadRazorpaySDK()
    if (!sdkLoaded || !window.Razorpay) {
      setStep('address')
      setPaymentError('Could not load Razorpay payment SDK. You can complete your order using Cash on Delivery (COD) below.')
      return
    }

    let orderData: any = null
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
        }),
      })

      if (res.ok) {
        orderData = await res.json()
      } else {
        const errObj = await res.json().catch(() => ({}))
        orderData = { error: errObj.error || 'Payment server order creation failed' }
      }
    } catch (e: any) {
      console.warn("Backend order creation warning:", e)
    }

    const razorpayKey = orderData?.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_Tha2BWyYXOJUkD'
    const razorpayOrderId = orderData?.orderId

    if (!razorpayOrderId || !razorpayOrderId.startsWith('order_')) {
      setStep('address')
      setPaymentError(orderData?.error || 'Unable to initialize Razorpay payment session. Please retry or choose Cash on Delivery.')
      return
    }

    const options: any = {
      key: razorpayKey,
      amount: Math.round(finalTotal * 100), // Convert ₹ to paise
      currency: 'INR',
      name: 'Friends of 4 Atelier',
      description: `${totalItems} Archival Piece${totalItems > 1 ? 's' : ''}`,
      ...(razorpayOrderId && razorpayOrderId.startsWith('order_') ? { order_id: razorpayOrderId } : {}),
      prefill: {
        name: addressForm.name,
        email: addressForm.email,
        contact: addressForm.phone,
      },
      notes: {
        address: fullFormattedAddress,
        coupon: appliedCoupon || 'None'
      },
      theme: {
        color: modeDetails.accentColor || '#B8892D',
      },
      handler: async (response: any) => {
        // ONLY RUNS AFTER CUSTOMER SUCCESSFULLY COMPLETES PAYMENT IN RAZORPAY MODAL
        const paymentId = response.razorpay_payment_id || `ORD-${Date.now().toString().slice(-6)}`
        setOrderId(paymentId)

        const snapshotItems = cart.map(item => ({
          name: item.name || item.title || 'Archival Piece',
          size: item.selectedSize || 'Standard',
          color: item.selectedColor || 'Default',
          quantity: item.quantity,
          price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 4800,
          image: item.image
        }))

        setCompletedOrder({
          orderId: paymentId,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          items: snapshotItems,
          customerName: addressForm.name || 'Valued Client',
          email: addressForm.email || '',
          phone: addressForm.phone || '',
          address: fullFormattedAddress,
          subtotal,
          discountAmount,
          shippingFee,
          finalTotal
        })

        await placeOrder(shippingMethod, shippingFee, customerProfile)
        setStep('success')
      },
      modal: {
        ondismiss: () => {
          setStep('address')
          setPaymentError('Payment window was closed before completion. You can retry Razorpay or select Cash on Delivery below.')
        }
      }
    }

    try {
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', async (response: any) => {
        setStep('address')
        setPaymentError(`Payment Failed: ${response.error?.description || 'Gateway error'}. Please retry.`)
      })
      setRzpInstance(rzp)
      rzp.open()
    } catch (err: any) {
      console.error("Error launching Razorpay:", err)
      setStep('address')
      setPaymentError(`Failed to launch Razorpay window: ${err?.message || 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-700" style={{ backgroundColor: modeDetails.themeBg }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderLeftColor: modeDetails.accentColor, borderRightColor: modeDetails.accentColor, borderBottomColor: modeDetails.accentColor, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-[#F4F1EA] flex flex-col font-body transition-colors duration-700" style={{ backgroundColor: modeDetails.themeBg }}>
      <Header />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        
        {/* BACK NAVIGATION BUTTON */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold transition-all hover:opacity-80 cursor-pointer"
            style={{ color: modeDetails.accentColor }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Collection
          </button>
        </div>

        {/* PAGE TITLE & CURRENCY SELECTOR */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between border-b pb-6 transition-colors duration-700"
          style={{ borderColor: `${modeDetails.borderColor}40` }}
        >
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] font-semibold" style={{ color: modeDetails.accentColor }}>
              SECURE CHECKOUT PROTOCOL
            </span>
            <h1 className="font-serif-editorial text-4xl sm:text-6xl text-white uppercase mt-1">
              FINALISE YOUR ORDER
            </h1>
          </div>

          {/* CURRENCY SWITCHER IN CHECKOUT */}
          <div className="mt-4 sm:mt-0 flex items-center space-x-2 border p-1.5 shadow-sm rounded-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: `${modeDetails.borderColor}40` }}>
            <span className="text-[10px] font-mono uppercase px-2 opacity-70" style={{ color: '#D6CEBE' }}>CURRENCY:</span>
            <button
              onClick={() => setCurrency('INR')}
              className="px-3 py-1 text-xs font-mono font-bold uppercase transition-all rounded cursor-pointer"
              style={{
                backgroundColor: currency === 'INR' ? modeDetails.accentColor : 'transparent',
                color: currency === 'INR' ? modeDetails.themeBg : '#D6CEBE'
              }}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className="px-3 py-1 text-xs font-mono font-bold uppercase transition-all rounded cursor-pointer"
              style={{
                backgroundColor: currency === 'USD' ? modeDetails.accentColor : 'transparent',
                color: currency === 'USD' ? modeDetails.themeBg : '#D6CEBE'
              }}
            >
              USD ($)
            </button>
          </div>
        </motion.div>

        {/* PROGRESS STEPS */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { id: 'summary', label: '1. REVIEW BAG' },
            { id: 'address', label: '2. DISPATCH DETAILS' },
            { id: 'paying', label: '3. PAYMENT' },
            { id: 'success', label: '4. CONFIRMED' },
          ].map((s) => {
            const steps: CheckoutStep[] = ['summary', 'address', 'paying', 'success']
            const currentIndex = steps.indexOf(step)
            const thisIndex = steps.indexOf(s.id as CheckoutStep)
            const isActive = s.id === step
            const isDone = thisIndex < currentIndex

            return (
              <div key={s.id} className="flex items-center space-x-2">
                <span 
                  className={`text-xs font-mono tracking-widest px-3 py-1 uppercase rounded-full border transition-all ${
                    isDone ? 'font-bold' : isActive ? 'font-bold shadow-md' : 'opacity-60'
                  }`}
                  style={{
                    backgroundColor: isDone || isActive ? modeDetails.accentColor : 'transparent',
                    color: isDone || isActive ? modeDetails.themeBg : '#D6CEBE',
                    borderColor: modeDetails.borderColor,
                  }}
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* STEP CONTENT */}
        <AnimatePresence mode="wait">
          {step === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* CART ITEMS LIST */}
              <div className="lg:col-span-7 space-y-4">
                <h2 className="font-serif-editorial text-2xl text-white mb-4 uppercase">
                  YOUR BAG ({totalItems} PIECES)
                </h2>

                {cart.length === 0 ? (
                  <div className="border p-8 text-center space-y-3 rounded-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                    <p className="font-serif-editorial text-xl">YOUR BAG IS EMPTY</p>
                    <Link href="/shop" className="inline-block px-6 py-2 text-xs font-mono uppercase font-bold rounded" style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}>
                      RETURN TO COLLECTION
                    </Link>
                  </div>
                ) : (
                  cart.map((item, idx) => {
                    const priceNum = typeof item.price === 'number' 
                      ? item.price 
                      : item.rawPrice || parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0
                    return (
                      <div
                        key={`${item.id}-${idx}`}
                        className="flex gap-4 p-4 border rounded-lg shadow-sm items-center"
                        style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
                      >
                        <div className="relative w-20 h-24 border shrink-0 overflow-hidden rounded" style={{ borderColor: modeDetails.borderColor }}>
                          <Image
                            src={item.image || '/placeholder.jpg'}
                            alt={item.name || item.title || 'Garment Piece'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-serif-editorial text-xl text-white">
                              {item.name || item.title}
                            </h3>
                            <p className="text-[10px] font-mono uppercase font-bold mt-1" style={{ color: modeDetails.accentColor }}>
                              SIZE: {item.selectedSize || 'Standard'} • QTY: {item.quantity}
                            </p>
                          </div>
                          <span className="font-mono text-sm font-bold text-white mt-2">
                            {formatPrice(priceNum * item.quantity)}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* ORDER SUMMARY & PROMO CODES */}
              <div className="lg:col-span-5 space-y-6 border p-6 shadow-sm rounded-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                <h2 className="font-serif-editorial text-2xl text-white uppercase border-b pb-3" style={{ borderColor: modeDetails.borderColor }}>
                  ORDER SUMMARY
                </h2>

                {/* SINGLE-USE DISCOUNT COUPON CODE SECTION */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase font-bold block" style={{ color: modeDetails.accentColor }}>
                    APPLY PROMO / VIP SINGLE-USE COUPON
                  </span>
                  <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="TRY WELCOME10, HERITAGE20, OR STREETWEAR15"
                      className="flex-1 border px-3 py-2 text-xs font-mono uppercase text-white placeholder-white/30 focus:outline-none rounded"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 font-bold text-xs font-mono uppercase tracking-wider transition-all rounded cursor-pointer"
                      style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                    >
                      APPLY
                    </button>
                  </form>
                  {couponError && <p className="text-[10px] font-mono text-red-400 font-bold">{couponError}</p>}
                  {appliedCoupon && (
                    <div className="p-2 border text-[10px] font-mono font-bold flex justify-between items-center rounded" style={{ backgroundColor: `${modeDetails.accentColor}20`, borderColor: modeDetails.accentColor }}>
                      <span>✓ COUPON {appliedCoupon} APPLIED</span>
                      <button onClick={() => { setDiscountAmount(0); setAppliedCoupon(''); }} className="text-red-400 hover:underline">REMOVE</button>
                    </div>
                  )}
                </div>

                {/* AVAILABLE CODES QUICK CHIPS */}
                <div className="pt-2 border-t" style={{ borderColor: modeDetails.borderColor }}>
                  <span className="text-[9px] font-mono text-white/50 uppercase block mb-1.5">ACTIVE DISCOUNTS AVAILABLE:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['WELCOME10', 'HERITAGE20', 'STREETWEAR15'].map((code) => (
                      <button
                        key={code}
                        onClick={() => { setCouponInput(code); }}
                        className="px-2 py-0.5 border text-[9px] font-mono text-white rounded transition-all hover:border-white cursor-pointer"
                        style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TOTAL BREAKDOWN */}
                <div className="space-y-2 pt-4 border-t text-xs font-mono" style={{ borderColor: modeDetails.borderColor }}>
                  <div className="flex justify-between text-white/70">
                    <span>SUBTOTAL</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between font-bold" style={{ color: modeDetails.accentColor }}>
                      <span>DISCOUNT APPLIED</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/70">
                    <span>EXPRESS INSURED SHIPPING</span>
                    <span>{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between font-serif-editorial text-2xl font-bold text-white pt-3 border-t" style={{ borderColor: modeDetails.borderColor }}>
                    <span>FINAL TOTAL</span>
                    <span style={{ color: modeDetails.accentColor }}>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('address')}
                  disabled={cart.length === 0}
                  className="w-full py-4 font-bold text-xs tracking-[0.25em] uppercase transition-all duration-300 shadow-lg rounded cursor-pointer"
                  style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                >
                  CONTINUE TO SHIPPING ADDRESS →
                </button>
              </div>
            </motion.div>
          )}

          {step === 'address' && (
            <motion.div
              key="address"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto border p-8 space-y-6 shadow-xl rounded-xl"
              style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
            >
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: modeDetails.borderColor }}>
                <h2 className="font-serif-editorial text-3xl uppercase text-white">
                  DISPATCH ADDRESS & DELIVERY FORM
                </h2>
                <button
                  onClick={() => setStep('summary')}
                  className="text-xs font-mono uppercase tracking-wider text-white/60 hover:text-white cursor-pointer"
                >
                  ← BACK
                </button>
              </div>

              {/* DETAILED SHIPPING FORM */}
              <div className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">FULL CLIENT NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">PHONE NUMBER (FOR DELIVERY SMS/CALL) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">EMAIL ADDRESS FOR DISPATCH RECEIPT *</label>
                  <input
                    type="email"
                    required
                    placeholder="client@domain.com"
                    value={addressForm.email}
                    onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                    className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">FLAT / HOUSE NO / BUILDING NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 402, Pinnacle Heights"
                      value={addressForm.flatNo}
                      onChange={(e) => setAddressForm({ ...addressForm, flatNo: e.target.value })}
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">AREA / STREET / LOCALITY *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Indiranagar 100ft Road"
                      value={addressForm.area}
                      onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">PIN CODE (6 DIGITS) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="560038"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">CITY *</label>
                    <input
                      type="text"
                      required
                      placeholder="Bengaluru"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">STATE *</label>
                    <input
                      type="text"
                      required
                      placeholder="Karnataka"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">LANDMARK (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="Near Metro Station"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>

                {/* SAVE ADDRESS AS DEFAULT CHECKBOX */}
                <div className="pt-2 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="saveDefault"
                    checked={addressForm.saveAsDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, saveAsDefault: e.target.checked })}
                    className="w-4 h-4 rounded cursor-pointer accent-[#B8892D]"
                  />
                  <label htmlFor="saveDefault" className="text-xs font-mono font-bold text-white cursor-pointer">
                    Save this address as my default delivery address for future purchases
                  </label>
                </div>
              </div>

              {paymentError && (
                <p className="text-xs text-red-400 font-mono p-3 border border-red-500/40 rounded bg-red-950/40">
                  {paymentError}
                </p>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t" style={{ borderColor: modeDetails.borderColor }}>
                <button
                  onClick={() => setStep('summary')}
                  className="w-full sm:w-auto px-6 py-3 border text-white text-xs font-mono uppercase rounded transition-all cursor-pointer"
                  style={{ borderColor: modeDetails.borderColor }}
                >
                  ← BACK TO REVIEW
                </button>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleDirectCODOrder}
                    className="px-6 py-3 font-mono font-bold text-xs tracking-wider uppercase transition-all rounded border border-amber-500/50 bg-amber-950/80 text-amber-200 hover:bg-amber-900 cursor-pointer flex items-center justify-center gap-2 shadow"
                  >
                    <span className="material-symbols-outlined text-sm">payments</span>
                    <span>CASH ON DELIVERY / DIRECT BOOKING ({formatPrice(finalTotal)})</span>
                  </button>

                  <button
                    onClick={handlePay}
                    className="px-8 py-3 font-bold text-xs tracking-[0.2em] uppercase transition-all rounded shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                  >
                    <span>PROCEED TO RAZORPAY ({formatPrice(finalTotal)})</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'paying' && (
            <motion.div
              key="paying"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto border p-8 text-center space-y-6 shadow-2xl rounded-xl"
              style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.accentColor }}
            >
              <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto flex items-center justify-center" style={{ borderLeftColor: modeDetails.accentColor, borderRightColor: modeDetails.accentColor, borderBottomColor: modeDetails.accentColor, borderTopColor: 'transparent' }}>
                <span className="material-symbols-outlined text-xl" style={{ color: modeDetails.accentColor }}>lock</span>
              </div>
              
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold block" style={{ color: modeDetails.accentColor }}>
                  PAYMENT GATEWAY PROTOCOL
                </span>
                <h2 className="font-serif-editorial text-3xl uppercase text-white mt-1">
                  RAZORPAY PAYMENT GATEWAY
                </h2>
                <p className="text-xs font-mono text-white/70 mt-2">
                  Total Amount: <span className="font-bold text-white text-sm" style={{ color: modeDetails.accentColor }}>{formatPrice(finalTotal)}</span>
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    if (rzpInstance) {
                      rzpInstance.open()
                    } else {
                      handlePay()
                    }
                  }}
                  className="w-full py-4 font-bold text-xs tracking-[0.2em] uppercase rounded shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                >
                  <span className="material-symbols-outlined text-sm">payments</span>
                  <span>OPEN RAZORPAY PAYMENT MODAL ({formatPrice(finalTotal)})</span>
                </button>

                <button
                  onClick={() => setStep('address')}
                  className="w-full py-3 border text-xs font-mono uppercase text-white/70 hover:text-white rounded transition-all cursor-pointer"
                  style={{ borderColor: modeDetails.borderColor }}
                >
                  ← RETURN TO DISPATCH DETAILS
                </button>
              </div>

              {paymentError && (
                <p className="text-xs font-mono text-red-400 p-3 border border-red-500/40 rounded bg-red-950/40">
                  {paymentError}
                </p>
              )}
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto border p-6 sm:p-10 space-y-8 shadow-2xl rounded-2xl text-left font-body relative overflow-hidden"
              style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.accentColor }}
            >
              {/* TOP EMBEDDED RECEIPT HEADER */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-6 gap-4" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md" style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}>
                    <span className="material-symbols-outlined text-2xl font-bold">check_circle</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-[0.3em] uppercase font-bold block" style={{ color: modeDetails.accentColor }}>
                      OFFICIAL ATELIER ORDER RECEIPT
                    </span>
                    <h2 className="font-serif-editorial text-2xl sm:text-3xl text-white uppercase mt-0.5">
                      ACQUISITION CONFIRMED
                    </h2>
                  </div>
                </div>
                
                <div className="text-left sm:text-right font-mono text-xs">
                  <span className="block text-[10px] text-white/50 uppercase">ORDER REFERENCE</span>
                  <span className="font-bold text-white text-sm" style={{ color: modeDetails.accentColor }}>{orderId || 'ORD-SECURED'}</span>
                  <span className="block text-[10px] text-white/50 mt-1">
                    {completedOrder?.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* DISPATCH & CLIENT PROFILE DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border font-mono text-xs" style={{ backgroundColor: `${modeDetails.themeBg}60`, borderColor: `${modeDetails.borderColor}30` }}>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-bold block text-white/40">CLIENT INFORMATION</span>
                  <p className="font-bold text-white text-sm">{completedOrder?.customerName || addressForm.name || 'Valued Client'}</p>
                  {completedOrder?.email && <p className="text-white/70">{completedOrder.email}</p>}
                  {completedOrder?.phone && <p className="text-white/70">{completedOrder.phone}</p>}
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-bold block text-white/40">DISPATCH ADDRESS</span>
                  <p className="text-white/80 leading-relaxed">
                    {completedOrder?.address || `${addressForm.flatNo}, ${addressForm.area}, ${addressForm.city}, ${addressForm.state} - ${addressForm.pincode}`}
                  </p>
                </div>
              </div>

              {/* ITEMIZED PRODUCTS BREAKDOWN TABLE */}
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-white/50 border-b pb-2" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                  <span>ITEMIZED PRODUCTS</span>
                  <span>VALUATION</span>
                </div>

                <div className="space-y-3">
                  {completedOrder?.items && completedOrder.items.length > 0 ? (
                    completedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-lg border" style={{ backgroundColor: `${modeDetails.themeBg}40`, borderColor: `${modeDetails.borderColor}20` }}>
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <div className="relative w-12 h-14 rounded overflow-hidden shrink-0 border" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-serif-editorial text-lg text-white">{item.name}</h4>
                            <p className="text-[10px] font-mono text-white/60">
                              SIZE: <span className="text-white font-bold">{item.size || 'Standard'}</span> • TONE: <span className="text-white font-bold">{item.color || 'Default'}</span> • QTY: <span className="text-white font-bold">{item.quantity}</span>
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-sm font-bold text-white">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-xs font-mono text-white/70">
                      Product items booked and dispatched to atelier.
                    </div>
                  )}
                </div>
              </div>

              {/* TOTAL VALUATION BREAKDOWN */}
              <div className="border-t pt-4 space-y-2 font-mono text-xs" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                <div className="flex justify-between text-white/70">
                  <span>SUBTOTAL</span>
                  <span>₹{(completedOrder?.subtotal ?? subtotal).toLocaleString('en-IN')}</span>
                </div>
                {(completedOrder?.discountAmount ?? discountAmount) > 0 && (
                  <div className="flex justify-between font-bold" style={{ color: modeDetails.accentColor }}>
                    <span>PROMO DISCOUNT</span>
                    <span>-₹{(completedOrder?.discountAmount ?? discountAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/70">
                  <span>EXPRESS INSURED SHIPPING</span>
                  <span>{(completedOrder?.shippingFee ?? shippingFee) === 0 ? 'FREE' : `₹${(completedOrder?.shippingFee ?? shippingFee).toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t font-serif-editorial text-2xl text-white font-bold" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                  <span>TOTAL PAID</span>
                  <span style={{ color: modeDetails.accentColor }}>
                    ₹{(completedOrder?.finalTotal ?? finalTotal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* AUTHORIZED CEO SIGNATURE BLOCK */}
              <div className="pt-6 border-t space-y-3" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 p-4 rounded-xl border" style={{ backgroundColor: `${modeDetails.themeBg}80`, borderColor: modeDetails.accentColor }}>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold block text-white/50">
                      AUTHORIZED & ISSUED BY
                    </span>
                    <p className="font-serif-editorial italic text-xl text-amber-200" style={{ color: modeDetails.accentColor }}>
                      Team Fo4
                    </p>
                    <p className="font-mono font-bold text-xs text-white">
                      Team Fo4
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-white/60">
                      Friends of 4 Atelier
                    </p>
                  </div>

                  <div className="border px-4 py-2 rounded text-center font-mono space-y-0.5" style={{ borderColor: `${modeDetails.accentColor}60`, backgroundColor: `${modeDetails.cardBg}` }}>
                    <span className="text-[9px] font-bold block tracking-widest" style={{ color: modeDetails.accentColor }}>
                      ✦ OFFICIAL ATELIER SEAL ✦
                    </span>
                    <span className="text-[8px] text-white/70 block uppercase">AUTHENTIC HERITAGE GUARANTEE</span>
                    <span className="text-[7px] text-white/40 block">NARASARAOPETA, ANDHRA PRADESH</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: DOWNLOAD RECEIPT PDF & RETURN */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => {
                    const pdfPayload = completedOrder ? {
                      order_id: completedOrder.orderId,
                      created_at: new Date().toISOString(),
                      customer_name: completedOrder.customerName,
                      email: completedOrder.email,
                      phone: completedOrder.phone,
                      address: completedOrder.address,
                      items: completedOrder.items,
                      subtotal: completedOrder.subtotal,
                      discountAmount: completedOrder.discountAmount,
                      shippingFee: completedOrder.shippingFee,
                      finalTotal: completedOrder.finalTotal,
                      order_status: 'CONFIRMED'
                    } : {
                      order_id: orderId || 'ORD-SECURED',
                      customer_name: addressForm.name || 'Valued Client',
                      email: addressForm.email || '',
                      phone: addressForm.phone || '',
                      address: `${addressForm.flatNo}, ${addressForm.area}, ${addressForm.city}`,
                      items: cart.map(i => ({ 
                        name: i.name || i.title || 'Masterpiece', 
                        size: i.selectedSize, 
                        color: i.selectedColor, 
                        quantity: i.quantity, 
                        price: typeof i.price === 'number' ? i.price : i.rawPrice || parseFloat(String(i.price).replace(/[^0-9.]/g, '')) || 0 
                      })),
                      subtotal,
                      discountAmount,
                      shippingFee,
                      finalTotal,
                      order_status: 'CONFIRMED'
                    }
                    downloadInvoicePDF(pdfPayload as any)
                  }}
                  className="flex-1 py-4 font-bold text-xs tracking-[0.2em] uppercase rounded-lg shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2"
                  style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                >
                  <span className="material-symbols-outlined text-sm font-bold">download</span>
                  <span>DOWNLOAD OFFICIAL RECEIPT (PDF)</span>
                </button>

                <Link
                  href="/shop"
                  className="px-6 py-4 border text-xs font-mono font-bold uppercase tracking-wider text-white text-center hover:bg-white/5 rounded-lg transition-all"
                  style={{ borderColor: modeDetails.borderColor }}
                >
                  RETURN TO ARCHIVE COLLECTION
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
