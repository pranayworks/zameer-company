'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useMode } from '@/context/mode-context'
import { checkAdminAuth, ADMIN_EMAILS } from '@/lib/admin-helpers'
import { supabase } from '@/lib/supabase'
import { Ticket, Plus, Edit2, Trash2, CheckCircle2, ShieldAlert, Tag, Percent, IndianRupee } from 'lucide-react'

export interface CouponItem {
  code: string
  type: 'percent' | 'fixed'
  val: number
  description?: string
  status: 'active' | 'disabled'
}

export default function AdminCouponsPage() {
  const router = useRouter()
  const { modeDetails } = useMode()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  const [coupons, setCoupons] = useState<CouponItem[]>([
    { code: 'WELCOME10', type: 'percent', val: 10, description: '10% Off First Acquisition', status: 'active' },
    { code: 'HERITAGE20', type: 'percent', val: 20, description: '20% Off Royal Heritage Silk', status: 'active' },
    { code: 'STREETWEAR15', type: 'percent', val: 15, description: '15% Off Brutalist Streetwear', status: 'active' },
    { code: 'ARCHIVE10', type: 'fixed', val: 1000, description: '₹1,000 Flat Vault Discount', status: 'active' },
  ])

  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [formData, setFormData] = useState<CouponItem>({
    code: '',
    type: 'percent',
    val: 10,
    description: '',
    status: 'active'
  })

  const [notification, setNotification] = useState<string | null>(null)

  // Verify Admin Authorization
  useEffect(() => {
    const init = async () => {
      const { authorized, email } = await checkAdminAuth()
      if (!authorized) {
        alert(`Access Denied: Account [${email || 'Guest'}] is not authorized to manage Atelier coupons.`)
        router.push('/')
        return
      }
      setIsAuthorized(true)
      loadCoupons()
    }
    init()
  }, [router])

  // Load coupons from localStorage & Supabase
  const loadCoupons = async () => {
    let localMap: Record<string, { type: 'percent' | 'fixed'; val: number; description?: string }> = {}
    if (typeof window !== 'undefined') {
      try {
        localMap = JSON.parse(localStorage.getItem('fo4_admin_coupons') || '{}')
      } catch (e) {}
    }

    // Default base coupons
    const baseCoupons: Record<string, CouponItem> = {
      'WELCOME10': { code: 'WELCOME10', type: 'percent', val: 10, description: '10% Off First Acquisition', status: 'active' },
      'HERITAGE20': { code: 'HERITAGE20', type: 'percent', val: 20, description: '20% Off Royal Heritage Silk', status: 'active' },
      'STREETWEAR15': { code: 'STREETWEAR15', type: 'percent', val: 15, description: '15% Off Brutalist Streetwear', status: 'active' },
      'ARCHIVE10': { code: 'ARCHIVE10', type: 'fixed', val: 1000, description: '₹1,000 Flat Vault Discount', status: 'active' },
    }

    // Merge custom admin coupons
    Object.entries(localMap).forEach(([code, data]) => {
      baseCoupons[code] = {
        code,
        type: data.type || 'percent',
        val: data.val || 10,
        description: data.description || 'Custom Admin Coupon',
        status: 'active'
      }
    })

    // Fetch from Supabase if table exists
    try {
      const { data } = await supabase.from('coupons').select('*')
      if (data && data.length > 0) {
        data.forEach((dbItem: any) => {
          baseCoupons[dbItem.code] = {
            code: dbItem.code,
            type: dbItem.type || 'percent',
            val: Number(dbItem.val) || 10,
            description: dbItem.description || 'Live Supabase Coupon',
            status: dbItem.status || 'active'
          }
        })
      }
    } catch (e) {}

    // Exclude deleted coupons if stored in blacklist
    let deletedCodes: string[] = []
    if (typeof window !== 'undefined') {
      try {
        deletedCodes = JSON.parse(localStorage.getItem('fo4_deleted_coupons') || '[]')
      } catch (e) {}
    }

    const finalArray = Object.values(baseCoupons).filter(c => !deletedCodes.includes(c.code))
    setCoupons(finalArray)
  }

  // Save / Sync Coupons Globally
  const saveCouponToStorageAndCloud = async (couponList: CouponItem[], deletedBlacklist?: string[]) => {
    // 1. Build dictionary for checkout validation
    const adminCouponMap: Record<string, { type: 'percent' | 'fixed'; val: number; description?: string }> = {}
    couponList.forEach(c => {
      if (c.status === 'active') {
        adminCouponMap[c.code] = {
          type: c.type,
          val: c.val,
          description: c.description
        }
      }
    })

    if (typeof window !== 'undefined') {
      localStorage.setItem('fo4_admin_coupons', JSON.stringify(adminCouponMap))
      if (deletedBlacklist) {
        localStorage.setItem('fo4_deleted_coupons', JSON.stringify(deletedBlacklist))
      }
    }

    // 2. Sync to Supabase
    try {
      for (const item of couponList) {
        await supabase.from('coupons').upsert([{
          code: item.code,
          type: item.type,
          val: item.val,
          description: item.description,
          status: item.status
        }], { onConflict: 'code' })
      }
    } catch (e) {}
  }

  // Handle Add / Edit Coupon Submit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = formData.code.trim().toUpperCase()
    if (!cleanCode) {
      alert('Please specify a valid coupon code.')
      return
    }

    const newCoupon: CouponItem = {
      code: cleanCode,
      type: formData.type,
      val: Number(formData.val) || 0,
      description: formData.description || 'Admin Created Coupon',
      status: formData.status
    }

    let updatedList = [...coupons]
    if (editingCode) {
      updatedList = updatedList.map(c => c.code === editingCode ? newCoupon : c)
    } else {
      updatedList = updatedList.filter(c => c.code !== cleanCode)
      updatedList.unshift(newCoupon)
    }

    // Remove code from deleted blacklist if re-adding
    if (typeof window !== 'undefined') {
      try {
        let deletedCodes: string[] = JSON.parse(localStorage.getItem('fo4_deleted_coupons') || '[]')
        deletedCodes = deletedCodes.filter(c => c !== cleanCode)
        localStorage.setItem('fo4_deleted_coupons', JSON.stringify(deletedCodes))
      } catch (e) {}
    }

    setCoupons(updatedList)
    await saveCouponToStorageAndCloud(updatedList)

    setNotification(`Coupon [${cleanCode}] successfully saved and synced globally across all checkouts!`)
    setTimeout(() => setNotification(null), 4000)

    // Reset Form
    setEditingCode(null)
    setFormData({ code: '', type: 'percent', val: 10, description: '', status: 'active' })
  }

  // Handle Edit Button Click
  const handleEditClick = (coupon: CouponItem) => {
    setEditingCode(coupon.code)
    setFormData({ ...coupon })
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  // Handle Delete / Remove Coupon Globally
  const handleDeleteCoupon = async (codeToDelete: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY REMOVE coupon [${codeToDelete}]?\n\nOnce removed, no user will be able to apply this discount at checkout.`)) {
      return
    }

    const updatedList = coupons.filter(c => c.code !== codeToDelete)
    setCoupons(updatedList)

    // Add to deleted blacklist
    let deletedCodes: string[] = []
    if (typeof window !== 'undefined') {
      try {
        deletedCodes = JSON.parse(localStorage.getItem('fo4_deleted_coupons') || '[]')
        if (!deletedCodes.includes(codeToDelete)) {
          deletedCodes.push(codeToDelete)
        }
      } catch (e) {}
    }

    await saveCouponToStorageAndCloud(updatedList, deletedCodes)

    // Delete from Supabase table if table exists
    try {
      await supabase.from('coupons').delete().eq('code', codeToDelete)
    } catch (e) {}

    setNotification(`Coupon [${codeToDelete}] permanently removed from all user checkouts.`)
    setTimeout(() => setNotification(null), 4000)
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-700" style={{ backgroundColor: modeDetails.themeBg, color: modeDetails.accentColor }}>
        <span className="w-8 h-8 border-2 border-t-transparent border-current rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen font-body transition-colors duration-700" style={{ backgroundColor: modeDetails.themeBg, color: '#F4F1EA' }}>
      <Header />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* BACK NAVIGATION BUTTON */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold transition-all hover:opacity-80 cursor-pointer"
            style={{ color: modeDetails.accentColor }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Command Center
          </button>

          <span className="text-[10px] font-mono uppercase tracking-widest text-[#D6CEBE]/70">
            DISCOUNT ENGINE • GLOBAL ATELIER CONTROL
          </span>
        </div>

        {/* PAGE TITLE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b pb-6" style={{ borderColor: `${modeDetails.borderColor}40` }}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${modeDetails.accentColor}20`, color: modeDetails.accentColor }}>
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-serif-editorial text-4xl uppercase tracking-wider text-white">COUPONS & PROMO MANAGER</h1>
                <p className="font-mono text-xs text-[#D6CEBE]/70 mt-1">Add, edit, or remove single-use & VIP discount codes globally</p>
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFICATION FEEDBACK */}
        {notification && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 border rounded-xl font-mono text-xs flex items-center gap-3 bg-emerald-950/60 border-emerald-500/50 text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: ADD / EDIT COUPON FORM */}
          <div className="lg:col-span-5 p-6 border rounded-2xl shadow-xl space-y-6" style={{ backgroundColor: modeDetails.cardBg, borderColor: `${modeDetails.borderColor}60` }}>
            <div>
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase font-bold block mb-1" style={{ color: modeDetails.accentColor }}>
                {editingCode ? 'EDIT EXISTING COUPON' : 'CREATE NEW PROMO CODE'}
              </span>
              <h2 className="font-serif-editorial text-2xl uppercase text-white">
                {editingCode ? `EDITING: ${editingCode}` : 'NEW COUPON CREATION'}
              </h2>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-white/70 mb-1">COUPON CODE (UPPERCASE) *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. VIP25, FESTIVE500"
                    className="w-full border p-3 pl-9 text-white placeholder-white/30 focus:outline-none rounded-xl uppercase"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                  <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/70 mb-1">DISCOUNT TYPE *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percent' | 'fixed' })}
                    className="w-full border p-3 text-white focus:outline-none rounded-xl cursor-pointer"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  >
                    <option value="percent">PERCENTAGE (%)</option>
                    <option value="fixed">FIXED AMOUNT (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/70 mb-1">VALUE ({formData.type === 'percent' ? '%' : '₹'}) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.val}
                    onChange={(e) => setFormData({ ...formData, val: Number(e.target.value) })}
                    className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/70 mb-1">DESCRIPTION / NOTE</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Special festive celebration offer"
                  className="w-full border p-3 text-white placeholder-white/30 focus:outline-none rounded-xl"
                  style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                />
              </div>

              <div className="flex space-x-3 pt-2">
                {editingCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCode(null)
                      setFormData({ code: '', type: 'percent', val: 10, description: '', status: 'active' })
                    }}
                    className="px-4 py-3 border text-xs font-mono uppercase text-white/70 hover:text-white rounded-xl cursor-pointer"
                    style={{ borderColor: modeDetails.borderColor }}
                  >
                    CANCEL
                  </button>
                )}

                <button
                  type="submit"
                  className="flex-1 py-3.5 font-bold text-xs tracking-[0.2em] uppercase transition-all rounded-xl shadow-lg cursor-pointer flex items-center justify-center space-x-2"
                  style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingCode ? 'UPDATE COUPON' : 'SAVE & SYNC GLOBALLY'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: LIVE COUPONS LIST TABLE */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-serif-editorial text-2xl uppercase text-white">
              ACTIVE ATELIER COUPONS ({coupons.length})
            </h2>

            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="p-5 border rounded-2xl shadow-md flex items-center justify-between transition-all hover:border-white/40"
                  style={{ backgroundColor: modeDetails.cardBg, borderColor: `${modeDetails.borderColor}60` }}
                >
                  <div className="space-y-1 font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-lg text-white tracking-wider px-3 py-1 rounded-lg border border-dashed" style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.accentColor }}>
                        {coupon.code}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${modeDetails.accentColor}30`, color: modeDetails.accentColor }}>
                        {coupon.type === 'percent' ? `${coupon.val}% OFF` : `₹${coupon.val.toLocaleString('en-IN')} OFF`}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 pt-1">{coupon.description || 'Active Atelier Promo Code'}</p>
                  </div>

                  <div className="flex items-center space-x-2 font-mono">
                    <button
                      onClick={() => handleEditClick(coupon)}
                      className="p-2.5 border rounded-xl text-xs font-bold uppercase transition-all hover:bg-white/10 cursor-pointer flex items-center space-x-1"
                      style={{ borderColor: modeDetails.borderColor, color: modeDetails.accentColor }}
                      title="Edit Coupon"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden sm:inline">EDIT</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCoupon(coupon.code)}
                      className="p-2.5 border border-red-500/40 text-red-400 bg-red-950/40 hover:bg-red-900/60 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center space-x-1"
                      title="Delete Coupon Globally"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">REMOVE</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
