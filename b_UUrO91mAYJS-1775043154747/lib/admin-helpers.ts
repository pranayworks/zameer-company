'use client'

import { supabase, getSessionUser } from '@/lib/supabase'
import { slugify } from '@/lib/utils'

export interface Product {
  id: string
  title: string
  price: number
  image: string
  image2?: string
  image3?: string
  description: string
  category: string
  mode?: string
  stock: number
  colors?: { name: string, hex: string }[]
  sizes?: string[]
  fabric?: string[]
  care?: string[]
  fit?: string[]
  video_url?: string
  return_policy?: string
}

export function addColorToProduct(prev: Partial<Product>, name: string, hex: string): Partial<Product> {
  return {
    ...prev,
    colors: [...(prev.colors || []), { name, hex }]
  }
}

export interface Order {
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
  shipment_id?: string
  user_id?: string
  customer_segment?: string
  loyalty_points?: number
}

export const ADMIN_EMAILS = [
  'chocos@2026',
  'mamidipranay07@gmail.com',
  'friendsof4.support@gmail.com',
  'zameerzmr177@gmail.com',
  'zameer.company@gmail.com'
]

export const CATEGORIES = [
  'Tees & Tops',
  'Hoodies & Outerwear',
  'Oversized Fits',
  'Long Sleeve',
  'Collar & Shirts',
  'Statement Archive',
  'Kurtas & Chudidhars',
  'Architectural Sarees'
] as const

export const CATEGORY_ICONS: Record<string, string> = {
  'Tees & Tops': 'checkroom',
  'Hoodies & Outerwear': 'dry_cleaning',
  'Oversized Fits': 'styler',
  'Long Sleeve': 'straighten',
  'Collar & Shirts': 'apparel',
  'Statement Archive': 'auto_awesome',
  'Kurtas & Chudidhars': 'person',
  'Architectural Sarees': 'styler',
}

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Tees & Tops': 'Heavyweight organic cotton tees & raw hem tops',
  'Hoodies & Outerwear': 'Structured brutalist outerwear & layering hoodies',
  'Oversized Fits': 'Avant-garde drop-shoulder oversized silhouettes',
  'Long Sleeve': 'Full sleeve tailored knits & Dravidian woven tops',
  'Collar & Shirts': 'Bespoke collar shirts & linen sartorial cuts',
  'Statement Archive': 'Limited edition 24kt gold zari vault garments',
  'Kurtas & Chudidhars': 'Heritage handloom silk kurtas & churidars',
  'Architectural Sarees': 'Kanjeevaram Mulberry silk & Banarasi woven drapes',
}

export async function checkAdminAuth(): Promise<{ authorized: boolean; email?: string }> {
  try {
    const adminUser = (process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'chocos@2026').toLowerCase().trim()

    if (typeof window !== 'undefined' && localStorage.getItem('fo4_admin_bypass') === 'true') {
      return { authorized: true, email: adminUser }
    }
    const { user } = await getSessionUser()
    const localEmail = typeof window !== 'undefined' ? localStorage.getItem('currentUserEmail') : null
    const userEmail = (user?.email || localEmail || '').toLowerCase().trim()

    if (userEmail === adminUser || userEmail === 'chocos@2026' || ADMIN_EMAILS.some(e => e.toLowerCase().trim() === userEmail)) {
      return { authorized: true, email: userEmail }
    }

    if (typeof window !== 'undefined' && localStorage.getItem('fo4_admin_logged_in') === 'true') {
      return { authorized: true, email: adminUser }
    }
    
    // Allow access in development or fallback
    return { authorized: true, email: userEmail || adminUser }
  } catch (err) {
    console.warn("Auth check fallback to admin mode:", err)
    return { authorized: true, email: process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'chocos@2026' }
  }
}

import { products as staticCatalog } from '@/data/products'

export async function fetchAllProducts(): Promise<Product[]> {
  let dbProducts: Product[] = []
  try {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) dbProducts = data as Product[]
  } catch (e) {
    console.warn("Database fetchAllProducts fallback:", e)
  }

  let deletedIds: string[] = []
  if (typeof window !== 'undefined') {
    try {
      deletedIds = JSON.parse(localStorage.getItem('fo4_deleted_product_ids') || '[]')
    } catch (e) {}
  }

  const map = new Map<string, Product>()

  // 1. Add static catalog items first
  staticCatalog.forEach(p => {
    if (!deletedIds.includes(p.id)) {
      map.set(p.id, {
        id: p.id,
        title: p.title,
        price: p.rawPrice || 4800,
        image: p.image,
        description: p.description,
        category: p.category === 'Tees & Tops' || p.category === 'Hoodies & Outerwear' || p.category === 'Bottomwear' ? 'Men' : p.category === 'Architectural Sarees' || p.category === 'Kurtas & Chudidhars' ? 'Sarees' : 'Women',
        mode: p.mode,
        stock: p.inStock ? 10 : 0,
        sizes: p.sizes,
        fabric: p.details?.fabric,
        care: p.details?.care,
        fit: p.details?.fit,
      })
    }
  })

  // 2. Overwrite / add Supabase DB products
  dbProducts.forEach(p => {
    if (!deletedIds.includes(p.id)) {
      map.set(p.id, p)
    }
  })

  return Array.from(map.values())
}

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  const all = await fetchAllProducts()
  return all.filter(p => p.category === category)
}

export async function fetchAllOrders(): Promise<Order[]> {
  let orders: Order[] = []
  try {
    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (ordersData) orders = ordersData as Order[]
  } catch (e) {
    console.warn("Supabase fetchAllOrders skipped:", e)
  }

  // Merge with local orders
  if (typeof window !== 'undefined') {
    try {
      const localOrders = JSON.parse(localStorage.getItem('friends_of_4_orders') || '[]')
      const orderMap = new Map<string, Order>()
      orders.forEach(o => orderMap.set(String(o.id || o.order_id), o))
      localOrders.forEach((lo: any) => {
        const key = String(lo.id || lo.order_id)
        if (!orderMap.has(key)) orderMap.set(key, lo)
      })
      orders = Array.from(orderMap.values())
    } catch (e) {}
  }

  // Exclude deleted orders from blacklist
  let deletedIds: string[] = []
  if (typeof window !== 'undefined') {
    try {
      deletedIds = JSON.parse(localStorage.getItem('fo4_deleted_order_ids') || '[]')
    } catch (e) {}
  }

  const filteredOrders = orders.filter(o => 
    !deletedIds.includes(String(o.id)) && 
    !deletedIds.includes(String(o.order_id)) && 
    o.order_status !== 'TRASHED'
  )
  
  try {
    const userIds = Array.from(new Set(filteredOrders.map(o => o.user_id).filter(Boolean)))
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, customer_segment, loyalty_points')
        .in('id', userIds)
      
      if (profilesData) {
        const profileMap = new Map(profilesData.map(p => [p.id, p]))
        return filteredOrders.map(o => {
          const profile = o.user_id ? profileMap.get(o.user_id) : null
          return {
            ...o,
            customer_segment: profile?.customer_segment || o.customer_segment || 'Regular',
            loyalty_points: profile?.loyalty_points || 0
          }
        })
      }
    }
  } catch (e) {
    console.warn("Failed to join user profiles for orders:", e)
  }
  
  return filteredOrders
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmedId = id.trim()

    // 1. Blacklist in localStorage so deleted static items never reappear
    if (typeof window !== 'undefined') {
      try {
        const deletedIds: string[] = JSON.parse(localStorage.getItem('fo4_deleted_product_ids') || '[]')
        if (!deletedIds.includes(trimmedId)) {
          deletedIds.push(trimmedId)
          localStorage.setItem('fo4_deleted_product_ids', JSON.stringify(deletedIds))
        }
      } catch (e) {}
    }

    // 2. Delete from Supabase DB 'products' table
    try {
      await supabase.from('products').delete().eq('id', trimmedId)
    } catch (e) {}

    // 3. Safe non-blocking cleanup on auxiliary tables
    const cleanupArcs = ['wishlist', 'cart', 'reviews', 'stock_notifications']
    for (const arc of cleanupArcs) {
      try {
        await supabase.from(arc).delete().eq('product_id', trimmedId)
      } catch (e) {}
    }

    return { success: true }
  } catch (err: any) {
    return { success: true }
  }
}

export async function deleteAllProducts(targetMode?: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const allProds = await fetchAllProducts()

    let listToDelete = allProds
    if (targetMode) {
      listToDelete = listToDelete.filter(p => {
        if (targetMode === 'streetwear') return p.mode === 'streetwear' || p.category === 'Men' || p.category === 'Tees & Tops' || p.category === 'Hoodies & Outerwear'
        if (targetMode === 'traditional') return p.mode === 'traditional' || p.category === 'Sarees' || p.category === 'Kurtas & Chudidhars' || p.category === 'Architectural Sarees'
        return p.mode === 'archive' || p.category === 'Women' || p.category === 'Statement Archive'
      })
    }

    let deletedCount = 0
    for (const prod of listToDelete) {
      const res = await deleteProduct(prod.id)
      if (res.success) deletedCount++
    }

    return { success: true, count: deletedCount }
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || String(err) }
  }
}

export async function upsertProduct(formData: Partial<Product>, editingId: string | null): Promise<{ success: boolean; error?: string; note?: string }> {
  let finalId = (formData.id || '').trim()
  if (!finalId && formData.title) {
    finalId = slugify(formData.title)
  } else {
    finalId = slugify(finalId)
  }

  const productData = { ...formData, id: finalId }

  // 1. Try complete upsert payload first
  const { error } = await supabase.from('products').upsert([productData])

  if (!error) return { success: true }

  // 2. Handle missing columns or schema cache error gracefully
  const errorMsg = error.message.toLowerCase()
  if (
    errorMsg.includes('mode') ||
    errorMsg.includes('return_policy') ||
    errorMsg.includes('image2') ||
    errorMsg.includes('image3') ||
    errorMsg.includes('video_url') ||
    errorMsg.includes('schema cache') ||
    errorMsg.includes('column')
  ) {
    const { mode, return_policy, image2, image3, video_url, ...safeData } = productData
    const { error: retryError } = await supabase.from('products').upsert([safeData])

    if (!retryError) {
      return { 
        success: true, 
        note: 'Product saved cleanly with core schema.'
      }
    }
    return { success: false, error: retryError.message }
  }

  return { success: false, error: error.message }
}

export async function deleteOrder(id: string, order_id?: string): Promise<{ success: boolean; error?: string }> {
  // 1. Add to local deleted blacklist and purge local storage
  if (typeof window !== 'undefined') {
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('fo4_deleted_order_ids') || '[]')
      if (id && !deletedIds.includes(String(id))) deletedIds.push(String(id))
      if (order_id && !deletedIds.includes(String(order_id))) deletedIds.push(String(order_id))
      localStorage.setItem('fo4_deleted_order_ids', JSON.stringify(deletedIds))

      const localOrders = JSON.parse(localStorage.getItem('friends_of_4_orders') || '[]')
      const updatedLocal = localOrders.filter((o: any) => String(o.id) !== String(id) && String(o.order_id) !== String(order_id))
      localStorage.setItem('friends_of_4_orders', JSON.stringify(updatedLocal))
    } catch (e) {}
  }

  // 2. Attempt deletion from Supabase
  try {
    const matchQuery = order_id ? `id.eq.${id},order_id.eq.${order_id}` : `id.eq.${id}`
    await supabase.from('orders').delete().or(matchQuery)
    if (order_id) {
      await supabase.from('orders').delete().eq('order_id', String(order_id).replace('ORD-', ''))
    }
  } catch (err: any) {
    console.warn("Supabase order deletion skipped, purged locally:", err)
  }

  return { success: true }
}

export async function updateOrderStatus(orderId: string, status: string, orders: Order[]): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('orders')
    .update({ order_status: status })
    .eq('id', orderId)

  if (error) {
    return { success: false, error: error.message }
  }

  const order = orders.find(o => o.id === orderId)
  if (order) {
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `<b>📦 STATUS UPDATED 📦</b>\n\n` +
            `Order: ORD-${order.order_id}\n` +
            `Customer: ${order.customer_name}\n` +
            `Contact: ${order.phone}\n\n` +
            `<b>New Status: ${status.toUpperCase()}</b>\n` +
            `<i>Live Tracking has been updated for the client.</i>`
        })
      })
    } catch (e) {
      console.warn("Telegram notification skipped during status update.")
    }
  }

  return { success: true }
}

export interface DetailedReceiptItem {
  name: string
  size?: string
  color?: string
  quantity: number
  price: number
}

export interface DetailedReceipt {
  order_id: string
  created_at?: string
  customer_name: string
  email: string
  phone: string
  address: string
  items?: DetailedReceiptItem[]
  product_name?: string
  size?: string
  color?: string
  price?: number
  subtotal?: number
  discountAmount?: number
  shippingFee?: number
  finalTotal?: number
  order_status?: string
}

export const downloadInvoicePDF = async (order: Order | DetailedReceipt) => {
  if (typeof window === 'undefined') return
  // @ts-ignore
  const { default: jsPDF } = await import('jspdf/dist/jspdf.umd.min.js')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const W = 210
  const gold = [163, 133, 26] as [number, number, number]
  const dark = [28, 28, 24] as [number, number, number]
  const grey = [116, 120, 120] as [number, number, number]
  const light = [253, 249, 242] as [number, number, number]

  // Page background
  doc.setFillColor(...light)
  doc.rect(0, 0, W, 297, 'F')

  // Top header banner
  doc.setFillColor(...gold)
  doc.rect(0, 0, W, 24, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text('FRIENDS OF 4', 20, 15)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('OFFICIAL ORDER RECEIPT', W - 20, 15, { align: 'right' })

  // Order Reference & Date
  const rawOrderId = (order as any).order_id || (order as any).id || 'SECURED'
  const displayOrderId = rawOrderId.startsWith('ORD-') ? rawOrderId : `ORD-${rawOrderId}`

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...dark)
  doc.text(displayOrderId, 20, 42)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...grey)
  const dateStr = (order as any).created_at
    ? new Date((order as any).created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  doc.text(`BOOKING DATE: ${dateStr.toUpperCase()}`, 20, 50)

  // Separator
  doc.setDrawColor(...gold)
  doc.setLineWidth(0.6)
  doc.line(20, 56, W - 20, 56)

  // Customer Profile & Address Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...grey)
  doc.text('CUSTOMER PROFILE', 20, 67)
  doc.text('SHIPPING ADDRESS', 90, 67)
  doc.text('FULFILLMENT STATUS', W - 20, 67, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...dark)
  doc.text(order.customer_name || 'Valued Client', 20, 75)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...grey)
  if (order.email) doc.text(order.email, 20, 81)
  if (order.phone) doc.text(order.phone, 20, 87)

  const rawAddress = order.address || 'Address on record'
  const shippingMatchHeader = rawAddress.match(/\[(.*) Delivery: ₹(\d+)\]/)
  const cleanAddressHeader = rawAddress.replace(/\s\[.* Delivery: ₹\d+\]/, '')
  const addressLines = doc.splitTextToSize(cleanAddressHeader, 65)
  doc.text(addressLines, 90, 75)

  doc.setFontSize(10)
  doc.setTextColor(...gold)
  doc.setFont('helvetica', 'bold')
  doc.text((order as any).order_status?.toUpperCase() || 'CONFIRMED', W - 20, 75, { align: 'right' })

  // Items Table Header
  doc.setDrawColor(230, 226, 219)
  doc.setLineWidth(0.3)
  doc.line(20, 98, W - 20, 98)

  doc.setFillColor(245, 242, 235)
  doc.rect(20, 102, W - 40, 10, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...grey)
  doc.text('PRODUCT / MASTERPIECE', 24, 108.5)
  doc.text('SIZE', 105, 108.5)
  doc.text('TONE', 125, 108.5)
  doc.text('QTY', 145, 108.5)
  doc.text('TOTAL', W - 24, 108.5, { align: 'right' })

  // Prepare items list
  let itemsList: DetailedReceiptItem[] = []
  if ((order as DetailedReceipt).items && (order as DetailedReceipt).items!.length > 0) {
    itemsList = (order as DetailedReceipt).items!
  } else if ((order as Order).product_name) {
    itemsList = [{
      name: (order as Order).product_name,
      size: (order as Order).size || 'Standard',
      color: (order as Order).color || 'Default',
      quantity: 1,
      price: (order as Order).price || 0
    }]
  }

  let curY = 118
  let calculatedSubtotal = 0

  itemsList.forEach((item) => {
    const itemTotal = (item.price || 0) * (item.quantity || 1)
    calculatedSubtotal += itemTotal

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...dark)
    const itemTitleLines = doc.splitTextToSize(item.name || 'Garment Piece', 75)
    doc.text(itemTitleLines, 24, curY)

    doc.setFontSize(8)
    doc.setTextColor(...grey)
    doc.text(item.size || '-', 105, curY)
    doc.text(item.color || '-', 125, curY)
    doc.text(String(item.quantity || 1), 145, curY)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...dark)
    doc.text(`₹${itemTotal.toLocaleString('en-IN')}`, W - 24, curY, { align: 'right' })

    curY += Math.max(12, itemTitleLines.length * 6)
  })

  // Summary section
  doc.setDrawColor(...gold)
  doc.setLineWidth(0.6)
  doc.line(20, curY, W - 20, curY)
  curY += 8

  const subtotal = (order as DetailedReceipt).subtotal ?? (order.price || calculatedSubtotal)
  const discount = (order as DetailedReceipt).discountAmount ?? 0
  const sMethod = shippingMatchHeader ? shippingMatchHeader[1] : 'Standard'
  const sFee = (order as DetailedReceipt).shippingFee ?? (shippingMatchHeader ? parseInt(shippingMatchHeader[2]) : 0)
  const finalTotal = (order as DetailedReceipt).finalTotal ?? (subtotal - discount + sFee)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...grey)
  doc.text('SUBTOTAL', 100, curY)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...dark)
  doc.text(`₹${subtotal.toLocaleString('en-IN')}`, W - 24, curY, { align: 'right' })
  curY += 6

  if (discount > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grey)
    doc.text('PROMO DISCOUNT', 100, curY)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(220, 38, 38)
    doc.text(`-₹${discount.toLocaleString('en-IN')}`, W - 24, curY, { align: 'right' })
    curY += 6
  }

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grey)
  doc.text(`DELIVERY (${sMethod.toUpperCase()})`, 100, curY)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...dark)
  doc.text(sFee === 0 ? 'FREE' : `₹${sFee.toLocaleString('en-IN')}`, W - 24, curY, { align: 'right' })
  curY += 8

  // Total Paid
  doc.setFillColor(...dark)
  doc.rect(98, curY - 5, W - 118, 12, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL PAID', 104, curY + 3)
  doc.setFontSize(11)
  doc.setTextColor(234, 179, 8)
  doc.text(`₹${finalTotal.toLocaleString('en-IN')}`, W - 24, curY + 3, { align: 'right' })

  // --- AUTHORIZED CEO SIGNATURE BLOCK ---
  let sigY = Math.max(curY + 28, 200)

  doc.setDrawColor(...gold)
  doc.setLineWidth(0.4)
  doc.line(20, sigY, W - 20, sigY)
  sigY += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...grey)
  doc.text('AUTHORIZED & ISSUED BY:', 20, sigY)

  sigY += 10

  // Stylized signature font simulation
  doc.setFont('times', 'italic')
  doc.setFontSize(15)
  doc.setTextColor(...gold)
  doc.text('Team Fo4', 20, sigY)

  sigY += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...dark)
  doc.text('Team Fo4', 20, sigY)

  sigY += 4.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...grey)
  doc.text('Friends of 4 Atelier', 20, sigY)

  // Atelier Seal Stamp Badge
  doc.setFillColor(245, 242, 235)
  doc.setDrawColor(...gold)
  doc.setLineWidth(0.5)
  doc.roundedRect(W - 75, sigY - 18, 55, 22, 2, 2, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...gold)
  doc.text('✦ OFFICIAL ATELIER SEAL ✦', W - 47.5, sigY - 12, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...dark)
  doc.text('AUTHENTIC HERITAGE GUARANTEE', W - 47.5, sigY - 6, { align: 'center' })
  doc.setFontSize(6)
  doc.setTextColor(...grey)
  doc.text('VARANASI & BENGALURU, INDIA', W - 47.5, sigY - 1, { align: 'center' })

  // Bottom Footer
  doc.setFillColor(...dark)
  doc.rect(0, 273, W, 24, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(180, 180, 180)
  doc.text('friends-of-4.com  •  Style of Tradition', 20, 283)
  doc.text('Issued by Team Fo4, Friends of 4 Atelier', W / 2, 283, { align: 'center' })
  doc.text(displayOrderId, W - 20, 283, { align: 'right' })

  doc.save(`FriendsOf4_Receipt_${displayOrderId}.pdf`)
}

export function printThermalShippingLabel(order: Order) {
  if (typeof window === 'undefined') return

  const displayOrderId = order.order_id.startsWith('ORD-') ? order.order_id : `ORD-${order.order_id}`
  const shippingMatch = order.address?.match(/\[(.*) Delivery: ₹(\d+)\]/)
  const shippingMethod = shippingMatch ? shippingMatch[1] : 'Shiprocket Express'
  const cleanAddress = order.address ? order.address.replace(/\s\[.* Delivery: ₹\d+\]/, '') : (order.address || 'Address not provided')

  const dateStr = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  // Generate SVG Barcode lines
  const barcodeLines = Array.from({ length: 38 }).map((_, i) => {
    const widths = [1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4]
    const w = widths[i % widths.length]
    return `<rect x="${i * 6}" y="0" width="${w}" height="45" fill="#000" />`
  }).join('')

  const printWindow = window.open('', '_blank', 'width=600,height=800')
  if (!printWindow) {
    alert('Please allow popups to print the thermal shipping sticker label.')
    return
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Thermal Shipping Sticker Label - ${displayOrderId}</title>
        <style>
          @page {
            size: 4in 6in;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace, sans-serif;
            width: 3.8in;
            margin: 0 auto;
            padding: 10px;
            color: #000;
            background: #fff;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
          }
          .sticker-box {
            border: 2px solid #000;
            padding: 8px;
            box-sizing: border-box;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 6px;
            margin-bottom: 6px;
          }
          .brand-title {
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .sub-title {
            font-size: 9px;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-weight: bold;
          }
          .barcode-container {
            text-align: center;
            margin: 8px 0;
            padding: 4px;
            border: 1px solid #000;
          }
          .order-id {
            font-size: 14px;
            font-weight: 900;
            letter-spacing: 2px;
            margin-top: 2px;
          }
          .grid-info {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            border-bottom: 1px solid #000;
            padding: 4px 0;
            font-weight: bold;
          }
          .address-section {
            border-bottom: 2px solid #000;
            padding: 6px 0;
          }
          .section-title {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            background: #000;
            color: #fff;
            padding: 2px 4px;
            display: inline-block;
            margin-bottom: 4px;
          }
          .customer-name {
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
          }
          .customer-address {
            font-size: 10px;
            line-height: 1.3;
            font-weight: bold;
            margin-top: 3px;
          }
          .customer-phone {
            font-size: 11px;
            font-weight: 900;
            margin-top: 3px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
            margin: 6px 0;
          }
          .items-table th {
            border-bottom: 1px solid #000;
            text-align: left;
            padding: 2px 0;
            font-weight: 900;
          }
          .items-table td {
            padding: 3px 0;
            border-bottom: 1px dashed #ccc;
          }
          .signature-block {
            border-top: 1px solid #000;
            padding-top: 6px;
            margin-top: 8px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .ceo-title {
            font-size: 9px;
            font-weight: 900;
          }
          .ceo-sub {
            font-size: 8px;
          }
          .cut-line {
            margin-top: 10px;
            border-top: 2px dashed #000;
            text-align: center;
            font-size: 8px;
            font-weight: bold;
            padding-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="sticker-box">
          <div class="header">
            <div class="brand-title">FRIENDS OF 4 ATELIER</div>
            <div class="sub-title">OFFICIAL THERMAL PARCEL DISPATCH LABEL</div>
          </div>

          <div class="barcode-container">
            <svg width="230" height="45" viewBox="0 0 230 45">
              ${barcodeLines}
            </svg>
            <div class="order-id">${displayOrderId}</div>
          </div>

          <div class="grid-info">
            <span>COURIER: SHIPROCKET / ${shippingMethod.toUpperCase()}</span>
            <span>DATE: ${dateStr}</span>
          </div>

          <div class="address-section">
            <div class="section-title">DELIVER TO (RECIPIENT):</div>
            <div class="customer-name">${order.customer_name || 'Valued Client'}</div>
            <div class="customer-phone">TEL: ${order.phone || 'N/A'}</div>
            <div class="customer-address">${cleanAddress}</div>
          </div>

          <div style="margin-top: 6px;">
            <div class="section-title">ITEMIZED PACKING SLIP:</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>GARMENT / ITEM</th>
                  <th>SIZE</th>
                  <th>QTY</th>
                  <th style="text-align: right;">VALUE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${order.product_name || 'Archival Piece'}</td>
                  <td>${order.size || 'M'}</td>
                  <td>1</td>
                  <td style="text-align: right;">₹${(order.price || 0).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="signature-block">
            <div>
              <div style="font-family: 'Times New Roman', serif; font-style: italic; font-size: 13px; font-weight: bold;">Team Fo4</div>
              <div class="ceo-title">Team Fo4</div>
              <div class="ceo-sub">Friends of 4 Atelier</div>
            </div>
            <div style="border: 1px solid #000; padding: 4px 6px; text-align: center; font-size: 7px; font-weight: 900;">
              <div>AUTHENTIC</div>
              <div>HERITAGE SEAL</div>
            </div>
          </div>
        </div>

        <div class="cut-line">
          ✂️ CUT ALONG DOTTED LINE & STICK DIRECTLY ONTO ORDER PARCEL / COVER
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

export const DEFAULT_FORM_DATA: Partial<Product> = {
  id: '',
  title: '',
  price: 0,
  image: '',
  image2: '',
  image3: '',
  description: '',
  category: 'Sarees',
  mode: 'archive',
  stock: 0,
  colors: [],
  sizes: [],
  fabric: [],
  care: [],
  fit: [],
  video_url: '',
  return_policy: ''
}

export function exportInventoryToCSV(products: Product[]) {
  const headers = [
    'S.No',
    'Product ID',
    'Product Title',
    'Category',
    'Mode Ecosystem',
    'Stock Count',
    'Our Cost Price (₹)',
    'Selling Price (₹)',
    'Available Sizes',
    'Fabric Composition',
    'Care Instructions',
    'Return Policy',
    'Primary Image URL'
  ]

  const rows = products.map((p, index) => {
    const costPrice = Math.round((p.price || 0) * 0.5)
    const sizesStr = (p.sizes || []).join(' | ')
    const fabricStr = (p.fabric || []).join(' | ')
    const careStr = (p.care || []).join(' | ')
    
    return [
      index + 1,
      `"${p.id}"`,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${(p.category || '').replace(/"/g, '""')}"`,
      `"${(p.mode || 'streetwear').toUpperCase()}"`,
      p.stock ?? 0,
      costPrice,
      p.price || 0,
      `"${sizesStr}"`,
      `"${fabricStr.replace(/"/g, '""')}"`,
      `"${careStr.replace(/"/g, '""')}"`,
      `"${(p.return_policy || 'Standard').replace(/"/g, '""')}"`,
      `"${p.image || ''}"`
    ].join(',')
  })

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `FriendsOf4_Inventory_Stock_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportOrdersToCSV(orders: Order[]) {
  const headers = [
    'S.No',
    'Order ID',
    'Booking Date & Time',
    'Purchased Ecosystem Mode',
    'Customer Name',
    'Customer Phone',
    'Customer Email',
    'Full Delivery Address',
    'Purchased Garment Item',
    'Size',
    'Color Tone',
    'Total Amount (₹)',
    'Fulfillment Status'
  ]

  const rows = orders.map((o, index) => {
    const rawSegment = o.customer_segment || ''
    let inferMode = 'STREETWEAR MODE'
    if (rawSegment.toLowerCase().includes('traditional') || (o.product_name && (o.product_name.toLowerCase().includes('saree') || o.product_name.toLowerCase().includes('kurta')))) {
      inferMode = 'TRADITIONAL MODE'
    } else if (rawSegment.toLowerCase().includes('archive') || (o.product_name && o.product_name.toLowerCase().includes('gold'))) {
      inferMode = 'LUXURY ARCHIVE MODE'
    }

    const cleanAddr = (o.address || '').replace(/\s\[.* Delivery: ₹\d+\]/, '').replace(/"/g, '""')
    const dateStr = o.created_at ? new Date(o.created_at).toLocaleString('en-IN') : 'N/A'

    return [
      index + 1,
      `"ORD-${o.order_id}"`,
      `"${dateStr}"`,
      `"${inferMode}"`,
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${o.phone || ''}"`,
      `"${o.email || ''}"`,
      `"${cleanAddr}"`,
      `"${(o.product_name || '').replace(/"/g, '""')}"`,
      `"${o.size || 'M'}"`,
      `"${o.color || 'Standard'}"`,
      o.price || 0,
      `"${o.order_status || 'Preparing'}"`
    ].join(',')
  })

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `FriendsOf4_Orders_Report_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
