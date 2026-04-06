'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase, getSessionUser } from '@/lib/supabase'
import {
  Product,
  Order,
  checkAdminAuth,
  fetchAllProducts,
  fetchAllOrders,
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_DESCRIPTIONS,
} from '@/lib/admin-helpers'

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { authorized } = await checkAdminAuth()
      if (!authorized) {
        alert("Atelier Access Denied: This account is not in the curated admin list.")
        router.push('/')
        return
      }
      setIsAuthorized(true)
      const [prods, ords] = await Promise.all([fetchAllProducts(), fetchAllOrders()])
      setProducts(prods)
      setOrders(ords)
      setLoading(false)
    }
    init()
  }, [router])

  const handleTestTelegram = async () => {
    const testMessage = `<b>🏛️ ATELIER CONNECTIVITY VERIFIED 🏛️</b>\n\n` +
      `Your boutique is now officially linked to your Telegram phone via the Secure Server Herald.\n\n` +
      `<i>Tradition, Secured.</i>`
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testMessage })
      })
      if (response.ok) alert("Herald Signal Handed to Server! Check your Telegram.")
      else {
        const errorData = await response.json()
        alert(`Herald Failed: ${errorData.error || 'Check .env settings'}`)
      }
    } catch (e) { alert("Could not reach your boutique server.") }
  }

  const handleTestEmail = async () => {
    const { user } = await getSessionUser()
    if (!user) return alert("Session expired")
    try {
      const resp = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.user_metadata?.full_name || 'Admin',
          orderId: 'TEST-123',
          items: [{ name: 'Test Masterpiece', quantity: 1, price: 1000 }],
          total: 1000
        })
      })
      const data = await resp.json()
      if (resp.ok && data.success) alert("Success! Check your mail inbox.")
      else alert(`Failed: ${data.error || 'Server error'}`)
    } catch (err) { alert("Error: Could not reach the email API.") }
  }

  const getCategoryCount = (cat: string) => {
    if (cat === 'Others') return products.filter(p => !['Men', 'Women', 'Sarees', 'Jewellery'].includes(p.category)).length
    return products.filter(p => p.category === cat).length
  }

  const getCategoryStock = (cat: string) => {
    const filtered = cat === 'Others'
      ? products.filter(p => !['Men', 'Women', 'Sarees', 'Jewellery'].includes(p.category))
      : products.filter(p => p.category === cat)
    return filtered.reduce((sum, p) => sum + p.stock, 0)
  }

  const activeOrders = orders.filter(o => o.order_status !== 'Delivered' && o.order_status !== 'Cancelled' && !o.order_status.includes('Refund'))
  const archivedOrders = orders.filter(o => o.order_status === 'Delivered' || o.order_status.includes('Cancelled') || o.order_status.includes('Refund'))

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#fdf9f2] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="font-headline text-3xl text-[#1c1c18] opacity-20"
        >
          Securing the Atelier...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdf9f2]">
      <Header />

      <main className="pt-32 pb-24 px-8 md:px-24 max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <h1 className="font-headline text-5xl md:text-7xl tracking-tighter mb-2">Boutique Command Center</h1>
            <p className="font-body text-sm text-[#747878]">Manage your collections, orders, and heritage archives from one place.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleTestTelegram}
              className="border border-[#a3851a] text-[#a3851a] px-6 py-4 font-body text-[10px] uppercase tracking-widest font-bold hover:bg-[#a3851a] hover:text-white transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">notifications_active</span>
              Test Herald
            </button>
            <button
              onClick={handleTestEmail}
              className="border border-[#a3851a] text-[#a3851a] px-6 py-4 font-body text-[10px] uppercase tracking-widest font-bold hover:bg-[#a3851a] hover:text-white transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">mail</span>
              Test Email
            </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-8 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Total Inventory</span>
            <p className="font-headline text-5xl mt-2">{products.length}</p>
          </div>
          <div className="bg-white p-8 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Out of Stock</span>
            <p className="font-headline text-5xl mt-2 text-red-500">{products.filter(p => p.stock === 0).length}</p>
          </div>
          <div className="bg-white p-8 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Active Orders</span>
            <p className="font-headline text-5xl mt-2 text-[#a3851a]">{activeOrders.length}</p>
          </div>
          <div className="bg-white p-8 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Total Revenue</span>
            <p className="font-headline text-4xl mt-2 text-green-600">₹{orders.filter(o => o.order_status === 'Delivered').reduce((s, o) => s + (o.price || 0), 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Section: Collections */}
        <div className="mb-16">
          <h2 className="font-headline text-3xl tracking-tight mb-8">Collections</h2>
          {loading ? (
            <div className="py-16 text-center opacity-40 font-headline text-xl">Loading Collections...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {CATEGORIES.map((cat, index) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/admin/${encodeURIComponent(cat)}`}
                    className="block bg-white border border-[#1c1c18]/5 p-8 shadow-sm hover:shadow-xl hover:border-[#a3851a]/30 transition-all group relative overflow-hidden"
                  >
                    {/* Background icon */}
                    <span className="material-symbols-outlined text-[120px] absolute -bottom-4 -right-4 text-[#1c1c18]/[0.03] group-hover:text-[#a3851a]/[0.08] transition-colors">
                      {CATEGORY_ICONS[cat]}
                    </span>

                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-[#1c1c18] group-hover:bg-[#a3851a] transition-colors flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-xl text-white">{CATEGORY_ICONS[cat]}</span>
                      </div>
                      <h3 className="font-headline text-2xl mb-1">{cat}</h3>
                      <p className="font-body text-[10px] text-[#747878] mb-6 leading-relaxed">{CATEGORY_DESCRIPTIONS[cat]}</p>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="font-headline text-3xl text-[#1c1c18]">{getCategoryCount(cat)}</p>
                          <p className="font-body text-[9px] uppercase tracking-widest text-[#747878]">Items</p>
                        </div>
                        <div className="text-right">
                          <p className="font-headline text-lg text-[#a3851a]">{getCategoryStock(cat)}</p>
                          <p className="font-body text-[9px] uppercase tracking-widest text-[#747878]">In Stock</p>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#1c1c18]/5 flex items-center justify-between">
                        <span className="font-body text-[9px] uppercase tracking-widest text-[#a3851a] group-hover:text-[#1c1c18] font-bold transition-colors">
                          Manage Collection
                        </span>
                        <span className="material-symbols-outlined text-sm text-[#a3851a] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Orders & Archive */}
        <div>
          <h2 className="font-headline text-3xl tracking-tight mb-8">Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Orders Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.5 }}
              onClick={() => router.push('/admin/orders')}
              className="block bg-white border border-[#1c1c18]/5 p-8 shadow-sm hover:shadow-xl hover:border-[#a3851a]/30 transition-all group relative overflow-hidden cursor-pointer"
            >
                <span className="material-symbols-outlined text-[120px] absolute -bottom-4 -right-4 text-[#1c1c18]/[0.03] group-hover:text-[#a3851a]/[0.08] transition-colors">local_shipping</span>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#a3851a] flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-xl text-white">local_shipping</span>
                  </div>
                  <h3 className="font-headline text-2xl mb-1">Active Orders</h3>
                  <p className="font-body text-[10px] text-[#747878] mb-6">Monitor, dispatch, and track live customer orders</p>

                  <div className="flex gap-8">
                    <div>
                      <p className="font-headline text-4xl text-[#a3851a]">{activeOrders.length}</p>
                      <p className="font-body text-[9px] uppercase tracking-widest text-[#747878]">Pending</p>
                    </div>
                    <div>
                      <p className="font-headline text-4xl text-blue-500">{orders.filter(o => o.order_status === 'Dispatched').length}</p>
                      <p className="font-body text-[9px] uppercase tracking-widest text-[#747878]">Dispatched</p>
                    </div>
                    <div>
                      <p className="font-headline text-4xl text-amber-500">{orders.filter(o => o.order_status === 'Out for Delivery').length}</p>
                      <p className="font-body text-[9px] uppercase tracking-widest text-[#747878]">In Transit</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#1c1c18]/5 flex items-center justify-between">
                    <span className="font-body text-[9px] uppercase tracking-widest text-[#a3851a] group-hover:text-[#1c1c18] font-bold transition-colors">Manage Orders</span>
                    <span className="material-symbols-outlined text-sm text-[#a3851a] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
            </motion.div>

            {/* Shipment Log Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.6 }}
              onClick={() => router.push('/admin/archive')}
              className="block bg-white border border-[#1c1c18]/5 p-8 shadow-sm hover:shadow-xl hover:border-[#a3851a]/30 transition-all group relative overflow-hidden cursor-pointer"
            >
                <span className="material-symbols-outlined text-[120px] absolute -bottom-4 -right-4 text-[#1c1c18]/[0.03] group-hover:text-[#a3851a]/[0.08] transition-colors">inventory</span>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#1c1c18] flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-xl text-white">inventory</span>
                  </div>
                  <h3 className="font-headline text-2xl mb-1">Shipment Log</h3>
                  <p className="font-body text-[10px] text-[#747878] mb-6">Historical archive of deliveries, cancellations & refunds</p>

                  <div className="flex gap-8">
                    <div>
                      <p className="font-headline text-4xl text-green-600">{orders.filter(o => o.order_status === 'Delivered').length}</p>
                      <p className="font-body text-[9px] uppercase tracking-widest text-[#747878]">Delivered</p>
                    </div>
                    <div>
                      <p className="font-headline text-4xl text-red-500">{orders.filter(o => o.order_status === 'Cancelled').length}</p>
                      <p className="font-body text-[9px] uppercase tracking-widest text-[#747878]">Cancelled</p>
                    </div>
                    <div>
                      <p className="font-headline text-4xl text-amber-500">{orders.filter(o => o.order_status === 'Refunded' || o.order_status === 'Refund Initiated').length}</p>
                      <p className="font-body text-[9px] uppercase tracking-widest text-[#747878]">Refunds</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#1c1c18]/5 flex items-center justify-between">
                    <span className="font-body text-[9px] uppercase tracking-widest text-[#a3851a] group-hover:text-[#1c1c18] font-bold transition-colors">View Archive</span>
                    <span className="material-symbols-outlined text-sm text-[#a3851a] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
