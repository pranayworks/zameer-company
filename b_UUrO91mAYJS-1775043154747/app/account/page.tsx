'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { supabase, getSessionUser } from '@/lib/supabase'

const downloadInvoicePDF = async (order: any) => {
  if (typeof window === 'undefined') return;
  // @ts-ignore
  const { default: jsPDF } = await import('jspdf/dist/jspdf.umd.min.js')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const W = 210
  const gold = [163, 133, 26] as [number, number, number]
  const dark = [28, 28, 24] as [number, number, number]
  const grey = [116, 120, 120] as [number, number, number]
  const light = [253, 249, 242] as [number, number, number]

  // Background
  doc.setFillColor(...light)
  doc.rect(0, 0, W, 297, 'F')

  // Gold header bar
  doc.setFillColor(...gold)
  doc.rect(0, 0, W, 24, 'F')

  // Brand name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text('FRIENDS OF 4', 20, 15)

  // INVOICE label top right
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('HERITAGE INVOICE', W - 20, 15, { align: 'right' })

  // Order ID
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...dark)
  doc.text(`ORD-${order.order_id || order.id}`, 20, 42)

  // Date
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...grey)
  const date = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN')
  doc.text(`PLACED ON ${date}`, 20, 50)

  // Divider
  doc.setDrawColor(...gold)
  doc.setLineWidth(0.6)
  doc.line(20, 56, W - 20, 56)

  // Customer & Address section
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...grey)
  doc.text('CUSTOMER PROFILE', 20, 67)
  doc.text('SHIPPING ADDRESS', 90, 67)
  doc.text('FULFILLMENT STATUS', W - 20, 67, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...dark)
  doc.text(order.customer_name || 'Customer', 20, 75)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...grey)
  if (order.email) doc.text(order.email, 20, 81)
  if (order.phone) doc.text(order.phone, 20, 86)

  // Address (wrap long text)
  const shippingMatchHeader = order.address?.match(/\[(.*) Delivery: ₹(\d+)\]/)
  const cleanAddressHeader = order.address ? order.address.replace(/\s\[.* Delivery: ₹\d+\]/, '') : (order.address || 'Address not provided')
  const addressLines = doc.splitTextToSize(cleanAddressHeader, 60)
  doc.setTextColor(...grey)
  doc.text(addressLines, 90, 75)

  // Status badge area
  doc.setFillColor(...gold)
  doc.roundedRect(W - 55, 69, 35, 8, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  doc.text(order.order_status || 'Preparing', W - 37.5, 74.2, { align: 'center' })

  // Product section divider
  doc.setDrawColor(220, 220, 215)
  doc.setLineWidth(0.3)
  doc.line(20, 100, W - 20, 100)

  // Product section header
  doc.setTextColor(...grey)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('ACQUIRED MASTERPIECE', 20, 110)
  doc.text('VALUATION', W - 20, 110, { align: 'right' })

  // Product details box
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(18, 114, W - 36, 42, 3, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...dark)
  doc.text(order.product_name || 'Product', 28, 128)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...grey)
  const details = [order.size && `Size: ${order.size}`, order.color && `Color: ${order.color}`].filter(Boolean).join('   •   ')
  if (details) doc.text(details, 28, 136)

  // Price
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...gold)
  doc.text(`Rs. ${(order.price || 0).toLocaleString('en-IN')}`, W - 28, 130, { align: 'right' })

  // Payment status badge
  doc.setFillColor(34, 197, 94)
  doc.roundedRect(28, 140, 28, 7, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6)
  doc.setTextColor(255, 255, 255)
  doc.text('PAYMENT VERIFIED', 28 + 14, 144.5, { align: 'center' })

  // Shipping analysis
  const shippingMatch = order.address?.match(/\[(.*) Delivery: ₹(\d+)\]/)
  const sMethod = shippingMatch ? shippingMatch[1] : null
  const sFee = shippingMatch ? parseInt(shippingMatch[2]) : 0
  const cleanAddress = order.address ? order.address.replace(/\s\[.* Delivery: ₹\d+\]/, '') : (order.address || 'Address not provided')

  // Total summary box
  const boxY = 162
  doc.setFillColor(...dark)
  doc.roundedRect(18, boxY, W - 36, 32, 3, 3, 'F')
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text('SUBTOTAL', 28, boxY + 8)
  doc.text(`Rs. ${(order.price || 0).toLocaleString('en-IN')}`, W - 28, boxY + 8, { align: 'right' })

  if (sMethod) {
    doc.text(`SHIPPING (${sMethod.toUpperCase()})`, 28, boxY + 14)
    doc.text(`Rs. ${sFee.toLocaleString('en-IN')}`, W - 28, boxY + 14, { align: 'right' })
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...gold)
  doc.text('TOTAL VOLUME', 28, boxY + 24)
  const totalAmount = (order.price || 0) + sFee
  doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, W - 28, boxY + 24, { align: 'right' })
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(180, 180, 180)
  doc.text(sMethod === 'Express' ? 'Express Boutique Delivery' : 'Standard Atelier Delivery', 28, boxY + 28)

  // Footer quote
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(...grey)
  doc.text('"May this tradition walk with you."', W / 2, 240, { align: 'center' })

  // Footer bar
  doc.setFillColor(...dark)
  doc.rect(0, 273, W, 24, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text('friends-of-4.com', 20, 283)
  doc.text('This is a computer-generated invoice and does not require a signature.', W / 2, 283, { align: 'center' })
  doc.text(`INV-${order.order_id || order.id}`, W - 20, 283, { align: 'right' })

  doc.save(`FriendsOf4_Invoice_${order.order_id || order.id}.pdf`)
}

const tabs = [
  { id: 'profile', label: 'Profile Details', icon: 'person' },
  { id: 'orders', label: 'Order History', icon: 'history' },
  { id: 'tracking', label: 'Live Tracking', icon: 'local_shipping' },
  { id: 'reviews', label: 'My Reviews', icon: 'rate_review' },
  { id: 'wishlist', label: 'Wishlist', icon: 'favorite' },
]

function AccountContent() {
  const router = useRouter()
  const { activeOrders, cancelOrder } = useCart()
  const { wishlist, removeFromWishlist } = useWishlist()
  const [activeTab, setActiveTab] = useState('profile')
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [selectedStars, setSelectedStars] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewImageUrl, setReviewImageUrl] = useState('')
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false)
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null)
  const [reviews, setReviews] = useState<{ id: string, title: string, content: string, stars: number, date: string, img: string }[]>([])
  const [userProfile, setUserProfile] = useState<{fullName?: string, email?: string, phone?: string, address?: string, tier?: string}>({
    fullName: 'The Collector',
    tier: 'Gold Tier Member'
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editData, setEditData] = useState({ name: '', phone: '', address: '' })
  const [dbOrders, setDbOrders] = useState<any[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchUser = async () => {
      const { user, error: authError } = await getSessionUser();
      if (authError || !user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileData) {
        setUserProfile({
          fullName: profileData.name || user.user_metadata?.full_name || 'Valued Client',
          email: profileData.email || user.email,
          phone: profileData.phone || user.user_metadata?.phone || '',
          address: profileData.address || '',
          tier: 'Gold Tier Member'
        });
        setEditData({
          name: profileData.name || user.user_metadata?.full_name || '',
          phone: profileData.phone || '',
          address: profileData.address || ''
        });
      }

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (orders) {
        setDbOrders(orders);
      }

      // Check for Admin status for high-visibility links
      const { authorized } = await import('@/lib/admin-helpers').then(m => m.checkAdminAuth());
      setIsAdmin(authorized);
    };
    
    fetchUser();
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('currentUserEmail');
    setUserProfile({});
    setIsLogoutModalOpen(false);
    router.push('/login');
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user } = await getSessionUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        name: editData.name,
        phone: editData.phone,
        address: editData.address
      })
      .eq('id', user.id);

    if (!error) {
       setUserProfile(prev => ({ ...prev, fullName: editData.name, phone: editData.phone, address: editData.address }));
       setIsEditingProfile(false);
    }
  }

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm('Are you sure you want to cancel this order? This action will notify the boutique to process your refund.')) return;
    
    const { error } = await supabase
      .from('orders')
      .update({ order_status: 'Cancelled' })
      .eq('id', orderId);

    if (!error) {
      // 1. Double-Guard Notifications: Admin Telegram + Customer Email
      const order = dbOrders.find(o => o.id === orderId)
      
      try {
        // A. Notify Admin via Telegram (High Priority)
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: `<b>🚨 ORDER CANCELLATION 🚨</b>\n\n` +
                     `Customer: ${userProfile.fullName}\n` +
                     `Order ID: ORD-${orderNumber}\n` +
                     `Value: ₹${(order?.price || 0).toLocaleString()}\n\n` +
                     `<b>REFUND REQUIRED</b>\n` +
                     `Please process the refund on the Razorpay dashboard for ORD-${orderNumber}.`
          })
        });

        // B. Notify Customer via Branded Email (Professionalism)
        if (order) {
          await fetch('/api/notify-cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: userProfile.email,
              name: userProfile.fullName,
              orderId: `ORD-${orderNumber}`,
              total: order.price
            })
          });
        }
      } catch (e) {
        console.error("Atelier Alert Error: Double-notification pipeline encounterd a delay.");
      }

      // Refresh list
      setDbOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: 'Cancelled' } : o));
      alert("Order cancelled successfully. Our team has been notified for your refund.");
    }
  }

  return (
    <div className="min-h-screen bg-[#fdf9f2] flex flex-col font-body">
      <Header />
      
      <main className="flex-1 pt-32 pb-24 px-8 md:px-12 xl:px-24 max-w-[1920px] mx-auto w-full flex flex-col lg:flex-row gap-16 no-print">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col border-r border-[#1c1c18]/10 lg:pr-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-12 flex flex-col items-center lg:items-start">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-4 relative bg-[#1c1c18]/5">
              <Image src="/placeholder-user.jpg" alt="Profile" fill className="object-cover" />
            </div>
            <h2 className="font-headline text-xl mb-2 text-[#1c1c18]">{userProfile.fullName}</h2>
            <span className="bg-[#e2bb53] text-[#1c1c18] text-[9px] uppercase tracking-widest px-3 py-1 font-bold">{userProfile.tier}</span>
          </motion.div>

          <nav className="space-y-2 mb-12 flex-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 text-left px-4 py-3 transition-colors ${activeTab === tab.id ? 'text-[#1c1c18] font-bold border-l-[3px] border-[#1c1c18] bg-[#1c1c18]/5' : 'text-[#747878] hover:text-[#1c1c18] border-l-[3px] border-transparent'}`}>
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span className="text-[10px] uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}

            {isAdmin && (
              <Link href="/admin" className="w-full flex items-center gap-4 text-left px-4 py-3 text-[#a3851a] hover:text-[#1c1c18] border-l-[3px] border-transparent mt-4 bg-[#a3851a]/5">
                <span className="material-symbols-outlined text-[18px] text-[#a3851a]">admin_panel_settings</span>
                <span className="text-[10px] uppercase tracking-widest font-black">Atelier Command Center</span>
              </Link>
            )}
          </nav>

          <div className="pt-8 border-t border-[#1c1c18]/10 px-4">
             <button onClick={() => setIsLogoutModalOpen(true)} className="w-full flex items-center gap-4 text-left text-[#747878] hover:text-[#1c1c18] transition-colors">
               <span className="material-symbols-outlined text-[18px]">logout</span>
               <span className="text-[10px] uppercase tracking-widest">Logout</span>
             </button>
          </div>
        </aside>

        {/* Content */}
        <section className="flex-1 lg:pl-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center lg:text-left">
            <h1 className="font-headline text-5xl lg:text-7xl mb-4 text-[#1c1c18]">My Atelier</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-body text-[#747878]">Managing your curated collection.</p>
          </motion.div>

          <AnimatePresence mode="wait">
             {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                  <div className="bg-white border border-[#1c1c18]/5 p-8 lg:p-12 shadow-sm">
                    {isEditingProfile ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div><label className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2">Name</label>
                            <input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="w-full bg-white border-b border-[#1c1c18]/10 p-4 outline-none font-body text-lg" />
                          </div>
                          <div><label className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2">Phone</label>
                            <input type="text" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} className="w-full bg-white border-b border-[#1c1c18]/10 p-4 outline-none font-body text-lg" />
                          </div>
                          <div className="md:col-span-2"><label className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2">Address</label>
                            <textarea rows={3} value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} className="w-full bg-white border-b border-[#1c1c18]/10 p-4 outline-none font-body text-lg resize-none" />
                          </div>
                        </div>
                        <div className="pt-8 flex justify-end gap-4">
                          <button type="button" onClick={() => setIsEditingProfile(false)} className="text-[#747878] text-[9px] uppercase tracking-[0.2em] font-bold">Cancel</button>
                          <button type="submit" className="bg-[#1c1c18] text-white py-3 px-8 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-[#a3851a]">Update</button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="md:col-span-2"><label className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2">Name</label><p className="font-body text-lg text-[#1c1c18] pb-2 border-b border-[#1c1c18]/10">{userProfile.fullName}</p></div>
                          <div><label className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2">Email</label><p className="font-body text-lg text-[#1c1c18] pb-2 border-b border-[#1c1c18]/10 opacity-60 italic">{userProfile.email}</p></div>
                          <div><label className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2">Phone</label><p className="font-body text-lg text-[#1c1c18] pb-2 border-b border-[#1c1c18]/10">{userProfile.phone || 'N/A'}</p></div>
                          <div className="md:col-span-2"><label className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2">Shipping Destination</label><p className="font-body text-lg text-[#1c1c18] pb-2 border-b border-[#1c1c18]/10">{userProfile.address || 'Specify in edit'}</p></div>
                        </div>
                        <div className="pt-8 flex justify-end"><button onClick={() => setIsEditingProfile(true)} className="bg-[#1c1c18] text-white py-3 px-8 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-[#a3851a]">Edit</button></div>
                      </div>
                    )}
                  </div>
                </motion.div>
             )}

             {activeTab === 'tracking' && (
                <motion.div key="tracking" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                  <div className="flex justify-between items-end mb-8 border-b border-[#1c1c18]/10 pb-4">
                    <h3 className="font-headline text-2xl tracking-widest uppercase">Live Tracking</h3>
                  </div>
                  {dbOrders.length === 0 ? (
                    <div className="py-20 text-center bg-white border border-[#1c1c18]/5 border-dashed"><h4 className="font-headline text-2xl mb-2 text-[#1c1c18]/40">No Acquisitions in Archive</h4></div>
                  ) : (
                    <div className="space-y-8">
                       {dbOrders.map((order) => (
                         <div key={order.id} className="bg-white p-8 lg:p-12 border border-[#1c1c18]/5 flex flex-col md:flex-row gap-12 group">
                            <div className="flex-1">
                               <span className="text-[9px] uppercase tracking-widest text-[#a3851a] font-bold">Order #{order.order_id}</span>
                               <h4 className="font-headline text-3xl mb-4 mt-2">{order.product_name}</h4>
                               <div className="mb-12">
                                  <div className="flex justify-between mb-6">
                                     <span className="text-[10px] font-bold uppercase tracking-widest text-[#a3851a]">Shipment Progress</span>
                                     <span className="text-[10px] font-body text-[#747878] uppercase tracking-widest">Tracking ID: {order.tracking_id || 'TBA'}</span>
                                  </div>
                                  
                                  <div className="relative pt-8 pb-4">
                                     {/* Progress Line */}
                                     <div className="absolute top-8 left-0 w-full h-[1px] bg-[#1c1c18]/10" />
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: 
                                         order.order_status === 'Preparing' ? '25%' : 
                                         order.order_status === 'Dispatched' ? '50%' : 
                                         order.order_status === 'Out for Delivery' ? '75%' : 
                                         order.order_status === 'Delivered' ? '100%' : '10%' 
                                       }} 
                                       className="absolute top-8 left-0 h-[1px] bg-[#a3851a]" 
                                     />

                                     {/* Milestones */}
                                     <div className="relative flex justify-between">
                                        {[
                                          { id: 'Confirmed', label: 'Placed', icon: 'check_circle' },
                                          { id: 'Preparing', label: 'Atelier', icon: 'auto_fix_high' },
                                          { id: 'Dispatched', label: 'Transit', icon: 'local_shipping' },
                                          { id: 'Delivered', label: 'Received', icon: 'inventory_2' }
                                        ].map((step, idx) => {
                                          const statuses = ['Confirmed', 'Preparing', 'Dispatched', 'Delivered']
                                          const currentIdx = statuses.indexOf(order.order_status)
                                          const isDone = idx <= (currentIdx === -1 ? 0 : currentIdx)
                                          
                                          return (
                                            <div key={step.id} className="flex flex-col items-center gap-3">
                                               <div className={`w-3 h-3 rounded-full border-2 transition-colors duration-500 ${isDone ? 'bg-[#a3851a] border-[#a3851a]' : 'bg-white border-[#1c1c18]/10'}`} />
                                               <div className="flex flex-col items-center">
                                                  <span className={`material-symbols-outlined text-lg mb-1 ${isDone ? 'text-[#a3851a]' : 'text-[#1c1c18]/10'}`}>{step.icon}</span>
                                                  <span className={`text-[8px] uppercase tracking-widest font-bold ${isDone ? 'text-[#1c1c18]' : 'text-[#747878]'}`}>{step.label}</span>
                                               </div>
                                            </div>
                                          )
                                        })}
                                     </div>
                                  </div>
                               </div>
                               <div className="flex flex-wrap gap-4">
                                  <button onClick={() => downloadInvoicePDF(order)} className="bg-[#1c1c18] text-white px-6 py-3 text-[9px] uppercase tracking-widest font-bold">Download Invoice</button>
                                  <button 
                                    onClick={() => handleCancelOrder(order.id, order.order_id)} 
                                    className="border border-red-500/20 text-red-500 px-6 py-3 text-[9px] uppercase tracking-widest font-bold hover:bg-red-500 hover:text-white transition-all"
                                  >
                                    Cancel Order
                                  </button>
                                  <button onClick={() => setIsReviewModalOpen(true)} className="border border-[#1c1c18]/20 px-6 py-3 text-[9px] uppercase tracking-widest font-bold hover:bg-[#1c1c18] hover:text-white transition-all">Submit Editorial</button>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
                </motion.div>
             )}

             {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                   <div className="flex justify-between items-end mb-8 border-b border-[#1c1c18]/10 pb-4"><h3 className="font-headline text-2xl tracking-widest uppercase">Acquisition History</h3></div>
                   <div className="space-y-4">
                      {dbOrders.map((order) => (
                         <div key={order.id} onClick={() => setSelectedInvoiceOrder(order)} className="bg-white border border-[#1c1c18]/5 p-6 hover:border-[#1c1c18]/20 transition-all cursor-pointer flex justify-between items-center group">
                            <div><h5 className="font-headline text-xl group-hover:text-[#a3851a] transition-colors">{order.product_name}</h5><p className="text-[9px] uppercase tracking-widest text-[#747878] mb-4">{new Date(order.created_at).toLocaleDateString()} • #{order.order_id}</p>
                               <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedInvoiceOrder(order)}} className="text-[8px] uppercase tracking-widest font-bold border-b border-[#1c1c18] pb-1">Archive Invoice</button>
                                  <button onClick={(e) => { e.stopPropagation(); setIsReviewModalOpen(true)}} className="text-[8px] uppercase tracking-widest font-bold border-b border-[#a3851a] text-[#a3851a] pb-1">Post Editorial</button>
                               </div>
                            </div>
                            <div className="text-right font-headline text-xl text-[#a3851a]">₹{order.price?.toLocaleString()}</div>
                         </div>
                      ))}
                   </div>
                </motion.div>
             )}

             {activeTab === 'reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                   <div className="flex justify-between items-end mb-8 border-b border-[#1c1c18]/10 pb-4"><h3 className="font-headline text-2xl tracking-widest uppercase">My Editorials</h3></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {reviews.length === 0 ? <p className="text-[10px] uppercase tracking-widest text-[#747878]">No editorials shared yet.</p> : reviews.map(r=>(
                         <div key={r.id} className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm flex gap-6">
                            <div className="w-20 h-24 relative bg-[#1c1c18]/5 shrink-0"><Image src={r.img} fill alt="Review" className="object-cover" /></div>
                            <div><h4 className="font-headline text-lg mb-1">{r.title}</h4><div className="flex mb-2">{[...Array(r.stars)].map((_,i)=><span key={i} className="material-symbols-outlined text-xs text-[#a3851a]">star</span>)}</div><p className="font-body text-xs italic line-clamp-2">"{r.content}"</p></div>
                         </div>
                      ))}
                   </div>
                </motion.div>
             )}

             {activeTab === 'wishlist' && (
                <motion.div key="wishlist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                   <div className="flex justify-between items-end mb-8 border-b border-[#1c1c18]/10 pb-4"><h3 className="font-headline text-2xl tracking-widest uppercase">Wishlist</h3></div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {wishlist.map(w=>(
                        <div key={w.product_id} className="bg-white border border-[#1c1c18]/5 group">
                           <Link href={`/product/${w.product_id}`} className="block relative aspect-[3/4] overflow-hidden"><Image src={w.image || '/placeholder.svg'} fill alt="Piece" className="object-cover group-hover:scale-105 transition-transform duration-700" /></Link>
                           <div className="p-6">
                              <h4 className="font-headline text-xl mb-1 truncate">{w.title}</h4>
                              <p className="font-body text-xs text-[#747878] mb-6">₹{w.price?.toLocaleString()}</p>
                              <div className="flex justify-between items-center"><Link href={`/product/${w.product_id}`} className="text-[9px] uppercase tracking-widest font-bold border-b border-[#1c1c18] pb-1">View Piece</Link><button onClick={()=>removeFromWishlist(w.product_id)} className="material-symbols-outlined text-lg text-red-500/20 hover:text-red-500">delete</button></div>
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
        </section>
      </main>

      <Footer />

      {/* Signature Invoice Modal */}
       <AnimatePresence>
         {selectedInvoiceOrder && (
           <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInvoiceOrder(null)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] no-print" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white z-[201] shadow-2xl p-12 md:p-16 print:fixed print:inset-0 print:m-0 print:w-full print:max-w-none">
                <div className="flex justify-between mb-16 no-print"><h2 className="font-headline text-4xl">Heritage Invoice</h2><button onClick={() => setSelectedInvoiceOrder(null)} className="material-symbols-outlined">close</button></div>
                <div className="space-y-12">
                   <div className="flex justify-between border-b-2 border-[#1c1c18] pb-12">
                      <div><h1 className="font-headline text-4xl mb-4 tracking-tighter">FRIENDS OF 4</h1><p className="text-[10px] uppercase tracking-widest text-[#747878]">ID: {selectedInvoiceOrder.order_id}</p></div>
                      <div className="text-right"><p className="text-[10px] uppercase tracking-widest font-bold">Billed To</p><p className="font-headline text-2xl">{selectedInvoiceOrder.customer_name}</p><p className="text-xs italic text-[#747878] mt-2">{selectedInvoiceOrder.address}</p></div>
                   </div>
                   <table className="w-full text-left font-body">
                      <thead><tr className="border-b border-[#1c1c18]/10 text-[9px] uppercase tracking-widest text-[#747878]"><th className="py-6">Description</th><th className="py-6 text-right">Valuation</th></tr></thead>
                      <tbody><tr className="border-b border-[#1c1c18]/5"><td className="py-8"><h4 className="font-headline text-2xl text-[#1c1c18]">{selectedInvoiceOrder.product_name}</h4><p className="text-[9px] uppercase text-[#747878]">{selectedInvoiceOrder.color} • {selectedInvoiceOrder.size}</p></td><td className="py-8 text-right font-headline text-xl text-[#a3851a]">₹{selectedInvoiceOrder.price?.toLocaleString()}</td></tr></tbody>
                   </table>
                   <div className="flex justify-end pt-24 font-headline text-center italic opacity-60">"May this tradition walk with you."</div>
                </div>
                <div className="mt-16 flex justify-center no-print"><button onClick={() => downloadInvoicePDF(selectedInvoiceOrder)} className="bg-[#1c1c18] text-white py-6 px-12 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#a3851a] flex items-center gap-4"><span className="material-symbols-outlined text-lg">download</span> Download Invoice PDF</button></div>
              </motion.div>
           </>
         )}
       </AnimatePresence>

       {/* Community Editorial Workshop Modal */}
       <AnimatePresence>
         {isReviewModalOpen && (
           <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReviewModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200]" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0b0b0b] text-white p-12 shadow-2xl z-[201]">
                <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                <h3 className="font-headline text-3xl mb-2 text-[#fdf9f2]">Share Your Story</h3>
                <p className="text-[10px] tracking-widest uppercase text-white/40 mb-8">Join the Community of Friends</p>
                <div className="flex gap-4 mb-8 justify-center">
                   {[1,2,3,4,5].map(s=>(<button key={s} onClick={()=>setSelectedStars(s)} className={`material-symbols-outlined text-4xl transition-colors ${selectedStars >= s ? 'text-[#e2bb53]' : 'text-white/10'}`}>star</button>))}
                </div>
                <div className="space-y-4 mb-8">
                   <input type="text" value={reviewImageUrl} onChange={(e)=>setReviewImageUrl(e.target.value)} placeholder="Photo URL: Show your signature style..." className="w-full bg-white/5 border border-white/10 p-4 font-body text-xs text-white placeholder-white/20 outline-none focus:border-[#e2bb53] transition-colors" />
                   <textarea rows={4} value={reviewText} onChange={(e)=>setReviewText(e.target.value)} placeholder="Describe your experience with this masterpiece..." className="w-full bg-white/5 border border-white/10 p-4 font-body text-xs text-white placeholder-white/20 outline-none focus:border-[#e2bb53] transition-colors resize-none" />
                </div>
                <button onClick={() => {
                   if (selectedStars===0 || !reviewText.trim()) return
                   setIsReviewSubmitted(true)
                   setTimeout(() => {
                      setReviews(prev=>[{ id:Math.random().toString(), title:'Masterpiece Discovery', content:reviewText, stars:selectedStars, date:new Date().toLocaleDateString(), img:reviewImageUrl || '/placeholder.svg'}, ...prev])
                      setIsReviewSubmitted(false); setIsReviewModalOpen(false); setReviewText(''); setReviewImageUrl(''); setSelectedStars(0); setActiveTab('reviews')
                   }, 1500)
                }} className="w-full bg-[#e2bb53] text-[#1c1c18] py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-colors disabled:opacity-50">Submit Editorial</button>
              </motion.div>
           </>
         )}
       </AnimatePresence>

       {/* Logout Modal */}
       <AnimatePresence>
        {isLogoutModalOpen && (
           <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogoutModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[320px] bg-white p-10 shadow-2xl z-[101] text-center">
                <h3 className="font-headline text-3xl mb-4">Logout?</h3><div className="flex gap-4"><button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 border py-4 text-[9px] uppercase font-bold">No</button><button onClick={handleLogout} className="flex-1 bg-[#1c1c18] text-white py-4 text-[9px] uppercase font-bold shadow-lg">Yes</button></div>
              </motion.div>
           </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AccountPage() {
  return (<Suspense fallback={<div className="min-h-screen bg-[#fdf9f2] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#a3851a] border-t-transparent rounded-full animate-spin" /></div>}><AccountContent /></Suspense>)
}
