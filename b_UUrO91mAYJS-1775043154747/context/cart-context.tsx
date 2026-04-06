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
  placeOrder: (shippingMethod?: string, shippingFee?: number) => void
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
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
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
          console.error("Cloud cart sync failed, using local cart", e)
        }
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
          console.error('Cloud cart save failed', e)
        }
      }
      syncToCloud()
    }
  }, [cart, userId])

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

  const placeOrder = async (shippingMethod: string = 'Normal', shippingFee: number = 100) => {
    if (userId && cart.length > 0) {
      // Get user profile for order details including address
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();

      const orderedItems = [];
      let totalAmount = 0;
      const checkoutOrderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
      const fullAddress = `${profile?.address || 'Address not set'} [${shippingMethod} Delivery: ₹${shippingFee}]`;

      for (const item of cart) {
        const price = typeof item.price === 'string' 
          ? parseFloat(item.price.replace('₹', '').replace(',', '')) 
          : item.price;

        totalAmount += price * item.quantity;
        orderedItems.push({
          name: item.name,
          price: price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        });

        const orderEntry = {
          user_id: userId,
          customer_name: profile?.name || 'Valued Customer',
          email: profile?.email || 'No Email provided',
          phone: profile?.phone || 'No Phone provided',
          address: fullAddress,
          product_name: item.name,
          size: item.selectedSize || 'Standard',
          color: item.selectedColor || 'Default',
          price: price,
          order_id: checkoutOrderId,
          order_status: 'Preparing',
          payment_status: 'Paid'
        };

        const { error } = await supabase.from('orders').insert(orderEntry);
        
        if (!error) {
           // 🚨 CRITICAL: Decrement Stock in the Atelier Vault
           const { data: pData } = await supabase.from('products').select('stock').eq('id', item.id).single();
           if (pData) {
             const newStock = Math.max(0, (pData.stock || 0) - item.quantity);
             await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
           }

           // Send Instant Mobile Alert to Admin
           await sendAdminNotification({ ...orderEntry, image_url: item.image });
        } else {
           console.error("Order Insert Error:", error)
        }
      }

      // --- SEND CLIENT INVOICE EMAIL ---
      if (profile?.email) {
        try {
          await fetch('/api/send-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name || 'Valued Customer',
              orderId: checkoutOrderId,
              items: orderedItems,
              total: totalAmount + shippingFee,
              shippingMethod,
              shippingFee
            })
          });
        } catch (e) {
          console.error("Invoice dispatch failed.", e);
        }
      }

      // Clear cart
      await supabase.from('cart').delete().eq('user_id', userId);
      setCart([])
      localStorage.removeItem('atelier-cart')
    } else {
      setCart([])
      localStorage.removeItem('atelier-cart')
    }
    
    showToast('Your order has been placed with the atelier.', 'success', 'auto_awesome')
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
