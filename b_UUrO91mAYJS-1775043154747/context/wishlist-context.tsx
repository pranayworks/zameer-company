'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from './toast-context'
import { products } from '@/data/products'

interface WishlistItem {
  product_id: string
  created_at?: string
  title?: string
  image?: string
  price?: number
}

interface WishlistContextType {
  wishlist: WishlistItem[]
  wishlistItems: WishlistItem[]
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  toggleWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  loading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const GUEST_WISHLIST_KEY = 'friends_of_4_wishlist'

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const { showToast } = useToast()

  // Load guest wishlist from localStorage on mount safely
  useEffect(() => {
    try {
      const stored = localStorage.getItem(GUEST_WISHLIST_KEY)
      if (stored) {
        setWishlist(JSON.parse(stored))
      }
    } catch {
      // Ignore JSON parse errors
    }

    let subscription: any = null
    try {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setUserId(session.user.id)
          fetchWishlist(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUserId(null)
          setLoading(false)
        } else {
          setLoading(false)
        }
      })
      subscription = data?.subscription
    } catch (e) {
      console.warn('Supabase auth listener disabled:', e)
      setLoading(false)
    }

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe()
    }
  }, [])

  // Sync guest wishlist to localStorage whenever it changes (if unauthenticated)
  const updateGuestWishlist = (newItems: WishlistItem[]) => {
    setWishlist(newItems)
    if (!userId) {
      try {
        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(newItems))
      } catch {
        // Ignore storage errors
      }
    }
  }

  const fetchWishlist = async (uid: string) => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('wishlist')
        .select('product_id, products(title, image, price)')
        .eq('user_id', uid)

      if (data && data.length > 0) {
        const items = data.map((item: any) => ({
          product_id: item.product_id,
          title: item.products?.title,
          image: item.products?.image,
          price: item.products?.price
        }))
        setWishlist(items)
      }
    } catch (e) {
      console.warn('Wishlist fetch fallback to local:', e)
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (productId: string) => {
    const targetProd = products.find(p => p.id === productId)
    const newItem: WishlistItem = {
      product_id: productId,
      title: targetProd?.title,
      image: targetProd?.image,
      price: targetProd?.rawPrice,
      created_at: new Date().toISOString()
    }

    if (!userId) {
      const updated = [...wishlist.filter(i => i.product_id !== productId), newItem]
      updateGuestWishlist(updated)
      showToast('Saved to your wishlist curation.', 'success', 'favorite')
      return
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' })

      if (!error) {
        fetchWishlist(userId)
      } else {
        const updated = [...wishlist.filter(i => i.product_id !== productId), newItem]
        updateGuestWishlist(updated)
      }
    } catch {
      const updated = [...wishlist.filter(i => i.product_id !== productId), newItem]
      updateGuestWishlist(updated)
    }
    showToast('Saved to your wishlist curation.', 'success', 'favorite')
  }

  const removeFromWishlist = async (productId: string) => {
    const updated = wishlist.filter(item => item.product_id !== productId)
    updateGuestWishlist(updated)
    showToast('Removed from your favorites.', 'info', 'favorite_border')

    if (userId) {
      try {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId)
      } catch (e) {
        console.warn('Supabase delete wishlist item skipped:', e)
      }
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.product_id === productId)
  }

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      wishlistItems: wishlist, 
      addToWishlist, 
      removeFromWishlist, 
      toggleWishlist,
      isInWishlist, 
      loading 
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
