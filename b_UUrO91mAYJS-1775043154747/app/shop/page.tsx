'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { products, Product } from '@/data/products'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { useMode, BrandMode } from '@/context/mode-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'

export default function ShopPage() {
  const { mode, setMode, modeDetails } = useMode()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const [dbProducts, setDbProducts] = useState<Product[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSize, setSelectedSize] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high'>('featured')

  // Fetch real-time products added via Admin Panel in Supabase
  useEffect(() => {
    setMounted(true)
    try {
      setDeletedIds(JSON.parse(localStorage.getItem('fo4_deleted_product_ids') || '[]'))
    } catch {}

    const fetchDbProducts = async () => {
      let mapped: Product[] = []
      try {
        const { data } = await supabase.from('products').select('*')
        if (data && data.length > 0) {
          mapped = data.map((d: any) => {
            const itemMode: BrandMode = d.mode || (
              ['Men', 'Tees & Tops', 'Hoodies & Outerwear', 'Bottomwear'].includes(d.category) ? 'streetwear' :
              ['Archive', 'Statement Archive'].includes(d.category) ? 'archive' : 'traditional'
            )
            return {
              id: String(d.id),
              title: d.title || 'Atelier Masterpiece',
              subtitle: d.subtitle || `${itemMode.toUpperCase()} COLLECTION`,
              price: typeof d.price === 'number' ? `₹${d.price.toLocaleString('en-IN')}` : String(d.price),
              rawPrice: typeof d.price === 'number' ? d.price : parseFloat(String(d.price).replace(/[^0-9.]/g, '')) || 0,
              mode: itemMode,
              category: d.category || 'Archive',
              image: d.image || '/saree_1.png',
              gallery: [d.image, d.image2, d.image3].filter(Boolean),
              blueprintImage: d.image3 || d.blueprintImage || '/media__1775056878622.png',
              description: d.description || '',
              gsm: d.gsm || (itemMode === 'streetwear' ? '350 GSM' : undefined),
              details: {
                fabric: Array.isArray(d.fabric) ? d.fabric : [d.fabric || 'Pure Handloom Fabric'],
                care: Array.isArray(d.care) ? d.care : ['Dry Clean Recommended'],
                fit: Array.isArray(d.fit) ? d.fit : ['Archival Tailored Fit']
              },
              heritageStory: d.heritageStory || 'Handcrafted precision weaving derived from ancient architectural blueprints.',
              unboxingPolicy: d.unboxingPolicy || 'Dispatched in signature rigid packaging with 24h unboxing guarantee.',
              rating: d.rating || 5.0,
              reviews: d.reviews || 16,
              sizes: Array.isArray(d.sizes) && d.sizes.length > 0 ? d.sizes : ['S', 'M', 'L', 'XL'],
              inStock: d.stock === undefined || d.stock > 0
            }
          })
        }
      } catch (e) {
        console.warn("DB products fetch skipped", e)
      }

      // Merge local edited products
      try {
        const localEdited = JSON.parse(localStorage.getItem('fo4_edited_products') || '[]')
        if (localEdited && localEdited.length > 0) {
          const mappedLocal: Product[] = localEdited.map((d: any) => {
            const itemMode: BrandMode = d.mode || 'streetwear'
            return {
              id: String(d.id),
              title: d.title || 'Atelier Masterpiece',
              subtitle: d.subtitle || `${itemMode.toUpperCase()} COLLECTION`,
              price: typeof d.price === 'number' ? `₹${d.price.toLocaleString('en-IN')}` : String(d.price),
              rawPrice: typeof d.price === 'number' ? d.price : parseFloat(String(d.price).replace(/[^0-9.]/g, '')) || 0,
              mode: itemMode,
              category: d.category || 'Archive',
              image: d.image || '/saree_1.png',
              gallery: [d.image, d.image2, d.image3].filter(Boolean),
              blueprintImage: d.image3 || d.blueprintImage || '/media__1775056878622.png',
              description: d.description || '',
              gsm: d.gsm || (itemMode === 'streetwear' ? '350 GSM' : undefined),
              details: {
                fabric: Array.isArray(d.fabric) ? d.fabric : [d.fabric || 'Pure Handloom Fabric'],
                care: Array.isArray(d.care) ? d.care : ['Dry Clean Recommended'],
                fit: Array.isArray(d.fit) ? d.fit : ['Archival Tailored Fit']
              },
              heritageStory: d.heritageStory || 'Handcrafted precision weaving derived from ancient architectural blueprints.',
              unboxingPolicy: d.unboxingPolicy || 'Dispatched in signature rigid packaging with 24h unboxing guarantee.',
              rating: d.rating || 5.0,
              reviews: d.reviews || 16,
              sizes: Array.isArray(d.sizes) && d.sizes.length > 0 ? d.sizes : ['S', 'M', 'L', 'XL'],
              inStock: d.stock === undefined || d.stock > 0
            }
          })
          const map = new Map<string, Product>()
          mapped.forEach(p => map.set(p.id, p))
          mappedLocal.forEach(p => map.set(p.id, p))
          mapped = Array.from(map.values())
        }
      } catch (e) {}

      setDbProducts(mapped)
    }
    fetchDbProducts()

    const handleSync = () => {
      fetchDbProducts()
      try {
        setDeletedIds(JSON.parse(localStorage.getItem('fo4_deleted_product_ids') || '[]'))
      } catch {}
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener('fo4_product_updated', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('fo4_product_updated', handleSync)
    }
  }, [])

  // Combine static dataset with DB dataset (giving priority to database items)
  const allProductsMap = new Map<string, Product>()
  products.forEach(p => allProductsMap.set(p.id, p))
  dbProducts.forEach(p => allProductsMap.set(p.id, p))
  const combinedProducts = Array.from(allProductsMap.values())

  // Filter products strictly by active mode & user selections
  const filteredProducts = combinedProducts.filter((p) => {
    if (deletedIds.includes(p.id)) return false

    const matchesMode = p.mode === mode || (
      mode === 'streetwear' && ['Men', 'Tees & Tops', 'Hoodies & Outerwear', 'Bottomwear'].includes(p.category)
    ) || (
      mode === 'archive' && ['Archive', 'Statement Archive'].includes(p.category)
    ) || (
      mode === 'traditional' && ['Traditional', 'Sarees', 'Architectural Sarees', 'Kurtas & Chudidhars', 'Women'].includes(p.category)
    )

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    const matchesSize = selectedSize === 'all' || p.sizes.includes(selectedSize)
    return matchesMode && matchesCategory && matchesSize
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.rawPrice - b.rawPrice
    if (sortBy === 'price-high') return b.rawPrice - a.rawPrice
    return 0
  })

  const categories = [
    'all',
    'Tees & Tops',
    'Hoodies & Outerwear',
    'Oversized Fits',
    'Long Sleeve',
    'Collar & Shirts',
    'Statement Archive',
    'Kurtas & Chudidhars',
    'Architectural Sarees'
  ]
  const sizes = ['all', 'S', 'M', 'L', 'XL', 'XXL']

  return (
    <div 
      className="min-h-screen text-[#F4F1EA] paper-texture flex flex-col justify-between transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: modeDetails.themeBg }}
    >
      <Header />

      <main className="pt-36 sm:pt-36 lg:pt-36 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        {/* BACK NAVIGATION BUTTON */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold transition-all hover:opacity-80 cursor-pointer"
            style={{ color: modeDetails.accentColor }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link>
          
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#D6CEBE]/70" suppressHydrationWarning>
            {mounted ? sortedProducts.length : 0} MASTERPIECES AVAILABLE
          </span>
        </div>

        {/* SHOP HERO TITLE - MODE DYNAMIC FONT */}
        <div className="border-b pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between" style={{ borderColor: modeDetails.borderColor }}>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: modeDetails.accentColor }} />
              <span className={`text-xs tracking-[0.4em] uppercase font-semibold transition-colors duration-500 ${modeDetails.fontClass}`} style={{ color: modeDetails.accentColor }}>
                {modeDetails.title} CATALOG • ONLINE VAULT
              </span>
            </div>
            <h1 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-4xl sm:text-6xl tracking-[0.05em] uppercase text-[#F4F1EA] mt-1 font-bold`}>
              {mode === 'streetwear' ? 'THE STREETWEAR ARCHIVE' : mode === 'archive' ? 'LUXURY VAULT CATALOG' : 'TRADITIONAL COUTURE COLLECTION'}
            </h1>
          </div>
          <p className="text-xs text-[#D6CEBE]/70 font-mono mt-4 md:mt-0" suppressHydrationWarning>
            SHOWING {mounted ? sortedProducts.length : 0} MASTERPIECES
          </p>
        </div>

        {/* MINIMAL FILTER BAR */}
        <div 
          className="p-4 mb-12 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl rounded-lg transition-colors duration-700 backdrop-blur-md"
          style={{ 
            backgroundColor: modeDetails.cardBg, 
            border: `1px solid ${modeDetails.borderColor}`,
            boxShadow: `0 10px 30px ${modeDetails.glowColor}`
          }}
        >
          {/* MODE SELECTOR STRIP */}
          <div className="flex items-center space-x-2 border-b md:border-b-0 md:border-r pb-3 md:pb-0 md:pr-6 w-full md:w-auto overflow-x-auto" style={{ borderColor: modeDetails.borderColor }}>
            <span className="text-[10px] font-mono uppercase text-[#D6CEBE]/60 mr-2">BRAND MODE:</span>
            {(['streetwear', 'archive', 'traditional'] as BrandMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3.5 py-1.5 text-[10px] uppercase border transition-all rounded-full ${modeDetails.fontClass}`}
                style={{
                  backgroundColor: mode === m ? modeDetails.accentColor : 'transparent',
                  color: mode === m ? modeDetails.themeBg : '#F4F1EA',
                  borderColor: mode === m ? modeDetails.accentColor : modeDetails.borderColor,
                  fontWeight: mode === m ? 700 : 400
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {/* CATEGORY & SIZE FILTERS */}
          <div className="flex items-center space-x-4 w-full md:w-auto overflow-x-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border text-xs font-mono px-3 py-2 text-[#F4F1EA] focus:outline-none rounded"
              style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
            >
              <option value="all">ALL CATEGORIES</option>
              {categories.slice(1).map((cat) => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>

            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="border text-xs font-mono px-3 py-2 text-[#F4F1EA] focus:outline-none rounded"
              style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
            >
              <option value="all">ALL SIZES</option>
              {sizes.slice(1).map((sz) => (
                <option key={sz} value={sz}>SIZE {sz}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border text-xs font-mono px-3 py-2 text-[#F4F1EA] focus:outline-none rounded"
              style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
            >
              <option value="featured">SORT: FEATURED</option>
              <option value="price-low">PRICE: LOW TO HIGH</option>
              <option value="price-high">PRICE: HIGH TO LOW</option>
            </select>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {sortedProducts.length === 0 ? (
          <div 
            className="py-20 text-center space-y-4 border border-dashed p-8 rounded-lg"
            style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
          >
            <span className="material-symbols-outlined text-5xl" style={{ color: modeDetails.accentColor }}>inventory_2</span>
            <h3 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-2xl uppercase text-[#F4F1EA]`}>
              NO {modeDetails.title} PIECES FOUND
            </h3>
            <p className="text-xs text-[#D6CEBE]/70 max-w-sm mx-auto font-mono">
              Try switching your active mode or adding new items in the Admin Panel.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedSize('all'); }}
              className="mt-4 px-6 py-2.5 text-xs font-mono uppercase tracking-[0.2em] font-bold rounded transition-all"
              style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {sortedProducts.map((product, idx) => {
              const isWishlisted = isInWishlist(product.id)

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group p-3 sm:p-5 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 rounded-lg overflow-hidden relative"
                  style={{
                    backgroundColor: modeDetails.cardBg,
                    border: `1px solid ${modeDetails.borderColor}`
                  }}
                >
                  {/* IMAGE CONTAINER */}
                  <Link href={`/product/${product.id}`} className="block relative w-full h-[240px] sm:h-[380px] bg-black/40 overflow-hidden rounded group">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* MODE BADGES */}
                    <div className="absolute top-2 left-2 flex flex-col space-y-1 z-10">
                      <span 
                        className={`text-[8px] sm:text-[9px] tracking-[0.15em] px-2 py-0.5 uppercase font-bold rounded ${modeDetails.fontClass}`}
                        style={{ backgroundColor: modeDetails.themeBg, color: modeDetails.accentColor, border: `1px solid ${modeDetails.borderColor}` }}
                      >
                        {product.mode || mode}
                      </span>
                      {product.gsm && (
                        <span 
                          className="text-[8px] font-bold px-1.5 py-0.5 tracking-wider uppercase hidden sm:inline-block rounded"
                          style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                        >
                          {product.gsm}
                        </span>
                      )}
                    </div>

                    {/* WISHLIST TOGGLE */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleWishlist(product.id)
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full text-[#F4F1EA] flex items-center justify-center transition-colors shadow-md z-20"
                      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
                    >
                      <span className="material-symbols-outlined text-[16px]" style={{ color: isWishlisted ? modeDetails.accentColor : '#F4F1EA' }}>
                        {isWishlisted ? 'favorite' : 'favorite_border'}
                      </span>
                    </button>
                  </Link>

                  {/* INFO & MODE FONT STYLING */}
                  <div className="mt-4 space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1">
                      <div>
                        <h3 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-base sm:text-xl font-bold text-[#F4F1EA] transition-colors line-clamp-1`}>
                          <Link href={`/product/${product.id}`} className="hover:opacity-80">
                            {product.title}
                          </Link>
                        </h3>
                        {product.subtitle && (
                          <p className="text-[9px] text-[#D6CEBE]/70 font-mono uppercase truncate mt-0.5">
                            {product.subtitle}
                          </p>
                        )}
                      </div>
                      <span className="font-mono text-xs sm:text-base font-bold shrink-0" style={{ color: modeDetails.accentColor }}>
                        {product.price}
                      </span>
                    </div>

                    {/* ACTION BUTTON */}
                    <div className="pt-2">
                      <Link
                        href={`/product/${product.id}`}
                        className={`block w-full text-center py-2.5 font-bold text-[10px] sm:text-xs tracking-[0.2em] uppercase transition-all duration-300 rounded shadow ${modeDetails.fontClass}`}
                        style={{
                          backgroundColor: modeDetails.accentColor,
                          color: modeDetails.themeBg
                        }}
                      >
                        VIEW {mode.toUpperCase()} SPEC →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
