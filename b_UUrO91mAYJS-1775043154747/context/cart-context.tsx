'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useToast } from './toast-context'

export interface CartItem {
  id: string | number
  name: string
  price: number | string
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
  placeOrder: () => void
  cancelOrder: (id: string | number, selectedSize?: string, selectedColor?: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeOrders, setActiveOrders] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const initCart = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        // Fetch cart from supabase with product details
        const { data: cartData } = await supabase
          .from('cart')
          .select('*, products(*)')
          .eq('user_id', user.id)
        
        if (cartData && cartData.length > 0) {
          const syncedCart: CartItem[] = cartData.map(c => ({
            id: c.product_id,
            name: c.products?.name || 'Unknown Product',
            price: c.products?.price || 0,
            quantity: c.quantity,
            image: c.products?.image_url || '/placeholder.svg',
            selectedSize: c.size
          }))
          setCart(syncedCart)
        }

        // Fetch orders
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
        
        if (orderData) {
          // Map backend orders to CartItem format for the UI
          const mappedOrders = orderData.map(o => ({
            id: o.id,
            name: o.product_name,
            price: o.price,
            quantity: 1, // Order row per item usually
            image: '/placeholder.svg', // Fallback
            order_id: o.order_id
          }))
          // We'll update AccountPage to fetch this directly, but keep local for immediate UX
        }
      }
    }
    initCart()
  }, [])

  const addToCart = async (newItem: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === newItem.id && item.selectedSize === newItem.selectedSize && item.selectedColor === newItem.selectedColor
      )
      if (existingItem) {
        return prevCart.map((item) =>
          (item.id === newItem.id && item.selectedSize === newItem.selectedSize && item.selectedColor === newItem.selectedColor)
            ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
            : item
        )
      }
      return [...prevCart, { ...newItem, quantity: newItem.quantity || 1 }]
    })

    // Sync to Supabase if logged in
    if (userId) {
      // Logic for upserting into 'cart' table
      // Note: product_id in table is UUID, if your local IDs aren't UUIDs, this might need an adjustment in DB or code
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

    showToast(`${newItem.name} added to your collection.`, 'success', 'shopping_bag')
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
    const message = `<b>🚨 NEU ATELIER ACQUISITION 🚨</b>\n\n` +
      `<b>Masterpiece:</b> ${orderData.product_name}\n` +
      `<b>Valuation:</b> ₹${orderData.price.toLocaleString('en-IN')}\n` +
      `<b>Client:</b> ${orderData.customer_name}\n` +
      `<b>Dispatch At:</b> <i>${orderData.address}</i>\n` +
      `<b>ID:</b> <code>${orderData.order_id}</code>\n\n` +
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

  const placeOrder = async () => {
    if (userId && cart.length > 0) {
      // Get user profile for order details including address
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();

      for (const item of cart) {
        const price = typeof item.price === 'string' 
          ? parseFloat(item.price.replace('₹', '').replace(',', '')) 
          : item.price;

        const orderEntry = {
          user_id: userId,
          customer_name: profile?.name || 'Valued Customer',
          email: profile?.email || 'No Email provided',
          phone: profile?.phone || 'No Phone provided',
          address: profile?.address || 'Address not set in profile',
          product_name: item.name,
          size: item.selectedSize || 'Standard',
          color: item.selectedColor || 'Default',
          price: price,
          order_id: `ORD-${Math.floor(Math.random() * 1000000)}`,
          order_status: 'Preparing',
          payment_status: 'Paid'
        };

        const { error } = await supabase.from('orders').insert(orderEntry);
        
        if (!error) {
           // 🚨 CRITICAL: Decrement Stock in the Atelier Vault
           // We use an RPC call or a simple update for now, but update is faster for this implementation
           const { data: pData } = await supabase.from('products').select('stock').eq('id', item.id).single();
           if (pData) {
             const newStock = Math.max(0, (pData.stock || 0) - item.quantity);
             await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
           }

           // Send Instant Mobile Alert to Admin
           await sendAdminNotification(orderEntry);
        }
      }

      // Clear cart in supabase
      await supabase.from('cart').delete().eq('user_id', userId);
    }
    
    showToast('Your order has been placed with the atelier.', 'success', 'auto_awesome')
    setActiveOrders((prev) => [...prev, ...cart])
    setCart([])
  }

  const cancelOrder = (id: string | number, selectedSize?: string, selectedColor?: string) => {
    setActiveOrders((prev) => prev.filter(
      (item) => !(item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
    ))
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
      cancelOrder
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
