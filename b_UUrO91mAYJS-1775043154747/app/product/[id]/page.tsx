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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProductAndRelated()
  }, [id])

  async function fetchProductAndRelated() {
    setError(null)
    const trimmedId = id.trim()
    console.log(`Boutique: Retrieving archive for piece [${trimmedId}]...`)

    try {
      // 1. Fetch current product - SUPER-FINDER SEARCH
      // We try exact matches, slugified variations, and title keywords
      const decodedId = decodeURIComponent(trimmedId)
      const normalizedSlug = slugify(decodedId)
      const slugId = trimmedId.toLowerCase().replace(/ /g, '-')
      const cleanId = trimmedId.replace(/%20/g, ' ')

      // Try searching by ID variants and title ilike
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
        
        // 2. Fetch community stories
        const { data: revs } = await supabase.from('reviews').select('*').eq('product_id', trimmedId).order('created_at', { ascending: false }).limit(4)
        if (revs) setCommunityReviews(revs)

        // 3. Fetch related (same category)
        if (p.category === 'Sarees') {
          const { data: relatedSaree } = await supabase.from('products').select('*').eq('category', 'Sarees').neq('id', trimmedId).limit(1)
          const { data: relatedJewellery } = await supabase.from('products').select('*').eq('category', 'Jewellery').limit(1)
          const { data: relatedWomen } = await supabase.from('products').select('*').eq('category', 'Women').limit(1)
          
          const mix = [...(relatedSaree || []), ...(relatedJewellery || []), ...(relatedWomen || [])]
          setRelatedProducts(mix)
        } else {
          const { data: related } = await supabase
            .from('products')
            .select('*')
            .eq('category', p.category)
            .neq('id', trimmedId)
            .limit(3)
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
    <div className="min-h-screen bg-[#fdf9f2] flex flex-col items-center justify-center font-headline text-2xl tracking-widest opacity-40 animate-pulse">
      Searching the Archives...
    </div>
  )

  const allImages = [...(product.image?.split(',') || []), product.image2, product.image3].filter(Boolean) as string[];


  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : (product.category === 'Jewellery' ? ['One Size'] : ['XS', 'S', 'M', 'L', 'XL'])
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://friendsof4.in/product/${id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} at Friends of 4 Atelier`,
          url: url
        })
      } catch (err) {
        console.error('Share failed', err)
      }
    } else {
      navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard!', 'success', 'content_copy')
    }
  }

  const handleAddToCart = () => {
    // Standardize selections based on category
    const isOneSizeCategory = product.category === 'Jewellery' || product.category === 'Sarees';
    
    if (!isOneSizeCategory) {
      if (!selectedSize) {
        alert('Please select a size')
        return
      }
    }
    
    // Color is optional - no validation needed

    if (!product) return;

    addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      image: allImages[0] || '',
      quantity: quantity,
      selectedSize: (isOneSizeCategory 
        ? (product.category === 'Jewellery' ? 'One Size' : 'Standard 6-Yard Drape') 
        : selectedSize) as string,
      selectedColor: selectedColor || undefined
    })

    showToast(`Masterpiece added to your archive.`, 'success', 'shopping_bag')
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": allImages,
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Style Of Traditionals | Friends of 4"
    },
    "offers": {
      "@context": "https://schema.org",
      "@type": "Offer",
      "url": `https://friendsof4.in/product/${product.id}`,
      "priceCurrency": "INR",
      "price": typeof product.price === 'number' ? product.price : parseFloat(product.price?.toString().replace(/[^0-9.]/g, '') || '0'),
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock && product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  }

  const sections = [
    { id: 'fabric', title: 'Fabric & Composition', content: product.fabric || [] },
    { id: 'care', title: 'Care Instructions', content: product.care || [] },
    { id: 'fit', title: 'Fit & Measurements', content: product.fit || [] },
  ]

  return (
    <div className="min-h-screen bg-[#fdf9f2]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      
      <main className="pt-32 pb-24 px-8 md:px-24 max-w-[1920px] mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-12 flex items-center gap-4 text-[10px] uppercase tracking-widest text-[#747878]">
          <Link href="/" className="hover:text-[#1c1c18] transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <Link href={`/${product.category.toLowerCase()}`} className="hover:text-[#1c1c18] transition-colors">{product.category}</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-[#1c1c18] font-semibold">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          {/* Left Column: Images */}
          <div className="space-y-8">
            {/* Main Product Image Carousel */}
            <div className="relative aspect-[3/4] bg-white overflow-hidden shadow-2xl group">
               <AnimatePresence mode='wait'>
                   <motion.div 
                    key={currentImageIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0 cursor-zoom-in"
                    onClick={() => setZoomedImage(allImages[currentImageIndex])}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    dragListener={true}
                    style={{ touchAction: 'pan-y' }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 30) {
                        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
                      } else if (info.offset.x < -30) {
                        setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
                      }
                    }}
                  >
                    <Image
                      src={allImages[currentImageIndex] || '/placeholder.jpg'}
                      alt={`${product.title} - View ${currentImageIndex + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-1000 select-none pointer-events-none"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Carousel Controls */}
                {allImages.length > 1 && (
                  <>
                    <div className="absolute inset-y-0 left-4 flex items-center z-10 lg:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
                        }}
                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-[#a3851a] hover:text-white transition-all shadow-lg text-[#1c1c18]"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                    </div>
                    <div className="absolute inset-y-0 right-4 flex items-center z-10 lg:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
                        }}
                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-[#a3851a] hover:text-white transition-all shadow-lg text-[#1c1c18]"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                   
                   {/* Indicators */}
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                     {allImages.map((_, idx) => (
                       <button 
                         key={idx}
                         onClick={() => setCurrentImageIndex(idx)}
                         className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-[#a3851a] w-6' : 'bg-[#1c1c18]/20'}`}
                       />
                     ))}
                   </div>
                 </>
               )}

               <div className="absolute top-6 right-6 z-10">
                  <span className="bg-[#1c1c18] text-white text-[8px] uppercase tracking-[0.3em] px-3 py-1 font-bold">New Perspective</span>
               </div>
            </div>
            
            {/* Grid for secondary images (thumbnails/details) */}
            <div className="grid grid-cols-2 gap-8">
               <motion.div 
                 className="aspect-square bg-white relative overflow-hidden cursor-zoom-in group"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.2 }}
                 onClick={() => setZoomedImage(allImages[0] || '')}
               >
                 <Image src={allImages[0] || '/placeholder.jpg'} alt="Detail 1" fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-white text-3xl drop-shadow-lg">zoom_in</span>
                 </div>
               </motion.div>
               {product.video_url ? (
                 <motion.div 
                   className="aspect-square bg-black relative overflow-hidden group shadow-xl cursor-zoom-in"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.3 }}
                   onClick={() => product.video_url && setZoomedImage(product.video_url)}
                 >
                   {(() => {
                     const getYoutubeId = (url: string) => {
                        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=)|(\&v=)|(\/shorts\/))([^#\&\?]*).*/;
                        const match = url.match(regExp);
                        return (match && match[9].length === 11) ? match[9] : null;
                     };

                     const videoId = getYoutubeId(product.video_url);

                     if (videoId) {
                       return (
                         <iframe 
                           src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`}
                           className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 border-0"
                           allow="autoplay; encrypted-media; picture-in-picture"
                           allowFullScreen
                         />
                       )
                     }
                     return (
                       <video 
                         src={product.video_url}
                         autoPlay 
                         muted 
                         loop 
                         playsInline
                         className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                       />
                     )
                   })()}
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 group-hover:bg-transparent transition-all pointer-events-none">
                      <span className="material-symbols-outlined text-[#a3851a] text-4xl mb-2 drop-shadow-lg">play_circle</span>
                      <h4 className="font-body text-[9px] uppercase tracking-[0.2em] text-white font-bold bg-[#1c1c18]/40 px-3 py-1 backdrop-blur-sm">The Cinematic Reel</h4>
                   </div>
                 </motion.div>
               ) : (
                 <motion.div 
                   className="aspect-square bg-[#3d0a0a] relative flex items-center justify-center p-8 text-center"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.3 }}
                 >
                   <div>
                      <span className="font-headline text-8xl text-[#a3851a] opacity-60">2</span>
                      <h4 className="font-body text-[10px] uppercase tracking-[0.2em] text-[#a3851a] mt-2">Bespoke Fitting Available</h4>
                   </div>
                 </motion.div>
               )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-[#a3851a] mb-4 block">Handcrafted Atelier</span>
              <h1 className="font-headline text-5xl md:text-7xl mb-6 tracking-tighter leading-tight text-[#1c1c18]">{product.title}</h1>
              <p className="font-headline text-3xl mb-8 text-[#1c1c18]/80">
                {typeof product.price === 'number' 
                  ? `₹${product.price.toLocaleString('en-IN')}` 
                  : product.price?.toString().includes('₹') 
                    ? product.price 
                    : `₹${product.price?.toString().replace('$', '')}`
                }
              </p>
              
              <div className="w-full h-[1px] bg-[#1c1c18]/10 mb-8" />
              
              <p className="font-body text-[#747878] leading-relaxed mb-12 max-w-lg">
                {product.description}
              </p>

              {/* Size Selector - Hidden for Jewellery and Sarees */}
              {product.category !== 'Jewellery' && product.category !== 'Sarees' && (
                <div className="mb-8">
                  <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#747878] mb-4 block">Select Size</span>
                  <div className="flex flex-wrap gap-4">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 px-6 border transition-all ${
                          selectedSize === size
                            ? 'border-[#a3851a] bg-[#a3851a] text-white font-bold'
                            : 'border-[#1c1c18]/20 text-[#1c1c18] hover:border-[#1c1c18]'
                        } font-body text-xs tracking-widest uppercase flex items-center justify-center`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector - Optional */}
              {product.colors && product.colors.length > 0 && product.category !== 'Jewellery' && (
                <div className="mb-12">
                  <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#747878] mb-4 block">Select Tone (Optional): {selectedColor || 'None'}</span>
                  <div className="flex flex-wrap gap-4">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        title={color.name}
                        className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all ${
                          selectedColor === color.name
                            ? 'border-[#a3851a] scale-110'
                            : 'border-transparent hover:border-[#1c1c18]/20'
                        }`}
                      >
                        <div 
                          className="w-full h-full rounded-full shadow-inner" 
                          style={{ backgroundColor: color.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-12 mb-12">
                <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#747878]">Quantity</span>
                <div className="flex items-center gap-6 border-b border-[#1c1c18]/20 pb-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-[#a3851a]">
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="font-body text-sm min-w-[24px] text-center">{quantity.toString().padStart(2, '0')}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="hover:text-[#a3851a]">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>

               {/* Stock Status Indicator */}
               {product.stock !== undefined && (
                 <div className="mb-8">
                   {product.stock > 0 ? (
                     <p className={`font-body text-[10px] uppercase tracking-widest ${product.stock < 5 ? 'text-amber-500 animate-pulse' : 'text-green-600'}`}>
                       {product.stock < 5 ? `⚠️ Only ${product.stock} Pieces Left in Archive` : '✓ Piece Available in Atelier'}
                     </p>
                   ) : (
                     <p className="font-body text-[10px] uppercase tracking-widest text-red-500">
                       ✕ Piece Out of Archive (Restocking Soon)
                     </p>
                   )}
                 </div>
               )}

               {/* Return Policy Note */}
               <div className="mb-12 p-5 bg-[#1c1c18]/5 border-l-2 border-[#a3851a] group hover:bg-[#1c1c18]/10 transition-colors">
                 <div className="flex items-center gap-4">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center ${product.return_policy?.toLowerCase().includes('non-returnable') ? 'bg-red-500/10 text-red-500' : 'bg-[#a3851a]/10 text-[#a3851a]'}`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {product.return_policy?.toLowerCase().includes('non-returnable') ? 'rule' : 'assignment_return'}
                      </span>
                   </div>
                   <div>
                     <h4 className="font-headline text-lg group-hover:text-[#a3851a] transition-colors">Atelier Return Policy</h4>
                     <p className="font-body text-xs text-[#747878]">
                       {product.return_policy || (product.category === 'Jewellery' ? 'Non-returnable' : 'Can be returned within 5 days')}
                     </p>
                   </div>
                 </div>
               </div>

               <div className="flex flex-col gap-4 mb-12">
                 <div className="flex gap-4">
                   <button 
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className={`flex-1 ${product.stock === 0 ? 'bg-[#1c1c18]/20 cursor-not-allowed text-[#1c1c18]/40' : 'gold-satin text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98]'} py-6 font-body uppercase tracking-[0.3em] text-[10px] font-bold transition-all`}
                   >
                     {product.stock === 0 ? 'Archive Depleted' : 'Add To Bag'}
                   </button>
                   <button 
                     onClick={() => product && (isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product.id))}
                     className={`p-6 border border-[#1c1c18]/10 transition-all flex items-center justify-center ${product && isInWishlist(product.id) ? 'bg-red-50 text-red-500 border-red-200' : 'hover:bg-[#1c1c18] hover:text-white'}`}
                   >
                     <span className={`material-symbols-outlined text-2xl ${product && isInWishlist(product.id) ? 'fill-1' : ''}`} style={{ fontVariationSettings: product && isInWishlist(product.id) ? "'FILL' 1" : "'FILL' 0" }}>
                       favorite
                     </span>
                   </button>
                   <button 
                     onClick={handleShare}
                     className="p-6 border border-[#1c1c18]/10 transition-all flex items-center justify-center hover:bg-[#a3851a] hover:text-white hover:border-[#a3851a] group relative"
                     title="Share Masterpiece"
                   >
                     <span className="material-symbols-outlined text-2xl">
                       ios_share
                     </span>
                   </button>
                 </div>
                 
                 {product.stock === 0 && (
                   <button 
                     onClick={() => setIsNotifyModalOpen(true)}
                     className="w-full bg-[#1c1c18] text-white py-6 font-body uppercase tracking-[0.3em] text-[10px] font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                   >
                     <span className="material-symbols-outlined text-sm">notifications</span>
                     Notify Me When In Stock
                   </button>
                 )}
               </div>

              <button className="w-full border border-[#1c1c18]/10 py-6 font-body uppercase tracking-[0.3em] text-[10px] text-[#1c1c18] hover:bg-[#1c1c18] hover:text-white transition-all mb-16">
                Find In Boutique
              </button>

              {/* Accordions */}
              <div className="space-y-2 border-t border-[#1c1c18]/10 pt-12">
                {sections.map((section) => (
                  <div key={section.id} className="border-b border-[#1c1c18]/5 pb-4">
                    <button 
                      onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                      className="w-full flex justify-between items-center py-4 text-left"
                    >
                      <span className="font-body text-[10px] uppercase tracking-[0.2em] font-semibold text-[#1c1c18]">{section.title}</span>
                      <span className={`material-symbols-outlined text-sm transition-transform duration-500 ${activeSection === section.id ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                    <AnimatePresence>
                      {activeSection === section.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <ul className="pt-2 pb-6 space-y-2">
                             {section.content.map((item, i) => (
                               <li key={i} className="font-body text-xs text-[#747878] pl-4 relative">
                                 <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-[#a3851a]" />
                                 {item}
                               </li>
                             ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* From the Loom - Heritage Section */}
        {product.category === 'Sarees' && (
          <section className="mt-48 pb-12">
             <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
                <div className="w-full lg:w-1/2 aspect-square lg:aspect-[4/5] relative bg-[#1c1c18]/5 overflow-hidden group shadow-[20px_20px_60px_rgba(0,0,0,0.05)]">
                   <div className="absolute inset-0 flex items-center justify-center opacity-10 font-headline text-8xl rotate-[-45deg] scale-150 pointer-events-none">
                      TRADITION
                   </div>
                   <Image 
                     src={
                       product.title.toLowerCase().includes('benarus') || product.title.toLowerCase().includes('banarasi') ? '/heritage/benarus.png' :
                       product.title.toLowerCase().includes('kalamkari') ? '/heritage/kalamkari.png' :
                       product.title.toLowerCase().includes('kanchi') ? '/heritage/kanchi.png' :
                       '/heritage/cotton.png'
                     }
                     alt="Artisan at the Loom"
                     fill
                     className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-[2s]"
                   />
                   <div className="absolute bottom-12 left-12 right-12 bg-white/10 backdrop-blur-md p-8 border border-white/20">
                      <p className="text-white text-[9px] uppercase tracking-[0.3em] font-bold mb-2">Heritage Proof</p>
                      <h4 className="text-white font-headline text-xl">Authenticated Hand-Looped Archive</h4>
                   </div>
                </div>

                <div className="w-full lg:w-1/2">
                   <span className="font-body text-[10px] uppercase tracking-[0.3em] text-[#a3851a] mb-6 block">The Artisan Narrative</span>
                   <h3 className="font-headline text-5xl md:text-7xl mb-12 tracking-tighter leading-none">From the Loom</h3>
                   
                   <div className="space-y-12 pr-0 lg:pr-16">
                      <div className="relative pl-12 border-l border-[#1c1c18]/10">
                         <span className="absolute left-0 top-0 font-headline text-4xl text-[#a3851a]">01.</span>
                         <h5 className="font-body text-[10px] uppercase tracking-widest font-bold text-[#1c1c18] mb-4">Origins of the Weave</h5>
                         <p className="font-body text-sm text-[#747878] leading-relaxed italic">
                           {
                             product.title.toLowerCase().includes('benarus') || product.title.toLowerCase().includes('banarasi') ? 
                             "The Benarus tradition is the soul of royalty. Every shimmering thread of gold and silver zari is meticulously hand-intertwined with pure mulberry silk in the heart of Varanasi, taking weeks for a single masterpiece." :
                             product.title.toLowerCase().includes('kalamkari') ? 
                             "Kalamkari is the ancient art of 'The Pen'. Using natural dyes sourced from the earth, our artisans in Srikalahasti hand-pick every motif, ensuring no two sarees are ever truly identical." :
                             product.title.toLowerCase().includes('kanchi') ? 
                             "Kanchipuram is where temples meet textiles. Known as 'The King of Silks', these pieces feature the signature contrast border, hand-woven with a triple-thread silk that feels like liquid gold." :
                             "Our collection of Hand-loomed Cottons celebrates the breathable simplicity of Indian soil. Each piece is crafted by local artisans using techniques that have remained unchanged for generations."
                           }
                         </p>
                      </div>

                      <div className="relative pl-12 border-l border-[#1c1c18]/10">
                         <span className="absolute left-0 top-0 font-headline text-4xl text-[#a3851a]">02.</span>
                         <h5 className="font-body text-[10px] uppercase tracking-widest font-bold text-[#1c1c18] mb-4">A Note from the Atelier</h5>
                         <p className="font-body text-sm text-[#747878] leading-relaxed">
                            This specific piece represents over 120 hours of manual labor. Our weavers follow a meticulous chart of traditions, ensuring every drape tells a story of heritage that can be passed down through your family for decades.
                         </p>
                      </div>

                      <div className="pt-8">
                         <button className="bg-[#1c1c18] text-white py-6 px-16 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-[#a3851a] transition-all shadow-2xl group">
                            Explore the Archive
                            <span className="material-symbols-outlined ml-4 text-[14px] group-hover:translate-x-2 transition-transform">arrow_forward</span>
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </section>
        )}

        {/* Complete the Look */}
        <section className="mt-32">
          <div className="flex justify-between items-end mb-12">
             <div>
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-[#a3851a] mb-2 block">Editorial Suggestion</span>
                <h2 className="font-headline text-4xl">Complete the Look</h2>
             </div>
             <div className="flex gap-4">
               <button className="w-12 h-12 border border-[#1c1c18]/10 flex items-center justify-center hover:bg-[#1c1c18] hover:text-white transition-all">
                 <span className="material-symbols-outlined">west</span>
               </button>
               <button className="w-12 h-12 border border-[#1c1c18]/10 flex items-center justify-center hover:bg-[#1c1c18] hover:text-white transition-all">
                 <span className="material-symbols-outlined">east</span>
               </button>
             </div>
          </div>
          
          <div className="flex lg:grid overflow-x-auto lg:overflow-visible gap-8 lg:gap-12 pb-12 lg:pb-0 snap-x scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid-cols-3">
             {relatedProducts.map((item, i) => (
                <div key={item.id} className="min-w-[280px] lg:min-w-0 snap-center">
                  <ProductCard 
                    id={item.id}
                    title={item.title}
                    price={typeof item.price === 'number' ? `₹${item.price.toLocaleString()}` : item.price}
                    image={item.image}
                    rating={item.rating || 5}
                    reviews={item.reviews || 0}
                    stock={item.stock}
                    index={i} 
                  />
                </div>
             ))}
          </div>
        </section>

        {/* Community of Friends - Editorial Reviews Section */}
        <section className="mt-48 pb-24 border-t border-[#1c1c18]/10 pt-32">
          <div className="text-center mb-24">
             <span className="font-body text-[10px] uppercase tracking-[0.3em] text-[#a3851a] mb-4 block">The Global Collective</span>
             <h2 className="font-headline text-5xl md:text-7xl tracking-tighter">Community of Friends</h2>
             <p className="font-body text-xs text-[#747878] mt-6 max-w-lg mx-auto leading-relaxed">
                See how our patrons from across the world are weaving these traditions into their own modern stories.
             </p>
          </div>

          <div className="flex lg:grid overflow-x-auto lg:overflow-visible gap-6 lg:gap-8 pb-12 lg:pb-0 snap-x scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid-cols-4">
            {/* Real Community Stories first */}
            {communityReviews.map((rev, i) => (
               <motion.div 
                 key={rev.id}
                 whileHover={{ y: -10 }}
                 transition={{ delay: i * 0.1 }}
                 className="min-w-[240px] md:min-w-[300px] lg:min-w-0 aspect-[3/4] bg-[#1c1c18]/5 relative overflow-hidden group shadow-lg snap-center"
               >
                  <Image src={rev.image_url || '/placeholder.svg'} alt={rev.user_name || 'Community Member'} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                     <p className="text-white font-headline text-xl mb-1">{rev.user_name || 'Friends of 4 Patrons'}</p>
                     <div className="flex gap-1 mb-2">
                        {[...Array(rev.rating || 5)].map((_,s) => <span key={s} className="material-symbols-outlined text-[10px] text-[#e2bb53]">star</span>)}
                     </div>
                     <p className="text-white/60 text-[9px] uppercase tracking-widest line-clamp-1 italic">"{rev.comment}"</p>
                  </div>
               </motion.div>
            ))}

            {/* If no user reviews yet, show curated editorial placeholders */}
            {communityReviews.length < 1 && (
             <motion.div 
               whileHover={{ y: -10 }}
               className="aspect-[3/4] bg-[#1c1c18]/5 relative overflow-hidden group shadow-lg"
             >
                <Image src="/miraya_lehenga.png" alt="Community Member" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                   <p className="text-white font-headline text-xl mb-1">Amara S.</p>
                   <div className="flex gap-1 mb-2">
                      {[1,2,3,4,5].map(s => <span key={s} className="material-symbols-outlined text-[10px] text-[#e2bb53]">star</span>)}
                   </div>
                   <p className="text-white/60 text-[9px] uppercase tracking-widest line-clamp-1 italic">"Modern tradition perfectly draped."</p>
                </div>
             </motion.div>
            )}

            {communityReviews.length < 2 && (
             <motion.div 
               whileHover={{ y: -10 }}
               transition={{ delay: 0.1 }}
               className="aspect-[3/4] bg-[#1c1c18]/5 relative overflow-hidden group shadow-lg"
             >
                <Image src="/zoya-silk.png" alt="Community Member" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                   <p className="text-white font-headline text-xl mb-1">Priya K.</p>
                   <div className="flex gap-1 mb-2">
                      {[1,2,3,4,5].map(s => <span key={s} className="material-symbols-outlined text-[10px] text-[#e2bb53]">star</span>)}
                   </div>
                   <p className="text-white/60 text-[9px] uppercase tracking-widest line-clamp-1 italic">"The gold zari literally shimmers in the sun!"</p>
                </div>
             </motion.div>
            )}

            {communityReviews.length < 3 && (
             <motion.div 
               whileHover={{ y: -10 }}
               transition={{ delay: 0.2 }}
               className="aspect-[3/4] bg-[#1c1c18]/5 relative overflow-hidden group shadow-lg"
             >
                <Image src="/royal_kalamkari.png" alt="Community Member" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                   <p className="text-white font-headline text-xl mb-1">Meera V.</p>
                   <div className="flex gap-1 mb-2">
                      {[1,2,3,4,5].map(s => <span key={s} className="material-symbols-outlined text-[10px] text-[#e2bb53]">star</span>)}
                   </div>
                   <p className="text-white/60 text-[9px] uppercase tracking-widest line-clamp-1 italic">"Acquired this for a gala, truly a masterpiece."</p>
                </div>
             </motion.div>
            )}

             <div className="bg-[#1c1c18] flex flex-col items-center justify-center p-12 text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                </div>
                <span className="material-symbols-outlined text-[#e2bb53] text-5xl mb-6">camera_front</span>
                <p className="text-white font-headline text-2xl mb-4">Be our next Friend.</p>
                <p className="text-white/40 text-[9px] uppercase tracking-widest mb-8 leading-relaxed">Acquired a piece? Share your signature style and join the collective.</p>
                <Link href="/account?tab=tracking" className="bg-[#e2bb53] text-[#1c1c18] py-4 px-8 text-[9px] uppercase tracking-widest font-bold hover:bg-white transition-colors">Write An Editorial</Link>
             </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Notify Me Modal */}
      <AnimatePresence>
        {isNotifyModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotifyModalOpen(false)}
              className="fixed inset-0 bg-[#0b0c10]/60 backdrop-blur-sm z-[100] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#fdf9f2] p-10 z-[101] shadow-2xl border border-[#1c1c18]/10"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-[#a3851a]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#a3851a]">
                  <span className="material-symbols-outlined text-3xl">notifications_active</span>
                </div>
                <h3 className="font-headline text-3xl text-[#1c1c18] mb-4">Back in Stock Notification</h3>
                <p className="font-body text-xs text-[#747878] mb-8 leading-relaxed uppercase tracking-widest">
                  We will meticulously alert you as soon as this piece is restored to our atelier archive.
                </p>

                <div className="space-y-4">
                  <div className="text-left">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-[#747878] mb-2 block">Your Email Address</label>
                    <input 
                      type="email" 
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="concierge@example.com"
                      className="w-full bg-white border border-[#1c1c18]/10 p-4 font-body text-xs focus:outline-none focus:border-[#a3851a] transition-colors"
                    />
                  </div>

                  <button 
                    disabled={isSubmittingNotify || !notifyEmail}
                    onClick={async () => {
                      setIsSubmittingNotify(true)
                      try {
                        const { error } = await supabase.from('stock_notifications').insert({
                          product_id: product.id,
                          product_name: product.title,
                          email: notifyEmail,
                          status: 'pending'
                        })
                        if (error) throw error
                        alert('Your request has been filed with the atelier.')
                        setIsNotifyModalOpen(false)
                        setNotifyEmail('')
                      } catch (e: any) {
                        console.error(e)
                        alert('Our archives are currently busy. Please try again.')
                      } finally {
                        setIsSubmittingNotify(false)
                      }
                    }}
                    className="w-full bg-[#1c1c18] text-white py-5 font-body uppercase tracking-[0.3em] text-[10px] font-bold shadow-xl hover:bg-[#a3851a] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingNotify ? (
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">mail</span>
                        Enroll for Restock Alert
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => setIsNotifyModalOpen(false)}
                    className="text-[9px] uppercase tracking-widest text-[#747878] hover:text-[#1c1c18] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image Zoom Lightbox */}
      <AnimatePresence>
        {zoomedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedImage(null)}
              className="fixed inset-0 bg-[#0b0c10]/95 backdrop-blur-xl z-[100] cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-12 z-[101] pointer-events-none flex items-center justify-center"
            >
              <div className="relative w-full h-full pointer-events-auto flex items-center justify-center">
                {product?.video_url === zoomedImage ? (
                  <div className="w-full h-full max-w-5xl aspect-video relative">
                    {(() => {
                      const getYoutubeId = (url: string) => {
                         const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=)|(\&v=)|(\/shorts\/))([^#\&\?]*).*/;
                         const match = url.match(regExp);
                         return (match && match[9].length === 11) ? match[9] : null;
                      };
                      const videoId = getYoutubeId(zoomedImage);
                      if (videoId) {
                        return (
                          <iframe 
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                            className="w-full h-full border-0 rounded-2xl shadow-2xl"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                          />
                        )
                      }
                      return (
                        <video 
                          src={zoomedImage}
                          autoPlay 
                          controls
                          loop 
                          className="w-full h-full object-contain rounded-2xl shadow-2xl"
                        />
                      )
                    })()}
                  </div>
                ) : (
                  <Image 
                    src={zoomedImage} 
                    alt="Zoomed Product View" 
                    fill 
                    className="object-contain" 
                    quality={100}
                  />
                )}
                <button 
                  onClick={() => setZoomedImage(null)}
                  className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
