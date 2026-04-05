'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
  Order,
  checkAdminAuth,
  fetchAllOrders,
  updateOrderStatus as updateStatus,
  downloadInvoicePDF,
} from '@/lib/admin-helpers'

export default function AdminOrdersPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { authorized } = await checkAdminAuth()
      if (!authorized) { router.push('/'); return }
      setIsAuthorized(true)
      loadOrders()
    }
    init()
  }, [router])

  const loadOrders = async () => {
    setLoading(true)
    const data = await fetchAllOrders()
    setOrders(data)
    setLoading(false)
  }

  const handleUpdateStatus = async (orderId: string, status: string) => {
    const result = await updateStatus(orderId, status, orders)
    if (!result.success) {
      alert(`Status update failed: ${result.error}`)
    }
    await loadOrders()
  }

  const activeOrders = orders.filter(o => o.order_status !== 'Delivered' && o.order_status !== 'Cancelled' && !o.order_status.includes('Refund'))

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#fdf9f2] flex items-center justify-center">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="font-headline text-3xl opacity-20">
          Securing the Atelier...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdf9f2]">
      <Header />

      <main className="pt-32 pb-24 px-8 md:px-24 max-w-[1920px] mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#747878]">
          <Link href="/admin" className="hover:text-[#1c1c18] transition-colors">Command Center</Link>
          <span>/</span>
          <span className="text-[#1c1c18] font-bold">Active Orders</span>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-[#a3851a] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-white">local_shipping</span>
              </div>
              <div>
                <h1 className="font-headline text-5xl md:text-6xl tracking-tighter">Active Orders</h1>
                <p className="font-body text-xs text-[#747878] mt-1">{activeOrders.length} orders awaiting fulfillment</p>
              </div>
            </div>
          </div>
          <Link
            href="/admin"
            className="border border-[#1c1c18]/20 px-8 py-4 font-body text-[10px] uppercase tracking-widest font-bold hover:bg-[#1c1c18] hover:text-white transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Preparing</span>
            <p className="font-headline text-4xl mt-2">{orders.filter(o => o.order_status === 'Preparing').length}</p>
          </div>
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Dispatched</span>
            <p className="font-headline text-4xl mt-2 text-blue-500">{orders.filter(o => o.order_status === 'Dispatched').length}</p>
          </div>
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Out for Delivery</span>
            <p className="font-headline text-4xl mt-2 text-amber-500">{orders.filter(o => o.order_status === 'Out for Delivery').length}</p>
          </div>
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Total Revenue</span>
            <p className="font-headline text-3xl mt-2 text-[#a3851a]">₹{activeOrders.reduce((sum, o) => sum + (o.price || 0), 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="py-24 text-center opacity-40 font-headline text-xl">Loading Orders...</div>
        ) : activeOrders.length === 0 ? (
          <div className="py-32 text-center bg-white border border-[#1c1c18]/5">
            <span className="material-symbols-outlined text-5xl opacity-10 mb-6 block">shopping_bag</span>
            <p className="font-body text-xs uppercase tracking-widest text-[#747878]">No active orders to manage.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {activeOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#1c1c18]/5 p-8 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col xl:flex-row gap-8 justify-between">
                  {/* Customer */}
                  <div className="flex-1 space-y-5">
                    <div>
                      <span className="font-body text-[10px] uppercase tracking-widest text-[#a3851a] block mb-2">Order Identification</span>
                      <h4 className="font-headline text-3xl text-[#1c1c18]">{order.order_id}</h4>
                      <p className="text-[10px] text-[#747878] uppercase mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-5 border-t border-[#1c1c18]/5">
                      <div>
                        <span className="font-body text-[9px] uppercase tracking-widest text-[#747878] block mb-1">Customer</span>
                        <p className="font-bold text-sm">{order.customer_name}</p>
                        <p className="text-[11px] text-[#747878]">{order.email}</p>
                        <p className="text-[11px] text-[#747878]">{order.phone}</p>
                      </div>
                      <div>
                        <span className="font-body text-[9px] uppercase tracking-widest text-[#747878] block mb-1">Shipping Address</span>
                        <p className="text-xs leading-relaxed italic max-w-xs">{order.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Product */}
                  <div className="flex-1 bg-[#fdf9f2] p-8 border border-[#1c1c18]/5">
                    <span className="font-body text-[9px] uppercase tracking-widest text-[#747878] block mb-4">Acquired Masterpiece</span>
                    <p className="font-headline text-2xl mb-2">{order.product_name}</p>
                    <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-widest mb-4">
                      <span className="bg-[#1c1c18] text-white px-3 py-1">Size: {order.size}</span>
                      <span className="border border-[#1c1c18]/20 px-3 py-1">Tone: {order.color}</span>
                    </div>
                    <p className="font-bold text-lg text-[#a3851a]">₹{order.price?.toLocaleString()}</p>
                  </div>

                  {/* Status */}
                  <div className="shrink-0 flex flex-col justify-between items-end gap-6 xl:border-l border-[#1c1c18]/5 xl:pl-8 min-w-[200px]">
                    <div className="text-right w-full">
                      <span className="font-body text-[9px] uppercase tracking-widest text-[#747878] block mb-2">Fulfillment Status</span>
                      <select
                        value={order.order_status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="w-full bg-transparent font-bold uppercase text-[10px] tracking-widest text-[#1c1c18] border-b-2 border-[#1c1c18] focus:border-[#a3851a] outline-none py-2"
                      >
                        <option>Preparing</option>
                        <option>Dispatched</option>
                        <option>Out for Delivery</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                        <option>Refund Initiated</option>
                        <option>Refunded</option>
                      </select>
                    </div>
                    <button
                      onClick={() => downloadInvoicePDF(order)}
                      className="text-[9px] uppercase tracking-[0.2em] font-bold border border-[#1c1c18]/10 px-6 py-3 hover:bg-[#1c1c18] hover:text-white transition-all flex items-center gap-2 w-full justify-center"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      Print Invoice
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
