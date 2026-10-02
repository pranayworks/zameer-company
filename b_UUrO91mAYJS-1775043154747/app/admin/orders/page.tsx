'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useMode } from '@/context/mode-context'
import {
  Order,
  checkAdminAuth,
  fetchAllOrders,
  updateOrderStatus as updateStatus,
  downloadInvoicePDF,
  printThermalShippingLabel,
  deleteOrder,
  exportOrdersToCSV,
} from '@/lib/admin-helpers'

export default function AdminOrdersPage() {
  const router = useRouter()
  const { modeDetails, mode } = useMode()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // EMAIL DISPATCH MODAL STATE
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailRecipient, setEmailRecipient] = useState({ email: '', name: '' })
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessageBody, setEmailMessageBody] = useState('')
  const [emailAppPassword, setEmailAppPassword] = useState('mpekpyweibetxmcq')
  const [emailSending, setEmailSending] = useState(false)

  const handleOpenEmailModal = (email: string, name?: string) => {
    setEmailRecipient({ email, name: name || 'Valued Client' })
    setEmailSubject('Update Regarding Your Friends of 4 Atelier Order')
    setEmailMessageBody(`Dear ${name || 'Valued Client'},\n\nWe are reaching out from Friends of 4 Atelier with an update regarding your order.\n\nThank you for choosing Friends of 4.\n\nWarm regards,\nTeam Fo4`)
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
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          email: emailRecipient.email,
          name: emailRecipient.name,
          subject: emailSubject,
          messageBody: emailMessageBody,
          appPassword: emailAppPassword
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        alert(data.note || '✓ Email dispatched successfully from friendsof4.support@gmail.com!')
        setIsEmailModalOpen(false)
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
      const { authorized, email: userEmail } = await checkAdminAuth()
      if (!authorized) { 
        alert(`Atelier Access Denied: \n\nPlease log in to access the Admin Orders Pipeline.`)
        router.push('/admin'); return 
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
    if (!confirm(`Are you sure you want to PERMANENTLY REMOVE order ORD-${order.order_id}?\n\nThis will purge the record permanently.`)) return
    
    setLoading(true)
    await deleteOrder(order.id, order.order_id)
    await loadOrders()
    setLoading(false)
    alert(`✓ Order ORD-${order.order_id} permanently removed.`)
  }

  // SHIPROCKET DIRECT LOGISTICS HANDLERS
  const [shiprocketLoading, setShiprocketLoading] = useState<string | null>(null)

  const handleCreateShiprocketOrder = async (order: Order) => {
    setShiprocketLoading(order.id)
    try {
      const res = await fetch('/api/shipping/shiprocket/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `ORD-${order.order_id}`,
          customerName: order.customer_name,
          email: order.email,
          phone: order.phone,
          address: order.address,
          paymentMethod: order.payment_method || (order.address?.includes('COD') ? 'COD' : 'Prepaid'),
          subtotal: order.price,
          finalTotal: order.price,
          items: [{ name: order.product_name, units: 1, selling_price: order.price }]
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert(`✓ Shiprocket Order Created Successfully!\nShiprocket Order ID: ${data.shiprocketOrderId}\nShipment ID: ${data.shipmentId}`)
        await loadOrders()
      } else {
        alert(`Shiprocket Order Creation Error: ${data.error || 'Server error'}`)
      }
    } catch (err: any) {
      alert(`Error creating Shiprocket order: ${err.message}`)
    } finally {
      setShiprocketLoading(null)
    }
  }

  const handleAssignAWB = async (order: Order) => {
    if (!order.shipment_id) {
      alert('Please create a Shiprocket Order first before assigning AWB.')
      return
    }
    setShiprocketLoading(order.id)
    try {
      const res = await fetch('/api/shipping/shiprocket/assign-awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentId: order.shipment_id })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert(`✓ Courier Assigned Successfully!\nCourier: ${data.courierName || 'Assigned Courier'}\nAWB Code: ${data.awbCode}`)
        await loadOrders()
      } else {
        alert(`AWB Assignment Note: ${data.error || 'Courier assignment pending'}`)
      }
    } catch (err: any) {
      alert(`AWB assignment error: ${err.message}`)
    } finally {
      setShiprocketLoading(null)
    }
  }

  const handleSchedulePickup = async (order: Order) => {
    if (!order.shipment_id) {
      alert('Please create Shiprocket order first.')
      return
    }
    setShiprocketLoading(order.id)
    try {
      const res = await fetch('/api/shipping/shiprocket/schedule-pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentId: order.shipment_id })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert(`✓ Pickup Scheduled Successfully! Courier driver assigned for pickup.`)
        await loadOrders()
      } else {
        alert(`Pickup Scheduling Note: ${data.error || 'Failed to schedule pickup'}`)
      }
    } catch (err: any) {
      alert(`Pickup scheduling error: ${err.message}`)
    } finally {
      setShiprocketLoading(null)
    }
  }

  const handleDownloadLabel = async (order: Order) => {
    if (order.label_url) {
      window.open(order.label_url, '_blank')
      return
    }
    if (!order.shipment_id) {
      alert('Please create Shiprocket order first.')
      return
    }
    setShiprocketLoading(order.id)
    try {
      const res = await fetch('/api/shipping/shiprocket/label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentId: order.shipment_id })
      })
      const data = await res.json()
      if (res.ok && data.labelUrl) {
        window.open(data.labelUrl, '_blank')
        await loadOrders()
      } else {
        alert(`Label Generation Note: ${data.error || 'Label not generated yet'}`)
      }
    } catch (err: any) {
      alert(`Label generation error: ${err.message}`)
    } finally {
      setShiprocketLoading(null)
    }
  }

  const handleSyncTracking = async (order: Order) => {
    if (!order.awb_code) {
      alert('No AWB code assigned yet for this shipment.')
      return
    }
    setShiprocketLoading(order.id)
    try {
      const res = await fetch(`/api/shipping/shiprocket/track/${order.awb_code}`)
      const data = await res.json()
      if (res.ok && data.success) {
        alert(`🚀 Live Shiprocket Tracking:\nStatus: ${data.currentStatus}\nCourier: ${data.courierName}\nETD: ${data.etd || 'N/A'}\nDestination: ${data.destination}`)
        await loadOrders()
      } else {
        alert(`Tracking Note: ${data.error || 'Tracking data unavailable'}`)
      }
    } catch (err: any) {
      alert(`Tracking fetch error: ${err.message}`)
    } finally {
      setShiprocketLoading(null)
    }
  }

  const visibleOrders = orders.filter(o => o.order_status !== 'TRASHED')

  // Real-Time WhatsApp Customer Query Search Filter (Order ID, Customer Phone, Email, or Name)
  const filteredOrders = visibleOrders.filter(o => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      String(o.order_id || '').toLowerCase().includes(q) ||
      String(o.customer_name || '').toLowerCase().includes(q) ||
      String(o.phone || '').toLowerCase().includes(q) ||
      String(o.email || '').toLowerCase().includes(q) ||
      String(o.product_name || '').toLowerCase().includes(q)
    )
  })

  const parseAddress = (address: string) => {
    const shippingMatch = address?.match(/\[(.*) Delivery: ₹(\d+)\]/)
    const method = shippingMatch ? shippingMatch[1] : 'Standard'
    const fee = shippingMatch ? shippingMatch[2] : '0'
    const cleanAddr = address ? address.replace(/\s\[.* Delivery: ₹\d+\]/, '') : 'No Address Set'
    return { method, fee, cleanAddr }
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-700" style={{ backgroundColor: modeDetails.themeBg, color: modeDetails.accentColor }}>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="font-serif-editorial text-2xl tracking-widest">
          Securing Atelier Command...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-body transition-colors duration-700" style={{ backgroundColor: modeDetails.themeBg, color: '#F4F1EA' }}>
      <Header />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1920px] mx-auto">
        
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
            LOGISTICS PIPELINE • {mode.toUpperCase()} MODE
          </span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-8 border-b pb-6" style={{ borderColor: `${modeDetails.borderColor}40` }}>
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${modeDetails.accentColor}20`, color: modeDetails.accentColor }}>
                <span className="material-symbols-outlined text-3xl">local_shipping</span>
              </div>
              <div>
                <h1 className="font-serif-editorial text-3xl md:text-5xl uppercase tracking-wider text-white">
                  CUSTOMER ORDER SEARCH & TRACKING PIPELINE
                </h1>
                <p className="font-mono text-xs text-[#D6CEBE]/70 mt-1">
                  Track any customer&apos;s order instantly when they reach out via WhatsApp or phone.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => exportOrdersToCSV(orders)}
            className="px-5 py-3.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900 text-xs font-mono uppercase font-bold tracking-widest rounded-xl cursor-pointer flex items-center gap-2 shadow-xl"
            title="Export all orders to Excel / CSV file"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>EXPORT ORDERS TO EXCEL 📊</span>
          </button>
        </div>

        {/* REAL-TIME WHATSAPP / CUSTOMER QUERY SEARCH BAR */}
        <div className="mb-8 p-6 border rounded-xl shadow-xl space-y-2" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.accentColor }}>
          <label className="block font-mono text-xs font-bold uppercase" style={{ color: modeDetails.accentColor }}>
            ⚡ WHATSAPP CUSTOMER QUERY SEARCH & ORDER TRACKER
          </label>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (e.g. 8849), Phone number, Customer Name, or Email..."
              className="w-full bg-transparent border-b py-2 text-sm font-mono text-white placeholder-white/40 focus:outline-none"
              style={{ borderColor: modeDetails.borderColor }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-mono px-3 py-1 bg-white/10 rounded text-white hover:bg-white/20"
              >
                CLEAR
              </button>
            )}
          </div>
          <p className="text-[10px] font-mono text-[#D6CEBE]/70">
            {searchQuery ? `Showing results matching "${searchQuery}" (${filteredOrders.length} found)` : 'Enter customer details or order ID to locate any order instantly.'}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="p-6 border rounded-xl shadow-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: `${modeDetails.borderColor}50` }}>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#D6CEBE]/70 font-bold">Preparing</span>
            <p className="font-serif-editorial text-4xl mt-2 text-white">{visibleOrders.filter(o => o.order_status === 'Preparing').length}</p>
          </div>
          <div className="p-6 border rounded-xl shadow-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: `${modeDetails.borderColor}50` }}>
            <span className="font-mono text-[10px] uppercase tracking-widest text-blue-400 font-bold">Dispatched</span>
            <p className="font-serif-editorial text-4xl mt-2 text-blue-400">{visibleOrders.filter(o => o.order_status === 'Dispatched').length}</p>
          </div>
          <div className="p-6 border rounded-xl shadow-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: `${modeDetails.borderColor}50` }}>
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 font-bold">Out for Delivery</span>
            <p className="font-serif-editorial text-4xl mt-2 text-amber-400">{visibleOrders.filter(o => o.order_status === 'Out for Delivery').length}</p>
          </div>
          <div className="p-6 border rounded-xl shadow-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: `${modeDetails.borderColor}50` }}>
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: modeDetails.accentColor }}>Total Valuation</span>
            <p className="font-serif-editorial text-3xl mt-2" style={{ color: modeDetails.accentColor }}>₹{filteredOrders.reduce((sum, o) => sum + (o.price || 0), 0).toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* ORDERS LIST */}
        {loading ? (
          <div className="py-24 text-center text-xs font-mono" style={{ color: modeDetails.accentColor }}>Loading Atelier Orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-32 text-center border rounded-xl" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
            <span className="material-symbols-outlined text-5xl opacity-30 mb-4 block" style={{ color: modeDetails.accentColor }}>search_off</span>
            <p className="font-mono text-xs uppercase tracking-widest text-[#D6CEBE]">
              {searchQuery ? `No orders found matching "${searchQuery}".` : 'No active orders in the database.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredOrders.map((order) => {
              const rawSeg = order.customer_segment || ''
              const inferMode = rawSeg.toLowerCase().includes('traditional') || (order.product_name && (order.product_name.toLowerCase().includes('saree') || order.product_name.toLowerCase().includes('kurta'))) ? 'TRADITIONAL MODE' : rawSeg.toLowerCase().includes('archive') || (order.product_name && order.product_name.toLowerCase().includes('gold')) ? 'LUXURY ARCHIVE MODE' : 'STREETWEAR MODE'

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border p-8 rounded-2xl shadow-xl space-y-6"
                  style={{ backgroundColor: modeDetails.cardBg, borderColor: `${modeDetails.borderColor}60` }}
                >
                  <div className="flex flex-col xl:flex-row gap-8 justify-between">
                    {/* Customer */}
                    <div className="flex-1 space-y-5">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: modeDetails.accentColor }}>Order Identification</span>
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                            {inferMode}
                          </span>
                        </div>
                        <h4 className="font-serif-editorial text-3xl text-white">ORD-{order.order_id}</h4>
                        <p className="text-[10px] font-mono text-[#D6CEBE]/70 uppercase mt-1">Placed on {new Date(order.created_at || Date.now()).toLocaleString()}</p>
                      </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-5 border-t" style={{ borderColor: `${modeDetails.borderColor}30` }}>
                      <div className="font-mono text-xs space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-[#D6CEBE]/70 block mb-1 font-bold">Purchaser Details</span>
                        <p className="font-bold text-sm text-white">{order.customer_name}</p>
                        <p className="text-[#D6CEBE]">Email: {order.email}</p>
                        <p className="text-[#D6CEBE]">Phone: <a href={`tel:${order.phone}`} className="underline text-white font-bold">{order.phone}</a></p>
                      </div>
                      <div className="font-mono text-xs space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-[#D6CEBE]/70 block mb-1 font-bold">Shipping Address & Pincode</span>
                        <p className="text-xs leading-relaxed text-white font-bold">{parseAddress(order.address).cleanAddr}</p>
                      </div>
                    </div>
                  </div>

                  {/* Product */}
                  <div className="flex-1 p-6 border rounded-xl font-mono text-xs space-y-3" style={{ backgroundColor: modeDetails.themeBg, borderColor: `${modeDetails.borderColor}40` }}>
                    <span className="text-[9px] uppercase tracking-widest font-bold block" style={{ color: modeDetails.accentColor }}>Acquired Item</span>
                    <p className="font-serif-editorial text-2xl text-white font-bold">{order.product_name}</p>
                    <div className="flex flex-wrap gap-3 text-[10px] uppercase font-mono">
                      <span className="px-3 py-1 border rounded text-white font-bold" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>Size: {order.size || 'M'}</span>
                      <span className="px-3 py-1 border rounded text-white font-bold" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>Tone: {order.color || 'Standard'}</span>
                      <span className="px-3 py-1 border rounded text-amber-300 font-bold bg-amber-950/40 border-amber-500/30">Payment: {order.payment_method || (order.address?.includes('COD') ? 'COD' : 'Prepaid')}</span>
                    </div>
                    <p className="font-bold text-xl mt-2" style={{ color: modeDetails.accentColor }}>₹{(order.price || 0).toLocaleString('en-IN')}</p>

                    {/* SHIPROCKET DIRECT LOGISTICS CONTROL PANEL */}
                    <div className="w-full mt-4 p-4 border rounded-xl font-mono text-xs space-y-3 bg-black/50" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                      <div className="flex flex-wrap justify-between items-center border-b pb-2 gap-2" style={{ borderColor: `${modeDetails.borderColor}20` }}>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-amber-400 text-sm">local_shipping</span>
                          <span className="font-bold text-[11px] text-amber-300 uppercase tracking-widest">
                            Shiprocket Direct Logistics
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                          order.shipping_status === 'DELIVERED' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' :
                          order.shipping_status === 'OUT_FOR_DELIVERY' || order.shipping_status === 'IN_TRANSIT' ? 'bg-blue-950/80 text-blue-300 border-blue-500/40' :
                          order.shiprocket_order_id ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' :
                          'bg-gray-800 text-gray-400 border-gray-700'
                        }`}>
                          {order.shipping_status || (order.shiprocket_order_id ? 'ORDER_CREATED' : 'UNFULFILLED')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] text-[#D6CEBE]/80">
                        <div>
                          <span className="block text-[8px] uppercase opacity-60 font-bold">SR Order ID</span>
                          <span className="font-bold text-white">{order.shiprocket_order_id || 'Not Synced'}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase opacity-60 font-bold">Shipment ID</span>
                          <span className="font-bold text-white">{order.shipment_id || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase opacity-60 font-bold">AWB Code</span>
                          <span className="font-bold text-amber-300 font-mono">{order.awb_code || 'Pending AWB'}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase opacity-60 font-bold">Courier Name</span>
                          <span className="font-bold text-white">{order.courier_name || 'Unassigned'}</span>
                        </div>
                      </div>

                      {/* SHIPROCKET ACTION BUTTONS */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: `${modeDetails.borderColor}20` }}>
                        {!order.shiprocket_order_id ? (
                          <button
                            onClick={() => handleCreateShiprocketOrder(order)}
                            disabled={shiprocketLoading === order.id}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] uppercase rounded transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">add_task</span>
                            {shiprocketLoading === order.id ? 'Creating...' : 'Create Shiprocket Order'}
                          </button>
                        ) : (
                          <>
                            {!order.awb_code && (
                              <button
                                onClick={() => handleAssignAWB(order)}
                                disabled={shiprocketLoading === order.id}
                                className="px-3 py-1.5 bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-500/40 font-bold text-[10px] uppercase rounded transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">confirmation_number</span>
                                {shiprocketLoading === order.id ? 'Assigning...' : 'Assign Courier & AWB'}
                              </button>
                            )}

                            {order.awb_code && (
                              <button
                                onClick={() => handleSchedulePickup(order)}
                                disabled={shiprocketLoading === order.id}
                                className="px-3 py-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-500/40 font-bold text-[10px] uppercase rounded transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">event_available</span>
                                {shiprocketLoading === order.id ? 'Scheduling...' : 'Schedule Driver Pickup'}
                              </button>
                            )}

                            <button
                              onClick={() => handleDownloadLabel(order)}
                              disabled={shiprocketLoading === order.id}
                              className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] uppercase rounded transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs">download</span>
                              Shiprocket Label PDF
                            </button>

                            {order.awb_code && (
                              <button
                                onClick={() => handleSyncTracking(order)}
                                disabled={shiprocketLoading === order.id}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase rounded transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">sync</span>
                                Track Live Status
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="shrink-0 flex flex-col justify-between items-end gap-6 xl:border-l xl:pl-8 min-w-[220px]" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                    <div className="text-right w-full font-mono">
                      <span className="text-[9px] uppercase tracking-widest text-[#D6CEBE]/70 block mb-2 font-bold">Fulfillment Status</span>
                      <select
                        value={order.order_status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="w-full font-bold uppercase text-xs tracking-widest text-white border-b py-2 outline-none cursor-pointer"
                        style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.accentColor }}
                      >
                        <option value="Preparing">Preparing</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-3 w-full font-mono">
                      <button
                        onClick={() => printThermalShippingLabel(order)}
                        className="text-[10px] uppercase tracking-widest font-bold border px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 shadow-lg cursor-pointer"
                        style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg, borderColor: modeDetails.accentColor }}
                      >
                        <span className="material-symbols-outlined text-sm">local_shipping</span>
                        Print Parcel Sticker Bill
                      </button>

                      <button
                        onClick={() => downloadInvoicePDF(order)}
                        className="text-[10px] uppercase tracking-widest font-bold border px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 cursor-pointer"
                        style={{ borderColor: modeDetails.accentColor, color: modeDetails.accentColor }}
                      >
                        <span className="material-symbols-outlined text-sm">print</span>
                        Print GST Invoice
                      </button>

                      <button
                        onClick={() => handleOpenEmailModal(order.email, order.customer_name)}
                        className="text-[10px] uppercase tracking-widest font-bold border border-amber-500/60 text-amber-300 bg-amber-950/80 px-4 py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-900 transition-all shadow"
                      >
                        <span className="material-symbols-outlined text-sm">mail</span>
                        Email Client ✉️
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(order)}
                        className="text-[10px] uppercase tracking-widest font-bold border border-red-500/40 text-red-400 bg-red-950/40 px-4 py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Remove Record
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )})}
          </div>
        )}
      </main>

      {/* EMAIL DISPATCH MODAL */}
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
                  ✉️ SEND CUSTOM EMAIL TO CLIENT
                </h3>
                <p className="text-xs font-mono text-[#D6CEBE]/70">
                  Direct message will be sent to {emailRecipient.name || 'Client'} ({emailRecipient.email}) from friendsof4.support@gmail.com.
                </p>
              </div>

              <form onSubmit={handleDispatchEmail} className="space-y-4 font-mono text-xs">
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
