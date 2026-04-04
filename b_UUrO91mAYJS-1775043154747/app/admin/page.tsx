'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Image from 'next/image'

interface Product {
  id: string
  title: string
  price: number
  image: string
  description: string
  category: string
  stock: number
  colors?: { name: string, hex: string }[]
  sizes?: string[]
  fabric?: string[]
  care?: string[]
  fit?: string[]
  video_url?: string
}

interface Order {
  id: string
  order_id: string
  customer_name: string
  email: string
  phone: string
  address: string
  product_name: string
  size: string
  color: string
  price: number
  order_status: string
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // New/Edit form state
  const [formData, setFormData] = useState<Partial<Product>>({
    id: '',
    title: '',
    price: 0,
    image: '',
    description: '',
    category: 'Sarees',
    stock: 0,
    colors: [],
    sizes: [],
    fabric: [],
    care: [],
    fit: [],
    video_url: ''
  })

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (profile?.is_admin) {
        setIsAuthorized(true)
        fetchProducts()
        fetchOrders()
      } else {
        // Kick them out if they aren't an admin
        router.push('/')
      }
    }
    checkAdmin()
  }, [router])

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  const handleOpenAdd = (category: string = 'Sarees') => {
    setFormData({
      id: '', title: '', price: 0, image: '', description: '', category, 
      stock: 0, colors: [], sizes: ['S', 'M', 'L', 'XL'], fabric: [], care: [], fit: [],
      video_url: ''
    })
    setIsAdding(true)
    setEditingId(null)
  }

  const handleEdit = (product: Product) => {
    setFormData(product)
    setEditingId(product.id)
    setIsAdding(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('products')
      .upsert([formData])

    if (error) {
      alert(`Error saving product: ${error.message}`)
    } else {
      setIsAdding(false)
      fetchProducts()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this item from the boutique?')) return
    
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchProducts()
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('id', orderId)
    
    if (!error) fetchOrders()
  }

  const handleTestTelegram = async () => {
    const testMessage = `<b>🏛️ ATELIER CONNECTIVITY VERIFIED 🏛️</b>\n\n` +
      `Your boutique is now officially linked to your Telegram phone via the Secure Server Herald.\n\n` +
      `<i>Tradition, Secured.</i>`;

    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testMessage })
      });

      if (response.ok) {
        alert("Herald Signal Handed to Server! Please check your Telegram for the verification message.");
      } else {
        const errorData = await response.json();
        alert(`Herald Connection Failed: ${errorData.error || 'Check your .env settings'}`);
      }
    } catch (e) {
      alert("Local Herald Failed: Could not reach your boutique server.");
    }
  }

  // Helpers for array inputs
  const addToArray = (field: 'fabric' | 'care' | 'fit', val: string) => {
    if (!val) return
    setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), val] }))
  }

  const addColor = (name: string, hex: string) => {
    if (!name || !hex) return
    setFormData(prev => ({ ...prev, colors: [...(prev.colors || []), { name, hex }] }))
  }

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div>
            <h1 className="font-headline text-5xl md:text-6xl tracking-tighter mb-4">Boutique Command Center</h1>
            <div className="flex gap-8">
               <button 
                onClick={() => setActiveTab('inventory')}
                className={`font-body text-[10px] uppercase tracking-[0.3em] pb-2 border-b-2 transition-all ${activeTab === 'inventory' ? 'border-[#a3851a] text-[#a3851a]' : 'border-transparent text-[#747878] hover:text-[#1c1c18]'}`}
               >
                 Inventory Archive
               </button>
               <button 
                onClick={() => setActiveTab('orders')}
                className={`font-body text-[10px] uppercase tracking-[0.3em] pb-2 border-b-2 transition-all ${activeTab === 'orders' ? 'border-[#a3851a] text-[#a3851a]' : 'border-transparent text-[#747878] hover:text-[#1c1c18]'}`}
               >
                 Order Log ({orders.length})
               </button>
            </div>
          </div>
          {activeTab === 'inventory' && (
            <div className="flex gap-4">
              <button 
                onClick={handleTestTelegram}
                className="border border-[#a3851a] text-[#a3851a] px-8 py-4 font-body text-[10px] uppercase tracking-widest font-bold shadow-sm hover:bg-[#a3851a] hover:text-white transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">notifications_active</span>
                Test Admin Herald
              </button>
              <button 
                onClick={() => handleOpenAdd()}
                className="gold-satin text-white px-8 py-4 font-body text-[10px] uppercase tracking-widest font-bold shadow-xl hover:scale-105 transition-all"
              >
                Global Add
              </button>
            </div>
          )}
        </div>

        {activeTab === 'inventory' ? (
          <>
            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
               <div className="bg-white p-8 border border-[#1c1c18]/5 shadow-sm">
                  <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Total Inventory</span>
                  <p className="font-headline text-4xl mt-2">{products.length}</p>
               </div>
               <div className="bg-white p-8 border border-[#1c1c18]/5 shadow-sm">
                  <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Out of Stock</span>
                  <p className="font-headline text-4xl mt-2 text-red-500">{products.filter(p => p.stock === 0).length}</p>
               </div>
               <div className="bg-white p-8 border border-[#1c1c18]/5 shadow-sm">
                  <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Total Categories</span>
                  <p className="font-headline text-4xl mt-2">{new Set(products.map(p => p.category)).size}</p>
               </div>
            </div>

            {loading && products.length === 0 ? (
              <div className="py-24 text-center opacity-40">Loading Boutique Data...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 overflow-x-auto pb-8">
                {['Men', 'Women', 'Sarees', 'Jewellery', 'Others'].map((cat) => (
                  <div key={cat} className="flex flex-col gap-6 min-w-[300px]">
                    <div className="flex justify-between items-center border-b-2 border-[#1c1c18] pb-4 mb-2">
                       <h2 className="font-headline text-3xl">{cat}</h2>
                       <button 
                        onClick={() => handleOpenAdd(cat === 'Others' ? 'Sarees' : cat)}
                        className="w-8 h-8 rounded-full border border-[#1c1c18] flex items-center justify-center hover:bg-[#1c1c18] hover:text-white transition-all"
                       >
                        <span className="material-symbols-outlined text-sm">add</span>
                       </button>
                    </div>

                    <div className="space-y-4">
                      {products.filter(p => cat === 'Others' ? !['Men', 'Women', 'Sarees', 'Jewellery'].includes(p.category) : p.category === cat).length === 0 ? (
                        <div className="py-8 text-center border border-dashed border-[#1c1c18]/10 text-[10px] uppercase tracking-widest text-[#747878] opacity-50">
                          Empty Vault
                        </div>
                      ) : (
                        products.filter(p => cat === 'Others' ? !['Men', 'Women', 'Sarees', 'Jewellery'].includes(p.category) : p.category === cat).map((product) => (
                          <motion.div 
                            key={product.id}
                            layout
                            className="bg-white border border-[#1c1c18]/5 p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow relative group"
                          >
                            <div className="relative w-full aspect-[3/4] bg-[#fdf9f2] overflow-hidden">
                               <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                               <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => handleEdit(product)}
                                    className="w-8 h-8 bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-[#1c1c18] hover:text-white transition-all"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(product.id)}
                                    className="w-8 h-8 bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                  </button>
                               </div>
                            </div>
                            <div>
                               <h3 className="font-headline text-lg leading-tight mb-1">{product.title}</h3>
                               <div className="flex justify-between items-center">
                                  <span className="font-body text-[10px] text-[#747878]">₹{product.price.toLocaleString()}</span>
                                  <span className={`font-body text-[10px] ${product.stock < 10 ? 'text-red-500 font-bold' : 'text-[#747878]'}`}>Stock: {product.stock}</span>
                               </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Orders Tab */
          <div className="space-y-8">
            {orders.length === 0 ? (
               <div className="py-32 text-center bg-white border border-[#1c1c18]/5">
                 <span className="material-symbols-outlined text-5xl opacity-10 mb-6">shopping_bag</span>
                 <p className="font-body text-xs uppercase tracking-widest text-[#747878]">No orders received yet.</p>
               </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white border border-[#1c1c18]/5 p-8 shadow-sm group">
                   <div className="flex flex-col xl:flex-row gap-12 justify-between">
                      {/* Customer Detail */}
                      <div className="flex-1 space-y-6">
                         <div>
                            <span className="font-body text-[10px] uppercase tracking-widest text-[#a3851a] block mb-2">Order Identification</span>
                            <h4 className="font-headline text-3xl text-[#1c1c18]">{order.order_id}</h4>
                            <p className="text-[10px] text-[#747878] uppercase mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#1c1c18]/5">
                            <div>
                               <span className="font-body text-[9px] uppercase tracking-widest text-[#747878] block mb-1">Customer Profile</span>
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

                      {/* Product Detail */}
                      <div className="flex-1 bg-[#fdf9f2] p-8 border border-[#1c1c18]/5">
                         <span className="font-body text-[9px] uppercase tracking-widest text-[#747878] block mb-4">Acquired Masterpiece</span>
                         <div className="flex gap-6 items-center">
                            <div className="flex-1">
                               <p className="font-headline text-2xl mb-1">{order.product_name}</p>
                               <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-widest">
                                  <span className="bg-[#1c1c18] text-white px-3 py-1">Size: {order.size}</span>
                                  <span className="border border-[#1c1c18]/20 px-3 py-1">Tone: {order.color}</span>
                               </div>
                               <p className="font-bold mt-4 text-[#a3851a]">Valuation: ₹{order.price?.toLocaleString()}</p>
                            </div>
                         </div>
                      </div>

                      {/* Status Control */}
                      <div className="shrink-0 flex flex-col justify-between items-end border-l border-[#1c1c18]/5 pl-8">
                         <div className="text-right">
                           <span className="font-body text-[9px] uppercase tracking-widest text-[#747878] block mb-2">Fulfillment Status</span>
                           <select 
                            value={order.order_status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="bg-transparent font-bold uppercase text-[10px] tracking-widest text-[#1c1c18] border-b-2 border-[#1c1c18] focus:border-[#a3851a] outline-none py-2"
                           >
                              <option>Preparing</option>
                              <option>Dispatched</option>
                              <option>Out for Delivery</option>
                              <option>Delivered</option>
                              <option>Cancelled</option>
                           </select>
                         </div>
                         <button className="text-[9px] uppercase tracking-[0.2em] font-bold border border-[#1c1c18]/10 px-6 py-3 hover:bg-[#1c1c18] hover:text-white transition-all">
                            Print Invoice
                         </button>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal Overlay for Add/Edit Inventory */}
        <AnimatePresence>
          {isAdding && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsAdding(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="fixed inset-8 md:inset-24 bg-[#fdf9f2] z-[101] shadow-2xl overflow-y-auto p-12"
              >
                <div className="max-w-4xl mx-auto">
                   <div className="flex justify-between items-center mb-12">
                      <h2 className="font-headline text-4xl">{editingId ? 'Edit Masterpiece' : 'Introduce New Creation'}</h2>
                      <button onClick={() => setIsAdding(false)} className="material-symbols-outlined">close</button>
                   </div>

                   <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {/* Left: General Info */}
                      <div className="space-y-8">
                         <div>
                            <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Item ID (Used in URLs)</label>
                            <input 
                              type="text" 
                              required 
                              disabled={!!editingId}
                              value={formData.id}
                              onChange={e => setFormData({ ...formData, id: e.target.value })}
                              className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none"
                              placeholder="e.g. emerald-silk-saree"
                            />
                         </div>
                         <div>
                            <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Display Title</label>
                            <input 
                               type="text" required value={formData.title}
                               onChange={e => setFormData({ ...formData, title: e.target.value })}
                               className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none"
                               placeholder="e.g. Royal Hand-woven Saree"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-8">
                            <div>
                               <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Price (In ₹)</label>
                               <input 
                                  type="number" required value={formData.price}
                                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                  className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none"
                               />
                            </div>
                            <div>
                               <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Initial Stock</label>
                               <input 
                                  type="number" required value={formData.stock}
                                  onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                  className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none"
                               />
                            </div>
                         </div>
                         <div>
                            <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Editorial Description</label>
                            <textarea 
                               rows={4} required value={formData.description}
                               onChange={e => setFormData({ ...formData, description: e.target.value })}
                               className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none"
                            />
                         </div>
                         <div>
                            <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Image URL</label>
                            <input 
                               type="text" required value={formData.image}
                               onChange={e => setFormData({ ...formData, image: e.target.value })}
                               className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none"
                               placeholder="/saree_1.png"
                            />
                         </div>
                         <div>
                            <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Cinematic Reel (MP4 URL)</label>
                            <input 
                               type="text" value={formData.video_url || ''}
                               onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                               className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none"
                               placeholder="e.g https://your-server.com/saree_reel.mp4"
                            />
                         </div>
                      </div>

                      {/* Right: Technical Specs */}
                      <div className="space-y-8">
                        <div>
                            <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Category</label>
                            <select 
                               value={formData.category}
                               onChange={e => setFormData({ ...formData, category: e.target.value })}
                               className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none appearance-none"
                            >
                               <option>Sarees</option>
                               <option>Women</option>
                               <option>Men</option>
                               <option>Jewellery</option>
                               <option>Kids</option>
                            </select>
                         </div>

                         <div>
                            <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-4 block">Available Colors (Tones)</label>
                            <div className="flex flex-wrap gap-2 mb-4">
                               {formData.colors?.map((c, i) => (
                                 <div key={i} className="flex items-center gap-2 bg-white border p-2 rounded-full shadow-sm">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.hex }} />
                                    <span className="text-[10px] font-bold">{c.name}</span>
                                    <button 
                                      type="button"
                                      onClick={() => setFormData({ ...formData, colors: formData.colors?.filter((_, idx) => idx !== i) })}
                                      className="material-symbols-outlined text-[10px]"
                                    >close</button>
                                 </div>
                               ))}
                            </div>
                            <div className="flex gap-2">
                               <input type="text" id="color_name" className="w-1/2 p-2 border-b text-xs outline-none" placeholder="Name" />
                               <input type="color" id="color_hex" className="h-10 w-10 p-0 border-0" />
                               <button 
                                 type="button"
                                 onClick={() => {
                                   const name = (document.getElementById('color_name') as HTMLInputElement).value
                                   const hex = (document.getElementById('color_hex') as HTMLInputElement).value
                                   if (name && hex) {
                                     addColor(name, hex);
                                     (document.getElementById('color_name') as HTMLInputElement).value = ''
                                   }
                                 }}
                                 className="text-xs font-bold uppercase tracking-widest border border-[#a3851a] text-[#a3851a] px-4"
                               >Add</button>
                            </div>
                         </div>

                         <div>
                            <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Fabric Highlights (Enter to add)</label>
                            <input 
                              type="text" 
                              onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); addToArray('fabric', e.currentTarget.value); e.currentTarget.value = '' } }}
                              className="w-full bg-white border-b border-[#1c1c18]/20 p-2 text-sm outline-none" 
                            />
                            <div className="mt-4 space-y-1">
                               {formData.fabric?.map((f, i) => (
                                 <div key={i} className="flex justify-between items-center text-[10px] border-b py-1">
                                    <span>{f}</span>
                                    <button type="button" onClick={() => setFormData({ ...formData, fabric: formData.fabric?.filter((_, idx) => idx !== i) })} className="material-symbols-outlined text-[10px]">close</button>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="md:col-span-2 pt-8">
                         <button 
                            type="submit" disabled={loading}
                            className="w-full gold-satin text-white py-6 font-body uppercase tracking-[0.3em] text-[10px] font-bold shadow-2xl"
                         >
                            {loading ? 'Curating Database...' : editingId ? 'Update Masterpiece' : 'Confirm New Creation'}
                         </button>
                      </div>
                   </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
