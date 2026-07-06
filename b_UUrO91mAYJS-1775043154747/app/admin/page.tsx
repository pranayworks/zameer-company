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

const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Process categories (Sarees, Men, Women, Jewellery)
    for (const category in data) {
      let sheet = ss.getSheetByName(category);
      if (!sheet) {
        sheet = ss.insertSheet(category);
      } else {
        sheet.clear();
      }
      
      const items = data[category];
      if (items && items.length > 0) {
        // Headers
        const headers = ["ID", "Title", "Price", "Stock", "Rating", "Reviews", "Image URL"];
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
        
        // Rows
        const rows = items.map(item => [
          item.id,
          item.title,
          typeof item.price === 'number' ? item.price : parseFloat((item.price || "0").toString().replace(/[^0-9.]/g, '')),
          item.stock || 0,
          item.rating || 0,
          item.reviews || 0,
          item.image || ""
        ]);
        
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }
    }
    
    // Auto-remove default Sheet1 if empty
    const defaultSheet = ss.getSheetByName("Sheet1");
    if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
      ss.deleteSheet(defaultSheet);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  const [sheetUrl, setSheetUrl] = useState('')
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'failed'>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [showScriptCode, setShowScriptCode] = useState(false)
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('atelier_google_sheet_url')
      if (savedUrl) setSheetUrl(savedUrl)
    }
  }, [])

  const handleSaveUrl = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('atelier_google_sheet_url', sheetUrl.trim())
      alert('Google Sheets Web App URL saved successfully!')
    }
  }

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE)
    setCopyCodeSuccess(true)
    setTimeout(() => setCopyCodeSuccess(false), 3000)
  }

  const handleSyncToSheets = async () => {
    if (!sheetUrl.trim()) {
      alert('Please enter your Google Sheets Apps Script Web App URL first.')
      return
    }
    
    setSyncStatus('syncing')
    setSyncError(null)
    
    try {
      const categoriesGroup: Record<string, Product[]> = {}
      CATEGORIES.forEach(cat => {
        categoriesGroup[cat] = products.filter(p => p.category === cat)
      })
      
      const response = await fetch(sheetUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(categoriesGroup)
      })
      
      const data = await response.json()
      if (response.ok && data.success) {
        setSyncStatus('success')
        alert('Inventory stock successfully synced to Google Sheets!')
      } else {
        setSyncStatus('failed')
        setSyncError(data.error || 'Server rejected synchronization request.')
      }
    } catch (err: any) {
      setSyncStatus('failed')
      setSyncError(err.message || 'Could not connect to the Google Apps Script Web App. Please ensure it is deployed with access set to "Anyone".')
    }
  }

  useEffect(() => {
    const init = async () => {
      const { authorized, email: userEmail } = await checkAdminAuth()
      if (!authorized) {
        alert(`Atelier Access Denied: \n\nAccount [${userEmail || 'Unknown'}] is not in the curated admin list. \n\nPlease use a registered administrator account to access the command center.`)
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
    return products.filter(p => p.category === cat).length
  }

  const getCategoryStock = (cat: string) => {
    const filtered = products.filter(p => p.category === cat)
    return filtered.reduce((sum, p) => sum + p.stock, 0)
  }

  const visibleOrders = orders.filter(o => o.order_status !== 'TRASHED')
  const activeOrders = visibleOrders.filter(o => o.order_status !== 'Delivered' && o.order_status !== 'Cancelled' && !o.order_status.includes('Refund'))
  const archivedOrders = visibleOrders.filter(o => o.order_status === 'Delivered' || o.order_status.includes('Cancelled') || o.order_status.includes('Refund'))

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

        {/* Google Sheets Integration Section */}
        <div className="mt-16 bg-white border border-[#1c1c18]/5 p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-50 flex items-center justify-center rounded">
                  <span className="material-symbols-outlined text-xl text-green-600">table_chart</span>
                </div>
                <div>
                  <h3 className="font-headline text-2xl text-[#1c1c18]">Google Sheets Inventory Sync</h3>
                  <p className="font-body text-xs text-[#747878] mt-0.5">Export and update your entire stock to Google Sheets in one click.</p>
                </div>
              </div>
              
              <div className="space-y-4 font-body text-xs text-[#747878] leading-relaxed">
                <p>
                  This integration automatically synchronizes all boutique items categorized by tab: <strong>Sarees</strong>, <strong>Men</strong>, <strong>Women</strong>, and <strong>Jewellery</strong>.
                </p>
                <div className="bg-[#fdf9f2] p-4 border border-[#1c1c18]/5 space-y-2 rounded">
                  <p className="font-bold text-[#1c1c18]">Quick Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>Create a new Google Sheet.</li>
                    <li>Open <strong>Extensions &gt; Apps Script</strong>.</li>
                    <li>Paste the custom Apps Script code (click <strong>"Get Sync Script Code"</strong> below to copy).</li>
                    <li>Click <strong>Deploy &gt; New Deployment</strong>, choose type <strong>Web App</strong>, execute as <strong>Me</strong>, set access to <strong>Anyone</strong>, and deploy.</li>
                    <li>Copy the generated <strong>Web App URL</strong>, paste it in the field below, and click <strong>Sync Stock</strong>.</li>
                  </ol>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  onClick={() => setShowScriptCode(!showScriptCode)}
                  className="border border-[#1c1c18]/20 hover:border-[#1c1c18] text-[#1c1c18] px-4 py-2 font-body text-[10px] uppercase tracking-widest font-black rounded transition-all"
                >
                  {showScriptCode ? 'Hide Sync Script' : 'Get Sync Script Code'}
                </button>
                {showScriptCode && (
                  <button
                    onClick={handleCopyScript}
                    className="bg-[#1c1c18] text-white hover:bg-[#a3851a] px-4 py-2 font-body text-[10px] uppercase tracking-widest font-black rounded transition-all"
                  >
                    {copyCodeSuccess ? '✓ Copied' : 'Copy Script Code'}
                  </button>
                )}
              </div>

              {showScriptCode && (
                <motion.pre 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-[#1a1a1a] text-green-400 font-mono text-[10px] overflow-x-auto rounded max-h-60 overflow-y-auto block w-full border border-neutral-800"
                >
                  {GOOGLE_APPS_SCRIPT_CODE}
                </motion.pre>
              )}
            </div>

            <div className="w-full lg:w-96 bg-[#fdf9f2] p-6 border border-[#1c1c18]/5 space-y-4">
              <h4 className="font-headline text-lg text-[#1c1c18]">Configuration</h4>
              
              <div className="space-y-2">
                <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] block font-bold">Google Web App URL</label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={e => setSheetUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full bg-white border border-[#1c1c18]/10 p-3 text-xs outline-none focus:border-[#a3851a] font-mono text-[#1c1c18]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveUrl}
                  className="flex-1 border border-[#1c1c18]/20 hover:border-[#1c1c18] text-[#1c1c18] py-3 text-[10px] uppercase tracking-widest font-black rounded transition-all"
                >
                  Save URL
                </button>
                <button
                  onClick={handleSyncToSheets}
                  disabled={syncStatus === 'syncing' || !sheetUrl}
                  className="flex-1 bg-[#9eff00] hover:bg-[#82d100] disabled:bg-neutral-200 text-black disabled:text-neutral-500 py-3 text-[10px] uppercase tracking-widest font-black rounded transition-all shadow-sm"
                >
                  {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Stock'}
                </button>
              </div>

              {syncStatus === 'success' && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-center font-body text-[10px] font-bold uppercase tracking-wider rounded">
                  🟢 Stock Sync Completed
                </div>
              )}

              {syncStatus === 'failed' && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded space-y-1">
                  <p className="font-body text-[10px] font-bold uppercase tracking-wider text-center">🔴 Sync Failed</p>
                  <p className="font-body text-[8px] leading-relaxed text-red-600">{syncError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
