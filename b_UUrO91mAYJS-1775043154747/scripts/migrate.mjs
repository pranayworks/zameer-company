import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ziuqzoqwkbtpjbleoibj.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_mmGLuziB99Tw2hI2AsPqSg_OPfwqgRE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const fullProducts = [
  {
    id: 'brutalist-heavyweight-polo',
    title: 'Brutalist Architectural Polo',
    price: 5400,
    image: '/men_polo_green_re_1775057386696.png',
    image2: '/men_linen_shirt_1775057312090.png',
    description: 'Sculpted from 320 GSM combed organic jersey featuring structured ribbed cuffs and concealed metal collar snaps.',
    category: 'Men',
    stock: 50,
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: ['100% Organic Comb Cotton', 'Concealed Metal Collar Snap'],
    care: ['Machine Wash Cold Inside Out', 'Hang Dry In Shade'],
    fit: ['Relaxed Boxy Fit'],
    rating: 4.9,
    reviews: 38
  },
  {
    id: 'monolith-slub-linen-shirt',
    title: 'Monolith Raw Slub Linen Overshirt',
    price: 6800,
    image: '/men_linen_shirt_1775057312090.png',
    image2: '/men_polo_green_re_1775057386696.png',
    description: 'Crafted from heavy 280 GSM hand-slubbed linen with oversized dual utility chest pockets.',
    category: 'Men',
    stock: 30,
    sizes: ['M', 'L', 'XL'],
    fabric: ['100% Handloom Slub Linen', 'Solid Antique Brass Fasteners'],
    care: ['Hand Wash Cold', 'Line Dry'],
    fit: ['Relaxed Layering Silhouette'],
    rating: 4.8,
    reviews: 27
  },
  {
    id: 'architectural-tailored-trousers',
    title: 'Monolithic Pleated Cargo Trouser',
    price: 7800,
    image: '/men_trousers_grey_1775057332529.png',
    description: 'High-waisted tailored trousers featuring deep inverted front pleats and hidden side adjustment tabs.',
    category: 'Men',
    stock: 25,
    sizes: ['30', '32', '34', '36'],
    fabric: ['70% Fine Wool, 30% Organic Cotton'],
    care: ['Dry Clean Recommended'],
    fit: ['Straight Wide Leg Cut'],
    rating: 5.0,
    reviews: 19
  },
  {
    id: 'temple-pillar-silk-jacket',
    title: 'Varanasi Zari Monolith Bomber',
    price: 48000,
    image: '/media__1775044228708.png',
    image2: '/media__1775055568355.png',
    image3: '/velvet_bandhgala.png',
    description: 'Hand-woven Mulberry silk bomber lined with organic mulberry satin. Features 24kt gold-coated zari thread hand embroidery mapping the geometry of ancient temple ceilings.',
    category: 'Archive',
    stock: 15,
    sizes: ['M', 'L', 'XL'],
    fabric: ['Pure Varanasi Mulberry Silk', 'Real 24kt Gold Thread Zari Inlay'],
    care: ['Specialist Dry Clean Only', 'Store in Cedar Wood Chest'],
    fit: ['Structured Tailored Fit'],
    rating: 5.0,
    reviews: 18
  },
  {
    id: 'raw-silk-sculptural-blazer',
    title: 'Deep Olive Architectural Bandhgala',
    price: 36500,
    image: '/velvet_bandhgala.png',
    description: 'A dark olive hand-slubbed raw silk Bandhgala featuring a standing collar with hidden brass clasp fasteners and hand-carved horn buttons.',
    category: 'Archive',
    stock: 20,
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: ['100% Handloom Raw Silk', 'Custom Horn Buttons'],
    care: ['Dry Clean Only', 'Steam Only'],
    fit: ['Sharp Architectural Shoulder'],
    rating: 4.9,
    reviews: 22
  },
  {
    id: 'hand-painted-kalamkari-trench',
    title: 'Kalamkari Heritage Silk Duster',
    price: 42000,
    image: '/chanderi_tunic.png',
    description: 'Hand-painted with bamboo pens using 100% natural madder root and indigo dyes on heavy mulberry silk.',
    category: 'Women',
    stock: 12,
    sizes: ['S/M', 'L/XL'],
    fabric: ['100% Mulberry Silk', 'Natural Organic Botanical Pigments'],
    care: ['Dry Clean Only', 'Keep Away From Direct UV Light'],
    fit: ['Flowing Floor-Length Silhouette'],
    rating: 5.0,
    reviews: 14
  },
  {
    id: 'architectural-border-saree',
    title: 'Kanjeevaram Temple Border Saree',
    price: 54000,
    image: '/saree_1.png',
    image2: '/saree_2.png',
    image3: '/saree_3.png',
    description: 'An obsidian black Kanjeevaram silk saree woven with heavy gold zari borders featuring interlocking Gopuram temple pyramid motifs along the pallu.',
    category: 'Sarees',
    stock: 40,
    sizes: ['Free Size'],
    fabric: ['100% Pure Hand-loomed Kanjeevaram Silk', 'Pure Tested Gold Zari'],
    care: ['Dry Clean Only', 'Wrap in Pure White Muslin Fabric'],
    fit: ['Length: 6.3 Meters', 'Includes Unstitched Silk Blouse Piece'],
    rating: 5.0,
    reviews: 88
  },
  {
    id: 'sculptural-lehenga-set',
    title: 'Obsidian & Gold Zari Lehenga Set',
    price: 62000,
    image: '/miraya_lehenga.png',
    description: 'A dramatic 16-kali flared lehenga skirt crafted from heavy raw silk with a hand-embroidered blouse and sheer organza dupatta.',
    category: 'Women',
    stock: 18,
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: ['Raw Silk Skirt', 'Hand Embroidered Zardozi Blouse', 'Organza Dupatta'],
    care: ['Dry Clean Only'],
    fit: ['Custom Made Fit Available', 'High Waist Skirt Band'],
    rating: 4.9,
    reviews: 35
  },
  {
    id: 'hand-woven-silk-saree',
    title: 'Hand-woven Silk Saree',
    price: 42500,
    image: '/saree_1.png',
    description: 'Emerald green saree with pure mulberry silk and gold zari borders. Handcrafted by master weavers in Varanasi.',
    category: 'Sarees',
    stock: 50,
    sizes: ['One Size'],
    fabric: ['100% Pure Mulberry Silk', 'Authentic Gold & Silver Zari Inlay'],
    care: ['Dry Clean Only', 'Store in Muslin Cloth'],
    fit: ['One Size Fits All', 'Length: 6 Meters'],
    rating: 4.9,
    reviews: 124
  },
  {
    id: 'ivory-chanderi-tunic',
    title: 'Ivory Chanderi Tunic',
    price: 18500,
    image: '/chanderi_tunic.png',
    description: 'A delicate ivory Chanderi tunic featuring hand-blocked floral patterns and a soft cotton silk blend.',
    category: 'Women',
    stock: 25,
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: ['Chanderi Silk Blend', 'Hand-blocked Prints'],
    care: ['Hand Wash Cold', 'Gentle Steam'],
    fit: ['Relaxed Silhouette', 'Hits at Hip'],
    rating: 5.0,
    reviews: 8
  },
  {
    id: 'temple-ruby-jhumkas',
    title: 'Temple Ruby Jhumkas',
    price: 82000,
    image: '/ruby_jhumkas.png',
    description: 'Traditional temple jewellery handcrafted with 22kt gold and untreated Burmese rubies.',
    category: 'Jewellery',
    stock: 10,
    sizes: ['One Size'],
    fabric: ['22kt Hallmarked Gold', 'Untreated Burmese Rubies'],
    care: ['Store in Padded Box', 'Avoid Perfumes'],
    fit: ['Weight: 45g', 'Length: 3 Inches'],
    rating: 4.8,
    reviews: 24
  }
]

async function migrate() {
  console.log("🚀 Starting Full Catalog Database Migration...")
  const { data, error } = await supabase
    .from('products')
    .upsert(fullProducts, { onConflict: 'id' })

  if (error) {
    console.error("❌ Migration Failed:", error)
  } else {
    console.log(`✅ Success! ${fullProducts.length} Atelier Masterpieces synced to Supabase Cloud Database.`)
  }
}

migrate()
