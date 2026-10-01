'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/context/cart-context'
import { useMode } from '@/context/mode-context'
import { supabase, getSessionUser } from '@/lib/supabase'
import { fetchAllOrders, downloadInvoicePDF, Order } from '@/lib/admin-helpers'

interface UserProfileData {
  name: string
  email: string
  phone: string
  flatNo: string
  area: string
  landmark: string
  pincode: string
  city: string
  state: string
  customerSegment: string
  loyaltyPoints: number
}

interface CompanyReview {
  id: string
  userName: string
  rating: number
  comment: string
  date: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { modeDetails } = useMode()
  const { clearCart } = useCart()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'present' | 'past' | 'rating' | 'vouchers'>('present')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('')

  // User Profile Form State
  const [profile, setProfile] = useState<UserProfileData>({
    name: '',
    email: '',
    phone: '',
    flatNo: '',
    area: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    customerSegment: 'ARCHIVAL PATRON',
    loyaltyPoints: 350
  })

  // Orders State
  const [userOrders, setUserOrders] = useState<Order[]>([])
  
  // Rating & Review State
  const [userRating, setUserRating] = useState<number>(5)
  const [reviewComment, setReviewComment] = useState<string>('')
  const [reviewsList, setReviewsList] = useState<CompanyReview[]>([])
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false)

  useEffect(() => {
    loadUserProfileAndOrders()
  }, [])

  const loadUserProfileAndOrders = async () => {
    setLoading(true)

    // 1. Get Logged In User Email / Session
    const { user } = await getSessionUser()
    let localEmail = typeof window !== 'undefined' ? localStorage.getItem('currentUserEmail') : null

    if (!user && !localEmail) {
      router.push('/login?redirect=/profile')
      return
    }

    const effectiveEmail = (user?.email || localEmail || '').toLowerCase().trim()

    // 2. Load Saved Address from localStorage
    let savedAddress: any = {}
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fo4_saved_default_address')
        if (saved) savedAddress = JSON.parse(saved)
      } catch (e) {}
    }

    // 3. Load user profile from database or local users db
    let userDetails = {
      name: savedAddress.name || '',
      email: effectiveEmail,
      phone: savedAddress.phone || '',
      flatNo: savedAddress.flatNo || '',
      area: savedAddress.area || '',
      landmark: savedAddress.landmark || '',
      pincode: savedAddress.pincode || '',
      city: savedAddress.city || '',
      state: savedAddress.state || '',
      customerSegment: 'ARCHIVAL PATRON',
      loyaltyPoints: 450
    }

    if (user) {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          userDetails.name = profileData.name || userDetails.name
          userDetails.phone = profileData.phone || userDetails.phone
          userDetails.customerSegment = profileData.customer_segment || userDetails.customerSegment
          userDetails.loyaltyPoints = profileData.loyalty_points || userDetails.loyaltyPoints
          if (profileData.address) {
            const parts = profileData.address.split(',')
            if (parts.length > 0 && !userDetails.flatNo) userDetails.flatNo = parts[0].trim()
            if (parts.length > 1 && !userDetails.area) userDetails.area = parts[1].trim()
          }
        }
      } catch (e) {
        console.warn('Profile fetch warning:', e)
      }
    } else if (localEmail && typeof window !== 'undefined') {
      try {
        const dbStr = localStorage.getItem('usersDb')
        const usersDb = dbStr ? JSON.parse(dbStr) : {}
        const localUser = usersDb[localEmail]
        if (localUser) {
          userDetails.name = userDetails.name || localUser.fullName || ''
          userDetails.phone = userDetails.phone || localUser.phone || ''
        }
      } catch (e) {}
    }

    setProfile(userDetails)

    // 4. Fetch User Orders (Present & Past)
    try {
      const allOrders = await fetchAllOrders()
      const userMatchedOrders = allOrders.filter(o => {
        const oEmail = String(o.email || '').toLowerCase().trim()
        const oPhone = String(o.phone || '').replace(/[^0-9]/g, '')
        const pPhone = String(userDetails.phone || '').replace(/[^0-9]/g, '')
        return (oEmail && oEmail === effectiveEmail) || (pPhone && pPhone.length > 5 && oPhone === pPhone)
      })
      setUserOrders(userMatchedOrders)
    } catch (e) {
      console.warn('Orders load warning:', e)
    }

    // 5. Load Company Reviews from Local Storage
    if (typeof window !== 'undefined') {
      try {
        const storedReviews = JSON.parse(localStorage.getItem('fo4_company_user_reviews') || '[]')
        setReviewsList(storedReviews)
        const myReview = storedReviews.find((r: CompanyReview) => r.userName.toLowerCase() === userDetails.name.toLowerCase() || r.id === effectiveEmail)
        if (myReview) {
          setUserRating(myReview.rating)
          setReviewComment(myReview.comment)
          setReviewSubmitted(true)
        }
      } catch (e) {}
    }

    setLoading(false)
  }

  // Save / Update User Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileSuccessMsg('')

    const fullFormattedAddress = `${profile.flatNo}, ${profile.area}${profile.landmark ? ', Landmark: ' + profile.landmark : ''}, ${profile.city}, ${profile.state} - ${profile.pincode}`

    // 1. Update localStorage address
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fo4_saved_default_address', JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          flatNo: profile.flatNo,
          area: profile.area,
          landmark: profile.landmark,
          pincode: profile.pincode,
          city: profile.city,
          state: profile.state,
          saveAsDefault: true
        }))

        // Update local usersDb
        const dbStr = localStorage.getItem('usersDb')
        if (dbStr) {
          const usersDb = JSON.parse(dbStr)
          if (usersDb[profile.email]) {
            usersDb[profile.email].fullName = profile.name
            usersDb[profile.email].phone = profile.phone
            localStorage.setItem('usersDb', JSON.stringify(usersDb))
          }
        }
      } catch (e) {}
    }

    // 2. Update Supabase Profile if session exists
    try {
      const { user } = await getSessionUser()
      if (user) {
        await supabase.from('profiles').upsert([{
          id: user.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: fullFormattedAddress,
          updated_at: new Date().toISOString()
        }])
      }
    } catch (e) {
      console.warn('Supabase profile update skipped:', e)
    }

    setSavingProfile(false)
    setProfileSuccessMsg('✓ Atelier Profile & Dispatch Address Updated Successfully!')
    setTimeout(() => setProfileSuccessMsg(''), 4000)
  }

  // Submit Rating & Review Handler
  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewComment.trim()) return

    const newReview: CompanyReview = {
      id: profile.email || `REV-${Date.now()}`,
      userName: profile.name || 'Valued Atelier Patron',
      rating: userRating,
      comment: reviewComment,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    let updatedList = [newReview, ...reviewsList.filter(r => r.id !== newReview.id)]
    setReviewsList(updatedList)
    setReviewSubmitted(true)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fo4_company_user_reviews', JSON.stringify(updatedList))
      } catch (e) {}
    }
  }

  // Logout Handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUserEmail')
      localStorage.removeItem('isAdminLoggedIn')
    }
    clearCart()
    router.push('/login')
  }

  // Categorize Orders
  const presentOrders = userOrders.filter(o => 
    ['Preparing', 'Dispatched', 'Out for Delivery'].includes(o.order_status)
  )
  const pastOrders = userOrders.filter(o => 
    ['Delivered', 'Completed', 'Cancelled'].includes(o.order_status) || !['Preparing', 'Dispatched', 'Out for Delivery'].includes(o.order_status)
  )

  const parseCleanAddress = (addr: string) => {
    return addr ? addr.replace(/\s\[.* Delivery: ₹\d+\]/, '') : 'Default Dispatch Address'
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
        
        {/* TOP PROFILE BANNER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 border rounded-2xl shadow-2xl mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
          style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.accentColor }}
        >
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-serif-editorial text-2xl sm:text-4xl font-bold shadow-xl border shrink-0"
              style={{ backgroundColor: `${modeDetails.accentColor}20`, borderColor: modeDetails.accentColor, color: modeDetails.accentColor }}
            >
              {(profile.name || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-mono uppercase tracking-[0.25em] px-2.5 py-0.5 rounded-full font-bold border" style={{ backgroundColor: `${modeDetails.accentColor}15`, borderColor: modeDetails.accentColor, color: modeDetails.accentColor }}>
                  {profile.customerSegment}
                </span>
                <span className="text-[9px] font-mono text-amber-300 font-bold">
                  ★ {profile.loyaltyPoints} LOYALTY REWARDS
                </span>
              </div>
              <h1 className="font-serif-editorial text-3xl sm:text-5xl uppercase text-white mt-1">
                {profile.name || 'Valued Atelier Patron'}
              </h1>
              <p className="font-mono text-xs text-[#D6CEBE]/70 mt-0.5">
                {profile.email} • {profile.phone || 'Phone not set'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push('/track-order')}
              className="px-4 py-2.5 border text-xs font-mono uppercase font-bold rounded-xl transition-all hover:bg-white/10 flex items-center gap-2 cursor-pointer"
              style={{ borderColor: modeDetails.borderColor, color: modeDetails.accentColor }}
            >
              <span className="material-symbols-outlined text-sm">local_shipping</span>
              <span>TRACK ACTIVE SHIPMENT</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900 text-xs font-mono uppercase font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>SIGN OUT</span>
            </button>
          </div>
        </motion.div>

        {/* ECOSYSTEM COMMAND NAVIGATION TABS */}
        <div className="flex items-center space-x-2 border-b pb-4 mb-8 overflow-x-auto" style={{ borderColor: `${modeDetails.borderColor}40` }}>
          {[
            { id: 'present', label: `ACTIVE ORDERS (${presentOrders.length})`, icon: 'view_agenda' },
            { id: 'past', label: `PAST ORDER HISTORY (${pastOrders.length})`, icon: 'history' },
            { id: 'profile', label: 'EDIT PROFILE & ADDRESS', icon: 'manage_accounts' },
            { id: 'rating', label: 'RATE ATELIER & REVIEWS', icon: 'grade' },
            { id: 'vouchers', label: 'VIP VOUCHERS & PERKS', icon: 'confirmation_number' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0"
              style={{
                backgroundColor: activeTab === tab.id ? modeDetails.accentColor : 'transparent',
                color: activeTab === tab.id ? modeDetails.themeBg : '#D6CEBE',
                border: activeTab === tab.id ? `1px solid ${modeDetails.accentColor}` : '1px solid transparent'
              }}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: PRESENT ACTIVE ORDERS */}
        {activeTab === 'present' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="font-serif-editorial text-2xl uppercase tracking-wider text-white border-b pb-3" style={{ borderColor: `${modeDetails.borderColor}40` }}>
              CURRENTLY ACTIVE & PRESENT DELIVERIES
            </h2>

            {presentOrders.length === 0 ? (
              <div className="p-12 border rounded-2xl text-center space-y-4" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                <span className="material-symbols-outlined text-5xl opacity-40 block" style={{ color: modeDetails.accentColor }}>package_2</span>
                <h3 className="font-serif-editorial text-2xl uppercase text-white">NO ACTIVE ORDERS IN PIPELINE</h3>
                <p className="text-xs font-mono text-[#D6CEBE]/70 max-w-md mx-auto">
                  You currently have no active orders in preparation or transit. Explore our latest archival pieces to acquire your next garment.
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                  style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                >
                  DISCOVER CATALOG MASTERPIECES →
                </Link>
              </div>
            ) : (
              presentOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="p-6 sm:p-8 border rounded-2xl shadow-xl space-y-6"
                  style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4" style={{ borderColor: `${modeDetails.borderColor}30` }}>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                        ORDER IDENTIFICATION • ORD-{order.order_id}
                      </span>
                      <h3 className="font-serif-editorial text-2xl font-bold text-white mt-0.5">
                        {order.product_name}
                      </h3>
                      <p className="text-[11px] font-mono text-[#D6CEBE]/70">
                        Acquired on {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-mono text-xl font-bold" style={{ color: modeDetails.accentColor }}>
                        ₹{(order.price || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 mt-1">
                        STATUS: {order.order_status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* LIVE LOGISTICS TRACKING BAR */}
                  <div className="space-y-2 pt-2 font-mono">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#D6CEBE]/80 block">
                      ⚡ REAL-TIME SHIPMENT PROGRESSION PIPELINE
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center text-[9px] uppercase font-bold pt-2">
                      <div className={`p-2 rounded border ${['Preparing', 'Dispatched', 'Out for Delivery', 'Delivered'].includes(order.order_status) ? 'bg-amber-950/60 border-amber-500 text-amber-200' : 'bg-black/40 border-white/10 text-white/40'}`}>
                        ✓ Placed & Secured
                      </div>
                      <div className={`p-2 rounded border ${['Preparing', 'Dispatched', 'Out for Delivery', 'Delivered'].includes(order.order_status) ? 'bg-amber-950/60 border-amber-500 text-amber-200' : 'bg-black/40 border-white/10 text-white/40'}`}>
                        🔨 Atelier Tailoring
                      </div>
                      <div className={`p-2 rounded border ${['Dispatched', 'Out for Delivery', 'Delivered'].includes(order.order_status) ? 'bg-amber-950/60 border-amber-500 text-amber-200' : 'bg-black/40 border-white/10 text-white/40'}`}>
                        🚚 In Transit
                      </div>
                      <div className={`p-2 rounded border ${['Out for Delivery', 'Delivered'].includes(order.order_status) ? 'bg-amber-950/60 border-amber-500 text-amber-200' : 'bg-black/40 border-white/10 text-white/40'}`}>
                        📦 Out for Delivery
                      </div>
                    </div>
                  </div>

                  {/* ADDRESS & ACTIONS */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t gap-4" style={{ borderColor: `${modeDetails.borderColor}30` }}>
                    <div className="text-xs font-mono text-[#D6CEBE]/80">
                      <span className="text-[9px] uppercase font-bold block text-white/50">DISPATCH DESTINATION</span>
                      <p className="font-bold text-white mt-0.5">{parseCleanAddress(order.address)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => downloadInvoicePDF(order)}
                        className="px-4 py-2 border text-xs font-mono uppercase font-bold rounded-xl transition-all hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
                        style={{ borderColor: modeDetails.borderColor, color: modeDetails.accentColor }}
                      >
                        <span className="material-symbols-outlined text-sm">print</span>
                        <span>DOWNLOAD INVOICE PDF</span>
                      </button>
                      <Link
                        href={`/track-order?id=${order.order_id}`}
                        className="px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                        style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                      >
                        TRACK LIVE →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* TAB 2: PAST ORDER HISTORY */}
        {activeTab === 'past' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="font-serif-editorial text-2xl uppercase tracking-wider text-white border-b pb-3" style={{ borderColor: `${modeDetails.borderColor}40` }}>
              PAST ACQUISITION & DELIVERED ORDER HISTORY
            </h2>

            {pastOrders.length === 0 ? (
              <div className="p-12 border rounded-2xl text-center space-y-3" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                <span className="material-symbols-outlined text-5xl opacity-40 block" style={{ color: modeDetails.accentColor }}>history_toggle_off</span>
                <h3 className="font-serif-editorial text-2xl uppercase text-white">NO COMPLETED PAST ORDERS YET</h3>
                <p className="text-xs font-mono text-[#D6CEBE]/70 max-w-md mx-auto">
                  Once your current acquisitions are delivered, your entire purchase archive with invoices will appear right here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pastOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 border rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-6"
                    style={{ backgroundColor: modeDetails.cardBg, borderColor: `${modeDetails.borderColor}40` }}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
                          ✓ DELIVERED & COMPLETED
                        </span>
                        <span className="text-xs font-mono text-[#D6CEBE]/60">ORD-{order.order_id}</span>
                      </div>
                      <h4 className="font-serif-editorial text-xl font-bold text-white mt-1">
                        {order.product_name}
                      </h4>
                      <p className="text-xs font-mono text-[#D6CEBE]/70">
                        Acquired on {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} • Size: {order.size || 'M'} • Tone: {order.color || 'Standard'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      <span className="font-mono text-lg font-bold" style={{ color: modeDetails.accentColor }}>
                        ₹{(order.price || 0).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => downloadInvoicePDF(order)}
                        className="px-4 py-2 border text-xs font-mono uppercase font-bold rounded-xl transition-all hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
                        style={{ borderColor: modeDetails.borderColor, color: modeDetails.accentColor }}
                      >
                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                        <span>INVOICE PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: EDIT PROFILE & DISPATCH ADDRESS */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
            <div className="border p-8 rounded-2xl shadow-2xl space-y-6" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
              <div className="border-b pb-4" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                <h2 className="font-serif-editorial text-3xl uppercase text-white">
                  CLIENT PROFILE & DISPATCH ADDRESS VAULT
                </h2>
                <p className="text-xs font-mono text-[#D6CEBE]/70 mt-1">
                  Update your contact info and default shipping location for instant 1-click checkout.
                </p>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 border text-xs font-mono font-bold rounded bg-emerald-950/60 border-emerald-500/50 text-emerald-300">
                  {profileSuccessMsg}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">FULL NAME *</label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">PHONE NUMBER *</label>
                    <input
                      type="tel"
                      required
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">EMAIL ADDRESS (ACCOUNT ID)</label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full border p-3 text-white/50 focus:outline-none rounded-xl cursor-not-allowed opacity-70"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">FLAT / BUILDING / HOUSE NO *</label>
                    <input
                      type="text"
                      required
                      value={profile.flatNo}
                      onChange={(e) => setProfile({ ...profile, flatNo: e.target.value })}
                      placeholder="e.g. Flat 402, Pinnacle Heights"
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">AREA / STREET / LOCALITY *</label>
                    <input
                      type="text"
                      required
                      value={profile.area}
                      onChange={(e) => setProfile({ ...profile, area: e.target.value })}
                      placeholder="e.g. Indiranagar 100ft Road"
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl"
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
                      value={profile.pincode}
                      onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                      placeholder="560038"
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">CITY *</label>
                    <input
                      type="text"
                      required
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      placeholder="Bengaluru"
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">STATE *</label>
                    <input
                      type="text"
                      required
                      value={profile.state}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      placeholder="Karnataka"
                      className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full py-4 font-bold text-xs tracking-[0.25em] uppercase transition-all duration-300 rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    <span>{savingProfile ? 'SAVING PROFILE...' : 'SAVE & UPDATE DISPATCH DETAILS'}</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* TAB 4: RATE COMPANY & CLIENT REVIEWS */}
        {activeTab === 'rating' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* COMPANY RATING STATS BANNER */}
            <div className="p-8 border rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.accentColor }}>
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-400 block">
                  FRIENDS OF 4 ATELIER SATISFACTION INDEX
                </span>
                <h2 className="font-serif-editorial text-3xl sm:text-4xl uppercase text-white">
                  4.9 OUT OF 5.0 STAR PATRON SATISFACTION
                </h2>
                <p className="text-xs font-mono text-[#D6CEBE]/70">
                  Based on 2,480+ verified heritage garment deliveries & artisan craftsmanship feedback.
                </p>
              </div>

              <div className="flex items-center space-x-1 text-amber-400 text-3xl shrink-0">
                {'★'.repeat(5)}
              </div>
            </div>

            {/* RATING SUBMISSION FORM */}
            <div className="p-8 border rounded-2xl shadow-xl space-y-6 max-w-3xl mx-auto" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
              <div className="border-b pb-4" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                <h3 className="font-serif-editorial text-2xl uppercase text-white">
                  RATE YOUR ATELIER EXPERIENCE
                </h3>
                <p className="text-xs font-mono text-[#D6CEBE]/70 mt-1">
                  Share your valuable feedback on our garments, shipping, and concierge support.
                </p>
              </div>

              {reviewSubmitted && (
                <div className="p-3 border text-xs font-mono font-bold rounded bg-emerald-950/60 border-emerald-500/50 text-emerald-300">
                  ✓ Thank you! Your official company review has been recorded in the Friends of 4 Atelier Vault.
                </div>
              )}

              <form onSubmit={handleSubmitRating} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/60 mb-2">SELECT YOUR RATING *</label>
                  <div className="flex items-center space-x-3 text-2xl cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        className={`transition-all hover:scale-125 ${star <= userRating ? 'text-amber-400' : 'text-white/20'}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-300 ml-2">({userRating} / 5 Stars)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">YOUR REVIEW & EXPERIENCE *</label>
                  <textarea
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us what you loved about your archival pieces, packaging, or delivery..."
                    className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl leading-relaxed"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 font-bold text-xs tracking-[0.2em] uppercase rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                >
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span>SUBMIT PATRON RATING & REVIEW</span>
                </button>
              </form>
            </div>

            {/* LIVE PATRON REVIEWS LIST */}
            <div className="space-y-4 max-w-3xl mx-auto">
              <h3 className="font-serif-editorial text-xl uppercase tracking-wider text-white">
                PATRON TESTIMONIALS & REVIEWS ({reviewsList.length})
              </h3>

              {reviewsList.map((rev, idx) => (
                <div key={idx} className="p-5 border rounded-xl space-y-2" style={{ backgroundColor: modeDetails.cardBg, borderColor: `${modeDetails.borderColor}40` }}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-white">{rev.userName}</span>
                      <span className="text-amber-400 text-xs">{'★'.repeat(rev.rating)}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#D6CEBE]/60">{rev.date}</span>
                  </div>
                  <p className="text-xs font-mono text-[#D6CEBE]/90 leading-relaxed">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 5: VIP VOUCHERS & PERKS */}
        {activeTab === 'vouchers' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl mx-auto">
            <div className="p-8 border rounded-2xl shadow-xl space-y-6" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
              <div className="border-b pb-4" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-400 block">
                  EXCLUSIVE CLIENT PRIVILEGES
                </span>
                <h2 className="font-serif-editorial text-3xl uppercase text-white mt-1">
                  PATRON SINGLE-USE PROMO VOUCHERS
                </h2>
                <p className="text-xs font-mono text-[#D6CEBE]/70 mt-1">
                  Active single-use promo coupons available for your account. Copy and apply during checkout.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { code: 'WELCOME10', desc: '10% OFF ON ENTIRE CATALOG ACQUISITION', tag: 'NEW PATRON GIFT' },
                  { code: 'HERITAGE20', desc: '20% OFF ON TRADITIONAL COUTURE COLLECTION', tag: 'COUTURE SPECIAL' },
                  { code: 'STREETWEAR15', desc: '15% OFF ON STREETWEAR ARCHIVE PIECES', tag: 'LIMITED EDITION' },
                  { code: 'ARCHIVE10', desc: '₹1,000 FLAT DISCOUNT ON LUXURY VAULT', tag: 'VIP EXCLUSIVE' }
                ].map((v) => (
                  <div key={v.code} className="p-5 border rounded-xl space-y-3 relative overflow-hidden" style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.accentColor }}>
                    <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                      {v.tag}
                    </span>
                    <h3 className="font-mono text-xl font-bold tracking-widest text-white mt-1">
                      {v.code}
                    </h3>
                    <p className="text-[10px] font-mono text-[#D6CEBE]/80">
                      {v.desc}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(v.code)
                        alert(`✓ Promo Code ${v.code} copied to clipboard!`)
                      }}
                      className="w-full py-2 font-mono text-[10px] font-bold uppercase tracking-widest rounded border transition-all hover:bg-white/10 cursor-pointer"
                      style={{ borderColor: modeDetails.borderColor, color: modeDetails.accentColor }}
                    >
                      COPY CODE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  )
}
