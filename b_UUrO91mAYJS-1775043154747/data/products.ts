import { BrandMode } from '@/context/mode-context'

export interface Product {
  id: string
  title: string
  subtitle?: string
  price: string
  rawPrice: number
  mode: BrandMode
  category: 'Tees & Tops' | 'Hoodies & Outerwear' | 'Statement Archive' | 'Kurtas & Chudidhars' | 'Architectural Sarees' | 'Bottomwear'
  image: string
  gallery: string[]
  blueprintImage: string
  description: string
  gsm?: string
  details: {
    fabric: string[]
    care: string[]
    fit: string[]
    gsmSpec?: string
  }
  heritageStory: string
  unboxingPolicy: string
  rating: number
  reviews: number
  sizes: string[]
  inStock: boolean
  isFeatured?: boolean
  isLimitedDrop?: boolean
}

export const products: Product[] = [
  // --- STREETWEAR MODE ---
  {
    id: 'brutalist-heavyweight-polo',
    title: 'Brutalist Architectural Polo',
    subtitle: '320 GSM Comb Cotton & Ribbed Structure',
    price: '₹5,400',
    rawPrice: 5400,
    mode: 'streetwear',
    category: 'Tees & Tops',
    image: '/men_polo_green_re_1775057386696.png',
    gallery: [
      '/men_polo_green_re_1775057386696.png',
      '/men_linen_shirt_1775057312090.png'
    ],
    blueprintImage: '/media__1775056878622.png',
    description: 'Sculpted from 320 GSM combed organic jersey featuring structured ribbed cuffs, concealed snap collar, and low-key monochrome chest embroidery.',
    gsm: '320 GSM',
    details: {
      fabric: ['100% Organic Comb Cotton', 'Concealed Metal Collar Snap'],
      care: ['Machine Wash Cold Inside Out', 'Hang Dry In Shade'],
      fit: ['Relaxed Boxy Fit', 'Model is 6\'1" wearing size L'],
      gsmSpec: '320 GSM Heavy Jersey'
    },
    heritageStory: 'Takes structural inspiration from monolithic columns, translated into precise, minimal streetwear seam lines.',
    unboxingPolicy: 'Dispatched in signature obsidian packaging with 24-hour unboxing guarantee.',
    rating: 4.9,
    reviews: 38,
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    isFeatured: true
  },
  {
    id: 'monolith-slub-linen-shirt',
    title: 'Monolith Raw Slub Linen Overshirt',
    subtitle: 'Tactile Handloom Linen & Brass Hardware',
    price: '₹6,800',
    rawPrice: 6800,
    mode: 'streetwear',
    category: 'Tees & Tops',
    image: '/men_linen_shirt_1775057312090.png',
    gallery: [
      '/men_linen_shirt_1775057312090.png',
      '/men_polo_green_re_1775057386696.png'
    ],
    blueprintImage: '/media__1775056878533.png',
    description: 'Crafted from heavy 280 GSM hand-slubbed linen with oversized dual utility chest pockets and raw distressed edge detailing.',
    gsm: '280 GSM',
    details: {
      fabric: ['100% Handloom Slub Linen', 'Solid Antique Brass Fasteners'],
      care: ['Hand Wash Cold', 'Line Dry'],
      fit: ['Relaxed Layering Silhouette'],
      gsmSpec: '280 GSM Slub Linen'
    },
    heritageStory: 'Inspired by ancient South Indian raw cotton weaves updated for modern layered streetwear utility.',
    unboxingPolicy: 'Shipped with serial-numbered certificate card in raw dust cover.',
    rating: 4.8,
    reviews: 27,
    sizes: ['M', 'L', 'XL'],
    inStock: true
  },
  {
    id: 'architectural-tailored-trousers',
    title: 'Monolithic Pleated Cargo Trouser',
    subtitle: '340 GSM Heavy Wool Blend & Deep Pleats',
    price: '₹7,800',
    rawPrice: 7800,
    mode: 'streetwear',
    category: 'Bottomwear',
    image: '/men_trousers_grey_1775057332529.png',
    gallery: [
      '/men_trousers_grey_1775057332529.png'
    ],
    blueprintImage: '/media__1775056878737.png',
    description: 'High-waisted tailored trousers featuring deep inverted front pleats, hidden side adjustment tabs, and clean relaxed leg cut.',
    gsm: '340 GSM',
    details: {
      fabric: ['70% Fine Wool, 30% Organic Cotton', 'Interior Satin Waistband'],
      care: ['Dry Clean Recommended'],
      fit: ['Straight Wide Leg Cut']
    },
    heritageStory: 'Reinterprets classic tailoring proportions into brutalist, wide-leg street silhouettes.',
    unboxingPolicy: 'Delivered in rigid protective garment sleeve.',
    rating: 5.0,
    reviews: 19,
    sizes: ['30', '32', '34', '36'],
    inStock: true
  },

  // --- LUXURY ARCHIVE MODE ---
  {
    id: 'temple-pillar-silk-jacket',
    title: 'Varanasi Zari Monolith Bomber',
    subtitle: 'Limited Drop #04 / 50 Pieces Worldwide',
    price: '₹48,000',
    rawPrice: 48000,
    mode: 'archive',
    category: 'Statement Archive',
    image: '/media__1775044228708.png',
    gallery: [
      '/media__1775044228708.png',
      '/media__1775055568355.png',
      '/velvet_bandhgala.png'
    ],
    blueprintImage: '/media__1775056878821.png',
    description: 'Hand-woven Mulberry silk bomber lined with organic mulberry satin. Features 24kt gold-coated zari thread hand embroidery mapping the geometry of ancient temple ceilings.',
    details: {
      fabric: ['Pure Varanasi Mulberry Silk', 'Real 24kt Gold Thread Zari Inlay', 'Quilted Mulberry Satin Lining'],
      care: ['Specialist Dry Clean Only', 'Store in Cedar Wood Chest'],
      fit: ['Structured Tailored Fit', 'Model is 6\'2" wearing size 40R']
    },
    heritageStory: 'Handcrafted by 7th generation master weavers in Varanasi. Each coat requires over 180 hours of hand loom precision.',
    unboxingPolicy: 'Presented in handcrafted cedar wood box with brass engraved certificate of authenticity.',
    rating: 5.0,
    reviews: 18,
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    isFeatured: true,
    isLimitedDrop: true
  },
  {
    id: 'raw-silk-sculptural-blazer',
    title: 'Deep Olive Architectural Bandhgala',
    subtitle: 'Sculptural Shoulder & Raw Silk Weave',
    price: '₹36,500',
    rawPrice: 36500,
    mode: 'archive',
    category: 'Statement Archive',
    image: '/velvet_bandhgala.png',
    gallery: [
      '/velvet_bandhgala.png',
      '/men_suit_detail_1775057272428.png'
    ],
    blueprintImage: '/media__1775056878622.png',
    description: 'A dark olive hand-slubbed raw silk Bandhgala featuring a standing collar with hidden brass clasp fasteners and hand-carved horn buttons.',
    details: {
      fabric: ['100% Handloom Raw Silk', 'Cupro Bemberg Lining', 'Custom Horn Buttons'],
      care: ['Dry Clean Only', 'Steam Only'],
      fit: ['Sharp Architectural Shoulder', 'Model wearing size 38']
    },
    heritageStory: 'Modeled after royal court jackets of Mysore, simplified with razor-sharp modern tailoring lines.',
    unboxingPolicy: 'Shipped in custom luxury garment cover with brass hanger.',
    rating: 4.9,
    reviews: 22,
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: 'hand-painted-kalamkari-trench',
    title: 'Kalamkari Heritage Silk Duster',
    subtitle: 'Natural Botanical Dyes & Fine Silk',
    price: '₹42,000',
    rawPrice: 42000,
    mode: 'archive',
    category: 'Statement Archive',
    image: '/chanderi_tunic.png',
    gallery: [
      '/chanderi_tunic.png',
      '/women_hero_silk_1775057460998.png'
    ],
    blueprintImage: '/media__1775056878533.png',
    description: 'Hand-painted with bamboo pens using 100% natural madder root and indigo dyes on heavy mulberry silk. A living canvas of ancient mythological motifs.',
    details: {
      fabric: ['100% Mulberry Silk', 'Natural Organic Botanical Pigments'],
      care: ['Dry Clean Only', 'Keep Away From Direct UV Light'],
      fit: ['Flowing Floor-Length Silhouette', 'Free Size Belted Wrap']
    },
    heritageStory: 'Created in Srikalahasti using traditional 23-step Kalamkari pen drawing techniques passed down through generations.',
    unboxingPolicy: 'Includes hand-bound parchment scroll documenting the artisan family tree.',
    rating: 5.0,
    reviews: 14,
    sizes: ['S/M', 'L/XL'],
    inStock: true
  },

  // --- TRADITIONAL MODE ---
  {
    id: 'architectural-border-saree',
    title: 'Kanjeevaram Temple Border Saree',
    subtitle: 'Pure Mulberry Silk with Solid Gold Zari Border',
    price: '₹54,000',
    rawPrice: 54000,
    mode: 'traditional',
    category: 'Architectural Sarees',
    image: '/saree_1.png',
    gallery: [
      '/saree_1.png',
      '/saree_2.png',
      '/saree_3.png',
      '/saree_4.png'
    ],
    blueprintImage: '/media__1775056878821.png',
    description: 'An obsidian black Kanjeevaram silk saree woven with heavy gold zari borders featuring interlocking Gopuram temple pyramid motifs along the pallu.',
    details: {
      fabric: ['100% Pure Hand-loomed Kanjeevaram Silk', 'Pure Tested Gold Zari'],
      care: ['Dry Clean Only', 'Wrap in Pure White Muslin Fabric'],
      fit: ['Length: 6.3 Meters', 'Includes Unstitched Silk Blouse Piece']
    },
    heritageStory: 'The border incorporates the iconic Korvai weaving technique where border and body are woven separately and joined with hand precision.',
    unboxingPolicy: 'Delivered in hand-finished brass trim keepsake trunk with 24h unboxing guarantee.',
    rating: 5.0,
    reviews: 88,
    sizes: ['Free Size'],
    inStock: true,
    isFeatured: true
  },
  {
    id: 'sculptural-lehenga-set',
    title: 'Obsidian & Gold Zari Lehenga Set',
    subtitle: 'Architectural Flare & Dupatta',
    price: '₹62,000',
    rawPrice: 62000,
    mode: 'traditional',
    category: 'Architectural Sarees',
    image: '/miraya_lehenga.png',
    gallery: [
      '/miraya_lehenga.png',
      '/women_hero_silk_1775057460998.png'
    ],
    blueprintImage: '/media__1775056878737.png',
    description: 'A dramatic 16-kali flared lehenga skirt crafted from heavy raw silk with a hand-embroidered blouse and sheer organza dupatta.',
    details: {
      fabric: ['Raw Silk Skirt', 'Hand Embroidered Zardozi Blouse', 'Organza Dupatta'],
      care: ['Dry Clean Only'],
      fit: ['Custom Made Fit Available', 'High Waist Skirt Band']
    },
    heritageStory: 'Inspired by the concentric circle geometry of ancient step-wells (Baolis).',
    unboxingPolicy: 'Shipped in rigid garment trunk with satin padded hangers.',
    rating: 4.9,
    reviews: 35,
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: 'hand-woven-emerald-saree',
    title: 'Varanasi Emerald Handloom Silk Saree',
    subtitle: 'Pure Mulberry Silk & Authentic Silver Zari',
    price: '₹42,500',
    rawPrice: 42500,
    mode: 'traditional',
    category: 'Architectural Sarees',
    image: '/saree_2.png',
    gallery: [
      '/saree_2.png',
      '/saree_3.png'
    ],
    blueprintImage: '/media__1775056878821.png',
    description: 'Emerald green saree crafted from pure mulberry silk with fine hand-loomed gold and silver zari borders.',
    details: {
      fabric: ['100% Pure Mulberry Silk', 'Silver & Gold Zari Weave'],
      care: ['Dry Clean Only', 'Store in Muslin Cloth'],
      fit: ['Length: 6.2 Meters', 'Includes Unstitched Blouse Piece']
    },
    heritageStory: 'Hand-loomed in Varanasi incorporating heritage geometric motifs.',
    unboxingPolicy: 'Delivered in signature Friends of 4 luxury keepsake casing.',
    rating: 4.9,
    reviews: 45,
    sizes: ['Free Size'],
    inStock: true
  }
]
