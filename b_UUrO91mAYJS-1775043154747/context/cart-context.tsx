'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useToast } from './toast-context'

export interface CartItem {
  id: string | number
  name?: string
  title?: string
  price: number | string
  rawPrice?: number
  quantity: number
  image: string
  selectedSize?: string
  selectedColor?: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string | number, selectedSize?: string, selectedColor?: string) => void
  updateQuantity: (id: string | number, delta: number, selectedSize?: string, selectedColor?: string) => void
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
  totalItems: number
  subtotal: number
  activeOrders: CartItem[]
  placeOrder: (shippingMethod?: string, shippingFee?: number, guestProfile?: { name?: string; email?: string; phone?: string; address?: string }) => void
  cancelOrder: (id: string | number, selectedSize?: string, selectedColor?: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeOrders, setActiveOrders] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    // 1. Load from localStorage first (Immediate UX)
    const savedCart = localStorage.getItem('atelier-cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error("Cart hydration failed")
      }
    }

    const initCart = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const user = data?.session?.user
        if (user) {
          setUserId(user.id)

          // Always try to load cloud cart for logged-in users (cross-device sync)
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('cart_data')
              .eq('id', user.id)
              .single()

            if (profileData?.cart_data && Array.isArray(profileData.cart_data) && profileData.cart_data.length > 0) {
              const cloudCart = profileData.cart_data as CartItem[]
              // Merge: if local cart has items, merge them with cloud; otherwise use cloud
              const localCart = savedCart ? JSON.parse(savedCart) : []
              if (localCart.length === 0) {
                // No local cart — use cloud cart
                setCart(cloudCart)
                localStorage.setItem('atelier-cart', JSON.stringify(cloudCart))
              } else {
                // Both exist — merge (add cloud items not in local)
                const merged = [...localCart]
                for (const cloudItem of cloudCart) {
                  const exists = merged.find((m: CartItem) => 
                    m.id === cloudItem.id && m.selectedSize === cloudItem.selectedSize && m.selectedColor === cloudItem.selectedColor
                  )
                  if (!exists) {
                    merged.push(cloudItem)
                  }
                }
                setCart(merged)
                localStorage.setItem('atelier-cart', JSON.stringify(merged))
                // Update cloud with merged cart
                await supabase.from('profiles').update({ cart_data: merged }).eq('id', user.id)
              }
            } else if (savedCart && savedCart !== '[]') {
              // Local cart exists but cloud is empty — push local to cloud
              await supabase.from('profiles').update({ cart_data: JSON.parse(savedCart) }).eq('id', user.id)
            }
          } catch (e) {
            console.warn("Cloud cart sync skipped", e)
          }
        }
      } catch (e) {
        console.warn("Supabase auth session check skipped", e)
      }
    }
    initCart()
  }, [])

  // Persist to localStorage AND Supabase on change
  useEffect(() => {
    localStorage.setItem('atelier-cart', JSON.stringify(cart))
    // Also sync to cloud for cross-device access
    if (userId && cart.length >= 0) {
      const syncToCloud = async () => {
        try {
          await supabase.from('profiles').update({ cart_data: cart }).eq('id', userId)
        } catch (e) {
          console.warn('Cloud cart save skipped', e)
        }
      }
      syncToCloud()
    }
  }, [cart, userId])

  const checkAuthStatus = async (): Promise<boolean> => {
    if (userId) return true
    if (typeof window !== 'undefined') {
      const localEmail = localStorage.getItem('currentUserEmail')
      if (localEmail) return true
    }
    try {
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user) {
        setUserId(data.session.user.id)
        return true
      }
    } catch (e) {}
    return false
  }

  const addToCart = async (newItem: CartItem) => {
    const isLogged = await checkAuthStatus()
    if (!isLogged) {
      showToast('Please sign in or create an account to add items to your cart.', 'error', 'lock')
      if (typeof window !== 'undefined') {
        window.location.href = '/login?redirect=cart'
      }
      return
    }

    const itemName = newItem.name || newItem.title || 'Garment Piece'
    const itemTitle = newItem.title || newItem.name || 'Garment Piece'
    const itemWithNames = { ...newItem, name: itemName, title: itemTitle }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === itemWithNames.id && item.selectedSize === itemWithNames.selectedSize && item.selectedColor === itemWithNames.selectedColor
      )
      if (existingItem) {
        return prevCart.map((item) =>
          (item.id === itemWithNames.id && item.selectedSize === itemWithNames.selectedSize && item.selectedColor === itemWithNames.selectedColor)
            ? { ...item, quantity: item.quantity + (itemWithNames.quantity || 1) }
            : item
        )
      }
      return [...prevCart, { ...itemWithNames, quantity: itemWithNames.quantity || 1 }]
    })

    // Sync to Supabase if logged in
    if (userId) {
      try {
        await supabase.from('cart').upsert({
          user_id: userId,
          product_id: typeof newItem.id === 'string' && newItem.id.length === 36 ? newItem.id : undefined,
          quantity: newItem.quantity || 1,
          size: newItem.selectedSize,
          color: newItem.selectedColor
        }, { onConflict: 'user_id, product_id, size, color' })
      } catch (e) { console.error("Cart sync failed", e) }
    }

    showToast(`${itemName} added to your collection.`, 'success', 'shopping_bag')
    setIsCartOpen(true)
  }

  const removeFromCart = (id: string | number, selectedSize?: string, selectedColor?: string) => {
    setCart((prevCart) => prevCart.filter(
      (item) => !(item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
    ))
    showToast('Item removed from bag.', 'info', 'remove_shopping_cart')
  }

  const updateQuantity = (id: string | number, delta: number, selectedSize?: string, selectedColor?: string) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor) {
          const newQty = Math.max(0, item.quantity + delta)
          return { ...item, quantity: newQty }
        }
        return item
      }).filter(item => item.quantity > 0)
    )
  }

  const sendAdminNotification = async (orderData: any) => {
    // --- ATELIER SECURE SERVER HERALD ---
    const shippingMatch = orderData.address?.match(/\[(.*) Delivery: ₹(\d+)\]/)
    const sMethod = shippingMatch ? shippingMatch[1] : 'Standard'
    const sFee = shippingMatch ? shippingMatch[2] : '0'
    const cleanAddress = orderData.address ? orderData.address.replace(/\s\[.* Delivery: ₹\d+\]/, '') : (orderData.address || 'N/A')

    const shippingText = sMethod.toLowerCase() === 'standard' 
      ? `FREE SHIPPING (Standard Delivery 5-7 Days)` 
      : `EXPRESS DELIVERY (2-3 Days, ₹${sFee})`;

    const message = `<b>🚨 NEU ATELIER ACQUISITION 🚨</b>\n\n` +
      `<b>Masterpiece:</b> ${orderData.product_name}\n` +
      `<b>Size:</b> ${orderData.size}\n` +
      `<b>Tone:</b> ${orderData.color}\n` +
      `<b>Valuation:</b> ₹${orderData.price.toLocaleString('en-IN')}\n` +
      `<b>Shipping:</b> ${shippingText}\n` +
      `<b>Client:</b> ${orderData.customer_name}\n` +
      `<b>Contact:</b> ${orderData.phone}\n` +
      `<b>Dispatch At:</b> <i>${cleanAddress}</i>\n` +
      `<b>ID:</b> <code>${orderData.order_id}</code>\n\n` +
      `<a href="${orderData.image_url}">🖼️ View Archive Masterpiece</a>\n\n` +
      `<i>Tradition, Secured.</i>`;

    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
    } catch (e) {
      console.warn("Herald failed to reach the server.", e);
    }
  }

  const sendMilestoneNotification = async (customerName: string, productList: string[], pointsEarned: number, totalPoints: number) => {
    const message = `<b>🌟 LOYALTY MILESTONE REACHED 🌟</b>\n\n` +
      `<b>Customer:</b> ${customerName}\n` +
      `<b>Products:</b> ${productList.join(', ')}\n` +
      `<b>Points Earned:</b> ${pointsEarned}\n` +
      `<b>New Total Points:</b> ${totalPoints}\n\n` +
      `<i>Milestone unlocked!</i>`;

    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
    } catch (e) {
      console.warn("Milestone notification failed to reach the server.", e);
    }
  }

  const placeOrder = async (
    shippingMethod: string = 'Standard',
    shippingFee: number = 0,
    guestProfile?: { name?: string; email?: string; phone?: string; address?: string }
  ) => {
    if (cart.length === 0) return

    // Calculate total order value
    const totalOrderValue = cart.reduce((acc, item) => {
      const price = typeof item.price === 'string' 
        ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
        : item.price
      return acc + price * item.quantity
    }, 0)

    // Get user profile if logged in, or fallback to guestProfile
    let profileName = guestProfile?.name || 'Valued Client'
    let profileEmail = guestProfile?.email || ''
    let profilePhone = guestProfile?.phone || ''
    let profileAddress = guestProfile?.address || ''
    let userSegment = 'Regular'
    let userPoints = 0

    if (userId) {
      try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
        if (profile) {
          profileName = profile.name || profileName
          profileEmail = profile.email || profileEmail
          profilePhone = profile.phone || profilePhone
          profileAddress = profile.address || profileAddress
          userSegment = profile.customer_segment || 'Regular'
          userPoints = profile.loyalty_points || 0
        }
      } catch (e) {
        console.warn('Could not fetch user profile for placeOrder:', e)
      }
    }

    const orderedItems = []
    let totalAmount = 0
    const checkoutOrderId = `ORD-${Math.floor(Math.random() * 900000 + 100000)}`
    const fullAddress = `${profileAddress || 'Address not provided'} [${shippingMethod} Delivery: ₹${shippingFee}]`

    for (const item of cart) {
      const price = typeof item.price === 'string' 
        ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
        : item.price

      totalAmount += price * item.quantity
      orderedItems.push({
        name: item.name || item.title || 'Archival Masterpiece',
        price: price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      })

      const orderEntry = {
        user_id: userId || null,
        customer_name: profileName,
        email: profileEmail || 'client@friendsof4.in',
        phone: profilePhone || 'N/A',
        address: fullAddress,
        product_name: `${item.name || item.title} (Qty: ${item.quantity})`,
        size: item.selectedSize || 'Standard',
        color: item.selectedColor || 'Default',
        price: price * item.quantity,
        order_id: checkoutOrderId,
        order_status: 'Preparing',
        payment_status: 'Paid'
      }

      const { error } = await supabase.from('orders').insert(orderEntry)
      
      if (!error) {
        // Decrement stock in database
        try {
          const { data: pData } = await supabase.from('products').select('stock').eq('id', item.id).single()
          if (pData && pData.stock !== undefined) {
            const newStock = Math.max(0, (pData.stock || 0) - item.quantity)
            await supabase.from('products').update({ stock: newStock }).eq('id', item.id)
          }
        } catch (sErr) {
          console.warn('Stock decrement skipped:', sErr)
        }

        // Send instant notification
        await sendAdminNotification({ ...orderEntry, image_url: item.image })
      } else {
        console.error('Order Insert Error:', error)
      }
    }

    // Loyalty calculation for logged-in user
    if (userId) {
      let multiplier = 1.0
      if (userSegment === 'VIP') multiplier = 1.5
      else if (userSegment === 'New') multiplier = 2.0

      const pointsEarned = Math.floor((totalOrderValue / 100) * multiplier)
      const newPoints = userPoints + pointsEarned

      try {
        await supabase.from('profiles').update({ loyalty_points: newPoints }).eq('id', userId)
        if (pointsEarned > 0) {
          await supabase.from('loyalty_history').insert({
            user_id: userId,
            order_id: checkoutOrderId,
            amount_spent: totalOrderValue,
            points_earned: pointsEarned
          })
        }

        const milestoneThreshold = userSegment === 'VIP' ? 80 : 100
        if (newPoints >= milestoneThreshold && userPoints < milestoneThreshold) {
          const productNames = cart.map(item => `${item.name || item.title} (x${item.quantity})`)
          await sendMilestoneNotification(profileName, productNames, pointsEarned, newPoints)
        }
      } catch (lErr) {
        console.warn('Loyalty points update skipped:', lErr)
      }
    }

    // Send client invoice email
    if (profileEmail) {
      try {
        await fetch('/api/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: profileEmail,
            name: profileName,
            orderId: checkoutOrderId,
            items: orderedItems,
            total: totalAmount + shippingFee,
            shippingMethod,
            shippingFee
          })
        })
      } catch (e) {
        console.error('Invoice dispatch failed.', e)
      }
    }

    // Clear cart
    if (userId) {
      try {
        await supabase.from('cart').delete().eq('user_id', userId)
      } catch (e) {}
    }
    setCart([])
    localStorage.removeItem('atelier-cart')

    showToast('Your acquisition has been confirmed by the atelier.', 'success', 'auto_awesome')
  }

  const cancelOrder = (id: string | number, selectedSize?: string, selectedColor?: string) => {
    setActiveOrders((prev) => prev.filter(
      (item) => !(item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
    ))
  }

  const clearCart = () => {
    setCart([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('atelier-cart')
    }
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = cart.reduce((acc, item) => {
    const price = typeof item.price === 'string' 
      ? parseFloat(item.price.replace('₹', '').replace(',', '')) 
      : item.price
    return acc + price * item.quantity
  }, 0)

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      isCartOpen, 
      setIsCartOpen,
      totalItems,
      subtotal,
      activeOrders,
      placeOrder,
      cancelOrder,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
