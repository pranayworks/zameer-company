
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ziuqzoqwkbtpjbleoibj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_mmGLuziB99Tw2hI2AsPqSg_OPfwqgRE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const products = [
  {
    id: 'hand-woven-silk-saree',
    title: 'Hand-woven Silk Saree',
    price: 42500,
    image: '/saree_1.png',
    description: 'Emerald green saree with pure mulberry silk and gold zari borders. Handcrafted by master weavers in Varanasi, this piece embodies centuries of textile heritage.',
    fabric: ['100% Pure Mulberry Silk', 'Authentic Gold & Silver Zari Inlay', 'Naturally Dyed Emerald Pigment'],
    care: ['Dry Clean Only', 'Store in Muslin Cloth', 'Avoid Direct Sunlight'],
    fit: ['One Size Fits All', 'Length: 6 Meters', 'Blouse Piece Included'],
    rating: 4.9,
    reviews: 124,
    category: 'Sarees',
    colors: [
      { name: 'Emerald', hex: '#046307' },
      { name: 'Ruby', hex: '#9b111e' },
      { name: 'Midnight', hex: '#191970' },
      { name: 'Gold', hex: '#d4af37' }
    ],
    sizes: ['One Size'],
    stock: 50
  },
  {
    id: 'ivory-chanderi-tunic',
    title: 'Ivory Chanderi Tunic',
    price: 18500,
    image: '/chanderi_tunic.png',
    description: 'A delicate ivory Chanderi tunic featuring hand-blocked floral patterns and a soft cotton silk blend. Perfect for breezy editorial afternoons.',
    fabric: ['Chanderi Silk Blend', 'Hand-blocked Prints', 'Organic Cotton Lining'],
    care: ['Hand Wash Cold', 'Gentle Steam', 'Store Separately'],
    fit: ['Relaxed Silhouette', 'Hits at Hip', 'Model is wearing size S'],
    rating: 5.0,
    reviews: 8,
    category: 'Women',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 25
  },
  {
    id: 'temple-ruby-jhumkas',
    title: 'Temple Ruby Jhumkas',
    price: 82000,
    image: '/ruby_jhumkas.png',
    description: 'Traditional temple jewellery handcrafted with 22kt gold and untreated Burmese rubies. A heirloom piece for the modern curator.',
    fabric: ['22kt Hallmarked Gold', 'Untreated Burmese Rubies', 'Hand-linked Chain'],
    care: ['Store in Padded Box', 'Avoid Perfumes', 'Professional Polish Only'],
    fit: ['Weight: 45g', 'Length: 3 Inches', 'Secure Post Backing'],
    rating: 4.8,
    reviews: 24,
    category: 'Jewellery',
    sizes: ['One Size'],
    stock: 10
  },
  {
      id: 'wool-blazer-charcoal',
      title: 'Midnight Charcoal Wool Blazer',
      price: 1295,
      image: '/men_suit_detail_1775057272428.png',
      description: 'A sharp, tailored blazer crafted from premium Italian virgin wool.',
      category: 'Men',
      sizes: ['38R', '40R', '42R', '44R'],
      stock: 15,
      fabric: ['100% Virgin Wool', 'Satin Lining'],
      rating: 4.8,
      reviews: 24
  }
]

async function migrate() {
  console.log("🚀 Starting Product Migration...")
  const { data, error } = await supabase
    .from('products')
    .upsert(products)

  if (error) {
    console.error("❌ Migration Failed:", error)
  } else {
    console.log("✅ Success! Products are now in the cloud.")
  }
}

migrate()
