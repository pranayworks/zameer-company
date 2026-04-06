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

  doc.setFillColor(...light)
  doc.rect(0, 0, W, 297, 'F')
  doc.setFillColor(...gold)
  doc.rect(0, 0, W, 24, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text('FRIENDS OF 4', 20, 15)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('HERITAGE INVOICE', W - 20, 15, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...dark)
  doc.text(`ORD-${order.order_id || order.id}`, 20, 42)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...grey)
  const date = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN')
  doc.text(`PLACED ON ${date}`, 20, 50)
  doc.setDrawColor(...gold)
  doc.setLineWidth(0.6)
  doc.line(20, 56, W - 20, 56)
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
  const shippingMatchHeader = order.address?.match(/\[(.*) Delivery: ₹(\d+)\]/)
  const cleanAddressHeader = order.address ? order.address.replace(/\s\[.* Delivery: ₹\d+\]/, '') : (order.address || 'Address not provided')
  const addressLines = doc.splitTextToSize(cleanAddressHeader, 60)
  doc.setTextColor(...grey)
  doc.text(addressLines, 90, 75)
  doc.setFillColor(...gold)
  doc.roundedRect(W - 55, 69, 35, 8, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  doc.text(order.order_status || 'Preparing', W - 37.5, 74.2, { align: 'center' })
  doc.setDrawColor(220, 220, 215)
  doc.setLineWidth(0.3)
  doc.line(20, 100, W - 20, 100)
  doc.setTextColor(...grey)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('ACQUIRED MASTERPIECE', 20, 110)
  doc.text('VALUATION', W - 20, 110, { align: 'right' })
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
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...gold)
  doc.text(`Rs. ${(order.price || 0).toLocaleString('en-IN')}`, W - 28, 130, { align: 'right' })
  doc.setFillColor(34, 197, 94)
  doc.roundedRect(28, 140, 28, 7, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6)
  doc.setTextColor(255, 255, 255)
  doc.text('PAYMENT VERIFIED', 28 + 14, 144.5, { align: 'center' })
  const shippingMatch = order.address?.match(/\[(.*) Delivery: ₹(\d+)\]/)
  const sMethod = shippingMatch ? shippingMatch[1] : null
  const sFee = shippingMatch ? parseInt(shippingMatch[2]) : 0
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
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(...grey)
  doc.text('"May this tradition walk with you."', W / 2, 240, { align: 'center' })
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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [selectedStars, setSelectedStars] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewImageUrl, setReviewImageUrl] = useState('')
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false)
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null)
  const [reviewingOrder, setReviewingOrder] = useState<any>(null)
  const [reviews, setReviews] = useState<{ id: string, title: string, content: string, stars: number, date: string, img: string }[]>([])
  const [userProfile, setUserProfile] = useState<{fullName?: string, email?: string, phone?: string, address?: string, tier?: string, userId?: string}>({
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
          tier: 'Gold Tier Member',
          userId: user.id
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

    await supabase.from('users').upsert([{
      id: user.id,
      name: editData.name,
      email: user.email,
      phone: editData.phone
    }], { onConflict: 'id' });

    const { error } = await supabase
      .from('profiles')
      .upsert([{
        id: user.id,
        name: editData.name,
        phone: editData.phone,
        address: editData.address,
        email: user.email
      }], { onConflict: 'id' });

    if (!error) {
       setUserProfile(prev => ({ ...prev, fullName: editData.name, phone: editData.phone, address: editData.address }));
       setIsEditingProfile(false);
    } else {
       alert("Failed to update profile details.");
    }
  }

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    const { error } = await supabase
      .from('orders')
      .update({ order_status: 'Cancelled' })
      .eq('id', orderId);

    if (!error) {
      const order = dbOrders.find(o => o.id === orderId)
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: `<b>🚨 ORDER CANCELLATION 🚨</b>\n\n` +
                     `Customer: ${userProfile.fullName}\n` +
                     `Order ID: ORD-${orderNumber}\n` +
                     `Value: ₹${(order?.price || 0).toLocaleString()}\n\n` +
                     `<b>REFUND REQUIRED</b>`
          })
        });
      } catch (e) {}

      setDbOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: 'Cancelled' } : o));
      alert("Order cancelled successfully.");
    }
  }

  return (
    <div className="min-h-screen bg-[#fdf9f2] flex flex-col font-body">
      <Header />
      
      <main className="flex-1 pt-32 pb-24 px-8 md:px-12 xl:px-24 max-w-[1920px] mx-auto w-full flex flex-col lg:flex-row gap-16 no-print">
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
                   <div className="flex justify-between items-end mb-8 border-b border-[#1c1c18]/10 pb-4"><h3 className="font-headline text-2xl tracking-widest uppercase">Live Tracking</h3></div>
                   {dbOrders.length === 0 ? (
                     <div className="py-20 text-center bg-white border border-[#1c1c18]/5 border-dashed font-headline text-2xl text-[#1c1c18]/20">No active shipments in the vault.</div>
                   ) : (
                     <div className="space-y-8">
                        {dbOrders.map((order) => (
                          <div key={order.id} className="bg-white p-8 border border-[#1c1c18]/5 flex flex-col md:flex-row gap-8 shadow-sm">
                             <div className="flex-1">
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#a3851a]">#{order.order_id}</span>
                                <h4 className="font-headline text-3xl mb-4">{order.product_name}</h4>
                                <div className="mb-8">
                                   <div className="flex justify-between mb-4">
                                      <span className="text-[10px] font-bold uppercase text-[#a3851a]">Logistics Progress</span>
                                      <span className="text-[10px] uppercase text-[#747878]">ID: {order.shipment_id || 'Awaiting Allocation'}</span>
                                   </div>
                                   <div className="relative pt-4 pb-2">
                                      <div className="absolute top-4 left-0 w-full h-[1px] bg-[#1c1c18]/10" />
                                      <motion.div initial={{ width: 0 }} animate={{ width: order.order_status === 'Delivered' ? '100%' : order.order_status === 'Out for Delivery' ? '75%' : order.order_status === 'Dispatched' ? '50%' : '25%' }} className="absolute top-4 left-0 h-[1px] bg-[#a3851a]" />
                                      <div className="flex justify-between relative">
                                         {['Placed', 'Atelier', 'Transit', 'Received'].map((s, i) => (
                                           <div key={s} className="flex flex-col items-center gap-2">
                                              <div className={`w-2 h-2 rounded-full ${i <= (order.order_status === 'Delivered' ? 3 : order.order_status === 'Out for Delivery' ? 2 : order.order_status === 'Dispatched' ? 2 : 1) ? 'bg-[#a3851a]' : 'bg-[#1c1c18]/10'}`} />
                                              <span className="text-[8px] uppercase tracking-widest font-bold">{s}</span>
                                           </div>
                                         ))}
                                      </div>
                                   </div>
                                </div>
                                <div className="flex gap-4">
                                   <button onClick={() => downloadInvoicePDF(order)} className="text-[9px] uppercase tracking-widest font-bold border-b border-[#1c1c18] pb-1">Invoice</button>
                                   {order.shipment_id && <button onClick={() => window.open(`https://www.delhivery.com/track/package/${order.shipment_id}`, '_blank')} className="text-[9px] uppercase tracking-widest font-bold border-b border-blue-500 text-blue-600 pb-1">Track Live</button>}
                                </div>
                             </div>
                             <div className="shrink-0 flex items-center"><span className="bg-amber-50 text-[#a3851a] px-6 py-2 text-[10px] uppercase font-bold border border-[#a3851a]/10">{order.order_status}</span></div>
                          </div>
                        ))}
                     </div>
                   )}
                </motion.div>
             )}

             {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                   <div className="flex justify-between items-end mb-8 border-b border-[#1c1c18]/10 pb-4"><h3 className="font-headline text-2xl tracking-widest uppercase">Acquisition History</h3></div>
                   <div className="space-y-6">
                      {dbOrders.map((order) => (
                         <div key={order.id} className="bg-white border border-[#1c1c18]/5 p-8 hover:border-[#1c1c18]/20 transition-all shadow-sm flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="flex-1">
                               <div className="flex justify-between items-start mb-4">
                                  <div className="flex flex-col">
                                     <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#a3851a] mb-1">#{order.order_id}</span>
                                     <h5 className="font-headline text-2xl text-[#1c1c18] uppercase">{order.product_name}</h5>
                                  </div>
                                  <span className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-sm ${order.order_status === 'Delivered' ? 'bg-green-100 text-green-700' : order.order_status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{order.order_status}</span>
                               </div>
                               <div className="flex flex-wrap gap-6 items-center mb-6">
                                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#747878]">calendar_today</span><p className="text-[10px] uppercase tracking-widest text-[#747878]">{new Date(order.created_at).toLocaleDateString('en-IN')}</p></div>
                                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-[#747878]">inventory</span><span className="text-[10px] uppercase tracking-widest font-bold">{order.size} / {order.color}</span></div>
                               </div>
                               <div className="flex flex-wrap gap-6">
                                  <button onClick={() => downloadInvoicePDF(order)} className="text-[9px] uppercase tracking-widest font-bold border-b border-[#1c1c18] pb-1 hover:text-[#a3851a]">Invoice</button>
                                  <button onClick={() => { setReviewingOrder(order); setIsReviewModalOpen(true)}} className="text-[9px] uppercase tracking-widest font-bold border-b border-[#a3851a] text-[#a3851a] pb-1">Editorial</button>
                                  {order.shipment_id && <button onClick={() => window.open(`https://www.delhivery.com/track/package/${order.shipment_id}`, '_blank')} className="text-[9px] uppercase tracking-widest font-bold border-b border-blue-500 text-blue-600 pb-1">Track</button>}
                               </div>
                            </div>
                            <div className="text-right shrink-0 border-l border-[#1c1c18]/5 pl-8 hidden md:block">
                               <p className="text-[10px] uppercase tracking-widest text-[#747878] mb-1">Valuation</p>
                               <div className="font-headline text-3xl text-[#1c1c18]">₹{order.price?.toLocaleString()}</div>
                            </div>
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
                            <div className="w-24 h-24 relative bg-[#1c1c18]/5 shrink-0 rounded-sm overflow-hidden"><Image src={r.img} fill alt="Review" className="object-cover" /></div>
                            <div><h4 className="font-headline text-lg mb-1">{r.title}</h4><div className="flex mb-2">{[...Array(r.stars)].map((_,i)=><span key={i} className="material-symbols-outlined text-xs text-[#a3851a]">star</span>)}</div><p className="font-body text-xs italic line-clamp-3">"{r.content}"</p></div>
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
                        <div key={w.product_id} className="bg-white border border-[#1c1c18]/5 group shadow-sm hover:shadow-lg transition-all rounded-sm overflow-hidden">
                           <Link href={`/product/${w.product_id}`} className="block relative aspect-[3/4] overflow-hidden"><Image src={w.image ? w.image.split(',')[0].trim() : '/placeholder.svg'} fill alt="Piece" className="object-cover group-hover:scale-105 transition-transform duration-700" /></Link>
                           <div className="p-6 text-center">
                              <h4 className="font-headline text-xl mb-1 truncate uppercase">{w.title}</h4>
                              <p className="font-body text-xs text-[#a3851a] mb-6 font-bold">₹{w.price?.toLocaleString()}</p>
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

       <AnimatePresence>
         {isReviewModalOpen && reviewingOrder && (
           <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReviewModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200]" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0b0b0b] text-white p-12 shadow-2xl z-[201] rounded-sm">
                <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                <h3 className="font-headline text-3xl mb-2">SHARED EXPERIENCE</h3>
                <p className="text-[10px] tracking-widest uppercase text-[#a3851a] mb-8 font-black">FOR: {reviewingOrder.product_name}</p>
                <div className="flex gap-4 mb-10 justify-center">
                   {[1,2,3,4,5].map(s=>(<button key={s} onClick={()=>setSelectedStars(s)} className={`material-symbols-outlined text-4xl transform transition-all ${selectedStars >= s ? 'text-[#e2bb53] scale-110 shadow-lg' : 'text-white/10'}`}>star</button>))}
                </div>
                <div className="space-y-4 mb-8">
                   <input type="text" value={reviewImageUrl} onChange={(e)=>setReviewImageUrl(e.target.value)} placeholder="Editorial Image URL" className="w-full bg-white/5 border border-white/10 p-4 font-body text-xs text-white placeholder-white/20 outline-none focus:border-[#e2bb53]" />
                   <textarea rows={4} value={reviewText} onChange={(e)=>setReviewText(e.target.value)} placeholder="Describe the curation..." className="w-full bg-white/5 border border-white/10 p-4 font-body text-xs text-white placeholder-white/20 outline-none focus:border-[#e2bb53] resize-none" />
                </div>
                <button disabled={selectedStars === 0 || !reviewText.trim() || isReviewSubmitted} onClick={async () => {
                    setIsReviewSubmitted(true);
                    try {
                      const { data: pData } = await supabase.from('products').select('id').ilike('title', `%${reviewingOrder.product_name}%`).limit(1).single();
                      const { error } = await supabase.from('reviews').insert([{ product_id: pData?.id || Date.now().toString(), user_id: userProfile.userId, user_name: userProfile.fullName, rating: selectedStars, comment: reviewText.trim(), image_url: reviewImageUrl || '' }]);
                      if (error) throw error;
                      setReviews(prev => [{ id: Math.random().toString(), title: reviewingOrder.product_name, content: reviewText.trim(), stars: selectedStars, date: new Date().toLocaleDateString(), img: reviewImageUrl || '/placeholder.svg' }, ...prev]);
                      alert('✓ Review submitted!'); setIsReviewModalOpen(false); setReviewText(''); setReviewImageUrl(''); setSelectedStars(0); setActiveTab('reviews');
                    } catch (err: any) { alert('Failed to submit review'); } finally { setIsReviewSubmitted(false); }
                  }} className="w-full bg-[#a3851a] text-[#1c1c18] py-5 text-[10px] uppercase tracking-widest font-black hover:bg-white transition-all disabled:opacity-30">SUBMIT EDITORIAL</button>
              </motion.div>
           </>
         )}
       </AnimatePresence>

       <AnimatePresence>
        {isLogoutModalOpen && (
           <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogoutModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[320px] bg-white p-10 shadow-2xl z-[101] text-center rounded-sm">
                <h3 className="font-headline text-3xl mb-6">LOGOUT?</h3><div className="flex gap-4"><button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 border py-4 text-[9px] uppercase font-bold">No</button><button onClick={handleLogout} className="flex-1 bg-[#1c1c18] text-white py-4 text-[9px] uppercase font-bold shadow-lg">Yes</button></div>
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
