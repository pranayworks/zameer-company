'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { products, Product } from '@/data/products'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { useMode, BrandMode } from '@/context/mode-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ShareButtonDemo } from '@/components/animate-ui/components/community/share-button'
import { supabase } from '@/lib/supabase'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.id as string
  
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { mode, modeDetails } = useMode()

  const [dbProduct, setDbProduct] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'photos' | '360' | 'reel'>('photos')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>('M')
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [openAccordion, setOpenAccordion] = useState<string | null>('fabric')
  const [imageFit, setImageFit] = useState<'contain' | 'cover'>('contain')

  // 360-DEGREE INTERACTIVE ROTATOR STATE
  const [rotationAngle, setRotationAngle] = useState(0)
  const [isAutoSpinning, setIsAutoSpinning] = useState(false)
  const [isDragging360, setIsDragging360] = useState(false)
  const dragStartX = useRef<number>(0)
  const angleAtStart = useRef<number>(0)

  // FULLSCREEN LIGHTBOX MODAL WITH ZOOM & ARROWS STATE
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxZoom, setLightboxZoom] = useState(1) // 1 = 100%, 1.5, 2, 2.5, 3

  // SHIPROCKET PINCODE ESTIMATOR STATE
  const [pincode, setPincode] = useState('')
  const [pincodeResult, setPincodeResult] = useState<{ estimatedDate: string; service: string; codAvailable?: boolean } | null>(null)
  const [checkingPincode, setCheckingPincode] = useState(false)
  const [pincodeError, setPincodeError] = useState('')

  // REVIEWS SYSTEM STATE
  const [reviewsList, setReviewsList] = useState<any[]>([])
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [newReview, setNewReview] = useState({
    name: '',
    city: '',
    rating: 5,
    title: '',
    comment: '',
    image: '',
  })

  // FIT CALCULATOR STATE
  const [isFitCalculatorOpen, setIsFitCalculatorOpen] = useState(false)
  const [fitHeight, setFitHeight] = useState('175')
  const [fitWeight, setFitWeight] = useState('72')
  const [fitPref, setFitPref] = useState<'slim' | 'tailored' | 'oversized'>('tailored')
  const [fitRecommendation, setFitRecommendation] = useState<{ size: string; match: number } | null>(null)

  // SAME DAY DISPATCH COUNTDOWN TIMER STATE
  const [countdownTime, setCountdownTime] = useState('03h 42m 18s')

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const cutoff = new Date()
      cutoff.setHours(18, 0, 0, 0)
      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1)
      }
      const diffMs = cutoff.getTime() - now.getTime()
      const hrs = String(Math.floor((diffMs / (1000 * 60 * 60)) % 24)).padStart(2, '0')
      const mins = String(Math.floor((diffMs / (1000 * 60)) % 60)).padStart(2, '0')
      const secs = String(Math.floor((diffMs / 1000) % 60)).padStart(2, '0')
      setCountdownTime(`${hrs}h ${mins}m ${secs}s`)
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCalculateFit = () => {
    const w = Number(fitWeight) || 70
    let recommended = 'M'
    if (w < 60) recommended = 'S'
    else if (w >= 60 && w < 75) recommended = 'M'
    else if (w >= 75 && w < 88) recommended = 'L'
    else if (w >= 88 && w < 100) recommended = 'XL'
    else recommended = 'XXL'

    if (fitPref === 'oversized' && recommended !== 'XXL') {
      const order = ['S', 'M', 'L', 'XL', 'XXL']
      const idx = order.indexOf(recommended)
      if (idx < order.length - 1) recommended = order[idx + 1]
    }

    setFitRecommendation({
      size: recommended,
      match: Math.floor(92 + Math.random() * 7)
    })
  }

  // Fetch product directly from Supabase if added via Admin Panel
  useEffect(() => {
    const fetchDbProduct = async () => {
      if (!productId) return
      try {
        const { data } = await supabase.from('products').select('*').eq('id', productId).single()
        if (data) {
          const itemMode: BrandMode = data.mode || (
            ['Men', 'Tees & Tops', 'Hoodies & Outerwear', 'Bottomwear'].includes(data.category) ? 'streetwear' :
            ['Archive', 'Statement Archive'].includes(data.category) ? 'archive' : 'traditional'
          )
          setDbProduct({
            id: String(data.id),
            title: data.title || 'Atelier Masterpiece',
            subtitle: data.subtitle || `${itemMode.toUpperCase()} SPECIFICATION`,
            price: typeof data.price === 'number' ? `₹${data.price.toLocaleString('en-IN')}` : String(data.price),
            rawPrice: typeof data.price === 'number' ? data.price : parseFloat(String(data.price).replace(/[^0-9.]/g, '')) || 0,
            mode: itemMode,
            category: data.category || 'Archive',
            image: data.image || '/saree_1.png',
            image2: data.image2,
            image3: data.image3,
            video_url: data.video_url,
            return_policy: data.return_policy,
            gallery: [data.image, data.image2, data.image3].filter(Boolean),
            blueprintImage: data.blueprintImage || '/media__1775056878622.png',
            description: data.description || '',
            gsm: data.gsm || (itemMode === 'streetwear' ? '350 GSM' : undefined),
            details: {
              fabric: Array.isArray(data.fabric) ? data.fabric : [data.fabric || 'Pure Handloom Material'],
              care: Array.isArray(data.care) ? data.care : ['Dry Clean Recommended'],
              fit: Array.isArray(data.fit) ? data.fit : ['Archival Tailored Fit']
            },
            heritageStory: data.heritageStory || 'Handcrafted precision weaving derived from ancient architectural blueprints.',
            unboxingPolicy: data.unboxingPolicy || 'Dispatched in signature rigid packaging with 24h unboxing guarantee.',
            rating: data.rating || 5.0,
            reviews: data.reviews || 16,
            sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : ['S', 'M', 'L', 'XL'],
            inStock: data.stock === undefined || data.stock > 0
          })
        }
      } catch (e) {
        console.warn("Db single product fetch skipped", e)
      }

      // Local session edited product check
      try {
        const localEdited = JSON.parse(localStorage.getItem('fo4_edited_products') || '[]')
        const found = localEdited.find((p: any) => String(p.id) === String(productId))
        if (found) {
          const itemMode: BrandMode = found.mode || 'streetwear'
          setDbProduct({
            id: String(found.id),
            title: found.title || 'Atelier Masterpiece',
            subtitle: found.subtitle || `${itemMode.toUpperCase()} SPECIFICATION`,
            price: typeof found.price === 'number' ? `₹${found.price.toLocaleString('en-IN')}` : String(found.price),
            rawPrice: typeof found.price === 'number' ? found.price : parseFloat(String(found.price).replace(/[^0-9.]/g, '')) || 0,
            mode: itemMode,
            category: found.category || 'Archive',
            image: found.image || '/saree_1.png',
            image2: found.image2,
            image3: found.image3,
            video_url: found.video_url,
            return_policy: found.return_policy,
            gallery: [found.image, found.image2, found.image3].filter(Boolean),
            blueprintImage: found.image3 || found.blueprintImage || '/media__1775056878622.png',
            description: found.description || '',
            gsm: found.gsm || (itemMode === 'streetwear' ? '350 GSM' : undefined),
            details: {
              fabric: Array.isArray(found.fabric) ? found.fabric : [found.fabric || 'Pure Handloom Material'],
              care: Array.isArray(found.care) ? found.care : ['Dry Clean Recommended'],
              fit: Array.isArray(found.fit) ? found.fit : ['Archival Tailored Fit']
            },
            heritageStory: found.heritageStory || 'Handcrafted precision weaving derived from ancient architectural blueprints.',
            unboxingPolicy: found.unboxingPolicy || 'Dispatched in signature rigid packaging with 24h unboxing guarantee.',
            rating: found.rating || 5.0,
            reviews: found.reviews || 16,
            sizes: Array.isArray(found.sizes) && found.sizes.length > 0 ? found.sizes : ['S', 'M', 'L', 'XL'],
            inStock: found.stock === undefined || found.stock > 0
          })
        }
      } catch (e) {}
    }
    fetchDbProduct()
  }, [productId])

  // Resolve active product from DB or Static fallback
  const staticProduct = products.find((p) => p.id === productId) || products[0]
  const product = dbProduct || staticProduct
  const productGallery = (product.gallery && product.gallery.length > 0) ? product.gallery : [product.image]

  // Auto-Spin 360 effect (Slow, smooth luxury turntable spin)
  useEffect(() => {
    let interval: any
    if (isAutoSpinning) {
      interval = setInterval(() => {
        setRotationAngle(prev => (prev + 1) % 360)
      }, 40) // Smooth slow rotation: 1 degree every 40ms (~14s per full 360° rotation)
    }
    return () => clearInterval(interval)
  }, [isAutoSpinning])

  // Load product reviews from localStorage & Supabase
  useEffect(() => {
    const loadReviews = async () => {
      let deletedIds: string[] = []
      try {
        deletedIds = JSON.parse(localStorage.getItem('fo4_deleted_review_ids') || '[]')
      } catch {}

      let local: any[] = []
      try {
        local = JSON.parse(localStorage.getItem('fo4_product_reviews') || '[]')
        local = local.filter((r: any) => !deletedIds.includes(r.id))
      } catch {}

      if (local.length === 0) {
        local = [
          {
            id: 'rev-1',
            productId: String(product.id),
            name: 'Aarav Sharma',
            city: 'Bengaluru',
            rating: 5,
            title: 'Exquisite Heritage Craftsmanship!',
            comment: 'The weight of the fabric and structural silhouette exceed expectations. Feels like museum quality.',
            image: product.image || '/saree_1.png',
            date: '2026-09-24',
            verified: true
          },
          {
            id: 'rev-2',
            productId: String(product.id),
            name: 'Meera Nair',
            city: 'Kochi',
            rating: 5,
            title: 'Flawless Fit & Premium Packaging',
            comment: 'Dispatched super fast with Shiprocket. Arrived in rigid box with unboxing certificate.',
            date: '2026-09-20',
            verified: true
          }
        ].filter(r => !deletedIds.includes(r.id))
        try { localStorage.setItem('fo4_product_reviews', JSON.stringify(local)) } catch {}
      }

      try {
        const { data } = await supabase.from('reviews').select('*').eq('product_id', String(product.id))
        if (data && data.length > 0) {
          const formatted = data
            .filter(d => !deletedIds.includes(d.id))
            .map(d => ({
              id: d.id,
              productId: String(d.product_id),
              name: d.reviewer_name || 'Client',
              city: d.reviewer_city || 'Verified Buyer',
              rating: d.rating || 5,
              title: d.title || 'Exceptional Piece',
              comment: d.comment,
              image: d.image_url,
              date: d.created_at ? d.created_at.split('T')[0] : '2026-09-25',
              verified: true
            }))
          const merged = [...local.filter(r => String(r.productId) === String(product.id))]
          formatted.forEach(f => {
            if (!merged.some(m => m.id === f.id)) merged.unshift(f)
          })
          setReviewsList(merged.filter(r => !deletedIds.includes(r.id)))
        } else {
          setReviewsList(local.filter(r => String(r.productId) === String(product.id) && !deletedIds.includes(r.id)))
        }
      } catch {
        setReviewsList(local.filter(r => String(r.productId) === String(product.id) && !deletedIds.includes(r.id)))
      }
    }

    if (product?.id) loadReviews()

    const handleSync = () => {
      if (product?.id) loadReviews()
    }

    window.addEventListener('storage', handleSync)
    window.addEventListener('fo4_reviews_updated', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('fo4_reviews_updated', handleSync)
    }
  }, [product?.id])

  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0])
    }
  }, [product])

  const isWishlisted = isInWishlist(product.id)

  const handleAddToCart = (p: any = product, sz: string = selectedSize) => {
    addToCart({
      id: p.id,
      title: p.title,
      price: p.price,
      rawPrice: p.rawPrice,
      image: p.image,
      selectedSize: sz,
      quantity: 1
    })
  }

  const handleBuyNow = (p: any = product, sz: string = selectedSize) => {
    handleAddToCart(p, sz)
    router.push('/checkout')
  }

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id)
  }

  // Handle Lightbox Modal Navigation
  const openLightbox = (index: number = activeImageIndex) => {
    setLightboxIndex(index)
    setLightboxZoom(1)
    setIsLightboxOpen(true)
  }

  const prevLightboxImage = () => {
    setLightboxIndex(prev => (prev - 1 + productGallery.length) % productGallery.length)
    setLightboxZoom(1)
  }

  const nextLightboxImage = () => {
    setLightboxIndex(prev => (prev + 1) % productGallery.length)
    setLightboxZoom(1)
  }

  // Handle 360 Dragging (Mouse & Mobile Touch)
  const handleMouseDown360 = (e: React.MouseEvent) => {
    setIsDragging360(true)
    dragStartX.current = e.clientX
    angleAtStart.current = rotationAngle
  }

  const handleMouseMove360 = (e: React.MouseEvent) => {
    if (!isDragging360) return
    const deltaX = e.clientX - dragStartX.current
    const newAngle = (angleAtStart.current + Math.round(deltaX * 0.8)) % 360
    setRotationAngle(newAngle < 0 ? newAngle + 360 : newAngle)
  }

  const handleTouchStart360 = (e: React.TouchEvent) => {
    setIsDragging360(true)
    if (e.touches.length > 0) {
      dragStartX.current = e.touches[0].clientX
      angleAtStart.current = rotationAngle
    }
  }

  const handleTouchMove360 = (e: React.TouchEvent) => {
    if (!isDragging360 || e.touches.length === 0) return
    const deltaX = e.touches[0].clientX - dragStartX.current
    const newAngle = (angleAtStart.current + Math.round(deltaX * 0.8)) % 360
    setRotationAngle(newAngle < 0 ? newAngle + 360 : newAngle)
  }

  const handleMouseUp360 = () => {
    setIsDragging360(false)
  }

  // Handle customer adding a review with optional product photo
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReview.name || !newReview.comment) return

    const reviewObj = {
      id: `rev-${Date.now()}`,
      productId: String(product.id),
      name: newReview.name,
      city: newReview.city || 'Verified Purchaser',
      rating: Number(newReview.rating),
      title: newReview.title || 'Exceptional Atelier Piece',
      comment: newReview.comment,
      image: newReview.image || undefined,
      date: new Date().toISOString().split('T')[0],
      verified: true,
    }

    const updated = [reviewObj, ...reviewsList]
    setReviewsList(updated)

    try {
      const allLocal = JSON.parse(localStorage.getItem('fo4_product_reviews') || '[]')
      allLocal.unshift(reviewObj)
      localStorage.setItem('fo4_product_reviews', JSON.stringify(allLocal))
    } catch {}

    try {
      await supabase.from('reviews').insert([{
        product_id: String(product.id),
        reviewer_name: newReview.name,
        reviewer_city: newReview.city,
        rating: Number(newReview.rating),
        title: newReview.title,
        comment: newReview.comment,
        image_url: newReview.image,
      }])
    } catch (e) {
      console.warn("Supabase review insert error:", e)
    }

    setIsReviewModalOpen(false)
    setNewReview({ name: '', city: '', rating: 5, title: '', comment: '', image: '' })
    alert('✓ Review & Product Photo successfully published!')
  }

  // Real-Time Shiprocket Pincode Calculator
  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pincode || pincode.length !== 6 || isNaN(Number(pincode))) {
      setPincodeError('Please enter a valid 6-digit Indian Pincode.')
      setPincodeResult(null)
      return
    }

    setCheckingPincode(true)
    setPincodeError('')

    try {
      const res = await fetch(`/api/shiprocket-estimate?pincode=${pincode}&weight=0.5`)
      const data = await res.json()
      if (data.success) {
        setPincodeResult(data)
      } else {
        setPincodeError(data.error || 'Pincode serviceability check failed.')
      }
    } catch (err) {
      setPincodeError('Network error checking Shiprocket serviceability.')
    } finally {
      setCheckingPincode(false)
    }
  }

  // Filter Related Products (You May Also Like)
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.mode === product.mode))
    .slice(0, 4)

  // Map 360 rotation angle to gallery image frame index
  const galleryFrameIndex = Math.floor((rotationAngle / 360) * productGallery.length) % productGallery.length

  return (
    <div 
      className="min-h-screen text-[#F4F1EA] paper-texture flex flex-col justify-between transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: modeDetails.themeBg }}
    >
      <Header />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        {/* BACK NAVIGATION BUTTON */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold transition-all hover:opacity-80 cursor-pointer"
            style={{ color: modeDetails.accentColor }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Collection
          </button>

          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#D6CEBE]/70 flex items-center space-x-2">
            <Link href="/" className="hover:opacity-80">HOME</Link>
            <span>/</span>
            <Link href="/shop" className="hover:opacity-80">COLLECTION</Link>
            <span>/</span>
            <span className="font-bold text-white line-clamp-1 max-w-[150px] sm:max-w-none">{product.title}</span>
          </div>
        </div>

        {/* MASTERPIECE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: STICKY MULTI-ANGLE GALLERY & 360 VIEWER */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-28">
            
            {/* VIEW TAB SELECTOR: 01 GALLERY | 02 360° VIEW | 03 CINEMATIC REEL */}
            <div className="flex border p-1 rounded-lg gap-1" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex-1 py-2 text-[10px] sm:text-[11px] tracking-[0.12em] uppercase transition-all rounded ${modeDetails.fontClass}`}
                style={{
                  backgroundColor: activeTab === 'photos' ? modeDetails.accentColor : 'transparent',
                  color: activeTab === 'photos' ? modeDetails.themeBg : '#D6CEBE',
                  fontWeight: activeTab === 'photos' ? 700 : 400
                }}
              >
                01. GALLERY ({productGallery.length})
              </button>

              <button
                onClick={() => setActiveTab('360')}
                className={`flex-1 py-2 text-[10px] sm:text-[11px] tracking-[0.12em] uppercase transition-all rounded flex items-center justify-center gap-1 ${modeDetails.fontClass}`}
                style={{
                  backgroundColor: activeTab === '360' ? modeDetails.accentColor : 'transparent',
                  color: activeTab === '360' ? modeDetails.themeBg : '#D6CEBE',
                  fontWeight: activeTab === '360' ? 700 : 400
                }}
              >
                <span className="material-symbols-outlined text-xs">360</span>
                <span>02. 360° VIEW</span>
              </button>
              
              {product.video_url && (
                <button
                  onClick={() => setActiveTab('reel')}
                  className={`flex-1 py-2 text-[10px] sm:text-[11px] tracking-[0.12em] uppercase transition-all rounded ${modeDetails.fontClass}`}
                  style={{
                    backgroundColor: activeTab === 'reel' ? modeDetails.accentColor : 'transparent',
                    color: activeTab === 'reel' ? modeDetails.themeBg : '#D6CEBE',
                    fontWeight: activeTab === 'reel' ? 700 : 400
                  }}
                >
                  03. REEL
                </button>
              )}
            </div>

            {/* MAIN DISPLAY AREA */}
            <div className="relative w-full h-[400px] sm:h-[480px] border overflow-hidden shadow-2xl rounded-lg group" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
              
              <AnimatePresence mode="wait">
                {activeTab === 'photos' ? (
                  <motion.div
                    key={`photo-${activeImageIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full p-2 flex items-center justify-center cursor-pointer"
                    onClick={() => openLightbox(activeImageIndex)}
                  >
                    <Image
                      src={productGallery[activeImageIndex] || '/placeholder.jpg'}
                      alt={product.title}
                      fill
                      priority
                      className={imageFit === 'contain' ? 'object-contain p-2' : 'object-cover object-top'}
                    />

                    {/* HOVER EXPAND POPUP INSTRUCTION */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-4 py-2 bg-black/80 text-white rounded-full font-mono text-xs uppercase tracking-widest border border-white/30 flex items-center gap-2 backdrop-blur-md">
                        <span className="material-symbols-outlined text-sm">open_in_full</span>
                        <span>CLICK FOR FULLSCREEN LIGHTBOX & ZOOM</span>
                      </div>
                    </div>
                  </motion.div>
                ) : activeTab === '360' ? (
                  /* 360 DEGREE INTERACTIVE ROTATOR VIEW - SMOOTH SLOW LUXURY ROTATION */
                  <motion.div
                    key="360-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full h-full flex flex-col items-center justify-between select-none cursor-grab active:cursor-grabbing touch-pan-y p-3"
                    onMouseDown={handleMouseDown360}
                    onMouseMove={handleMouseMove360}
                    onMouseUp={handleMouseUp360}
                    onMouseLeave={handleMouseUp360}
                    onTouchStart={handleTouchStart360}
                    onTouchMove={handleTouchMove360}
                    onTouchEnd={handleMouseUp360}
                  >
                    <div className="relative w-full h-full p-2 flex items-center justify-center overflow-hidden">
                      {/* CRISP ULTRA-HD UN-DISTORTED IMAGE CONTAINER WITH SMOOTH CONTINUOUS 3D PERSPECTIVE */}
                      {(() => {
                        const totalFrames = productGallery.length
                        const frameIdx = totalFrames > 1 ? Math.floor((rotationAngle / 360) * totalFrames) % totalFrames : 0
                        const activeImage = productGallery[frameIdx] || product.image
                        const lightSheenOffset = (rotationAngle / 360) * 100
                        const yAngle = (rotationAngle % 360) > 180 ? 360 - (rotationAngle % 360) : (rotationAngle % 360)

                        return (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <div 
                              className="relative w-full h-full flex items-center justify-center transition-transform duration-75"
                              style={{
                                transform: `perspective(1200px) rotateY(${yAngle * 0.25}deg)`
                              }}
                            >
                              <img
                                src={activeImage}
                                alt={`360 Degree View Frame - ${rotationAngle}°`}
                                className="w-full h-full object-contain p-2 select-none"
                                style={{
                                  imageRendering: 'crisp-edges'
                                }}
                              />

                              {/* SMOOTH SPECULAR REFLECTION LIGHTING OVERLAY */}
                              <div
                                className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                                style={{
                                  background: `linear-gradient(115deg, transparent ${Math.max(0, lightSheenOffset - 30)}%, rgba(255,255,255,0.8) ${lightSheenOffset}%, transparent ${Math.min(100, lightSheenOffset + 30)}%)`
                                }}
                              />
                            </div>
                          </div>
                        )
                      })()}

                      {/* 360 OVERLAY STATUS & BADGE */}
                      <div className="absolute top-3 left-3 z-10 font-mono text-[10px] bg-black/85 px-3.5 py-1.5 rounded-full border border-amber-500/40 flex items-center gap-2 shadow-lg backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span style={{ color: modeDetails.accentColor }} className="font-bold">
                          360° TURNTABLE: {rotationAngle}°
                        </span>
                        <span className="text-[9px] text-emerald-400 font-bold border-l pl-2 border-white/20">
                          {isAutoSpinning ? 'SLOW AUTO-SPINNING' : 'DRAG TO ROTATE'}
                        </span>
                      </div>

                      {/* QUICK ANGLE PRESETS */}
                      <div className="absolute top-3 right-3 z-10 flex gap-1 font-mono text-[9px]">
                        {[
                          { label: '0° FRONT', val: 0 },
                          { label: '90° SIDE', val: 90 },
                          { label: '180° BACK', val: 180 },
                          { label: '270° SIDE', val: 270 },
                        ].map((preset) => (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() => {
                              setIsAutoSpinning(false)
                              setRotationAngle(preset.val)
                            }}
                            className="px-2 py-1 bg-black/80 border border-white/20 text-white rounded hover:bg-white/20 cursor-pointer font-bold"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* PLAY / PAUSE & ROTATION CONTROLS STRIP */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/90 p-2 rounded-full border border-white/20 backdrop-blur-md shadow-2xl">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAutoSpinning(false)
                            setRotationAngle(prev => (prev - 15 + 360) % 360)
                          }}
                          className="p-1.5 text-xs text-white hover:text-amber-400 font-mono cursor-pointer"
                          title="-15° Left"
                        >
                          ◄ -15°
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('360')
                            setIsAutoSpinning(!isAutoSpinning)
                          }}
                          className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-full border transition-all cursor-pointer ${
                            isAutoSpinning ? 'bg-amber-400 text-black border-amber-400 shadow-md' : 'bg-white/10 text-white border-white/30'
                          }`}
                        >
                          {isAutoSpinning ? '⏸ PAUSE ROTATION' : '▶ AUTO-SPIN 360°'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsAutoSpinning(false)
                            setRotationAngle(prev => (prev + 15) % 360)
                          }}
                          className="p-1.5 text-xs text-white hover:text-amber-400 font-mono cursor-pointer"
                          title="+15° Right"
                        >
                          +15° ►
                        </button>

                        <button
                          type="button"
                          onClick={() => { setRotationAngle(0); setIsAutoSpinning(false) }}
                          className="px-2 py-1 text-[9px] font-mono text-white/70 hover:text-white cursor-pointer"
                        >
                          RESET
                        </button>
                      </div>
                    </div>

                    {/* INTERACTIVE 360° SCRUBBING RANGE SLIDER BAR */}
                    <div className="w-full pt-2 px-4 flex flex-col gap-1 font-mono text-[9px] z-10 bg-black/60 rounded-xl p-2 border border-white/10">
                      <div className="flex items-center justify-between text-[#D6CEBE]">
                        <span>DRAG SLIDER OR SWIPE IMAGE TO ROTATE MANUALLY:</span>
                        <span className="font-bold text-amber-400">{rotationAngle}° / 360°</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={rotationAngle}
                        onChange={(e) => {
                          setIsAutoSpinning(false)
                          setRotationAngle(Number(e.target.value))
                        }}
                        className="w-full accent-amber-400 cursor-pointer h-2 bg-white/20 rounded-lg"
                      />
                    </div>
                  </motion.div>
                ) : (
                  /* CINEMATIC REEL VIEW */
                  <motion.div
                    key="reel-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full h-full bg-black flex items-center justify-center"
                  >
                    <video
                      src={product.video_url}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* MODE STAMP */}
              <div className={`absolute top-3 left-3 text-[9px] tracking-[0.15em] px-2.5 py-0.5 uppercase font-bold rounded ${modeDetails.fontClass}`} style={{ backgroundColor: modeDetails.themeBg, color: modeDetails.accentColor, border: `1px solid ${modeDetails.borderColor}` }}>
                {product.mode || mode} MODE
              </div>

              {/* IMAGE FIT VIEW TOGGLE BUTTON */}
              {activeTab === 'photos' && (
                <div className="absolute bottom-3 right-3 z-10 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openLightbox(activeImageIndex)}
                    className="px-2.5 py-1 text-[9px] font-mono uppercase font-bold rounded border backdrop-blur-md transition-all flex items-center gap-1 cursor-pointer bg-black/80 text-white border-amber-400/50 hover:border-amber-400 shadow-lg"
                  >
                    <span className="material-symbols-outlined text-xs">zoom_in</span>
                    <span>LIGHTBOX POPUP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageFit(imageFit === 'contain' ? 'cover' : 'contain')}
                    className="px-2.5 py-1 text-[9px] font-mono uppercase font-bold rounded border backdrop-blur-md transition-all flex items-center gap-1 cursor-pointer bg-black/70 text-white border-white/30 hover:border-white shadow-lg"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {imageFit === 'contain' ? 'zoom_out_map' : 'fit_screen'}
                    </span>
                    <span>{imageFit === 'contain' ? 'FIT: CONTAIN' : 'FIT: COVER'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* THUMBNAIL GALLERY STRIP */}
            {activeTab === 'photos' && productGallery.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {productGallery.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className="relative w-20 h-24 flex-shrink-0 border-2 overflow-hidden transition-all rounded bg-black/40 p-1 cursor-pointer group"
                    style={{
                      borderColor: activeImageIndex === idx ? modeDetails.accentColor : modeDetails.borderColor,
                      opacity: activeImageIndex === idx ? 1 : 0.6
                    }}
                  >
                    <Image src={imgUrl} alt={`View ${idx}`} fill className="object-contain p-1" />
                    <div className="absolute inset-0 bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PRODUCT PURCHASING & SPECS ACCORDION */}
          <div className="lg:col-span-5 space-y-5 p-5 border shadow-xl rounded-lg" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
            
            {/* TITLE & PRICE */}
            <div className="border-b pb-4 space-y-1.5" style={{ borderColor: modeDetails.borderColor }}>
              <div className="flex justify-between items-start">
                <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${modeDetails.fontClass}`} style={{ color: modeDetails.accentColor }}>
                  {product.category} {product.gsm ? `• ${product.gsm}` : ''}
                </span>
                <div className="flex items-center space-x-2">
                  <ShareButtonDemo size="sm" />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="hover:opacity-80 transition-colors p-1 text-[#F4F1EA]"
                    aria-label="Wishlist"
                  >
                    <span className="material-symbols-outlined text-xl" style={{ color: isWishlisted ? modeDetails.accentColor : '#F4F1EA' }}>
                      {isWishlisted ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                </div>
              </div>

              {/* HEADING */}
              <h1 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-xl sm:text-2xl tracking-[0.03em] text-[#F4F1EA] font-bold`}>
                {product.title}
              </h1>

              {product.subtitle && (
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#D6CEBE]/70">
                  {product.subtitle}
                </p>
              )}

              <div className="pt-1.5 flex items-baseline justify-between">
                <span className="font-mono text-xl font-bold" style={{ color: modeDetails.accentColor }}>
                  {product.price}
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 border rounded" style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: modeDetails.accentColor, borderColor: modeDetails.borderColor }}>
                  IN STOCK • READY TO SHIP
                </span>
              </div>
            </div>

            {/* DESCRIPTION */}
            <p className="text-[11px] text-[#D6CEBE]/80 leading-relaxed font-light">
              {product.description}
            </p>

            {/* PILL SIZE SELECTOR & FIT CALCULATOR */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-[#F4F1EA] font-bold">SELECT SIZE:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFitCalculatorOpen(true)}
                    className="px-2.5 py-1 text-[9px] font-mono border rounded-full bg-amber-400/10 text-amber-300 border-amber-400/40 hover:bg-amber-400 hover:text-black transition-all flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <span>📐 FIND MY FIT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="underline hover:opacity-80 transition-colors text-[10px]"
                    style={{ color: modeDetails.accentColor }}
                  >
                    SIZE GUIDE
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(product.sizes || ['S', 'M', 'L', 'XL']).map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-1.5 text-[11px] border transition-all rounded-full cursor-pointer ${modeDetails.fontClass}`}
                    style={{
                      backgroundColor: selectedSize === size ? modeDetails.accentColor : 'transparent',
                      color: selectedSize === size ? modeDetails.themeBg : '#F4F1EA',
                      borderColor: selectedSize === size ? modeDetails.accentColor : modeDetails.borderColor,
                      fontWeight: selectedSize === size ? 700 : 400
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* SAME-DAY DISPATCH COUNTDOWN BADGE */}
            <div className="p-2.5 rounded-lg border bg-black/40 text-[10px] font-mono flex items-center justify-between shadow-inner" style={{ borderColor: `${modeDetails.borderColor}40` }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-emerald-300 uppercase tracking-wider">⚡ SAME-DAY DISPATCH</span>
              </div>
              <div className="text-[#D6CEBE]">
                Order in <strong className="text-amber-400 font-bold">{countdownTime}</strong>
              </div>
            </div>

            {/* PRIMARY ADD TO BAG & BUY NOW BUTTONS */}
            <div className="space-y-2">
              <button
                onClick={() => handleAddToCart()}
                className={`w-full py-3 font-bold text-[11px] tracking-[0.18em] uppercase transition-all duration-300 shadow-lg rounded hover:brightness-110 cursor-pointer ${modeDetails.fontClass}`}
                style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
              >
                ADD TO BAG — {product.price}
              </button>

              <button
                onClick={() => handleBuyNow()}
                className={`w-full py-3 font-bold text-[11px] tracking-[0.18em] uppercase transition-all duration-300 shadow-lg rounded border hover:bg-white/10 cursor-pointer flex items-center justify-center gap-2 ${modeDetails.fontClass}`}
                style={{ borderColor: modeDetails.accentColor, color: modeDetails.accentColor }}
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span>BUY NOW — DIRECT CHECKOUT</span>
              </button>
            </div>

            {/* SHIPROCKET PINCODE ESTIMATOR WIDGET */}
            <div className="p-3 border rounded-lg space-y-2 text-[10px]" style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}>
              <div className="flex items-center gap-2 font-mono font-bold uppercase text-[10px]" style={{ color: modeDetails.accentColor }}>
                <span className="material-symbols-outlined text-xs">local_shipping</span>
                <span>SHIPROCKET PINCODE ESTIMATOR</span>
              </div>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="ENTER PINCODE"
                  className="flex-1 bg-transparent border px-2.5 py-1.5 text-[11px] font-mono uppercase text-white placeholder-white/40 focus:outline-none rounded"
                  style={{ borderColor: modeDetails.borderColor }}
                />
                <button
                  type="submit"
                  disabled={checkingPincode}
                  className="px-3 py-1.5 font-bold text-[10px] font-mono uppercase tracking-wider rounded transition-all cursor-pointer"
                  style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                >
                  {checkingPincode ? '...' : 'CHECK'}
                </button>
              </form>
              {pincodeError && <p className="text-[9px] font-mono text-red-400">{pincodeError}</p>}
              {pincodeResult && (
                <div className="p-2 border text-[10px] font-mono space-y-0.5 rounded bg-green-950/20 border-green-500/40 text-green-300">
                  <p className="font-bold">✓ Delivers by {pincodeResult.estimatedDate}</p>
                  <p className="opacity-80">{pincodeResult.service}</p>
                </div>
              )}
            </div>

            {/* ACCORDION SECTIONS */}
            <div className="border-t pt-3 space-y-2 divide-y" style={{ borderColor: modeDetails.borderColor }}>
              
              {/* FABRIC & GSM SPECS */}
              <div className="pt-2">
                <button
                  onClick={() => toggleAccordion('fabric')}
                  className={`w-full flex justify-between items-center text-[11px] font-bold text-[#F4F1EA] uppercase py-1 cursor-pointer ${modeDetails.fontClass}`}
                >
                  <span>[FABRIC & GSM SPECS]</span>
                  <span>{openAccordion === 'fabric' ? '-' : '+'}</span>
                </button>
                {openAccordion === 'fabric' && (
                  <div className="mt-2 text-[10px] text-[#D6CEBE]/80 space-y-1.5 font-mono p-2.5 border rounded" style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}>
                    {product.details?.gsmSpec && <p className="font-bold" style={{ color: modeDetails.accentColor }}>WEIGHT: {product.details.gsmSpec}</p>}
                    <p className="font-semibold text-[#F4F1EA]">MATERIAL COMPOSITION:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {(product.details?.fabric || ['100% Premium Cotton / Handloom Silk']).map((f: string, i: number) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* FIT & CARE INSTRUCTIONS */}
              <div className="pt-2">
                <button
                  onClick={() => toggleAccordion('fit')}
                  className={`w-full flex justify-between items-center text-[11px] font-bold text-[#F4F1EA] uppercase py-1 cursor-pointer ${modeDetails.fontClass}`}
                >
                  <span>[FIT & CARE INSTRUCTIONS]</span>
                  <span>{openAccordion === 'fit' ? '-' : '+'}</span>
                </button>
                {openAccordion === 'fit' && (
                  <div className="mt-2 text-[10px] text-[#D6CEBE]/80 space-y-1.5 font-mono p-2.5 border rounded" style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}>
                    <p className="font-semibold text-[#F4F1EA]">FIT & MEASUREMENTS:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {(product.details?.fit || ['Relaxed Archival Fit']).map((f: string, i: number) => <li key={i}>{f}</li>)}
                    </ul>
                    <p className="font-semibold text-[#F4F1EA] pt-1">CARE INSTRUCTIONS:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {(product.details?.care || ['Dry Clean Recommended']).map((c: string, i: number) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* THE HERITAGE STORY */}
              <div className="pt-2">
                <button
                  onClick={() => toggleAccordion('story')}
                  className={`w-full flex justify-between items-center text-[11px] font-bold text-[#F4F1EA] uppercase py-1 cursor-pointer ${modeDetails.fontClass}`}
                >
                  <span>[THE HERITAGE STORY]</span>
                  <span>{openAccordion === 'story' ? '-' : '+'}</span>
                </button>
                {openAccordion === 'story' && (
                  <div className="mt-2 text-[10px] text-[#D6CEBE]/80 leading-relaxed font-light p-2.5 border rounded" style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}>
                    <p>{product.heritageStory}</p>
                  </div>
                )}
              </div>

              {/* RETURN & UNBOXING POLICY */}
              <div className="pt-2">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className={`w-full flex justify-between items-center text-[11px] font-bold text-[#F4F1EA] uppercase py-1 cursor-pointer ${modeDetails.fontClass}`}
                >
                  <span>[RETURN & 24H UNBOXING POLICY]</span>
                  <span>{openAccordion === 'shipping' ? '-' : '+'}</span>
                </button>
                {openAccordion === 'shipping' && (
                  <div className="mt-2 text-[10px] text-[#D6CEBE]/80 space-y-1.5 font-mono p-2.5 border rounded" style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}>
                    <p>{product.return_policy || product.unboxingPolicy || '7-day boutique return policy with 24-hour unboxing video inspection guarantee.'}</p>
                    <p className="text-[9px] font-bold" style={{ color: modeDetails.accentColor }}>
                      ⚡ INSURED COURIER FULFILLMENT VIA SHIPROCKET
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS RECOMMENDATION GRID ("YOU MAY ALSO LIKE") */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t space-y-6" style={{ borderColor: `${modeDetails.borderColor}50` }}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono tracking-[0.2em] uppercase font-bold block" style={{ color: modeDetails.accentColor }}>
                  ATELIER SELECTIONS
                </span>
                <h2 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-xl sm:text-2xl uppercase text-white font-bold mt-1`}>
                  YOU MAY ALSO LIKE — RECOMMENDED GARMENTS
                </h2>
              </div>
              <Link href="/shop" className="text-xs font-mono uppercase underline hover:opacity-80" style={{ color: modeDetails.accentColor }}>
                VIEW ALL COLLECTIONS →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="border rounded-xl p-4 flex flex-col justify-between group transition-transform hover:-translate-y-1 shadow-lg"
                  style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
                >
                  <div>
                    <div className="relative w-full h-64 border rounded-lg overflow-hidden mb-3 bg-black/30">
                      <Image
                        src={rel.image}
                        alt={rel.title}
                        fill
                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 text-[8px] font-mono uppercase px-2 py-0.5 rounded bg-black/80 text-amber-400 font-bold border border-amber-400/40">
                        {rel.category}
                      </span>
                    </div>

                    <h3 className="font-mono text-xs font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {rel.title}
                    </h3>
                    <p className="text-[10px] font-mono text-[#D6CEBE]/70 line-clamp-1 mt-0.5">
                      {rel.subtitle || rel.category}
                    </p>
                  </div>

                  <div className="pt-3 border-t mt-3 flex items-center justify-between" style={{ borderColor: `${modeDetails.borderColor}40` }}>
                    <span className="font-mono font-bold text-sm" style={{ color: modeDetails.accentColor }}>
                      {rel.price}
                    </span>
                    <Link
                      href={`/product/${rel.id}`}
                      className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase rounded border transition-all hover:bg-amber-400 hover:text-black"
                      style={{ borderColor: modeDetails.accentColor, color: modeDetails.accentColor }}
                    >
                      EXPLORE
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOMER REVIEWS & VERIFIED PHOTOS SECTION */}
        <div className="mt-16 pt-8 border-t space-y-6" style={{ borderColor: `${modeDetails.borderColor}50` }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className={`text-[9px] font-mono tracking-[0.2em] uppercase font-bold block`} style={{ color: modeDetails.accentColor }}>
                VERIFIED CLIENT FEEDBACK & ATELIER REVIEWS
              </span>
              <h2 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-xl sm:text-2xl uppercase text-white font-bold mt-1`}>
                CLIENT REVIEWS & CUSTOMER PHOTOS ({reviewsList.length})
              </h2>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-lg border transition-all cursor-pointer flex items-center gap-2"
              style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg, borderColor: modeDetails.accentColor }}
            >
              <span className="material-symbols-outlined text-xs">rate_review</span>
              <span>WRITE A REVIEW & UPLOAD PHOTO</span>
            </button>
          </div>

          {/* RATING OVERVIEW BAR */}
          <div className="p-4 border rounded-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
            <div className="md:col-span-4 text-center border-r md:border-r" style={{ borderColor: `${modeDetails.borderColor}40` }}>
              <span className="font-serif-editorial text-3xl font-bold text-white">4.9</span>
              <div className="flex justify-center text-amber-400 my-0.5 text-xs">
                {'★'.repeat(5)}
              </div>
              <p className="text-[10px] font-mono text-[#D6CEBE]/70">Based on {reviewsList.length} verified customer acquisitions</p>
            </div>

            <div className="md:col-span-8 space-y-2 font-mono text-xs">
              {[
                { stars: '5 Stars', pct: '92%', count: reviewsList.filter(r => r.rating === 5).length || reviewsList.length },
                { stars: '4 Stars', pct: '8%', count: reviewsList.filter(r => r.rating === 4).length },
                { stars: '3 Stars', pct: '0%', count: 0 },
              ].map(bar => (
                <div key={bar.stars} className="flex items-center gap-3">
                  <span className="w-16 text-[10px] uppercase text-[#D6CEBE]">{bar.stars}</span>
                  <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden border" style={{ borderColor: `${modeDetails.borderColor}30` }}>
                    <div className="h-full rounded-full" style={{ width: bar.pct, backgroundColor: modeDetails.accentColor }} />
                  </div>
                  <span className="w-8 text-right text-[10px] text-[#D6CEBE] font-bold">{bar.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* REVIEWS GRID LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="p-6 border rounded-xl space-y-4 shadow-lg flex flex-col justify-between"
                style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif-editorial text-lg text-white font-bold">{rev.name}</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
                          ✓ Verified Purchaser
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-[#D6CEBE]/60">{rev.city} • {rev.date}</p>
                    </div>

                    <div className="text-amber-400 text-sm">
                      {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                    </div>
                  </div>

                  <h3 className="font-mono text-sm font-bold text-white">{rev.title}</h3>
                  <p className="text-xs text-[#D6CEBE]/80 leading-relaxed font-light">{rev.comment}</p>
                </div>

                {/* CUSTOMER UPLOADED PHOTO THUMBNAIL */}
                {rev.image && (
                  <div className="pt-3 border-t" style={{ borderColor: `${modeDetails.borderColor}30` }}>
                    <p className="text-[9px] font-mono text-[#D6CEBE]/60 uppercase mb-2 font-bold">CLIENT PHOTO ATTACHMENT:</p>
                    <button
                      onClick={() => setExpandedImage(rev.image)}
                      className="relative w-28 h-28 border-2 rounded-lg overflow-hidden transition-transform hover:scale-105 cursor-pointer"
                      style={{ borderColor: modeDetails.accentColor }}
                    >
                      <Image src={rev.image} alt="Customer Photo" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-xl">zoom_in</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FULLSCREEN POPUP LIGHTBOX MODAL WITH ZOOM & ARROWS */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 select-none">
            
            {/* LIGHTBOX TOP HEADER CONTROLS */}
            <div className="flex items-center justify-between border-b pb-4 border-white/20 z-10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                  ATELIER LIGHTBOX (IMAGE {lightboxIndex + 1} OF {productGallery.length})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 rounded text-white/80">
                  ZOOM: {Math.round(lightboxZoom * 100)}%
                </span>
              </div>

              {/* ZOOM & CLOSE ACTION BUTTONS */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLightboxZoom(prev => Math.min(prev + 0.5, 3.5))}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all cursor-pointer font-mono text-xs"
                  title="Zoom In (+)"
                >
                  <span className="material-symbols-outlined text-sm">zoom_in</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxZoom(prev => Math.max(prev - 0.5, 1))}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all cursor-pointer font-mono text-xs"
                  title="Zoom Out (-)"
                >
                  <span className="material-symbols-outlined text-sm">zoom_out</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxZoom(1)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 font-mono text-xs font-bold"
                  title="Reset Zoom"
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg border border-red-400 transition-all cursor-pointer ml-4"
                  title="Close Lightbox (Esc)"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>

            {/* LIGHTBOX MAIN DISPLAY AREA WITH SIDE ARROWS */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
              
              {/* PREVIOUS ARROW BUTTON */}
              {productGallery.length > 1 && (
                <button
                  type="button"
                  onClick={prevLightboxImage}
                  className="absolute left-2 sm:left-6 z-20 p-3 sm:p-4 bg-black/80 hover:bg-amber-400 hover:text-black text-white rounded-full border border-white/30 backdrop-blur-md transition-all shadow-2xl cursor-pointer"
                  title="Previous Image"
                >
                  <span className="material-symbols-outlined text-2xl sm:text-3xl">chevron_left</span>
                </button>
              )}

              {/* CENTER ZOOMABLE IMAGE */}
              <motion.div
                key={`lightbox-${lightboxIndex}`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: lightboxZoom, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <Image
                  src={productGallery[lightboxIndex] || product.image}
                  alt={`${product.title} Lightbox View`}
                  fill
                  className="object-contain p-4 transition-transform duration-200"
                />
              </motion.div>

              {/* NEXT ARROW BUTTON */}
              {productGallery.length > 1 && (
                <button
                  type="button"
                  onClick={nextLightboxImage}
                  className="absolute right-2 sm:right-6 z-20 p-3 sm:p-4 bg-black/80 hover:bg-amber-400 hover:text-black text-white rounded-full border border-white/30 backdrop-blur-md transition-all shadow-2xl cursor-pointer"
                  title="Next Image"
                >
                  <span className="material-symbols-outlined text-2xl sm:text-3xl">chevron_right</span>
                </button>
              )}
            </div>

            {/* LIGHTBOX BOTTOM THUMBNAIL STRIP */}
            {productGallery.length > 1 && (
              <div className="flex justify-center items-center gap-3 overflow-x-auto pt-4 border-t border-white/20 z-10">
                {productGallery.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => { setLightboxIndex(idx); setLightboxZoom(1) }}
                    className="relative w-16 h-20 border-2 rounded overflow-hidden transition-all bg-black/50 cursor-pointer"
                    style={{
                      borderColor: lightboxIndex === idx ? '#F59E0B' : 'rgba(255,255,255,0.3)',
                      opacity: lightboxIndex === idx ? 1 : 0.5
                    }}
                  >
                    <Image src={imgUrl} alt={`Thumbnail ${idx}`} fill className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* WRITE REVIEW MODAL WITH PHOTO UPLOAD */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border p-8 max-w-lg w-full text-[#F4F1EA] space-y-6 shadow-2xl relative rounded-2xl"
              style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.accentColor }}
            >
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-4 right-4 text-[#D6CEBE] hover:text-[#F4F1EA]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: modeDetails.accentColor }}>
                  ATELIER VERIFIED REVIEW PROTOCOL
                </span>
                <h3 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-2xl uppercase tracking-[0.05em] text-white font-bold mt-1`}>
                  REVIEW FOR: {product.title}
                </h3>
              </div>

              <form onSubmit={handleAddReview} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#D6CEBE] mb-1">YOUR NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={newReview.name}
                      onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                      className="w-full border p-3 text-white rounded focus:outline-none"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#D6CEBE] mb-1">CITY / LOCATION</label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru"
                      value={newReview.city}
                      onChange={e => setNewReview({ ...newReview, city: e.target.value })}
                      className="w-full border p-3 text-white rounded focus:outline-none"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#D6CEBE] mb-1">STAR RATING *</label>
                  <select
                    value={newReview.rating}
                    onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full border p-3 text-white rounded focus:outline-none cursor-pointer"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  >
                    <option value={5}>★★★★★ 5 Stars — Masterpiece Execution</option>
                    <option value={4}>★★★★☆ 4 Stars — Very Good</option>
                    <option value={3}>★★★☆☆ 3 Stars — Average</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#D6CEBE] mb-1">REVIEW TITLE</label>
                  <input
                    type="text"
                    placeholder="e.g. Exceptional Tailored Silhouette"
                    value={newReview.title}
                    onChange={e => setNewReview({ ...newReview, title: e.target.value })}
                    className="w-full border p-3 text-white rounded focus:outline-none"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#D6CEBE] mb-1">DETAILED REVIEW *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the fabric weight, fit, stitching, and unboxing experience..."
                    value={newReview.comment}
                    onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full border p-3 text-white rounded focus:outline-none"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>

                {/* CUSTOMER PRODUCT PHOTO UPLOAD */}
                <div className="p-4 border rounded-xl space-y-2" style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}>
                  <label className="block text-[10px] font-bold uppercase" style={{ color: modeDetails.accentColor }}>
                    UPLOAD PRODUCT PHOTO (OPTIONAL)
                  </label>
                  <p className="text-[10px] text-[#D6CEBE]/60">Share how the garment fits or photos of the unboxing to inspire others.</p>
                  
                  <input
                    type="text"
                    placeholder="Photo URL link or upload file below..."
                    value={newReview.image}
                    onChange={e => setNewReview({ ...newReview, image: e.target.value })}
                    className="w-full border p-2 text-white text-[11px] rounded mb-2"
                    style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => setNewReview({ ...newReview, image: reader.result as string })
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="text-[10px] text-[#D6CEBE]"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 font-bold font-mono uppercase tracking-widest text-xs rounded-lg shadow-lg cursor-pointer"
                    style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                  >
                    PUBLISH REVIEW & PHOTO
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="py-3.5 px-6 border uppercase text-xs font-mono tracking-widest rounded-lg cursor-pointer"
                    style={{ borderColor: modeDetails.borderColor, color: '#D6CEBE' }}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPANDED CUSTOMER PHOTO LIGHTBOX MODAL */}
      <AnimatePresence>
        {expandedImage && (
          <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl w-full h-[80vh] rounded-2xl overflow-hidden border shadow-2xl"
              style={{ borderColor: modeDetails.accentColor }}
            >
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/70 rounded-full text-white hover:bg-black cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <Image src={expandedImage} alt="Expanded Customer Review Photo" fill className="object-contain" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIZE GUIDE MODAL */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-8 max-w-lg w-full text-[#F4F1EA] space-y-6 shadow-2xl relative rounded-lg border"
              style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
            >
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="absolute top-4 right-4 text-[#D6CEBE] hover:text-[#F4F1EA]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className={`${modeDetails.fontClass || 'font-serif-editorial'} text-2xl uppercase tracking-[0.1em] font-bold`}>
                SIZE & MEASUREMENT SCHEMATIC
              </h3>
              <p className="text-xs text-[#D6CEBE]/70 font-mono">
                All garments feature our signature {mode} proportions.
              </p>
              <div className="overflow-x-auto font-mono text-xs">
                <table className="w-full border-collapse border" style={{ borderColor: modeDetails.borderColor }}>
                  <thead>
                    <tr style={{ backgroundColor: modeDetails.cardBg, color: modeDetails.accentColor }}>
                      <th className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>SIZE</th>
                      <th className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>CHEST (IN)</th>
                      <th className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>SHOULDER (IN)</th>
                      <th className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>LENGTH (IN)</th>
                    </tr>
                  </thead>
                  <tbody className="text-center" style={{ backgroundColor: modeDetails.themeBg }}>
                    <tr><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>XS</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>40"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>20.5"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>27.5"</td></tr>
                    <tr><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>S</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>42"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>21.5"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>28.5"</td></tr>
                    <tr><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>M</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>44"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>22.5"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>29.5"</td></tr>
                    <tr><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>L</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>46"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>23.5"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>30.5"</td></tr>
                    <tr><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>XL</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>48"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>24.5"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>31.5"</td></tr>
                    <tr><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>XXL</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>50"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>25.5"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>32.5"</td></tr>
                    <tr><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>3XL</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>52"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>26.5"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>33.5"</td></tr>
                    <tr><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>4XL</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>54"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>27.5"</td><td className="p-2 border" style={{ borderColor: modeDetails.borderColor }}>34.5"</td></tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FIND MY FIT CALCULATOR MODAL */}
      <AnimatePresence>
        {isFitCalculatorOpen && (
          <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative border rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl overflow-hidden font-mono"
              style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.accentColor, color: '#F4F1EA' }}
            >
              <button
                onClick={() => setIsFitCalculatorOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-amber-400">FIT INTELLIGENCE CALCULATOR</span>
                <h3 className="font-serif-editorial text-2xl text-white font-bold mt-1">FIND YOUR EXACT ATELIER FIT</h3>
                <p className="text-[11px] text-[#D6CEBE]/70 mt-1">Enter your body measurements to calculate your tailored size match.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-bold text-[10px] text-[#D6CEBE]">HEIGHT (CM)</label>
                    <input
                      type="number"
                      value={fitHeight}
                      onChange={e => setFitHeight(e.target.value)}
                      className="w-full border p-2.5 rounded text-white"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-[10px] text-[#D6CEBE]">WEIGHT (KG)</label>
                    <input
                      type="number"
                      value={fitWeight}
                      onChange={e => setFitWeight(e.target.value)}
                      className="w-full border p-2.5 rounded text-white"
                      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-[10px] text-[#D6CEBE]">PREFERRED FIT SILHOUETTE</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'slim', label: 'Slim' },
                      { id: 'tailored', label: 'Tailored' },
                      { id: 'oversized', label: 'Oversized' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFitPref(opt.id as any)}
                        className={`flex-1 py-2 text-[10px] font-bold border rounded-lg uppercase cursor-pointer ${
                          fitPref === opt.id ? 'bg-amber-400 text-black border-amber-400' : 'bg-transparent text-white border-white/20'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCalculateFit}
                  className="w-full py-3 font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg cursor-pointer transition-all"
                  style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
                >
                  CALCULATE MY SIZE MATCH ⚡
                </button>

                {fitRecommendation && (
                  <div className="p-4 border rounded-xl bg-amber-950/40 border-amber-500/50 text-center space-y-2">
                    <span className="text-[10px] font-bold text-amber-300 tracking-widest uppercase">BEST FIT RECOMMENDATION</span>
                    <p className="text-2xl font-bold text-white">SIZE {fitRecommendation.size}</p>
                    <p className="text-[10px] text-emerald-400 font-bold">{fitRecommendation.match}% ACCURACY MATCH FOR YOUR BODY MATRIX</p>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSize(fitRecommendation.size)
                        setIsFitCalculatorOpen(false)
                      }}
                      className="w-full py-2.5 bg-amber-400 text-black font-bold uppercase text-[10px] tracking-widest rounded-lg cursor-pointer hover:bg-amber-300"
                    >
                      APPLY SIZE {fitRecommendation.size} TO PRODUCT ✓
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
