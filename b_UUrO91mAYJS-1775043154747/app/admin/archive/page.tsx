'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'
import {
  Order,
  checkAdminAuth,
  fetchAllOrders,
  updateOrderStatus as updateStatus,
  downloadInvoicePDF,
  deleteOrder,
} from '@/lib/admin-helpers'

export default function AdminArchivePage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingShipment, setIsAddingShipment] = useState(false)
  const [shipmentForm, setShipmentForm] = useState<Partial<Order>>({
    customer_name: '', product_name: '', price: 0, order_status: 'Delivered', address: ''
  })

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
    if (!result.success) alert(`Failed: ${result.error}`)
    await loadOrders()
  }

  const handleDeleteOrder = async (order: Order) => {
    if (!order.id) {
      alert("Atelier Archive Error: This record has an invalid ID and cannot be identified for deletion.")
      return
    }
    
    if (!confirm(`Are you sure you want to permanently remove order ORD-${order.order_id} from history? This action is irreversible.`)) return
    
    try {
      setLoading(true)
      const result = await deleteOrder(order.id, order.order_id)
      
      if (!result.success) {
        // INTELLIGENT FALLBACK: If deletion is blocked by security (RLS), try a "Soft Delete" by hiding it
        const fallbackResult = await updateStatus(order.id, 'TRASHED', orders)
        if (fallbackResult.success) {
          await loadOrders()
          alert(`✓ Record ORD-${order.order_id} has been securely removed from the view.`)
        } else {
          alert(`Atelier Archive Error: ${result.error}. This record is protected by your project's security policies.`)
        }
      } else {
        await loadOrders()
        alert(`✓ Record ORD-${order.order_id} has been removed from the archives.`)
      }
    } catch (err: any) {
      alert(`Network/Security Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddManualShipment = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert("Session expired."); return }
    const newOrderId = `MAN-${Math.floor(100000 + Math.random() * 900000)}`
    const { error } = await supabase.from('orders').insert([{
      ...shipmentForm, order_id: newOrderId, email: 'manual@entry.local',
      user_id: user.id, phone: 'N/A', size: 'Manual', color: 'Manual'
    }])
    if (error) { alert(`Error: ${error.message}`) }
    else {
      setIsAddingShipment(false)
      setShipmentForm({ customer_name: '', product_name: '', price: 0, order_status: 'Delivered', address: '' })
      await loadOrders()
    }
  }

  const archivedOrders = orders.filter(o => 
    (o.order_status === 'Delivered' || o.order_status.includes('Cancelled') || o.order_status.includes('Refund')) &&
    o.order_status !== 'TRASHED'
  )

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
        <nav className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#747878]">
          <Link href="/admin" className="hover:text-[#1c1c18] transition-colors">Command Center</Link>
          <span>/</span>
          <span className="text-[#1c1c18] font-bold">Shipment Log</span>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-[#1c1c18] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-white">inventory</span>
              </div>
              <div>
                <h1 className="font-headline text-5xl md:text-6xl tracking-tighter">Shipment Log</h1>
                <p className="font-body text-xs text-[#747878] mt-1">{archivedOrders.length} historical records</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="border border-[#1c1c18]/20 px-8 py-4 font-body text-[10px] uppercase tracking-widest font-bold hover:bg-[#1c1c18] hover:text-white transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Dashboard
            </Link>
            <button
              onClick={() => setIsAddingShipment(true)}
              className="gold-satin text-white px-8 py-4 font-body text-[10px] uppercase tracking-widest font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add_box</span>
              Manual Entry
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Delivered</span>
            <p className="font-headline text-4xl mt-2 text-green-600">{orders.filter(o => o.order_status === 'Delivered').length}</p>
          </div>
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Cancelled</span>
            <p className="font-headline text-4xl mt-2 text-red-500">{orders.filter(o => o.order_status === 'Cancelled').length}</p>
          </div>
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Refunded</span>
            <p className="font-headline text-4xl mt-2 text-amber-500">{orders.filter(o => o.order_status === 'Refunded' || o.order_status === 'Refund Initiated').length}</p>
          </div>
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Total Revenue</span>
            <p className="font-headline text-3xl mt-2 text-[#a3851a]">₹{orders.filter(o => o.order_status === 'Delivered').reduce((s, o) => s + (o.price || 0), 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-24 text-center opacity-40 font-headline text-xl">Loading Archive...</div>
        ) : archivedOrders.length === 0 ? (
          <div className="py-32 text-center bg-white border border-[#1c1c18]/5">
            <span className="material-symbols-outlined text-5xl opacity-10 mb-6 block">inventory</span>
            <p className="font-body text-xs uppercase tracking-widest text-[#747878]">No historical records found.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#1c1c18]/5 shadow-sm overflow-x-auto">
            <table className="w-full text-left font-body">
              <thead>
                <tr className="bg-[#1c1c18]/5 border-b border-[#1c1c18]/10 text-[9px] uppercase tracking-widest font-bold">
                  <th className="p-6">Creation</th>
                  <th className="p-6">Identity</th>
                  <th className="p-6">Destination</th>
                  <th className="p-6 text-right">Valuation</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1c18]/5">
                {archivedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fdf9f2] transition-colors group">
                    <td className="p-6">
                      <div className="text-[10px] font-bold">{order.order_id}</div>
                      <div className="text-[9px] text-[#747878]">{new Date(order.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="p-6">
                      <div className="text-xs font-bold">{order.customer_name}</div>
                      <div className="text-[10px] text-[#747878]">{order.phone}</div>
                      <div className="text-[10px] text-[#a3851a] font-bold mt-1">{order.product_name}</div>
                      <div className="text-[8px] text-[#747878] uppercase mt-0.5">{order.size} • {order.color}</div>
                    </td>
                    <td className="p-6">
                      <div className="text-[10px] line-clamp-1 max-w-[200px] text-[#747878]">{order.address}</div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="text-xs font-headline text-[#a3851a]">₹{order.price?.toLocaleString()}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-2 min-w-[130px]">
                        {(order.order_status === 'Cancelled' || order.order_status.includes('Refund')) ? (
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" checked={order.order_status === 'Cancelled'} onChange={() => handleUpdateStatus(order.id, 'Cancelled')} className="w-3 h-3 accent-red-500" />
                              <span className="text-[8px] uppercase font-bold text-red-500">Refund Needed</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" checked={order.order_status === 'Refund Initiated'} onChange={() => handleUpdateStatus(order.id, 'Refund Initiated')} className="w-3 h-3 accent-[#a3851a]" />
                              <span className="text-[8px] uppercase font-bold text-[#a3851a]">Refund Initiated</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" checked={order.order_status === 'Refunded'} onChange={() => handleUpdateStatus(order.id, 'Refunded')} className="w-3 h-3 accent-green-600" />
                              <span className="text-[8px] uppercase font-bold text-green-600">Refunded</span>
                            </label>
                          </div>
                        ) : (
                          <span className="text-[8px] uppercase font-bold px-2 py-1 bg-green-50 text-green-600 w-fit">{order.order_status}</span>
                        )}
                        {order.order_status === 'Cancelled' && (
                          <span className="text-[7px] font-bold text-red-600 animate-pulse">🚨 REFUND DUE</span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-4">
                        <button 
                          onClick={() => downloadInvoicePDF(order)} 
                          title="Download Invoice"
                          className="material-symbols-outlined text-[18px] text-[#747878] hover:text-[#1c1c18] transition-colors"
                        >
                          download
                        </button>
                        <button onClick={() => handleDeleteOrder(order)} className="material-symbols-outlined text-[18px] text-red-500/40 hover:text-red-600 transition-colors">delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Manual Shipment Modal */}
        <AnimatePresence>
          {isAddingShipment && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingShipment(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]" />
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white p-12 shadow-2xl z-[101]">
                <h3 className="font-headline text-3xl mb-8">Manual Archive Entry</h3>
                <form onSubmit={handleAddManualShipment} className="space-y-6">
                  <div><label className="text-[10px] uppercase tracking-widest text-[#747878] mb-1 block">Customer Name</label>
                    <input type="text" required value={shipmentForm.customer_name} onChange={e => setShipmentForm({ ...shipmentForm, customer_name: e.target.value })} className="w-full bg-[#fdf9f2] p-4 text-sm outline-none border-b border-[#1c1c18]/10" /></div>
                  <div><label className="text-[10px] uppercase tracking-widest text-[#747878] mb-1 block">Product Title</label>
                    <input type="text" required value={shipmentForm.product_name} onChange={e => setShipmentForm({ ...shipmentForm, product_name: e.target.value })} className="w-full bg-[#fdf9f2] p-4 text-sm outline-none border-b border-[#1c1c18]/10" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#747878] mb-1 block">Valuation (₹)</label>
                      <input type="number" required value={shipmentForm.price} onChange={e => setShipmentForm({ ...shipmentForm, price: Number(e.target.value) })} className="w-full bg-[#fdf9f2] p-4 text-sm outline-none border-b border-[#1c1c18]/10" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#747878] mb-1 block">Status</label>
                      <select value={shipmentForm.order_status} onChange={e => setShipmentForm({ ...shipmentForm, order_status: e.target.value })} className="w-full bg-[#fdf9f2] p-4 text-[10px] font-bold uppercase outline-none border-b border-[#1c1c18]/10">
                        <option>Delivered</option>
                        <option>Cancelled</option>
                        <option>Refund Initiated</option>
                        <option>Refunded</option>
                      </select>
                    </div>
                  </div>
                  <div><label className="text-[10px] uppercase tracking-widest text-[#747878] mb-1 block">Shipment Note / Address</label>
                    <textarea rows={2} required value={shipmentForm.address} onChange={e => setShipmentForm({ ...shipmentForm, address: e.target.value })} className="w-full bg-[#fdf9f2] p-4 text-xs outline-none border-b border-[#1c1c18]/10 resize-none" /></div>
                  <button type="submit" className="w-full gold-satin text-white py-4 font-body uppercase tracking-widest text-[10px] font-bold">Add to History</button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
