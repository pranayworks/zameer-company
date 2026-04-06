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
  deleteOrder,
} from '@/lib/admin-helpers'

export default function AdminOrdersPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [trackingNums, setTrackingNums] = useState<Record<string, string>>({})
  const [sendingEmail, setSendingEmail] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const init = async () => {
      const { authorized, email: userEmail } = await checkAdminAuth()
      if (!authorized) { 
        alert(`Atelier Access Denied: \n\nAccount [${userEmail || 'Unknown'}] is not authorized.`)
        router.push('/'); return 
      }
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

  const handleDeleteOrder = async (order: Order) => {
    if (!confirm(`Are you sure you want to permanently remove order ORD-${order.order_id}? This will bypass security and remove it from view.`)) return
    
    setLoading(true)
    const result = await deleteOrder(order.id, order.order_id)
    
    if (!result.success) {
      // Soft delete bypass
      await updateStatus(order.id, 'TRASHED', orders)
    }
    await loadOrders()
    setLoading(false)
  }

  const visibleOrders = orders.filter(o => o.order_status !== 'TRASHED')
  const activeOrders = visibleOrders.filter(o => 
    o.order_status !== 'Delivered' && 
    o.order_status !== 'Cancelled' && 
    !o.order_status.includes('Refund')
  )

  const parseAddress = (address: string) => {
    const shippingMatch = address?.match(/\[(.*) Delivery: ₹(\d+)\]/)
    const method = shippingMatch ? shippingMatch[1] : 'Standard'
    const fee = shippingMatch ? shippingMatch[2] : '0'
    const cleanAddr = address ? address.replace(/\s\[.* Delivery: ₹\d+\]/, '') : 'No Address Set'
    return { method, fee, cleanAddr }
  }

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
            <p className="font-headline text-4xl mt-2">{visibleOrders.filter(o => o.order_status === 'Preparing').length}</p>
          </div>
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Dispatched</span>
            <p className="font-headline text-4xl mt-2 text-blue-500">{visibleOrders.filter(o => o.order_status === 'Dispatched').length}</p>
          </div>
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Out for Delivery</span>
            <p className="font-headline text-4xl mt-2 text-amber-500">{visibleOrders.filter(o => o.order_status === 'Out for Delivery').length}</p>
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
                        <p className="text-xs leading-relaxed italic max-w-xs">{parseAddress(order.address).cleanAddr}</p>
                        <div className="mt-3 flex gap-2">
                          <span className={`text-[8px] uppercase tracking-widest font-bold px-2 py-1 ${parseAddress(order.address).method === 'Express' ? 'bg-[#a3851a] text-white' : 'bg-[#1c1c18]/10 text-[#747878]'}`}>
                            {parseAddress(order.address).method} Delivery
                          </span>
                          <span className="text-[8px] uppercase tracking-widest font-bold px-2 py-1 border border-[#1c1c18]/10 text-[#747878]">
                            Fee: ₹{parseAddress(order.address).fee}
                          </span>
                        </div>
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
                    <div className="flex flex-col gap-3 w-full">
                      {/* Tracking Number Section */}
                      <div className="space-y-4 pt-4 border-t border-[#1c1c18]/5 w-full">
                        <div className="flex flex-col gap-2">
                          <span className="font-body text-[8px] uppercase tracking-widest text-[#747878] block">Logistics Management</span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Tracking Number"
                              value={trackingNums[order.id] || order.shipment_id || ''}
                              onChange={(e) => setTrackingNums(prev => ({ ...prev, [order.id]: e.target.value }))}
                              className="flex-1 bg-[#1c1c18]/5 border border-[#1c1c18]/10 text-[10px] uppercase font-bold tracking-widest px-4 py-3 focus:border-[#a3851a] outline-none transition-all"
                            />
                            <button
                              disabled={sendingEmail[order.id]}
                              onClick={async () => {
                                const tNum = trackingNums[order.id] || order.shipment_id;
                                if (!tNum) return alert('Enter tracking number first');
                                setSendingEmail(prev => ({ ...prev, [order.id]: true }));
                                try {
                                  const res = await fetch('/api/send-tracking-email', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      email: order.email,
                                      name: order.customer_name,
                                      orderId: order.order_id,
                                      trackingNumber: tNum,
                                      internalId: order.id
                                    })
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    alert('✓ Tracking details sent to customer!');
                                    await loadOrders();
                                  } else {
                                    alert(`Failed: ${data.error}`);
                                  }
                                } catch (err) {
                                  alert('Connection error');
                                } finally {
                                  setSendingEmail(prev => ({ ...prev, [order.id]: false }));
                                }
                              }}
                              className={`px-4 py-3 text-[9px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${sendingEmail[order.id] ? 'bg-[#1c1c18]/20 cursor-not-allowed text-[#1c1c18]/40' : 'bg-[#a3851a] text-white hover:bg-[#1c1c18]'}`}
                            >
                              {sendingEmail[order.id] ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <span className="material-symbols-outlined text-[14px]">send</span>
                              )}
                              Send
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => downloadInvoicePDF(order)}
                        className="text-[9px] uppercase tracking-[0.2em] font-bold border border-[#1c1c18]/10 px-6 py-3 hover:bg-[#1c1c18] hover:text-white transition-all flex items-center gap-2 w-full justify-center mt-4"
                      >
                        <span className="material-symbols-outlined text-[14px]">download</span>
                        Print Invoice
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order)}
                        className="text-[9px] uppercase tracking-[0.2em] font-bold border border-red-500/20 text-red-600 px-6 py-3 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 w-full justify-center"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Remove Masterpiece
                      </button>
                    </div>
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
