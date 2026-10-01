'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useMode, BrandMode } from '@/context/mode-context'
import { supabase } from '@/lib/supabase'
import {
  Product,
  Order,
  checkAdminAuth,
  fetchAllProducts,
  fetchAllOrders,
  CATEGORIES,
  deleteProduct,
  deleteAllProducts,
  upsertProduct,
  DEFAULT_FORM_DATA,
  deleteOrder,
  exportInventoryToCSV,
  exportOrdersToCSV,
} from '@/lib/admin-helpers'

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']

function SafeAdminImage({ src, alt }: { src?: string; alt: string }) {
  const getCleanSrc = (url?: string) => {
    if (!url || !url.trim() || url === 'null' || url === 'undefined' || url.length < 3 || url === '/placeholder.jpg') {
      return '/media__1775044228708.png'
    }
    return url.split(',')[0].trim()
  }

  const [imgSrc, setImgSrc] = useState(() => getCleanSrc(src))

  useEffect(() => {
    setImgSrc(getCleanSrc(src))
  }, [src])

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover"
      onError={() => setImgSrc('/media__1775044228708.png')}
    />
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const { mode, setMode, modeDetails } = useMode()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [reviewsList, setReviewsList] = useState<any[]>([])
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'inventory' | 'reviews' | 'orders' | 'coupons' | 'activity' | 'subscribers'>('inventory')

  // Product creation / edit modal state
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>(DEFAULT_FORM_DATA)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // Single-use Coupons State & Usage Counters
  const [coupons, setCoupons] = useState<Record<string, { type: 'percent' | 'fixed'; val: number }>>({
    'WELCOME10': { type: 'percent', val: 10 },
    'HERITAGE20': { type: 'percent', val: 20 },
    'STREETWEAR15': { type: 'percent', val: 15 },
    'ARCHIVE10': { type: 'fixed', val: 1000 },
  })
  const [newCouponCode, setNewCouponCode] = useState('')
  const [newCouponType, setNewCouponType] = useState<'percent' | 'fixed'>('percent')
  const [newCouponVal, setNewCouponVal] = useState(10)
  const [usedCouponsList, setUsedCouponsList] = useState<string[]>([])
  const [couponRedemptions, setCouponRedemptions] = useState<any[]>([])

  // Member Carts & Wishlists State
  const [memberCarts, setMemberCarts] = useState<any[]>([])
  const [memberWishlists, setMemberWishlists] = useState<any[]>([])

  // Email dispatch modal state (Single Client & Mass Broadcast)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailTargetMode, setEmailTargetMode] = useState<'single' | 'broadcast'>('single')
  const [emailRecipient, setEmailRecipient] = useState({ email: '', name: '' })
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessageBody, setEmailMessageBody] = useState('')
  const [emailAppPassword, setEmailAppPassword] = useState('mpekpyweibetxmcq')
  const [emailSending, setEmailSending] = useState(false)

  const handleOpenSingleEmail = (email: string, name?: string) => {
    setEmailTargetMode('single')
    setEmailRecipient({ email, name: name || 'Valued Client' })
    setEmailSubject('Update Regarding Your Friends of 4 Atelier Order')
    setEmailMessageBody(`Dear ${name || 'Valued Client'},\n\nWe are reaching out from Friends of 4 Atelier with an update regarding your order.\n\nThank you for choosing Friends of 4.\n\nWarm regards,\nTeam Fo4`)
    setIsEmailModalOpen(true)
  }

  const handleOpenBroadcastEmail = () => {
    setEmailTargetMode('broadcast')
    setEmailRecipient({ email: '', name: 'All Registered Customers & Subscribers' })
    setEmailSubject('Exclusive Announcement from Friends of 4 Atelier 🌟')
    setEmailMessageBody(`Dear Friends of 4 Patron,\n\nWe are delighted to share an exclusive announcement from our atelier...\n\nThank you for being a part of our heritage journey.\n\nWarm regards,\nTeam Fo4`)
    setIsEmailModalOpen(true)
  }

  const handleDispatchEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailSubject.trim() || !emailMessageBody.trim()) {
      alert('Please fill in both Subject and Message Body.')
      return
    }

    setEmailSending(true)

    try {
      const allEmails = Array.from(new Set([
        ...orders.map(o => o.email),
        ...subscribers.map(s => s.email)
      ].filter(Boolean)))

      const payload = emailTargetMode === 'broadcast' ? {
        mode: 'broadcast',
        emails: allEmails,
        subject: emailSubject,
        messageBody: emailMessageBody,
        appPassword: emailAppPassword
      } : {
        mode: 'single',
        email: emailRecipient.email,
        name: emailRecipient.name,
        subject: emailSubject,
        messageBody: emailMessageBody,
        appPassword: emailAppPassword
      }

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (res.ok && data.success) {
        alert(data.note || '✓ Email dispatched successfully from friendsof4.support@gmail.com!')
        setIsEmailModalOpen(false)
        setEmailSubject('')
        setEmailMessageBody('')
      } else {
        alert(`Failed to send email: ${data.error || 'Server error'}`)
      }
    } catch (err: any) {
      alert(`Email dispatch error: ${err.message}`)
    } finally {
      setEmailSending(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const { authorized } = await checkAdminAuth()
      setIsAuthorized(authorized)
      loadData()
    }
    init()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [prods, ords] = await Promise.all([fetchAllProducts(), fetchAllOrders()])
    setProducts(prods)
    setOrders(ords)

    // Load customer reviews across products
    let allReviews: any[] = []
    try {
      const localRev = JSON.parse(localStorage.getItem('fo4_product_reviews') || '[]')
      const deletedRevIds = JSON.parse(localStorage.getItem('fo4_deleted_review_ids') || '[]')
      allReviews = localRev.filter((r: any) => !deletedRevIds.includes(r.id))
    } catch {}

    try {
      const { data: dbRevs } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
      if (dbRevs && dbRevs.length > 0) {
        const formatted = dbRevs.map((d: any) => ({
          id: d.id,
          productId: String(d.product_id),
          name: d.reviewer_name || 'Client',
          city: d.reviewer_city || 'Verified Buyer',
          rating: d.rating || 5,
          title: d.title || 'Product Review',
          comment: d.comment,
          image: d.image_url,
          date: d.created_at ? d.created_at.split('T')[0] : '2026-09-28',
          verified: true
        }))
        const deletedRevIds = JSON.parse(localStorage.getItem('fo4_deleted_review_ids') || '[]')
        const filteredDb = formatted.filter(r => !deletedRevIds.includes(r.id))
        
        const revMap = new Map()
        allReviews.forEach(r => revMap.set(r.id, r))
        filteredDb.forEach(r => revMap.set(r.id, r))
        allReviews = Array.from(revMap.values())
      }
    } catch {}
    setReviewsList(allReviews)

    // Load subscribers from localStorage & Supabase
    let localSubs: any[] = []
    try {
      localSubs = JSON.parse(localStorage.getItem('fo4_subscribers') || '[]')
    } catch {}

    try {
      const { data: dbSubs } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false })
      if (dbSubs && dbSubs.length > 0) {
        const combined = new Map()
        localSubs.forEach(s => combined.set(s.email, s))
        dbSubs.forEach(s => combined.set(s.email, s))
        setSubscribers(Array.from(combined.values()))
      } else {
        setSubscribers(localSubs)
      }
    } catch {
      setSubscribers(localSubs)
    }

    // Load coupons and detailed redemption logs
    try {
      const savedCoupons = JSON.parse(localStorage.getItem('fo4_admin_coupons') || '{}')
      if (Object.keys(savedCoupons).length > 0) {
        setCoupons(prev => ({ ...prev, ...savedCoupons }))
      }
      const used = JSON.parse(localStorage.getItem('fo4_used_coupons') || '[]')
      setUsedCouponsList(used)
      const redemptions = JSON.parse(localStorage.getItem('fo4_coupon_redemptions') || '[]')
      setCouponRedemptions(redemptions)
    } catch {}

    // Load member carts and wishlists across client sessions
    try {
      const rawCart = JSON.parse(localStorage.getItem('friends_of_4_cart') || '[]')
      const rawWish = JSON.parse(localStorage.getItem('friends_of_4_wishlist') || '[]')
      setMemberCarts(rawCart)
      setMemberWishlists(rawWish)
    } catch {}

    setLoading(false)
  }

  // Broadcast real-time product updates site-wide
  const notifyProductSync = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new CustomEvent('fo4_product_updated'))
    }
  }

  // Filter products strictly by active mode
  const modeProducts = products.filter(p => {
    if (mode === 'streetwear') return p.mode === 'streetwear' || p.category === 'Men' || p.category === 'Tees & Tops' || p.category === 'Hoodies & Outerwear'
    if (mode === 'traditional') return p.mode === 'traditional' || p.category === 'Sarees' || p.category === 'Kurtas & Chudidhars' || p.category === 'Architectural Sarees'
    return p.mode === 'archive' || p.category === 'Women' || p.category === 'Statement Archive'
  })

  const modeOrders = orders.filter(o => o.order_status !== 'TRASHED')

  const handleOpenAdd = () => {
    setFormData({
      ...DEFAULT_FORM_DATA,
      mode: mode === 'streetwear' ? 'streetwear' : mode === 'traditional' ? 'traditional' : 'archive',
      category: mode === 'traditional' ? 'Sarees' : mode === 'streetwear' ? 'Men' : 'Women',
      sizes: ['S', 'M', 'L', 'XL'],
      fabric: ['100% Organic Comb Cotton'],
      care: ['Hand Wash Cold'],
      fit: ['Relaxed Fit'],
      return_policy: '7-day boutique return policy with 24H unboxing inspection guarantee.'
    })
    setIsAdding(true)
    setEditingId(null)
  }

  const handleEditProduct = (product: Product) => {
    setFormData({
      ...product,
      mode: product.mode || mode,
      sizes: product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'],
      fabric: Array.isArray(product.fabric) ? product.fabric : [product.fabric || ''],
      care: Array.isArray(product.care) ? product.care : [product.care || ''],
      fit: Array.isArray(product.fit) ? product.fit : [product.fit || ''],
      return_policy: product.return_policy || '7-day boutique return policy'
    })
    setEditingId(product.id)
    setIsAdding(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? It will be permanently removed from every client website immediately.')) return
    setLoading(true)
    await deleteProduct(id)
    notifyProductSync()
    await loadData()
    setLoading(false)
  }

  const handleDeleteAllModeProducts = async () => {
    const modeTitle = mode.toUpperCase()
    if (!confirm(`⚠️ ARE YOU SURE YOU WANT TO DELETE ALL PRODUCTS IN ${modeTitle} MODE?\n\nThis will permanently erase all ${modeProducts.length} items from ${modeTitle} inventory across the website.`)) {
      return
    }
    setLoading(true)
    const res = await deleteAllProducts(mode)
    if (res.success) {
      notifyProductSync()
      alert(`Successfully deleted ${res.count} products from ${modeTitle} mode across the website!`)
      await loadData()
    } else {
      alert(`Failed to delete products: ${res.error}`)
    }
    setLoading(false)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.image) {
      alert('Please provide at least a Title and Main Image.')
      return
    }
    setLoading(true)
    const payload = {
      ...formData,
      mode: formData.mode || mode
    }
    const res = await upsertProduct(payload, editingId)
    if (res.success) {
      setIsAdding(false)
      setEditingId(null)
      setFormData(DEFAULT_FORM_DATA)
      notifyProductSync()
      await loadData()
    } else {
      alert(`Error saving product: ${res.error}`)
    }
    setLoading(false)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this customer review permanently? Once deleted, it will be removed for everyone across the entire website.')) return
    
    setLoading(true)
    
    // 1. Delete from Supabase table
    try {
      await supabase.from('reviews').delete().eq('id', reviewId)
    } catch (e) {}

    // 2. Add to deleted review IDs blacklist in localStorage
    try {
      const deletedRevIds = JSON.parse(localStorage.getItem('fo4_deleted_review_ids') || '[]')
      if (!deletedRevIds.includes(reviewId)) {
        deletedRevIds.push(reviewId)
        localStorage.setItem('fo4_deleted_review_ids', JSON.stringify(deletedRevIds))
      }

      // Purge from local storage array
      const localRev = JSON.parse(localStorage.getItem('fo4_product_reviews') || '[]')
      const updatedLocal = localRev.filter((r: any) => r.id !== reviewId)
      localStorage.setItem('fo4_product_reviews', JSON.stringify(updatedLocal))

      // Broadcast site-wide storage and custom events
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'))
        window.dispatchEvent(new CustomEvent('fo4_reviews_updated'))
      }
    } catch (e) {}

    await loadData()
    setLoading(false)
    alert('✓ Review permanently deleted from the website for all users!')
  }

  const handleImageFileSelect = async (file: File, field: 'image' | 'image2' | 'image3') => {
    setUploading(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result as string }))
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageFileSelect(file, 'image')
    }
  }

  const handleToggleSize = (size: string) => {
    const currentSizes = formData.sizes || []
    if (currentSizes.includes(size)) {
      setFormData({ ...formData, sizes: currentSizes.filter(s => s !== size) })
    } else {
      setFormData({ ...formData, sizes: [...currentSizes, size] })
    }
  }

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCouponCode.trim()) return
    const code = newCouponCode.trim().toUpperCase()
    const updated = { ...coupons, [code]: { type: newCouponType, val: Number(newCouponVal) } }
    setCoupons(updated)
    try {
      localStorage.setItem('fo4_admin_coupons', JSON.stringify(updated))
      // Remove from deleted blacklist if re-added
      let deletedCodes: string[] = JSON.parse(localStorage.getItem('fo4_deleted_coupons') || '[]')
      deletedCodes = deletedCodes.filter(c => c !== code)
      localStorage.setItem('fo4_deleted_coupons', JSON.stringify(deletedCodes))
    } catch {}
    setNewCouponCode('')
    alert(`✓ Single-Use Coupon ${code} successfully activated for all customers!`)
  }

  const handleDeleteCoupon = (codeToDelete: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY REMOVE coupon code [${codeToDelete}]?\n\nOnce removed, no customer will be able to apply this discount at checkout.`)) {
      return
    }
    const updated = { ...coupons }
    delete updated[codeToDelete]
    setCoupons(updated)
    try {
      localStorage.setItem('fo4_admin_coupons', JSON.stringify(updated))
      let deletedCodes: string[] = JSON.parse(localStorage.getItem('fo4_deleted_coupons') || '[]')
      if (!deletedCodes.includes(codeToDelete)) {
        deletedCodes.push(codeToDelete)
        localStorage.setItem('fo4_deleted_coupons', JSON.stringify(deletedCodes))
      }
    } catch {}
    alert(`✓ Coupon [${codeToDelete}] permanently removed from all user checkouts.`)
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-700" style={{ backgroundColor: modeDetails.themeBg, color: modeDetails.accentColor }}>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="font-serif-editorial text-2xl tracking-[0.2em]">
          SECURING {modeDetails.title.toUpperCase()} ATELIER COMMAND CENTER...
        </motion.div>
      </div>
    )
  }

  const adminModeOptions: { id: BrandMode; label: string }[] = [
    { id: 'streetwear', label: 'STREETWEAR ADMIN' },
    { id: 'archive', label: 'LUXURY ARCHIVE ADMIN' },
    { id: 'traditional', label: 'TRADITIONAL ADMIN' }
  ]

  // Count usage per coupon
  const couponUsageCounts: Record<string, number> = {}
  Object.keys(coupons).forEach(code => {
    couponUsageCounts[code] = usedCouponsList.filter(c => c === code).length
  })

  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-700 font-body" style={{ backgroundColor: modeDetails.themeBg, color: '#F4F1EA' }}>
      <Header />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        {/* BACK BUTTON */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold transition-all hover:opacity-80 cursor-pointer"
            style={{ color: modeDetails.accentColor }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Website
          </button>
          
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#D6CEBE]/70">
            ADMINISTRATOR ACTIVE • {mode.toUpperCase()} MODE
          </div>
        </div>

        {/* TOP HEADER & ECOSYSTEM MODE SWITCHER */}
        <div 
          className="mb-8 p-6 rounded-2xl shadow-2xl transition-all duration-700 border"
          style={{ backgroundColor: modeDetails.cardBg, borderColor: `${modeDetails.borderColor}60` }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[9px] font-mono tracking-[0.3em] uppercase font-bold" style={{ color: modeDetails.accentColor }}>
                ACTIVE ADMIN ECOSYSTEM MODE
              </span>
              <h1 className="font-serif-editorial text-3xl sm:text-4xl tracking-[0.1em] uppercase text-white mt-1">
                {modeDetails.title} COMMAND CENTER
              </h1>
              <p className="text-xs font-mono mt-1 opacity-70" style={{ color: '#D6CEBE' }}>
                {modeDetails.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {adminModeOptions.map((item) => {
                const isActive = mode === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setMode(item.id)}
                    className="px-4 py-3 text-[11px] font-mono tracking-[0.12em] uppercase transition-all duration-300 rounded-xl border shadow-lg flex items-center justify-center gap-2 cursor-pointer font-bold whitespace-nowrap"
                    style={{
                      backgroundColor: isActive ? modeDetails.accentColor : modeDetails.themeBg,
                      color: isActive ? modeDetails.themeBg : '#D6CEBE',
                      borderColor: isActive ? modeDetails.accentColor : `${modeDetails.borderColor}40`,
                    }}
                  >
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS WITH MOBILE RESPONSIVE SCROLL */}
        <div className="flex border-b mb-8 overflow-x-auto scrollbar-none pb-2" style={{ borderColor: `${modeDetails.borderColor}50` }}>
          {[
            { id: 'inventory', label: `PRODUCTS (${modeProducts.length})`, icon: 'inventory_2' },
            { id: 'reviews', label: `REVIEWS CONTROL (${reviewsList.length})`, icon: 'rate_review' },
            { id: 'orders', label: `ORDERS (${modeOrders.length})`, icon: 'receipt_long' },
            { id: 'coupons', label: `COUPONS & ANALYTICS (${usedCouponsList.length})`, icon: 'confirmation_number' },
            { id: 'activity', label: `CUSTOMER CARTS & WISHLISTS`, icon: 'shopping_bag' },
            { id: 'subscribers', label: `SUBSCRIBERS (${subscribers.length})`, icon: 'mail' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3.5 text-xs font-mono tracking-[0.12em] uppercase transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id ? 'font-bold' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                color: activeTab === tab.id ? modeDetails.accentColor : '#D6CEBE',
                borderColor: activeTab === tab.id ? modeDetails.accentColor : 'transparent'
              }}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: `${modeDetails.borderColor}40` }}>
              <div>
                <h2 className="font-serif-editorial text-2xl uppercase text-white">
                  {mode.toUpperCase()} CATALOG PRODUCTS
                </h2>
                <p className="text-xs font-mono text-[#D6CEBE]/70">Items added or edited here will update live across every user&apos;s website in real time.</p>
              </div>

              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <button
                  onClick={handleOpenBroadcastEmail}
                  className="flex-1 sm:flex-none px-4 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-all rounded-xl shadow-lg border flex items-center justify-center gap-2 cursor-pointer bg-purple-950/80 text-purple-200 border-purple-500/50 hover:bg-purple-900"
                  title="Send announcement or update email to all customers at once from friendsof4.support@gmail.com"
                >
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                  <span>BROADCAST EMAIL ALL CLIENTS 📢</span>
                </button>

                <button
                  onClick={() => exportInventoryToCSV(products)}
                  className="flex-1 sm:flex-none px-4 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-all rounded-xl shadow-lg border flex items-center justify-center gap-2 cursor-pointer bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900"
                  title="Download complete product inventory with stock, cost price, selling price to Excel / CSV"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>EXPORT INVENTORY TO EXCEL 📊</span>
                </button>

                <button
                  onClick={handleOpenAdd}
                  className="flex-1 sm:flex-none px-5 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-all rounded-xl shadow-lg border flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg, borderColor: modeDetails.accentColor }}
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>ADD NEW PRODUCT</span>
                </button>
                <button
                  onClick={handleDeleteAllModeProducts}
                  className="flex-1 sm:flex-none px-4 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-all rounded-xl shadow-lg border bg-red-950/80 text-red-200 border-red-800 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                  <span>PURGE {mode.toUpperCase()}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {modeProducts.map((product) => (
                <div
                  key={product.id}
                  className="border p-4 rounded-xl flex flex-col justify-between shadow-xl transition-all duration-300"
                  style={{ backgroundColor: modeDetails.cardBg, borderColor: `${modeDetails.borderColor}40` }}
                >
                  <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4 border" style={{ backgroundColor: modeDetails.themeBg, borderColor: `${modeDetails.borderColor}30` }}>
                    <SafeAdminImage
                      src={product.image}
                      alt={product.title}
                    />
                    <div 
                      className="absolute top-2 left-2 text-[8px] font-mono px-2 py-0.5 uppercase tracking-widest border font-bold"
                      style={{ backgroundColor: modeDetails.themeBg, color: modeDetails.accentColor, borderColor: modeDetails.accentColor }}
                    >
                      {product.mode || mode}
                    </div>
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif-editorial text-lg text-white font-bold line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-[10px] font-mono line-clamp-2 mt-1 text-[#D6CEBE]/70">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between font-mono text-xs" style={{ borderColor: `${modeDetails.borderColor}30` }}>
                      <span className="font-bold text-sm" style={{ color: modeDetails.accentColor }}>₹{(product.price || 0).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-[#D6CEBE]">Stock: {product.stock || 0}</span>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 py-2 px-3 border text-[11px] font-mono uppercase tracking-wider font-bold rounded-lg cursor-pointer text-center"
                        style={{ borderColor: modeDetails.accentColor, color: modeDetails.accentColor }}
                      >
                        EDIT SPECS
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="py-2 px-3 bg-red-950/40 border border-red-500/40 text-red-400 text-[11px] font-mono uppercase tracking-wider font-bold rounded-lg cursor-pointer"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: REVIEWS CONTROL & MODERATION (FULL ADMIN POWER TO DELETE COMMENTS/REVIEWS AND PHOTOS) */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4" style={{ borderColor: `${modeDetails.borderColor}40` }}>
              <div>
                <h2 className="font-serif-editorial text-2xl uppercase text-white">
                  CUSTOMER REVIEWS & MODERATION CONTROL ({reviewsList.length})
                </h2>
                <p className="text-xs font-mono text-[#D6CEBE]/70">
                  Full administrative control over customer feedback and product photos. Deleting a review permanently purges it from everyone&apos;s website view.
                </p>
              </div>

              <span className="px-3 py-1.5 rounded text-xs font-mono font-bold bg-amber-950/60 border border-amber-500/40 text-amber-300">
                LIVE REVIEWS MODERATION ACTIVE
              </span>
            </div>

            {reviewsList.length === 0 ? (
              <div className="p-12 text-center border rounded-xl" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                <p className="font-mono text-sm text-[#D6CEBE]">No customer reviews submitted yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviewsList.map((rev) => {
                  const targetProd = products.find(p => String(p.id) === String(rev.productId))
                  return (
                    <div
                      key={rev.id}
                      className="p-6 border rounded-xl space-y-4 shadow-xl relative flex flex-col justify-between"
                      style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between border-b pb-3" style={{ borderColor: `${modeDetails.borderColor}30` }}>
                          <div>
                            <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">
                              {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))} ({rev.rating || 5}/5)
                            </span>
                            <h3 className="font-serif-editorial text-lg text-white font-bold mt-1">
                              {rev.title || 'Product Feedback'}
                            </h3>
                            <p className="text-[11px] font-mono text-[#D6CEBE]/70">
                              By <strong className="text-white">{rev.name}</strong> ({rev.city || 'Verified Customer'}) • {rev.date}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="px-3 py-1.5 bg-red-950/80 border border-red-600/80 text-red-300 hover:bg-red-900 text-xs font-mono font-bold uppercase rounded flex items-center gap-1 cursor-pointer transition-all shadow"
                            title="Delete comment and remove from everyone's website"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            <span>DELETE COMMENT</span>
                          </button>
                        </div>

                        {/* PRODUCT REFERENCE */}
                        {targetProd && (
                          <div className="text-[10px] font-mono px-3 py-1.5 rounded border bg-black/40 text-emerald-300 flex items-center justify-between" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                            <span>PRODUCT: {targetProd.title}</span>
                            <span className="font-bold">₹{targetProd.price.toLocaleString('en-IN')}</span>
                          </div>
                        )}

                        {/* COMMENT BODY */}
                        <p className="text-xs font-mono text-white/90 leading-relaxed italic bg-black/20 p-3 rounded border" style={{ borderColor: `${modeDetails.borderColor}30` }}>
                          &ldquo;{rev.comment}&rdquo;
                        </p>

                        {/* UPLOADED CUSTOMER PHOTO */}
                        {rev.image && (
                          <div className="space-y-1 pt-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#D6CEBE]">
                              CUSTOMER UPLOADED PRODUCT PHOTO:
                            </span>
                            <div className="relative w-full h-48 border rounded-lg overflow-hidden" style={{ borderColor: modeDetails.accentColor }}>
                              <Image src={rev.image} alt="Customer product photo" fill className="object-cover" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t text-[10px] font-mono text-[#D6CEBE]/60 flex items-center justify-between" style={{ borderColor: `${modeDetails.borderColor}30` }}>
                        <span>REVIEW ID: {rev.id}</span>
                        <span className="text-emerald-400 font-bold">✓ VERIFIED PURCHASER</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DETAILED ORDERS & PURCHASES INSPECTOR */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4" style={{ borderColor: `${modeDetails.borderColor}40` }}>
              <div>
                <h2 className="font-serif-editorial text-2xl uppercase text-white">
                  COMPLETE ORDER DETAILS & PURCHASE RECORD ({orders.length})
                </h2>
                <p className="text-xs font-mono text-[#D6CEBE]/70">View purchaser details, phone numbers, pincodes, product photos, sizes, quantities, and dates.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => exportOrdersToCSV(orders)}
                  className="px-4 py-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900 text-xs font-mono uppercase font-bold tracking-widest rounded-xl cursor-pointer flex items-center gap-2 shadow"
                  title="Download all customer orders into Excel / CSV spreadsheet"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>EXPORT ORDERS TO EXCEL 📊</span>
                </button>

                <Link
                  href="/admin/orders"
                  className="px-5 py-3 border text-xs font-mono uppercase font-bold tracking-widest rounded-xl hover:bg-white/10"
                  style={{ borderColor: modeDetails.accentColor, color: modeDetails.accentColor }}
                >
                  OPEN LOGISTICS PIPELINE →
                </Link>
              </div>
            </div>

            {modeOrders.length === 0 ? (
              <div className="p-12 text-center border rounded-xl" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                <p className="font-mono text-sm text-[#D6CEBE]">No purchase records recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modeOrders.map((ord) => {
                  const rawSeg = ord.customer_segment || ''
                  const inferMode = rawSeg.toLowerCase().includes('traditional') || (ord.product_name && (ord.product_name.toLowerCase().includes('saree') || ord.product_name.toLowerCase().includes('kurta'))) ? 'TRADITIONAL MODE' : rawSeg.toLowerCase().includes('archive') || (ord.product_name && ord.product_name.toLowerCase().includes('gold')) ? 'LUXURY ARCHIVE MODE' : 'STREETWEAR MODE'

                  return (
                    <div key={ord.id} className="p-6 border rounded-xl space-y-4 shadow-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-3 gap-2" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 border rounded" style={{ borderColor: modeDetails.accentColor, color: modeDetails.accentColor }}>
                            ORD-{ord.order_id}
                          </span>
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                            {inferMode}
                          </span>
                          <span className="text-xs font-mono text-[#D6CEBE]">
                            Date & Time: {new Date(ord.created_at || Date.now()).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-xs font-mono font-bold uppercase px-3 py-1 rounded bg-black/40 text-emerald-400 border border-emerald-500/40">
                            STATUS: {ord.order_status}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenSingleEmail(ord.email, ord.customer_name)}
                            className="px-3 py-1 bg-amber-950/80 border border-amber-500/60 text-amber-300 hover:bg-amber-900 text-xs font-mono font-bold uppercase rounded flex items-center gap-1 cursor-pointer transition-all"
                            title="Send custom email to customer from friendsof4.support@gmail.com"
                          >
                            <span className="material-symbols-outlined text-sm">mail</span>
                            <span>EMAIL CLIENT ✉️</span>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm(`Are you sure you want to PERMANENTLY REMOVE order ORD-${ord.order_id}?\n\nIt will be deleted from all order views.`)) return
                              setLoading(true)
                              await deleteOrder(ord.id, ord.order_id)
                              await loadData()
                              setLoading(false)
                              alert(`✓ Order ORD-${ord.order_id} permanently removed.`)
                            }}
                            className="px-3 py-1 bg-red-950/80 border border-red-600/80 text-red-300 hover:bg-red-900 text-xs font-mono font-bold uppercase rounded flex items-center gap-1 cursor-pointer transition-all"
                            title="Delete order record permanently"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            <span>REMOVE RECORD</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs font-mono">
                        {/* CLIENT PURCHASER DETAILS */}
                        <div className="lg:col-span-6 space-y-2 border-r pr-6" style={{ borderColor: `${modeDetails.borderColor}30` }}>
                          <span className="text-[10px] uppercase tracking-widest font-bold block" style={{ color: modeDetails.accentColor }}>
                            PURCHASER & CONTACT DETAILS
                          </span>
                          <p className="text-sm font-bold text-white">Client Name: {ord.customer_name || 'N/A'}</p>
                          <p className="text-[#D6CEBE]">Phone: <a href={`tel:${ord.phone}`} className="underline text-white font-bold">{ord.phone || 'N/A'}</a></p>
                          <p className="text-[#D6CEBE]">Email: {ord.email || 'N/A'}</p>
                          <p className="text-[#D6CEBE] leading-relaxed">Full Delivery Address: <span className="text-white font-bold">{ord.address || 'N/A'}</span></p>
                        </div>

                        {/* PURCHASED ITEM DETAILS & IMAGE */}
                        <div className="lg:col-span-6 space-y-2">
                          <span className="text-[10px] uppercase tracking-widest font-bold block" style={{ color: modeDetails.accentColor }}>
                            PURCHASED ITEM & ITEMIZED BILL
                          </span>
                          <div className="flex gap-4 items-center">
                            <div className="relative w-16 h-20 border rounded overflow-hidden shrink-0" style={{ borderColor: modeDetails.borderColor }}>
                              <Image src="/placeholder.jpg" alt={ord.product_name || 'Product'} fill className="object-cover" />
                            </div>
                            <div>
                              <p className="font-serif-editorial text-lg text-white font-bold">{ord.product_name}</p>
                              <p className="text-[#D6CEBE]">Selected Size: <span className="font-bold text-white">{ord.size || 'M'}</span> | Color Tone: {ord.color || 'Standard'}</p>
                              <p className="text-sm font-bold mt-1" style={{ color: modeDetails.accentColor }}>Total Amount: ₹{(ord.price || 0).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SINGLE-USE COUPONS & USAGE COUNT ANALYTICS */}
        {activeTab === 'coupons' && (
          <div className="space-y-8">
            <div className="border-b pb-4" style={{ borderColor: `${modeDetails.borderColor}40` }}>
              <h2 className="font-serif-editorial text-2xl uppercase text-white">
                SINGLE-USE COUPONS & REDEMPTION ANALYTICS
              </h2>
              <p className="text-xs font-mono text-[#D6CEBE]/70">
                Every coupon is accessible to all customers but strictly enforced as SINGLE-USE per client. Track total usage count and individual redemptions below.
              </p>
            </div>

            {/* ANALYTICS SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 border rounded-xl space-y-1 shadow-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.accentColor }}>
                <span className="text-[10px] font-mono uppercase font-bold text-[#D6CEBE]">TOTAL PEOPLE USING COUPONS</span>
                <p className="font-serif-editorial text-3xl font-bold text-white">{usedCouponsList.length} Redemptions</p>
                <p className="text-[10px] font-mono text-emerald-400">✓ Enforced Single-Use Per Client</p>
              </div>

              <div className="p-5 border rounded-xl space-y-1 shadow-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                <span className="text-[10px] font-mono uppercase font-bold text-[#D6CEBE]">ACTIVE PROMO CODES</span>
                <p className="font-serif-editorial text-3xl font-bold text-white">{Object.keys(coupons).length} Active Codes</p>
                <p className="text-[10px] font-mono text-[#D6CEBE]/70">Accessible to all customers at checkout</p>
              </div>

              <div className="p-5 border rounded-xl space-y-1 shadow-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                <span className="text-[10px] font-mono uppercase font-bold text-[#D6CEBE]">MOST POPULAR COUPON</span>
                <p className="font-serif-editorial text-3xl font-bold text-amber-400">
                  {Object.entries(couponUsageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'WELCOME10'}
                </p>
                <p className="text-[10px] font-mono text-[#D6CEBE]/70">Highest redemption volume</p>
              </div>
            </div>

            {/* CREATE COUPON FORM & ACTIVE COUPONS LIST */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* CREATE FORM */}
              <form onSubmit={handleCreateCoupon} className="lg:col-span-5 p-6 border rounded-xl space-y-4" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                <h3 className="font-mono text-sm font-bold uppercase text-white">CREATE NEW SINGLE-USE COUPON</h3>
                
                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="block mb-1 text-[10px] uppercase text-[#D6CEBE]">COUPON CODE *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VIP25"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className="w-full border p-3 text-white uppercase rounded focus:outline-none"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-[10px] uppercase text-[#D6CEBE]">DISCOUNT TYPE</label>
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value as any)}
                        className="w-full border p-3 text-white rounded focus:outline-none cursor-pointer"
                        style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                      >
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-[10px] uppercase text-[#D6CEBE]">DISCOUNT VALUE</label>
                      <input
                        type="number"
                        required
                        value={newCouponVal}
                        onChange={(e) => setNewCouponVal(Number(e.target.value))}
                        className="w-full border p-3 text-white rounded focus:outline-none"
                        style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-mono font-bold uppercase tracking-widest rounded transition-all cursor-pointer shadow-lg"
                  style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                >
                  ACTIVATE SINGLE-USE COUPON
                </button>
              </form>

              {/* COUPONS WITH LIVE USAGE COUNTER */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-mono text-sm font-bold uppercase text-white">ACTIVE COUPONS & USAGE COUNTER</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(coupons).map(([code, rule]) => {
                    const count = couponUsageCounts[code] || 0
                    return (
                      <div key={code} className="p-4 border rounded-xl space-y-3 shadow-md relative" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-base font-bold text-white">{code}</span>
                          <span className="text-xs font-mono px-2.5 py-1 font-bold uppercase rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                            {count} REDEEMED
                          </span>
                        </div>
                        <p className="text-xs font-mono text-[#D6CEBE]">
                          {rule.type === 'percent' ? `${rule.val}% OFF` : `₹${rule.val} OFF`} (Single-Use Per Account)
                        </p>
                        <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                          <button
                            type="button"
                            onClick={() => router.push('/admin/coupons')}
                            className="text-[10px] font-mono font-bold uppercase text-amber-400 hover:underline"
                          >
                            EDIT COUPON →
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(code)}
                            className="px-2 py-1 bg-red-950/80 border border-red-500/50 text-red-300 hover:bg-red-900 text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition-all"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* DETAILED COUPON REDEMPTION LOG TABLE */}
            <div className="space-y-3 pt-4 border-t" style={{ borderColor: `${modeDetails.borderColor}40` }}>
              <h3 className="font-mono text-sm font-bold uppercase text-white">COMPLETE REDEMPTIONS LOG</h3>
              {couponRedemptions.length === 0 ? (
                <div className="p-6 border rounded-xl text-center text-xs font-mono text-[#D6CEBE]" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                  No redemptions logged yet. As customers checkout with single-use coupons, their details will log here.
                </div>
              ) : (
                <div className="overflow-x-auto text-xs font-mono">
                  <table className="w-full border-collapse border rounded-xl" style={{ borderColor: modeDetails.borderColor }}>
                    <thead>
                      <tr style={{ backgroundColor: modeDetails.cardBg, color: modeDetails.accentColor }}>
                        <th className="p-3 border text-left">CUSTOMER EMAIL / PHONE</th>
                        <th className="p-3 border text-center">COUPON CODE</th>
                        <th className="p-3 border text-center">DISCOUNT VALUE</th>
                        <th className="p-3 border text-center">TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {couponRedemptions.map((log: any, idx: number) => (
                        <tr key={idx} className="border-b" style={{ borderColor: modeDetails.borderColor }}>
                          <td className="p-3 font-bold text-white">{log.email || log.phone || 'Guest Client'}</td>
                          <td className="p-3 text-center text-amber-400 font-bold">{log.code}</td>
                          <td className="p-3 text-center text-emerald-400">₹{log.discount}</td>
                          <td className="p-3 text-center text-[#D6CEBE]">{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: MEMBER ACTIVITY - CARTS & SAVED WISHLISTS */}
        {activeTab === 'activity' && (
          <div className="space-y-8">
            <div className="border-b pb-4" style={{ borderColor: `${modeDetails.borderColor}40` }}>
              <h2 className="font-serif-editorial text-2xl uppercase text-white">
                MEMBER SELECTIONS & WISHLIST MONITORING
              </h2>
              <p className="text-xs font-mono text-[#D6CEBE]/70">
                Access and monitor clothes selected by members into active shopping carts and saved wishlists across browser sessions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ACTIVE SHOPPING CARTS */}
              <div className="p-6 border rounded-xl space-y-4" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                  <h3 className="font-mono text-sm font-bold uppercase text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: modeDetails.accentColor }}>shopping_bag</span>
                    <span>ACTIVE SHOPPING CARTS ({memberCarts.length} Items)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400">LIVE SESSION</span>
                </div>

                {memberCarts.length === 0 ? (
                  <p className="text-xs font-mono text-[#D6CEBE]/70 text-center py-6">No active cart items currently selected by members.</p>
                ) : (
                  <div className="space-y-3">
                    {memberCarts.map((item: any, i: number) => (
                      <div key={i} className="p-3 border rounded-lg flex items-center justify-between text-xs font-mono" style={{ backgroundColor: modeDetails.themeBg, borderColor: `${modeDetails.borderColor}30` }}>
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-[10px] text-[#D6CEBE]">Size: {item.size} | Qty: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-amber-400">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SAVED WISHLISTS */}
              <div className="p-6 border rounded-xl space-y-4" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                  <h3 className="font-mono text-sm font-bold uppercase text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ color: modeDetails.accentColor }}>favorite</span>
                    <span>SAVED WISHLISTS ({memberWishlists.length} Items)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400">CURATED FAVORITES</span>
                </div>

                {memberWishlists.length === 0 ? (
                  <p className="text-xs font-mono text-[#D6CEBE]/70 text-center py-6">No saved wishlist items currently selected by members.</p>
                ) : (
                  <div className="space-y-3">
                    {memberWishlists.map((item: any, i: number) => (
                      <div key={i} className="p-3 border rounded-lg flex items-center justify-between text-xs font-mono" style={{ backgroundColor: modeDetails.themeBg, borderColor: `${modeDetails.borderColor}30` }}>
                        <div>
                          <p className="font-bold text-white">{item.title || `Product #${item.product_id}`}</p>
                          <p className="text-[10px] text-[#D6CEBE]">ID: {item.product_id}</p>
                        </div>
                        <span className="font-bold text-amber-400">₹{(item.price || 4800).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: NEWSLETTER SUBSCRIBERS LIST */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: `${modeDetails.borderColor}40` }}>
              <div>
                <h2 className="font-serif-editorial text-2xl uppercase text-white">
                  CAPTURED EMAIL SUBSCRIBERS ({subscribers.length})
                </h2>
                <p className="text-xs font-mono text-[#D6CEBE]/70">Emails submitted at the bottom of pages across the website.</p>
              </div>

              <button
                onClick={() => {
                  const csv = 'Email,SubscribedDate,Mode\n' + subscribers.map(s => `${s.email},${s.created_at || ''},${s.mode || ''}`).join('\n')
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `Fo4_Subscribers_${Date.now()}.csv`
                  a.click()
                }}
                className="px-4 py-2 border text-xs font-mono font-bold uppercase rounded hover:bg-white/10"
                style={{ borderColor: modeDetails.accentColor, color: modeDetails.accentColor }}
              >
                EXPORT TO CSV
              </button>
            </div>

            {subscribers.length === 0 ? (
              <div className="p-8 text-center border rounded-xl" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
                <p className="text-xs font-mono text-[#D6CEBE]">No email subscriptions recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto font-mono text-xs">
                <table className="w-full border-collapse border rounded-xl" style={{ borderColor: modeDetails.borderColor }}>
                  <thead>
                    <tr style={{ backgroundColor: modeDetails.cardBg, color: modeDetails.accentColor }}>
                      <th className="p-3 border text-left" style={{ borderColor: modeDetails.borderColor }}>SUBSCRIBER EMAIL</th>
                      <th className="p-3 border text-center" style={{ borderColor: modeDetails.borderColor }}>SUBMITTED AT</th>
                      <th className="p-3 border text-center" style={{ borderColor: modeDetails.borderColor }}>ECOSYSTEM MODE</th>
                      <th className="p-3 border text-center" style={{ borderColor: modeDetails.borderColor }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub, i) => (
                      <tr key={i} className="border-b" style={{ borderColor: modeDetails.borderColor }}>
                        <td className="p-3 font-bold text-white">{sub.email}</td>
                        <td className="p-3 text-center text-[#D6CEBE]">{sub.created_at ? new Date(sub.created_at).toLocaleString() : 'N/A'}</td>
                        <td className="p-3 text-center text-[#D6CEBE] uppercase">{sub.mode || 'general'}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenSingleEmail(sub.email, 'Valued Subscriber')}
                            className="px-3 py-1 bg-amber-950/80 border border-amber-500/60 text-amber-300 hover:bg-amber-900 text-[10px] font-mono font-bold uppercase rounded flex items-center gap-1 cursor-pointer transition-all inline-flex"
                          >
                            <span className="material-symbols-outlined text-xs">mail</span>
                            <span>EMAIL ✉️</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* CREATE & EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative rounded-2xl"
              style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.accentColor, color: '#F4F1EA' }}
            >
              <button
                onClick={() => setIsAdding(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <h3 className="font-serif-editorial text-2xl uppercase tracking-[0.1em]" style={{ color: modeDetails.accentColor }}>
                {editingId ? 'EDIT ARCHIVAL CREATION' : `INTRODUCE NEW ${mode.toUpperCase()} PRODUCT`}
              </h3>

              <form onSubmit={handleSaveProduct} className="space-y-5 font-mono text-xs">
                <div>
                  <label className="block mb-1 uppercase text-[10px] font-bold text-[#D6CEBE]">PRODUCT TITLE *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border p-3 text-white rounded focus:outline-none"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    placeholder="e.g. Gopuram Blueprint Oversized Tee"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block mb-1 uppercase text-[10px] font-bold text-[#D6CEBE]">PRICE (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price || ''}
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full border p-3 text-white rounded focus:outline-none"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 uppercase text-[10px] font-bold text-[#D6CEBE]">STOCK COUNT *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock || 0}
                      onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full border p-3 text-white rounded focus:outline-none"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 uppercase text-[10px] font-bold text-[#D6CEBE]">PRODUCT CATEGORY *</label>
                    <select
                      value={formData.category || CATEGORIES[0]}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border p-3 text-white rounded focus:outline-none cursor-pointer"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 uppercase text-[10px] font-bold text-[#D6CEBE]">MODE ECOSYSTEM *</label>
                    <select
                      value={formData.mode || mode}
                      onChange={e => setFormData({ ...formData, mode: e.target.value })}
                      className="w-full border p-3 text-white rounded focus:outline-none cursor-pointer"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    >
                      <option value="streetwear">Streetwear</option>
                      <option value="archive">Luxury Archive</option>
                      <option value="traditional">Traditional</option>
                    </select>
                  </div>
                </div>

                {/* AVAILABLE SIZES SELECTION BUTTONS (XS TO 4XL) */}
                <div className="p-4 border rounded-xl space-y-2" style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}>
                  <label className="block uppercase text-[10px] font-bold" style={{ color: modeDetails.accentColor }}>
                    AVAILABLE SIZES SELECTION (UP TO 4XL) *
                  </label>
                  <p className="text-[10px] text-[#D6CEBE]/70">Selected size buttons will appear directly on the product review page for clients.</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {ALL_SIZES.map(sz => {
                      const selected = (formData.sizes || []).includes(sz)
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleToggleSize(sz)}
                          className={`px-4 py-2 text-xs border rounded-lg font-bold transition-all cursor-pointer ${
                            selected ? 'shadow-md' : 'opacity-50'
                          }`}
                          style={{
                            backgroundColor: selected ? modeDetails.accentColor : 'transparent',
                            color: selected ? modeDetails.themeBg : '#FFFFFF',
                            borderColor: modeDetails.accentColor,
                          }}
                        >
                          {sz} {selected ? '✓' : ''}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* EDITABLE FABRIC, CARE, FIT & RETURN POLICY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 uppercase text-[10px] font-bold text-[#D6CEBE]">FABRIC & COMPOSITION</label>
                    <textarea
                      rows={2}
                      value={Array.isArray(formData.fabric) ? formData.fabric.join(', ') : formData.fabric || ''}
                      onChange={e => setFormData({ ...formData, fabric: [e.target.value] })}
                      placeholder="e.g. 100% Organic Comb Cotton, Antique Brass Fasteners"
                      className="w-full border p-3 text-white rounded focus:outline-none"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 uppercase text-[10px] font-bold text-[#D6CEBE]">CARE INSTRUCTIONS</label>
                    <textarea
                      rows={2}
                      value={Array.isArray(formData.care) ? formData.care.join(', ') : formData.care || ''}
                      onChange={e => setFormData({ ...formData, care: [e.target.value] })}
                      placeholder="e.g. Machine Wash Cold Inside Out, Dry Clean"
                      className="w-full border p-3 text-white rounded focus:outline-none"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 uppercase text-[10px] font-bold text-[#D6CEBE]">FIT & MEASUREMENTS</label>
                    <textarea
                      rows={2}
                      value={Array.isArray(formData.fit) ? formData.fit.join(', ') : formData.fit || ''}
                      onChange={e => setFormData({ ...formData, fit: [e.target.value] })}
                      placeholder="e.g. Boxy Archival Fit, Model 6'1 wearing L"
                      className="w-full border p-3 text-white rounded focus:outline-none"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 uppercase text-[10px] font-bold text-[#D6CEBE]">BOUTIQUE RETURN POLICY</label>
                    <textarea
                      rows={2}
                      value={formData.return_policy || ''}
                      onChange={e => setFormData({ ...formData, return_policy: e.target.value })}
                      placeholder="e.g. 7-day return policy with 24h unboxing inspection guarantee"
                      className="w-full border p-3 text-white rounded focus:outline-none"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 uppercase text-[10px] font-bold text-[#D6CEBE]">FULL DESCRIPTION</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border p-3 text-white rounded focus:outline-none"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>

                {/* MULTI-OPTION IMAGE & VIDEO UPLOAD CONTROLS */}
                <div className="space-y-3 p-4 border rounded-xl" style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}>
                  <label className="block font-bold uppercase text-[10px]" style={{ color: modeDetails.accentColor }}>
                    PRODUCT MEDIA & REEL VIDEO (LOCAL FILE, DRAG & DROP, OR IMAGE LINK)
                  </label>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDropImage}
                    className={`p-6 border-2 border-dashed rounded-xl text-center transition-all ${dragOver ? 'bg-white/10' : ''}`}
                    style={{ borderColor: modeDetails.accentColor }}
                  >
                    <span className="material-symbols-outlined text-3xl mb-1" style={{ color: modeDetails.accentColor }}>cloud_upload</span>
                    <p className="text-xs font-bold text-white">Drag & Drop Main Product Image Here</p>
                    <p className="text-[10px] text-[#D6CEBE]/60 mt-1">Or click file selector below</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block mb-1 text-[10px] font-bold text-[#D6CEBE]">PRIMARY MAIN IMAGE (FILE OR URL) *</label>
                      <input
                        type="text"
                        placeholder="Primary image URL link..."
                        value={formData.image || ''}
                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                        className="w-full border p-2 text-white rounded mb-2 text-[11px]"
                        style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleImageFileSelect(e.target.files[0], 'image')}
                        className="w-full text-[10px] text-[#D6CEBE]"
                      />

                      {/* PRESET SAMPLE IMAGES */}
                      <div className="pt-2">
                        <label className="block mb-1 text-[9px] font-bold text-[#D6CEBE] uppercase">1-CLICK SAMPLE PRESET IMAGES:</label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: '👘 Silk Saree', url: '/saree_1.png' },
                            { label: '👕 Streetwear Tee', url: '/media__1775044228708.png' },
                            { label: '👔 Heritage Suit', url: '/men_hero_suit_1775057251070.png' },
                            { label: '👗 Silk Dress', url: '/women_hero_silk_1775057460998.png' },
                            { label: '💎 Ruby Jhumka', url: '/ruby_jhumkas.png' },
                          ].map(p => (
                            <button
                              key={p.url}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, image: p.url }))}
                              className="px-2 py-0.5 text-[9px] font-mono border rounded hover:bg-white/10 text-white transition-all cursor-pointer"
                              style={{ borderColor: modeDetails.borderColor }}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block mb-1 text-[10px] font-bold text-[#D6CEBE]">SECONDARY GALLERY IMAGE 2 (FILE OR URL)</label>
                        <input
                          type="text"
                          placeholder="Gallery image 2 URL..."
                          value={formData.image2 || ''}
                          onChange={e => setFormData({ ...formData, image2: e.target.value })}
                          className="w-full border p-2 text-white rounded mb-1 text-[11px]"
                          style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => e.target.files?.[0] && handleImageFileSelect(e.target.files[0], 'image2')}
                          className="w-full text-[10px] text-[#D6CEBE]"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-[10px] font-bold text-[#D6CEBE]">BLUEPRINT / GALLERY IMAGE 3 (FILE OR URL)</label>
                        <input
                          type="text"
                          placeholder="Blueprint / Gallery image 3 URL..."
                          value={formData.image3 || ''}
                          onChange={e => setFormData({ ...formData, image3: e.target.value })}
                          className="w-full border p-2 text-white rounded mb-1 text-[11px]"
                          style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => e.target.files?.[0] && handleImageFileSelect(e.target.files[0], 'image3')}
                          className="w-full text-[10px] text-[#D6CEBE]"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-[10px] font-bold text-[#D6CEBE]">CINEMATIC REEL VIDEO URL</label>
                        <input
                          type="text"
                          placeholder="https://...mp4 or Video URL"
                          value={formData.video_url || ''}
                          onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                          className="w-full border p-2 text-white rounded text-[11px]"
                          style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 py-3.5 font-bold font-mono uppercase tracking-widest text-xs transition-all rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>{uploading ? 'UPLOADING...' : 'SAVE CREATION TO ATELIER'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="py-3.5 px-6 border uppercase text-xs font-bold font-mono tracking-widest rounded-xl transition-all cursor-pointer"
                    style={{ borderColor: modeDetails.borderColor, color: '#D6CEBE' }}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EMAIL DISPATCH MODAL (SINGLE CLIENT & MASS BROADCAST) */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative rounded-2xl"
              style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.accentColor, color: '#F4F1EA' }}
            >
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-amber-400">
                  OFFICIAL SENDER: FRIENDSOF4.SUPPORT@GMAIL.COM
                </span>
                <h3 className="font-serif-editorial text-2xl uppercase tracking-[0.1em] text-white">
                  {emailTargetMode === 'broadcast' ? '📢 BROADCAST EMAIL TO ALL CLIENTS' : '✉️ SEND CUSTOM EMAIL TO CLIENT'}
                </h3>
                <p className="text-xs font-mono text-[#D6CEBE]/70">
                  {emailTargetMode === 'broadcast' 
                    ? 'This announcement will be dispatched from friendsof4.support@gmail.com to all registered customers & email subscribers.' 
                    : `Direct message will be sent to ${emailRecipient.name || 'Client'} (${emailRecipient.email}) from friendsof4.support@gmail.com.`
                  }
                </p>
              </div>

              <form onSubmit={handleDispatchEmail} className="space-y-4 font-mono text-xs">
                {emailTargetMode === 'single' ? (
                  <div>
                    <label className="block mb-1 uppercase text-[10px] font-bold text-[#D6CEBE]">RECIPIENT CUSTOMER EMAIL *</label>
                    <input
                      type="email"
                      required
                      value={emailRecipient.email}
                      onChange={e => setEmailRecipient({ ...emailRecipient, email: e.target.value })}
                      className="w-full border p-3 text-white rounded focus:outline-none"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                ) : (
                  <div className="p-3 border rounded bg-amber-950/40 border-amber-500/40 text-amber-200 text-[11px] font-mono">
                    <strong>Target Audience:</strong> Broadcast list of all registered customers & newsletter subscribers ({Array.from(new Set([...orders.map(o => o.email), ...subscribers.map(s => s.email)].filter(Boolean))).length} unique recipients).
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="uppercase text-[10px] font-bold text-[#D6CEBE]">GMAIL APP PASSWORD (16-CHARACTERS) *</label>
                    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-[9px] text-amber-400 hover:underline">
                      Generate Google App Password ↗
                    </a>
                  </div>
                  <input
                    type="text"
                    required
                    value={emailAppPassword}
                    onChange={e => setEmailAppPassword(e.target.value)}
                    placeholder="e.g. abcd efgh ijkl mnop"
                    className="w-full border p-3 text-white rounded focus:outline-none font-mono"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                  <p className="text-[9px] text-[#D6CEBE]/60 mt-1">
                    16-character password generated from Google Account → Security → 2-Step Verification → App Passwords for <strong>friendsof4.support@gmail.com</strong>.
                  </p>
                </div>

                <div>
                  <label className="block mb-1 uppercase text-[10px] font-bold text-[#D6CEBE]">EMAIL SUBJECT *</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    placeholder="e.g. Update regarding your Friends of 4 Atelier order"
                    className="w-full border p-3 text-white rounded focus:outline-none"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase text-[10px] font-bold text-[#D6CEBE]">MESSAGE BODY *</label>
                  <textarea
                    rows={8}
                    required
                    value={emailMessageBody}
                    onChange={e => setEmailMessageBody(e.target.value)}
                    placeholder="Write your email content here..."
                    className="w-full border p-3 text-white rounded focus:outline-none leading-relaxed"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>

                <div className="p-3 border rounded bg-black/40 text-[10px] text-[#D6CEBE]/80 space-y-1" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                  <p className="font-bold text-amber-300">✓ Official Atelier Signature Included</p>
                  <p>Messages include official Team Fo4 signature & official support contact: <strong>friendsof4.support@gmail.com</strong>.</p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={emailSending}
                    className="flex-1 py-3.5 font-bold font-mono uppercase tracking-widest text-xs transition-all rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>{emailSending ? 'DISPATCHING EMAIL...' : 'SEND EMAIL FROM FRIENDSOF4.SUPPORT@GMAIL.COM'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="py-3.5 px-6 border uppercase text-xs font-bold font-mono tracking-widest rounded-xl transition-all cursor-pointer"
                    style={{ borderColor: modeDetails.borderColor, color: '#D6CEBE' }}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
