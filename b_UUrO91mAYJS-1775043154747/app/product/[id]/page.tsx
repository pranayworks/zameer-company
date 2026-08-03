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
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [fitHeight, setFitHeight] = useState('')
  const [fitChest, setFitChest] = useState('')
  const [calculatedFit, setCalculatedFit] = useState<string | null>(null)
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
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

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

      // First, try to find an exact match on ID or URL slug variants
      let { data, error: pError } = await supabase
        .from('products')
        .select('*')
        .or(`id.eq."${trimmedId}",id.eq."${decodedId}",id.eq."${normalizedSlug}",id.eq."${slugId}",id.eq."${cleanId}",title.eq."${decodedId}"`)
        .limit(1)

      // If no exact match, fallback to a careful `ilike` search just in case
      if (!data || data.length === 0) {
        const { data: fallbackData } = await supabase
          .from('products')
          .select('*')
          .ilike('title', `%${decodedId}%`)
          .limit(1)
        
        data = fallbackData
      }

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

        // Editorial Recommendations ("Complete the Look")
        const recommendationCategories = p.category === 'Jewellery'
          ? ['Sarees', 'Women', 'Men']
          : ['Jewellery'];

        const { data: related } = await supabase
          .from('products')
          .select('*')
          .in('category', recommendationCategories)
          .neq('id', trimmedId)
          .limit(20)
        
        if (related) {
          const shuffled = [...related].sort(() => 0.5 - Math.random()).slice(0, 6)
          setRelatedProducts(shuffled)
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

    const colorIndex = selectedColor && product.colors ? product.colors.findIndex(c => c.name === selectedColor) : -1;
    const cartImage = colorIndex >= 0 && colorIndex < allImages.length ? allImages[colorIndex] : (allImages[0] || '');

    addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      image: cartImage,
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
    <div className="min-h-screen bg-[#FAF7F2]">
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
            <div 
              className="relative aspect-[3/4] bg-[#ebdcb9]/15 overflow-hidden shadow-2xl group"
              style={{ position: 'relative' }}
            >
              {/* Prefetch/Preload other product images in background to remove switching lag */}
              <div className="hidden" aria-hidden="true">
                {allImages.map((img, idx) => (
                  <img key={idx} src={img} alt="preload" />
                ))}
              </div>
               <AnimatePresence mode='wait'>
                   <motion.div key={currentImageIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 cursor-zoom-in" style={{ position: 'absolute' }} onClick={() => { const currentImg = allImages[currentImageIndex]; setZoomedImage(currentImg && !failedImages[currentImg] ? currentImg : '/placeholder.jpg'); }} drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, info) => { if (info.offset.x > 30) setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length); else if (info.offset.x < -30) setCurrentImageIndex((prev) => (prev + 1) % allImages.length); }}>
                     <Image 
                       src={allImages[currentImageIndex] && !failedImages[allImages[currentImageIndex]] ? allImages[currentImageIndex] : '/placeholder.jpg'} 
                       alt={`${product.title}`} 
                       fill 
                       className="object-cover group-hover:scale-105 transition-transform duration-1000 select-none pointer-events-none" 
                       priority 
                       onError={() => {
                         if (allImages[currentImageIndex]) {
                           setFailedImages(prev => ({ ...prev, [allImages[currentImageIndex]]: true }))
                         }
                       }}
                     />
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
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {allImages.map((img, idx) => (
                <motion.div 
                  key={idx}
                  className={`aspect-square bg-[#ebdcb9]/15 relative overflow-hidden cursor-pointer group shadow-sm border transition-all ${idx === currentImageIndex ? 'border-[#a3851a] scale-[0.98]' : 'border-[#1c1c18]/10 hover:border-[#1c1c18]'}`} 
                  style={{ position: 'relative' }}
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  <Image 
                     src={img && !failedImages[img] ? img : '/placeholder.jpg'} 
                     alt={`Thumbnail ${idx + 1}`} 
                     fill 
                     className="object-cover group-hover:scale-105 transition-transform duration-500" 
                     sizes="(max-width: 768px) 33vw, 25vw"
                     onError={() => {
                       if (img) {
                         setFailedImages(prev => ({ ...prev, [img]: true }))
                       }
                     }}
                   />
                </motion.div>
              ))}
              {product.video_url && (
                <motion.div 
                  className="aspect-square bg-black relative overflow-hidden group shadow-md cursor-pointer border border-[#1c1c18]/10" 
                  onClick={() => product.video_url && setZoomedImage(product.video_url)}
                >
                  <video 
                    src={product.video_url} 
                    className="w-full h-full object-cover opacity-60" 
                    muted 
                    loop 
                    autoPlay 
                    playsInline
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                    <span className="material-symbols-outlined text-[#a3851a] text-2xl">play_circle</span>
                    <span className="text-[8px] uppercase font-bold text-white bg-[#1c1c18]/60 px-1 py-0.5 mt-1">Reel</span>
                  </div>
                </motion.div>
              )}
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
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#747878]">Select Size</span>
                    <button 
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="font-body text-[9px] uppercase tracking-widest text-[#a3851a] font-bold border-b border-[#a3851a] pb-0.5 hover:text-[#1c1c18] hover:border-[#1c1c18] transition-colors"
                    >
                      Size Guide & Fit Finder
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-4">{product.sizes.map((size) => <button key={size} onClick={() => setSelectedSize(size)} className={`h-12 px-6 border transition-all ${selectedSize === size ? 'border-[#a3851a] bg-[#a3851a] text-white font-bold' : 'border-[#1c1c18]/20 hover:border-[#1c1c18]'} font-body text-xs uppercase tracking-widest`}>{size}</button>)}</div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div className="mb-12">
                   <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#747878] mb-4 block">{product.category === 'Jewellery' ? 'Material Tone (Required):' : 'Select Tone (Optional):'} {selectedColor || 'None'}</span>
                   <div className="flex flex-wrap gap-4">{product.colors.map((c, index) => <button key={c.name} onClick={() => { setSelectedColor(c.name); if (index < allImages.length) { setCurrentImageIndex(index); } }} className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all ${selectedColor === c.name ? 'border-[#a3851a] scale-110' : 'border-transparent'}`}><div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: c.hex }} /></button>)}</div>
                </div>
              )}

              <div className="flex items-center gap-12 mb-12">
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#747878]">Quantity</span>
                <div className="flex items-center gap-6 border-b border-[#1c1c18]/20 pb-2"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><span className="material-symbols-outlined text-sm">remove</span></button><span className="font-body text-sm min-w-[24px] text-center">{quantity.toString().padStart(2, '0')}</span><button onClick={() => setQuantity(quantity + 1)}><span className="material-symbols-outlined text-sm">add</span></button></div>
              </div>

               <div className="flex flex-col gap-4 mb-2">
                 <div className="flex gap-3 md:gap-4 h-14 md:h-16">
                    <button onClick={handleAddToCart} disabled={product.stock === 0} className={`flex-1 h-full ${product.stock === 0 ? 'bg-[#1c1c18]/20 text-[#1c1c18]/40' : 'gold-satin text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98]'} font-body uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-[9px] md:text-[10px] transition-all`}>{product.stock === 0 ? 'Archive Depleted' : 'Add To Bag'}</button>
                    <button onClick={() => product && (isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product.id))} className={`w-14 md:w-16 h-full flex items-center justify-center shrink-0 border border-[#1c1c18]/10 transition-all active:scale-95 ${product && isInWishlist(product.id) ? 'bg-red-50 text-red-500' : 'hover:bg-[#1c1c18] hover:text-white'}`}><span className="material-symbols-outlined text-xl md:text-2xl">favorite</span></button>
                    <button onClick={handleShare} className="w-14 md:w-16 h-full flex items-center justify-center shrink-0 border border-[#1c1c18]/10 hover:bg-[#a3851a] hover:text-white transition-all active:scale-95"><span className="material-symbols-outlined text-xl md:text-2xl">ios_share</span></button>
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

        {/* Some More Collection Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-[#1c1c18]/10 pt-16">
            <div className="mb-12 text-center lg:text-left">
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-[#a3851a] mb-2 block">
                Editorial Styling
              </span>
              <h2 className="font-headline text-4xl lg:text-5xl text-[#1c1c18] uppercase tracking-tight">
                Complete The Look
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {relatedProducts.map((item, index) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={typeof item.price === 'number' ? `₹${item.price.toLocaleString('en-IN')}` : String(item.price)}
                  image={item.image}
                  rating={item.rating || 5.0}
                  reviews={item.reviews || 0}
                  index={index}
                  stock={item.stock}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      
      {/* Size Guide & Fit Finder Drawer */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsSizeGuideOpen(false); setCalculatedFit(null); }}
              className="fixed inset-0 bg-black/40 backdrop-blur-lg z-[100]"
            />

            {/* Slide-out Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-[100dvh] w-full max-w-lg bg-[#fdf9f2]/90 backdrop-blur-2xl border-l border-white/20 z-[101] shadow-[0_0_50px_rgba(0,0,0,0.35)] flex flex-col font-body"
            >
              {/* Header */}
              <div className="p-8 border-b border-[#1c1c18]/5 flex justify-between items-center bg-white/30 backdrop-blur-md shrink-0">
                <div>
                  <h2 className="font-headline text-2xl tracking-tighter">Size Guide & Fit Finder</h2>
                  <p className="font-body text-[10px] text-[#a3851a] uppercase tracking-widest mt-1">Curate your perfect fit</p>
                </div>
                <button
                  onClick={() => { setIsSizeGuideOpen(false); setCalculatedFit(null); }}
                  className="material-symbols-outlined text-[#1c1b1b] hover:rotate-90 transition-transform duration-500"
                >
                  close
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                
                {/* 1. Interactive Fit Finder Calculator */}
                <div className="bg-white border border-[#1c1c18]/5 p-6 shadow-sm">
                  <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#a3851a] font-bold block mb-4">🔮 Smart Fit Finder</span>
                  <p className="text-[11px] text-[#747878] leading-relaxed mb-6">
                    Enter your measurements below and our smart calculator will recommend the ideal size.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-[#747878] font-bold block">Height (cm)</label>
                      <input 
                        type="number" 
                        value={fitHeight} 
                        onChange={(e) => setFitHeight(e.target.value)} 
                        placeholder="e.g. 175" 
                        className="w-full bg-[#fdf9f2] border border-[#1c1c18]/10 p-3 text-xs outline-none focus:border-[#a3851a] text-[#1c1c18]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-[#747878] font-bold block">Chest/Bust (inches)</label>
                      <input 
                        type="number" 
                        value={fitChest} 
                        onChange={(e) => setFitChest(e.target.value)} 
                        placeholder="e.g. 38" 
                        className="w-full bg-[#fdf9f2] border border-[#1c1c18]/10 p-3 text-xs outline-none focus:border-[#a3851a] text-[#1c1c18]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const h = parseFloat(fitHeight)
                      const c = parseFloat(fitChest)
                      if (!h || !c) {
                        alert("Please fill in both height and chest measurements.");
                        return;
                      }
                      
                      let recommended = 'M';
                      if (product.category === 'Men') {
                        if (c <= 37) recommended = '38R (S)';
                        else if (c <= 39) recommended = '40R (M)';
                        else if (c <= 41) recommended = '42R (L)';
                        else recommended = '44R (XL)';
                      } else { // Women/Sarees/General
                        if (c <= 34) recommended = 'S';
                        else if (c <= 37) recommended = 'M';
                        else if (c <= 40) recommended = 'L';
                        else recommended = 'XL';
                      }
                      setCalculatedFit(recommended);
                    }}
                    className="w-full bg-[#1c1c18] text-white py-4 font-body uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-[#a3851a] transition-all shadow-md"
                  >
                    Calculate Recommended Fit
                  </button>

                  {calculatedFit && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="mt-6 p-4 bg-[#a3851a]/5 border border-[#a3851a]/20 text-center"
                    >
                      <span className="text-[9px] uppercase tracking-widest text-[#747878] block">Your Suggested Size</span>
                      <span className="font-headline text-3xl text-[#a3851a] font-bold block mt-1">{calculatedFit}</span>
                      <button 
                        onClick={() => {
                          const cleanSize = calculatedFit.includes('(') ? calculatedFit.split('(')[1].replace(')', '') : calculatedFit;
                          setSelectedSize(cleanSize);
                          setIsSizeGuideOpen(false);
                          setCalculatedFit(null);
                          showToast(`Size ${cleanSize} selected!`, 'success', 'check_circle');
                        }}
                        className="text-[9px] uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] font-bold pb-0.5 mt-3 hover:text-[#a3851a] hover:border-[#a3851a] transition-colors"
                      >
                        Apply Size Select
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* 2. Official Measurement Chart */}
                <div className="space-y-4">
                  <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#747878] font-bold block">📊 Measurement Matrix ({product.category})</span>
                  <div className="border border-[#1c1c18]/10 bg-white overflow-hidden shadow-sm">
                    {product.category === 'Men' ? (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#1c1c18]/5 font-bold border-b border-[#1c1c18]/10 text-[9px] uppercase tracking-wider text-[#747878]">
                            <th className="p-4">Size Tag</th>
                            <th className="p-4">Chest (in)</th>
                            <th className="p-4">Waist (in)</th>
                            <th className="p-4">Sleeve (in)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1c1c18]/5 font-body text-[#1c1c18]">
                          {['38R (S)', '40R (M)', '42R (L)', '44R (XL)'].map((tag, i) => (
                            <tr key={tag} className="hover:bg-[#fdf9f2] transition-colors">
                              <td className="p-4 font-bold">{tag}</td>
                              <td className="p-4">{36 + i*2} - {37 + i*2}</td>
                              <td className="p-4">{30 + i*2} - {31 + i*2}</td>
                              <td className="p-4">{32.5 + i*0.5}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : product.category === 'Jewellery' ? (
                      <div className="p-6 text-xs text-[#747878] leading-relaxed">
                        💍 All luxury jewellery pieces in the Atelier catalog are handcrafted to standard sizes. 
                        Chokers include adjustable silk dori string backings to fit all neck types perfectly. 
                        Jhumkas and rings are standard sizing.
                      </div>
                    ) : product.category === 'Sarees' ? (
                      <div className="p-6 text-xs text-[#747878] leading-relaxed">
                        🧣 Sarees are woven as one size fits all.
                        Includes 6 meters of premium fabric drape and comes with an unstitched matching blouse piece (80cm) to allow personalized tailoring.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#1c1c18]/5 font-bold border-b border-[#1c1c18]/10 text-[9px] uppercase tracking-wider text-[#747878]">
                            <th className="p-4">Size</th>
                            <th className="p-4">Bust (in)</th>
                            <th className="p-4">Waist (in)</th>
                            <th className="p-4">Hips (in)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1c1c18]/5 font-body text-[#1c1c18]">
                          {[['XS', '32-33', '24-25', '34-35'], ['S', '34-35', '26-27', '36-37'], ['M', '36-37', '28-29', '38-39'], ['L', '38-40', '30-32', '40-42'], ['XL', '41-43', '33-35', '43-45']].map(([sz, b, w, h]) => (
                            <tr key={sz} className="hover:bg-[#fdf9f2] transition-colors">
                              <td className="p-4 font-bold">{sz}</td>
                              <td className="p-4">{b}</td>
                              <td className="p-4">{w}</td>
                              <td className="p-4">{h}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* 3. Luxury Styling Tip */}
                <div className="border-t border-[#1c1c18]/10 pt-6 text-[10px] leading-relaxed uppercase tracking-wider text-[#747878]">
                  🌿 <strong>Tip:</strong> If you are between sizes, we recommend selecting the larger size for a relaxed drape, or custom tailoring it locally to match your exact silhouette.
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />

      <AnimatePresence>
        {zoomedImage && (() => {
          const isVideo = product.video_url && zoomedImage === product.video_url;
          return (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomedImage(null)} className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] cursor-zoom-out" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 md:inset-12 z-[101] flex items-center justify-center pointer-events-none">
                <div className="relative w-full h-full pointer-events-auto flex items-center justify-center">
                  {isVideo ? (
                    <video 
                      src={zoomedImage} 
                      className="max-w-full max-h-full object-contain" 
                      controls 
                      autoPlay 
                      playsInline
                    />
                  ) : (
                    <Image src={zoomedImage} alt="Zoom" fill className="object-contain" quality={100} />
                  )}
                  <button onClick={() => setZoomedImage(null)} className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-black transition-all"><span className="material-symbols-outlined">close</span></button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  )
}
