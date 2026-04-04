'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from './toast-context'

interface WishlistItem {
  product_id: string
  created_at?: string
  // Full product details we might want to store or fetch
  title?: string
  image?: string
  price?: number
}

interface WishlistContextType {
  wishlist: WishlistItem[]
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  loading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    // Rely solely on the listener to prevent lock racing conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        fetchWishlist(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUserId(null)
        setWishlist([])
        setLoading(false)
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchWishlist = async (uid: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id, products(title, image, price)')
      .eq('user_id', uid)

    if (data) {
      const items = data.map((item: any) => ({
        product_id: item.product_id,
        title: item.products?.title,
        image: item.products?.image,
        price: item.products?.price
      }))
      setWishlist(items)
    }
    setLoading(false)
  }

  const addToWishlist = async (productId: string) => {
    if (!userId) {
      alert("Please sign in to save your wishlist.")
      return
    }

    const { error } = await supabase
      .from('wishlist')
      .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' })

    if (!error) {
      fetchWishlist(userId)
      showToast('Added to your wishlist curation.', 'success', 'favorite')
    }
  }

  const removeFromWishlist = async (productId: string) => {
    if (!userId) return

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (!error) {
      setWishlist(prev => prev.filter(item => item.product_id !== productId))
      showToast('Removed from your favorites.', 'info', 'favorite_border')
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.product_id === productId)
  }

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading }}>
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
