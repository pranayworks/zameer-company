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

declare global {
  interface Window {
    Razorpay: any
  }
}

type CheckoutStep = 'summary' | 'address' | 'paying' | 'success'

interface UserProfile {
  name: string
  email: string
  phone: string
  address: string
  userId: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, subtotal, placeOrder, totalItems } = useCart()

  const [step, setStep] = useState<CheckoutStep>('summary')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [addressConfirmed, setAddressConfirmed] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [orderId, setOrderId] = useState('')
  const [shippingMethod, setShippingMethod] = useState<'Standard' | 'Express'>('Standard')
  const shippingFee = shippingMethod === 'Express' ? 150 : 0

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { user, error } = await getSessionUser()
      if (error || !user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile({
        name: profileData?.name || user.user_metadata?.full_name || 'Valued Customer',
        email: profileData?.email || user.email || '',
        phone: profileData?.phone || '',
        address: profileData?.address || '',
        userId: user.id,
      })
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && cart.length === 0 && step !== 'success') {
      router.push('/')
    }
  }, [cart, loading, step, router])

  const handleProceedToAddress = () => {
    setStep('address')
  }

  // Express delivery only — no shipping method toggle needed

  const handlePay = async () => {
    if (!profile) return
    setPaymentError('')
    setStep('paying')

    try {
      // 1. Create Razorpay order on server
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: subtotal + shippingFee,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
        }),
      })

      const orderData = await res.json()
      if (!res.ok || !orderData.orderId) {
        throw new Error(orderData.error || 'Could not create payment order')
      }

      // 2. Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Friends of 4 Atelier',
        description: `${totalItems} Editorial Piece${totalItems > 1 ? 's' : ''}`,
        order_id: orderData.orderId,
        prefill: {
          name: profile.name,
          email: profile.email,
          contact: profile.phone,
        },
        theme: {
          color: '#a3851a',
          backdrop_color: '#0b0b0b',
        },
        modal: {
          ondismiss: () => {
            setStep('address')
            setPaymentError('Payment was cancelled. You can try again.')
          },
        },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          // 3. Verify payment on server
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            // 4. Place order in Supabase + send Telegram notification
            setOrderId(response.razorpay_payment_id)
            // @ts-ignore
            await placeOrder(shippingMethod, shippingFee)
            
            // 5. Send confirmation email
            try {
              const emailResp = await fetch('/api/send-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: profile.email,
                  name: profile.name,
                  orderId: response.razorpay_payment_id,
                  items: cart,
                  total: subtotal + shippingFee,
                  shippingMethod,
                  shippingFee
                })
              })
              const emailData = await emailResp.json()
              if (!emailResp.ok || !emailData.success) {
                console.error('Email API returned error:', emailData.error)
              } else {
                console.log('Confirmation email successfully queued')
              }
            } catch (emailError) {
              console.error('Failed to connect to email API:', emailError)
            }

            setStep('success')
          } else {
            setStep('address')
            setPaymentError('Payment verification failed. Please contact support.')
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (res: any) => {
        setStep('address')
        setPaymentError(`Payment failed: ${res.error?.description || 'Unknown error'}`)
      })
      rzp.open()
    } catch (err: any) {
      setStep('address')
      setPaymentError(err.message || 'Something went wrong. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf9f2] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#a3851a] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdf9f2] flex flex-col font-body">
      <Header />

      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 xl:px-24 max-w-[1400px] mx-auto w-full">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#a3851a] mb-4">Secure Checkout</p>
          <h1 className="font-headline text-5xl lg:text-7xl text-[#1c1c18]">Finalise Your Order</h1>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-16">
          {[
            { id: 'summary', label: 'Review', icon: 'receipt_long' },
            { id: 'address', label: 'Address', icon: 'location_on' },
            { id: 'paying', label: 'Payment', icon: 'payment' },
            { id: 'success', label: 'Confirmed', icon: 'check_circle' },
          ].map((s, i, arr) => {
            const steps: CheckoutStep[] = ['summary', 'address', 'paying', 'success']
            const currentIndex = steps.indexOf(step)
            const thisIndex = steps.indexOf(s.id as CheckoutStep)
            const isActive = s.id === step
            const isDone = thisIndex < currentIndex

            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isDone ? 'bg-[#a3851a] text-white shadow-lg' :
                    isActive ? 'bg-[#1c1c18] text-white shadow-xl scale-110' :
                    'bg-[#1c1c18]/10 text-[#747878]'
                  }`}>
                    <span className="material-symbols-outlined text-sm">
                      {isDone ? 'check' : s.icon}
                    </span>
                  </div>
                  <span className={`text-[8px] uppercase tracking-widest ${isActive ? 'text-[#1c1c18] font-bold' : 'text-[#747878]'}`}>
                    {s.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`w-12 md:w-24 h-px mx-2 mb-5 transition-all duration-700 ${thisIndex < currentIndex ? 'bg-[#a3851a]' : 'bg-[#1c1c18]/10'}`} />
                )}
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: ORDER SUMMARY ── */}
          {step === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-12"
            >
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="font-headline text-2xl text-[#1c1c18] mb-6">Your Bag ({totalItems} {totalItems === 1 ? 'piece' : 'pieces'})</h2>
                {cart.map((item) => {
                  const price = typeof item.price === 'string'
                    ? parseFloat(item.price.replace('₹', '').replace(',', '').replace('$', ''))
                    : item.price
                  return (
                    <motion.div
                      key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                      layout
                      className="flex gap-6 p-6 bg-white border border-[#1c1c18]/5 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="relative w-20 aspect-[3/4] bg-[#f5f0e8] overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-headline text-lg text-[#1c1c18] leading-tight">{item.name}</h3>
                          <div className="flex gap-4 mt-2">
                            {item.selectedSize && (
                              <span className="text-[9px] uppercase tracking-widest text-[#747878] bg-[#1c1c18]/5 px-2 py-1">Size: {item.selectedSize}</span>
                            )}
                            {item.selectedColor && (
                              <span className="text-[9px] uppercase tracking-widest text-[#747878] bg-[#1c1c18]/5 px-2 py-1">Color: {item.selectedColor}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-[9px] uppercase tracking-widest text-[#747878]">Qty: {item.quantity}</span>
                          <span className="font-headline text-xl text-[#1c1c18]">₹{(price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Summary Box */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-[#1c1c18]/5 p-8 shadow-sm sticky top-32">
                  <h2 className="font-headline text-2xl text-[#1c1c18] mb-8 border-b border-[#1c1c18]/5 pb-4">Order Total</h2>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-xs font-body">
                      <span className="uppercase tracking-widest text-[#747878]">Subtotal</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex flex-col gap-4 py-4 border-y border-[#1c1c18]/5">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#1c1c18]">Shipping Method</span>
                      
                      {/* Standard Option */}
                      <div 
                        className={`flex items-center justify-between p-5 border cursor-pointer transition-all ${shippingMethod === 'Standard' ? 'border-[#a3851a] bg-[#a3851a]/5 shadow-inner' : 'border-[#1c1c18]/10 hover:border-[#a3851a]/50'}`}
                        onClick={() => setShippingMethod('Standard')}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${shippingMethod === 'Standard' ? 'border-[#a3851a]' : 'border-[#1c1c18]/30'}`}>
                            {shippingMethod === 'Standard' && <div className="w-2 h-2 rounded-full bg-[#a3851a]" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#1c1c18]">Standard Delivery</span>
                            <span className={`text-[9px] uppercase font-bold ${shippingMethod === 'Standard' ? 'text-[#a3851a]' : 'text-[#747878]'}`}>Delivery takes 5–7 Days</span>
                          </div>
                        </div>
                        <span className="font-headline text-xl text-[#1c1c18]">Free</span>
                      </div>

                      {/* Express Option */}
                      <div 
                        className={`flex items-center justify-between p-5 border cursor-pointer transition-all ${shippingMethod === 'Express' ? 'border-[#a3851a] bg-[#a3851a]/5 shadow-inner' : 'border-[#1c1c18]/10 hover:border-[#a3851a]/50'}`}
                        onClick={() => setShippingMethod('Express')}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${shippingMethod === 'Express' ? 'border-[#a3851a]' : 'border-[#1c1c18]/30'}`}>
                            {shippingMethod === 'Express' && <div className="w-2 h-2 rounded-full bg-[#a3851a]" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#1c1c18]">Express Delivery</span>
                            <span className={`text-[9px] uppercase font-bold ${shippingMethod === 'Express' ? 'text-[#a3851a]' : 'text-[#747878]'}`}>Delivery takes  2–3 Days</span>
                          </div>
                        </div>
                        <span className="font-headline text-xl text-[#1c1c18]">₹150</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs font-body pt-4">
                      <span className="uppercase tracking-widest text-[#747878]">Shipping Fee</span>
                      <span>₹{shippingFee}</span>
                    </div>
                    <div className="border-t border-[#1c1c18]/10 pt-4 flex justify-between items-baseline">
                      <span className="text-[10px] uppercase tracking-widest font-bold">Total Payable</span>
                      <span className="font-headline text-3xl text-[#a3851a]">₹{(subtotal + shippingFee).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToAddress}
                    className="w-full gold-satin text-white py-5 font-body uppercase tracking-[0.3em] text-[10px] font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Confirm Address
                  </button>

                  <Link
                    href="/"
                    className="block text-center mt-4 text-[9px] uppercase tracking-widest text-[#747878] hover:text-[#1c1c18] transition-colors"
                  >
                    ← Continue Shopping
                  </Link>

                  {/* Trust badges */}
                  <div className="mt-8 pt-8 border-t border-[#1c1c18]/5 space-y-3">
                    {[
                      { icon: 'lock', label: '256-bit SSL Secured Checkout' },
                      { icon: 'local_shipping', label: 'Free Express Delivery' },
                      { icon: 'replay', label: '7-Day Easy Returns' },
                    ].map((b) => (
                      <div key={b.label} className="flex items-center gap-3 text-[#747878]">
                        <span className="material-symbols-outlined text-sm text-[#a3851a]">{b.icon}</span>
                        <span className="text-[9px] uppercase tracking-widest">{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: ADDRESS CONFIRMATION ── */}
          {step === 'address' && (
            <motion.div
              key="address"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="font-headline text-3xl text-[#1c1c18] mb-2">Delivery Address</h2>
              <p className="text-[10px] uppercase tracking-widest text-[#747878] mb-10">Where shall we dispatch your order?</p>

              {paymentError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                  <p className="text-xs text-red-600 font-body">{paymentError}</p>
                </motion.div>
              )}

              {/* No address case */}
              {!profile?.address ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-amber-200 shadow-sm p-10 text-center"
                >
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-3xl text-amber-500">location_off</span>
                  </div>
                  <h3 className="font-headline text-2xl text-[#1c1c18] mb-3">No Delivery Address Found</h3>
                  <p className="font-body text-sm text-[#747878] mb-8 leading-relaxed">
                    You haven't set a delivery address yet. Please add your address in your account profile so we know where to dispatch your order.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/profile/shipping-address"
                      className="inline-flex items-center gap-2 bg-[#1c1c18] text-white py-4 px-8 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#a3851a] transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">person</span>
                      Go to Add Address
                    </Link>
                    <button
                      onClick={async () => {
                        // Re-fetch in case user just updated
                        setLoading(true)
                        const { user } = await getSessionUser()
                        if (user) {
                          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                          if (profileData?.address) {
                            setProfile(prev => prev ? { ...prev, address: profileData.address } : prev)
                          }
                        }
                        setLoading(false)
                      }}
                      className="inline-flex items-center gap-2 border border-[#1c1c18]/20 py-4 px-8 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#1c1c18]/5 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      Refresh
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Address exists - confirm it */
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {!addressConfirmed ? (
                    <div className="bg-white border border-[#1c1c18]/5 shadow-sm p-10">
                      <div className="flex items-start gap-4 mb-8">
                        <div className="w-12 h-12 bg-[#fdf9f2] rounded-full flex items-center justify-center shrink-0 mt-1">
                          <span className="material-symbols-outlined text-xl text-[#a3851a]">home</span>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-[#747878] mb-1">Delivering To</p>
                          <h3 className="font-headline text-2xl text-[#1c1c18] mb-2">{profile.name}</h3>
                          <p className="font-body text-sm text-[#747878] leading-relaxed">{profile.address}</p>
                          {profile.phone && (
                            <p className="font-body text-xs text-[#747878] mt-2">📞 {profile.phone}</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-[#fdf9f2] p-4 mb-8 border-l-2 border-[#a3851a]">
                        <p className="text-[9px] uppercase tracking-widest text-[#a3851a] font-bold mb-1">Confirm Location</p>
                        <p className="font-body text-xs text-[#747878]">Is the above address correct? Please confirm before proceeding to payment.</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => setAddressConfirmed(true)}
                          className="flex-1 gold-satin text-white py-5 font-body uppercase tracking-[0.3em] text-[10px] font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                          Yes, This Is Correct
                        </button>
                        <Link
                          href="/profile/shipping-address"
                          className="flex-1 border border-[#1c1c18]/20 text-[#1c1c18] py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#1c1c18]/5 transition-all flex items-center justify-center gap-3"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Change Address
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* Address confirmed - show pay button */
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="bg-white border border-green-200 shadow-sm p-6 mb-8 flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-green-600 font-bold">Address Confirmed</p>
                          <p className="font-body text-sm text-[#747878] truncate">{profile.address}</p>
                        </div>
                        <button
                          onClick={() => setAddressConfirmed(false)}
                          className="ml-auto text-[9px] uppercase tracking-widest text-[#747878] hover:text-[#1c1c18] underline"
                        >
                          Change
                        </button>
                      </div>

                      {/* Order total recap */}
                      <div className="bg-white border border-[#1c1c18]/5 p-8 mb-8">
                        <h3 className="font-headline text-xl text-[#1c1c18] mb-6">Payment Summary</h3>
                        <div className="space-y-3 mb-6">
                          {cart.map((item) => {
                            const price = typeof item.price === 'string'
                              ? parseFloat(item.price.replace('₹', '').replace(',', '').replace('$', ''))
                              : item.price
                            return (
                              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between items-start text-xs font-body text-[#747878] pb-2 border-b border-[#1c1c18]/5 mb-2 last:border-0 last:mb-0">
                                <div>
                                  <span className="block text-[#1c1c18] font-bold">{item.name} × {item.quantity}</span>
                                  <span className="text-[9px] uppercase tracking-widest block mt-0.5">
                                    {item.selectedSize && `Size: ${item.selectedSize}`} 
                                    {item.selectedSize && item.selectedColor && ` • `}
                                    {item.selectedColor && `Tone: ${item.selectedColor}`}
                                  </span>
                                </div>
                                <span className="font-bold text-[#1c1c18]">₹{(price * item.quantity).toLocaleString('en-IN')}</span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="border-t border-[#1c1c18]/10 pt-4 flex justify-between items-baseline">
                          <span className="text-[10px] uppercase tracking-widest font-bold">Total Payable</span>
                          <span className="font-headline text-3xl text-[#a3851a]">₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Order Timeline Notice */}
                      <div className="bg-amber-50 border border-amber-100 p-5 mb-6 rounded-sm flex items-start gap-4 shadow-sm">
                        <span className="material-symbols-outlined text-amber-500 text-xl shrink-0">info</span>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-amber-900 font-bold leading-relaxed">
                            ✅ Order confirmation will be sent immediately to your email.<br/>
                            🚚 Tracking details will be shared within 48-72 hours after order confirmation.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handlePay}
                        className="w-full gold-satin text-white py-6 font-body uppercase tracking-[0.3em] text-[11px] font-bold shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                      >
                        <span className="material-symbols-outlined">payment</span>
                        Pay ₹{(subtotal + shippingFee).toLocaleString('en-IN')} Securely
                      </button>

                      <p className="text-center text-[9px] text-[#747878] uppercase tracking-widest mt-4">
                        🔒 Secured by Razorpay · 256-bit SSL
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── STEP 3: PAYING ── */}
          {step === 'paying' && (
            <motion.div
              key="paying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-[#a3851a]/20 border-t-[#a3851a] rounded-full mb-8"
              />
              <h2 className="font-headline text-3xl text-[#1c1c18] mb-4">Awaiting Payment</h2>
              <p className="font-body text-sm text-[#747878]">Please complete your payment in the Razorpay window.</p>
            </motion.div>
          )}

          {/* ── STEP 4: SUCCESS ── */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto"
            >
              {/* Green checkmark at top */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                className="relative w-28 h-28 mb-10"
              >
                <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
                <div className="relative w-28 h-28 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="material-symbols-outlined text-white text-5xl">check</span>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <span className="text-[9px] uppercase tracking-[0.4em] text-[#a3851a] block mb-3 font-bold">Payment Successful</span>
                <h2 className="font-headline text-5xl lg:text-6xl text-[#1c1c18] mb-4">Thank You for Your Order!</h2>
                <div className="space-y-2 mb-10">
                  <p className="font-body text-sm text-[#747878]">
                    Order ID: <span className="font-bold text-[#1c1c18] font-mono">{orderId}</span>
                  </p>
                  <p className="font-body text-sm text-[#747878]">
                    Amount Paid: <span className="font-bold text-[#a3851a]">₹{(subtotal + shippingFee).toLocaleString('en-IN')}</span>
                  </p>
                </div>
              </motion.div>

              {/* Vertical timeline */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full text-left mb-12 space-y-0"
              >
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#a3851a] mb-6">Delivery Timeline</h4>
                {[
                  { label: "Order Confirmed", time: "completed", status: "done", icon: "check_circle" },
                  { label: "Order Processing", time: "24 to 48 hours", status: "waiting", icon: "hourglass_empty" },
                  { label: "Order Shipped", time: "Tracking sent to email", status: "pending", icon: "local_shipping" },
                  { label: "Out for Delivery", time: "Arriving Soon", status: "pending", icon: "home" },
                  { label: "Delivered", time: "Final Destination", status: "pending", icon: "task_alt" }
                ].map((s, idx, arr) => (
                  <div key={idx} className="relative pl-10 pb-8 last:pb-0">
                    {/* Line */}
                    {idx < arr.length - 1 && (
                      <div className={`absolute left-[11px] top-7 w-[1px] h-full ${s.status === 'done' ? 'bg-green-500' : 'bg-[#1c1c18]/10'}`} />
                    )}
                    {/* Dot */}
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 ${s.status === 'done' ? 'bg-green-100 text-green-600' : s.status === 'waiting' ? 'bg-amber-100 text-amber-600' : 'bg-[#1c1c18]/5 text-[#747878]/30'}`}>
                      <span className="material-symbols-outlined text-sm">{s.icon}</span>
                    </div>
                    {/* Content */}
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest ${s.status === 'done' ? 'text-green-600' : s.status === 'waiting' ? 'text-amber-600' : 'text-[#747878]'}`}>{s.label}</p>
                      <p className="text-[10px] text-[#747878] uppercase opacity-60 tracking-wider mt-1">{s.time}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex flex-col gap-4 w-full"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => window.open(`https://wa.me/917569145624?text=Greetings%20Friends%20of%204%2C%20I%20have%20a%20query%20regarding%20my%20order%3A%20${orderId}`, '_blank')}
                    className="flex-1 bg-green-600 text-white py-5 font-body uppercase tracking-[0.3em] text-[10px] font-bold shadow-xl hover:bg-green-700 transition-all flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    WhatsApp Support
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="flex-1 bg-[#1c1c18] text-white py-5 font-body uppercase tracking-[0.3em] text-[10px] font-bold shadow-xl hover:bg-[#a3851a] transition-all flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined text-sm">shopping_bag</span>
                    Continue Shopping
                  </button>
                </div>
                
                <button
                  onClick={() => router.push('/account?tab=orders')}
                  className="w-full border border-[#1c1c18]/10 text-[#1c1c18] py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#1c1c18]/5 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-sm">history</span>
                  View Order Status in Account
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
