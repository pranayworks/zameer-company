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
  stock: number
  colors?: { name: string, hex: string }[]
  sizes?: string[]
  fabric?: string[]
  care?: string[]
  fit?: string[]
  video_url?: string
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
}

export const ADMIN_EMAILS = [
  'mamidipranay07@gmail.com',
  'friendsof4.support@gmail.com'
]

export const CATEGORIES = ['Men', 'Women', 'Sarees', 'Jewellery', 'Others'] as const

export const CATEGORY_ICONS: Record<string, string> = {
  Men: 'person',
  Women: 'female',
  Sarees: 'styler',
  Jewellery: 'diamond',
  Others: 'category',
}

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Men: 'Kurtas, Suits, Sherwanis & Heritage Wear',
  Women: 'Tunics, Dresses, Blouses & Curated Fits',
  Sarees: 'Hand-woven Silks, Banarasi & Designer Drapes',
  Jewellery: 'Heritage Chokers, Jhumkas & Statement Pieces',
  Others: 'Kids, Accessories & Special Collections',
}

export async function checkAdminAuth(): Promise<{ authorized: boolean; email?: string }> {
  const { user } = await getSessionUser()
  if (!user) return { authorized: false }
  if (ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return { authorized: true, email: user.email || '' }
  }
  return { authorized: false }
}

export async function fetchAllProducts(): Promise<Product[]> {
  const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  return (data || []) as Product[]
}

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  if (category === 'Others') {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    return ((data || []) as Product[]).filter(p => !['Men', 'Women', 'Sarees', 'Jewellery'].includes(p.category))
  }
  const { data } = await supabase.from('products').select('*').eq('category', category).order('created_at', { ascending: false })
  return (data || []) as Product[]
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  return (data || []) as Order[]
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmedId = id.trim()
    const cleanupArcs = ['wishlist', 'cart', 'reviews', 'stock_notifications', 'order_items', 'order_details', 'orders']

    for (const arc of cleanupArcs) {
      const { error: arcErr } = await supabase.from(arc).delete().eq('product_id', trimmedId)
      if (arcErr) {
        console.warn(`Skip/Fail on archive ${arc} - ${arcErr.message}`)
        if (arc === 'wishlist' && !arcErr.message.includes('column')) {
          throw new Error(`Wishlist cleanup failed: ${arcErr.message}`)
        }
      }
      if (trimmedId !== id) {
        await supabase.from(arc).delete().eq('product_id', id)
      }
    }

    const { error: finalError } = await supabase.from('products').delete().eq('id', trimmedId)
    if (finalError) throw finalError

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || JSON.stringify(err) }
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

  const { error } = await supabase.from('products').upsert([productData])

  if (error) {
    if (error.message.includes('image2') || error.message.includes('image3')) {
      const { image2, image3, ...safeData } = productData
      const { error: retryError } = await supabase.from('products').upsert([safeData])
      if (retryError) {
        return { success: false, error: retryError.message }
      }
      return { success: true, note: "Extra images were not saved because 'image2' and 'image3' columns are missing in your Supabase table." }
    }
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function deleteOrder(id: string, order_id?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Attempt deletion by both ID and Order ID using an OR filter for maximum compatibility
    const matchQuery = order_id ? `id.eq.${id},order_id.eq.${order_id}` : `id.eq.${id}`
    const { data: deletedRows, error } = await supabase
      .from('orders')
      .delete()
      .or(matchQuery)
      .select()
    
    if (error) throw error
    
    if (!deletedRows || deletedRows.length === 0) {
       // Final fallback for manual records that might have been created with order_id in the 'id' field
       if (order_id) {
         const { data: fallbackRows, error: errorFallback } = await supabase
           .from('orders')
           .delete()
           .eq('order_id', order_id.replace('ORD-', ''))
           .select()
         if (!errorFallback && fallbackRows && fallbackRows.length > 0) return { success: true }
       }
       
       return { success: false, error: "Record not found or protected by security policies. Ensure you have administrative privileges for historical removal." }
    }
    
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || JSON.stringify(err) }
  }
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
            `Customer: ${order.customer_name}\n\n` +
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

export const downloadInvoicePDF = async (order: Order) => {
  if (typeof window === 'undefined') return
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
  doc.text(`ORD-${order.order_id}`, 20, 42)
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
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...dark)
  doc.text(order.customer_name || 'N/A', 20, 75)
  doc.setFontSize(8)
  doc.setTextColor(...grey)
  doc.text(order.email || '', 20, 81)
  doc.text(order.phone || '', 20, 87)
  const shippingMatchHeader = order.address?.match(/\[(.*) Delivery: ₹(\d+)\]/)
  const cleanAddressHeader = order.address ? order.address.replace(/\s\[.* Delivery: ₹\d+\]/, '') : 'N/A'
  const addressLines = doc.splitTextToSize(cleanAddressHeader, 60)
  doc.text(addressLines, 90, 75)
  doc.setFontSize(10)
  doc.setTextColor(...gold)
  doc.setFont('helvetica', 'bold')
  doc.text(order.order_status?.toUpperCase() || 'PROCESSING', W - 20, 75, { align: 'right' })
  doc.setDrawColor(230, 226, 219)
  doc.setLineWidth(0.3)
  doc.line(20, 100, W - 20, 100)
  doc.setFillColor(245, 242, 235)
  doc.rect(20, 108, W - 40, 12, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...grey)
  doc.text('ITEM', 24, 115)
  doc.text('SIZE', 100, 115)
  doc.text('TONE', 125, 115)
  doc.text('AMOUNT', W - 24, 115, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...dark)
  doc.text(order.product_name || 'N/A', 24, 130)
  doc.setFontSize(8)
  doc.setTextColor(...grey)
  doc.text(order.size || '-', 100, 130)
  doc.text(order.color || '-', 125, 130)
  doc.setFontSize(10)
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  const priceStr = order.price ? `₹${order.price.toLocaleString()}` : '₹0'
  doc.text(priceStr, W - 24, 130, { align: 'right' })
  doc.setDrawColor(...gold)
  doc.setLineWidth(0.8)
  doc.line(20, 145, W - 20, 145)
  doc.setFontSize(8)
  doc.setTextColor(...grey)
  doc.setFont('helvetica', 'normal')
  doc.setFont('helvetica', 'normal')
  const shippingMatch = order.address?.match(/\[(.*) Delivery: ₹(\d+)\]/)
  const sMethod = shippingMatch ? shippingMatch[1] : null
  const sFee = shippingMatch ? parseInt(shippingMatch[2]) : 0
  const cleanAddress = order.address ? order.address.replace(/\s\[.* Delivery: ₹\d+\]/, '') : 'N/A'
  
  doc.text('SUBTOTAL', 100, 153)
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.text(priceStr, W - 24, 153, { align: 'right' })

  if (sMethod) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grey)
    doc.text(`SHIPPING (${sMethod.toUpperCase()})`, 100, 160)
    doc.setTextColor(...dark)
    doc.setFont('helvetica', 'bold')
    doc.text(`₹${sFee.toLocaleString()}`, W - 24, 160, { align: 'right' })
  }

  doc.setTextColor(...gold)
  doc.setFontSize(12)
  doc.text('TOTAL', 100, 172)
  const totalAmount = (order.price || 0) + sFee
  doc.text(`₹${totalAmount.toLocaleString()}`, W - 24, 172, { align: 'right' })
  doc.setFillColor(...dark)
  doc.rect(0, 273, W, 24, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text('friends-of-4.com', 20, 283)
  doc.text('This is a computer-generated invoice and does not require a signature.', W / 2, 283, { align: 'center' })
  doc.text(`INV-${order.order_id}`, W - 20, 283, { align: 'right' })

  doc.save(`FriendsOf4_Invoice_Admin_${order.order_id}.pdf`)
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
  stock: 0,
  colors: [],
  sizes: [],
  fabric: [],
  care: [],
  fit: [],
  video_url: ''
}
