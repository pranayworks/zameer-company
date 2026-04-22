'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { products } from '@/data/products'
import { supabase } from '@/lib/supabase'
import { use } from 'react'
import { useToast } from '@/context/toast-context'
import Head from 'next/head'
import { slugify } from '@/lib/utils'

interface Product {
  id: string
  title: string
  price: number | string
  image: string
  image2?: string
  image3?: string
  description: string
  category: string
  rating: number
  reviews: number
  stock?: number
  colors?: { name: string, hex: string }[]
  sizes?: string[]
  fabric?: string[]
  care?: string[]
  fit?: string[]
  video_url?: string
  return_policy?: string
}

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = use(params)
  const id = decodeURIComponent(rawId)
  const [product, setProduct] = useState<Product | null>(null)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { showToast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>('fabric')
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [communityReviews, setCommunityReviews] = useState<any[]>([])
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState('')
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProductAndRelated()
    trackRecentlyViewed(id)
    loadRecentlyViewed()
  }, [id])

  const trackRecentlyViewed = (productId: string) => {
    if (typeof window === 'undefined') return
    const stored = JSON.parse(localStorage.getItem('atk_recent_viewed') || '[]') as string[]
    const updated = [productId, ...stored.filter(i => i !== productId)].slice(0, 4)
    localStorage.setItem('atk_recent_viewed', JSON.stringify(updated))
  }

  const loadRecentlyViewed = async () => {
    if (typeof window === 'undefined') return
    const stored = JSON.parse(localStorage.getItem('atk_recent_viewed') || '[]') as string[]
    const otherIds = stored.filter(i => i !== id)
    if (otherIds.length === 0) return

    const { data } = await supabase.from('products').select('*').in('id', otherIds).limit(4)
    if (data) setRecentlyViewed(data)
  }

  async function fetchProductAndRelated() {
    setError(null)
    const trimmedId = id.trim()
    console.log(`Boutique: Retrieving archive for piece [${trimmedId}]...`)

    try {
      const decodedId = decodeURIComponent(trimmedId)
      const normalizedSlug = slugify(decodedId)
      const slugId = trimmedId.toLowerCase().replace(/ /g, '-')
      const cleanId = trimmedId.replace(/%20/g, ' ')

      const { data, error: pError } = await supabase
        .from('products')
        .select('*')
        .or(`id.eq."${trimmedId}",id.eq."${decodedId}",id.eq."${normalizedSlug}",id.eq."${slugId}",id.eq."${cleanId}",title.ilike."%${decodedId}%"`)
        .limit(1)

      const p = data && data.length > 0 ? data[0] : null

      if (pError || !p) {
        console.error(`Boutique Archive: Retrieval failed for Piece [${trimmedId}]. Tried ID variants and Titles.`)
        setError(`Masterpiece [${id}] not found in our current archives. Please verify the ID or title in your Admin Panel.`)
        return
      }

      if (p) {
        setProduct(p)
        const { data: revs } = await supabase.from('reviews').select('*').eq('product_id', trimmedId).order('created_at', { ascending: false }).limit(4)
        if (revs) setCommunityReviews(revs)

        if (p.category === 'Sarees') {
          const { data: relatedSaree } = await supabase.from('products').select('*').eq('category', 'Sarees').neq('id', trimmedId).limit(1)
          const { data: relatedJewellery } = await supabase.from('products').select('*').eq('category', 'Jewellery').limit(1)
          const { data: relatedWomen } = await supabase.from('products').select('*').eq('category', 'Women').limit(1)
          setRelatedProducts([...(relatedSaree || []), ...(relatedJewellery || []), ...(relatedWomen || [])])
        } else {
          const { data: related } = await supabase.from('products').select('*').eq('category', p.category).neq('id', trimmedId).limit(3)
          if (related) setRelatedProducts(related)
        }
      }
    } catch (err: any) {
      setError("Atelier connection timed out. Reconnecting...")
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fdf9f2] flex flex-col items-center justify-center p-8 text-center font-body">
        <h2 className="font-headline text-4xl mb-6">{error}</h2>
        <Link href="/" className="bg-[#1c1c18] text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold">Return to Main Gallery</Link>
      </div>
    )
  }

  if (!product) return (
    <div className="min-h-screen bg-[#fdf9f2]">
      <Header />
      <div className="pt-32 pb-24 px-8 md:px-24 max-w-[1920px] mx-auto animate-pulse"><div className="h-4 w-48 bg-[#1c1c18]/5 mb-12" /><div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24"><div className="aspect-[3/4] bg-[#1c1c18]/5" /><div className="space-y-8"><div className="h-20 w-3/4 bg-[#1c1c18]/5" /><div className="h-8 w-1/4 bg-[#1c1c18]/5" /><div className="h-32 w-full bg-[#1c1c18]/5" /><div className="grid grid-cols-4 gap-4 pt-12">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-[#1c1c18]/5" />)}</div></div></div></div>
      <Footer />
    </div>
  )

  const allImages = [...(product.image?.split(',') || []), product.image2, product.image3].filter(Boolean) as string[];
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : (product.category === 'Jewellery' ? ['One Size'] : ['XS', 'S', 'M', 'L', 'XL'])
  
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://friendsof4.in/product/${id}`
    if (navigator.share) {
      try { await navigator.share({ title: product.title, text: `Check out ${product.title} at Friends of 4 Atelier`, url: url }) } catch (err) {}
    } else {
      navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard!', 'success', 'content_copy')
    }
  }

  const handleAddToCart = () => {
    const hasSizes = product.sizes && product.sizes.length > 0;
    if (hasSizes && !selectedSize) { alert('Please select a size'); return; }
    if (product.category === 'Jewellery' && product.colors && product.colors.length > 0 && !selectedColor) { showToast('Please curate your preferred material tone', 'error', 'palette'); return; }
    
    let cartSize = selectedSize;
    if (!hasSizes) {
      if (product.category === 'Jewellery') cartSize = 'One Size';
      else if (product.category === 'Sarees') cartSize = 'Standard 6-Yard Drape';
      else cartSize = 'Standard';
    }

    addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      image: allImages[0] || '',
      quantity: quantity,
      selectedSize: cartSize as string,
      selectedColor: selectedColor || undefined
    })
    showToast(`Masterpiece added to your archive.`, 'success', 'shopping_bag')
  }

  const sections = [
    { id: 'fabric', title: 'Fabric & Composition', content: product.fabric || [] },
    { id: 'care', title: 'Care Instructions', content: product.care || [] },
    { id: 'fit', title: 'Fit & Measurements', content: product.fit || [] },
  ]

  return (
    <div className="min-h-screen bg-[#fdf9f2]">
      <Header activeCategory={product?.category} />
      <main className="pt-32 pb-24 px-8 md:px-24 max-w-[1920px] mx-auto">
        <nav className="mb-12 flex items-center gap-4 text-[10px] uppercase tracking-widest text-[#747878]">
          <Link href="/" className="hover:text-[#1c1c18] transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <Link href={`/${product.category.toLowerCase()}`} className="hover:text-[#1c1c18] transition-colors">{product.category}</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-[#1c1c18] font-semibold">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          <div className="space-y-8">
            <div className="relative aspect-[3/4] bg-white overflow-hidden shadow-2xl group">
               <AnimatePresence mode='wait'>
                   <motion.div key={currentImageIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 cursor-zoom-in" onClick={() => setZoomedImage(allImages[currentImageIndex])} drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, info) => { if (info.offset.x > 30) setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length); else if (info.offset.x < -30) setCurrentImageIndex((prev) => (prev + 1) % allImages.length); }}>
                    <Image src={allImages[currentImageIndex] || '/placeholder.jpg'} alt={`${product.title}`} fill className="object-cover group-hover:scale-105 transition-transform duration-1000 select-none pointer-events-none" priority />
                  </motion.div>
                </AnimatePresence>
                {allImages.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                    <button onClick={() => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)} className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center pointer-events-auto hover:bg-[#a3851a] hover:text-white transition-all"><span className="material-symbols-outlined">chevron_left</span></button>
                    <button onClick={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)} className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center pointer-events-auto hover:bg-[#a3851a] hover:text-white transition-all"><span className="material-symbols-outlined">chevron_right</span></button>
                  </div>
                )}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">{allImages.map((_, idx) => <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-[#a3851a] w-6' : 'bg-[#1c1c18]/20'}`} />)}</div>
            </div>
            <div className="grid grid-cols-2 gap-8">
               <motion.div className="aspect-square bg-white relative overflow-hidden cursor-zoom-in group" onClick={() => setZoomedImage(allImages[0] || '')}><Image src={allImages[0] || '/placeholder.jpg'} alt="Detail" fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" /></motion.div>
               {product.video_url && (<motion.div className="aspect-square bg-black relative overflow-hidden group shadow-xl cursor-zoom-in" onClick={() => product.video_url && setZoomedImage(product.video_url)}>{/* Video component */}<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 pointer-events-none"><span className="material-symbols-outlined text-[#a3851a] text-4xl mb-2">play_circle</span><h4 className="font-body text-[9px] uppercase font-bold text-white bg-[#1c1c18]/40 px-3 py-1">The Cinematic Reel</h4></div></motion.div>)}
            </div>
          </div>

          <div className="flex flex-col">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-[#a3851a] mb-4 block">Handcrafted Atelier</span>
              <h1 className="font-headline text-5xl md:text-7xl mb-6 tracking-tighter text-[#1c1c18]">{product.title}</h1>
              <p className="font-headline text-3xl mb-8 text-[#1c1c18]/80">₹{typeof product.price === 'number' ? product.price.toLocaleString() : product.price}</p>
              <div className="w-full h-[1px] bg-[#1c1c18]/10 mb-8" />
              <p className="font-body text-[#747878] leading-relaxed mb-12 max-w-lg">{product.description}</p>

              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-8">
                  <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#747878] mb-4 block">Select Size</span>
                  <div className="flex flex-wrap gap-4">{product.sizes.map((size) => <button key={size} onClick={() => setSelectedSize(size)} className={`h-12 px-6 border transition-all ${selectedSize === size ? 'border-[#a3851a] bg-[#a3851a] text-white font-bold' : 'border-[#1c1c18]/20 hover:border-[#1c1c18]'} font-body text-xs uppercase tracking-widest`}>{size}</button>)}</div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div className="mb-12">
                   <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#747878] mb-4 block">{product.category === 'Jewellery' ? 'Material Tone (Required):' : 'Select Tone (Optional):'} {selectedColor || 'None'}</span>
                   <div className="flex flex-wrap gap-4">{product.colors.map((c) => <button key={c.name} onClick={() => setSelectedColor(c.name)} className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all ${selectedColor === c.name ? 'border-[#a3851a] scale-110' : 'border-transparent'}`}><div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: c.hex }} /></button>)}</div>
                </div>
              )}

              <div className="flex items-center gap-12 mb-12">
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#747878]">Quantity</span>
                <div className="flex items-center gap-6 border-b border-[#1c1c18]/20 pb-2"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><span className="material-symbols-outlined text-sm">remove</span></button><span className="font-body text-sm min-w-[24px] text-center">{quantity.toString().padStart(2, '0')}</span><button onClick={() => setQuantity(quantity + 1)}><span className="material-symbols-outlined text-sm">add</span></button></div>
              </div>

               <div className="flex flex-col gap-4 mb-2">
                 <div className="flex gap-4">
                    <button onClick={handleAddToCart} disabled={product.stock === 0} className={`flex-1 ${product.stock === 0 ? 'bg-[#1c1c18]/20 text-[#1c1c18]/40' : 'gold-satin text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98]'} py-6 font-body uppercase tracking-[0.3em] font-bold text-[10px] transition-all`}>{product.stock === 0 ? 'Archive Depleted' : 'Add To Bag'}</button>
                    <button onClick={() => product && (isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product.id))} className={`p-6 border border-[#1c1c18]/10 transition-all ${product && isInWishlist(product.id) ? 'bg-red-50 text-red-500' : 'hover:bg-[#1c1c18] hover:text-white'}`}><span className="material-symbols-outlined text-2xl">favorite</span></button>
                    <button onClick={handleShare} className="p-6 border border-[#1c1c18]/10 hover:bg-[#a3851a] hover:text-white transition-all"><span className="material-symbols-outlined text-2xl">ios_share</span></button>
                 </div>
               </div>

               {/* Shipping info box */}
               <div className="bg-blue-50/80 border border-blue-100 p-5 mt-4 mb-12 flex items-start gap-4 rounded-sm shadow-sm">
                 <span className="material-symbols-outlined text-blue-500 text-xl shrink-0">local_shipping</span>
                 <div>
                   <p className="text-[10px] uppercase tracking-widest text-[#1c1c18] font-black leading-relaxed">📦 Usually shipped within 24-48 hours.</p>
                   <p className="text-[9px] uppercase tracking-widest text-[#747878] mt-1 font-bold leading-relaxed">Tracking details sent to your email within 48-72 hours of shipment.</p>
                 </div>
               </div>

              <div className="space-y-2 border-t border-[#1c1c18]/10 pt-12">{sections.map((s) => <div key={s.id} className="border-b border-[#1c1c18]/5 pb-4"><button onClick={() => setActiveSection(activeSection === s.id ? null : s.id)} className="w-full flex justify-between items-center py-4 text-left"><span className="font-body text-[10px] uppercase font-semibold">{s.title}</span><span className="material-symbols-outlined text-sm">expand_more</span></button><AnimatePresence>{activeSection === s.id && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden"><ul className="pb-6 space-y-2">{s.content.map((item, i) => <li key={i} className="text-xs text-[#747878] pl-4 relative"><span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-[#a3851a]" />{item}</li>)}</ul></motion.div>}</AnimatePresence></div>)}</div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />

      <AnimatePresence>
        {zoomedImage && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomedImage(null)} className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] cursor-zoom-out" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 md:inset-12 z-[101] flex items-center justify-center pointer-events-none">
              <div className="relative w-full h-full pointer-events-auto"><Image src={zoomedImage} alt="Zoom" fill className="object-contain" quality={100} /><button onClick={() => setZoomedImage(null)} className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-black transition-all"><span className="material-symbols-outlined">close</span></button></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
