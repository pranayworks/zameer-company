export interface Product {
  id: string
  title: string
  price: string
  image: string
  description: string
  details: {
    fabric: string[]
    care: string[]
    fit: string[]
  }
  rating: number
  reviews: number
  category: string
  colors?: { name: string, hex: string }[]
}

export const products: Product[] = [
  // FEATURED / HOME
  {
    id: 'hand-woven-silk-saree',
    title: 'Hand-woven Silk Saree',
    price: '₹42,500',
    image: '/saree_1.png',
    description: 'Emerald green saree with pure mulberry silk and gold zari borders. Handcrafted by master weavers in Varanasi, this piece embodies centuries of textile heritage.',
    details: {
      fabric: ['100% Pure Mulberry Silk', 'Authentic Gold & Silver Zari Inlay', 'Naturally Dyed Emerald Pigment'],
      care: ['Dry Clean Only', 'Store in Muslin Cloth', 'Avoid Direct Sunlight'],
      fit: ['One Size Fits All', 'Length: 6 Meters', 'Blouse Piece Included']
    },
    rating: 4.9,
    reviews: 124,
    category: 'Sarees',
    colors: [
      { name: 'Emerald', hex: '#046307' },
      { name: 'Ruby', hex: '#9b111e' },
      { name: 'Midnight', hex: '#191970' },
      { name: 'Gold', hex: '#d4af37' }
    ]
  },
  {
    id: 'ivory-chanderi-tunic',
    title: 'Ivory Chanderi Tunic',
    price: '₹18,500',
    image: '/chanderi_tunic.png',
    description: 'A delicate ivory Chanderi tunic featuring hand-blocked floral patterns and a soft cotton silk blend. Perfect for breezy editorial afternoons.',
    details: {
      fabric: ['Chanderi Silk Blend', 'Hand-blocked Prints', 'Organic Cotton Lining'],
      care: ['Hand Wash Cold', 'Gentle Steam', 'Store Separately'],
      fit: ['Relaxed Silhouette', 'Hits at Hip', 'Model is wearing size S']
    },
    rating: 5.0,
    reviews: 8,
    category: 'Women'
  },
  {
    id: 'temple-ruby-jhumkas',
    title: 'Temple Ruby Jhumkas',
    price: '₹82,000',
    image: '/ruby_jhumkas.png',
    description: 'Traditional temple jewellery handcrafted with 22kt gold and untreated Burmese rubies. A heirloom piece for the modern curator.',
    details: {
      fabric: ['22kt Hallmarked Gold', 'Untreated Burmese Rubies', 'Hand-linked Chain'],
      care: ['Store in Padded Box', 'Avoid Perfumes', 'Professional Polish Only'],
      fit: ['Weight: 45g', 'Length: 3 Inches', 'Secure Post Backing']
    },
    rating: 4.8,
    reviews: 24,
    category: 'Jewellery'
  },
  {
    id: 'miraya-lehenga-set',
    title: 'Miraya Lehenga Set',
    price: '₹12,200',
    image: '/miraya_lehenga.png',
    description: 'Contemporary lehenga set with a minimalist digital print and raw silk border. Designed for effortless movement and visual impact.',
    details: {
      fabric: ['Raw Silk Blend', 'Signature Digital Print', 'Lightweight Can-can'],
      care: ['Dry Clean Only', 'Steam Only', 'Hanger Storage Recommended'],
      fit: ['Adjustable Waistband', 'Calf Length', 'Fitted Bodice']
    },
    rating: 4.9,
    reviews: 15,
    category: 'Women'
  },

  // MEN
  {
    id: 'wool-blazer-charcoal',
    title: 'Midnight Charcoal Wool Blazer',
    price: '₹1,295',
    image: '/men_suit_detail_1775057272428.png',
    description: 'A sharp, tailored blazer crafted from premium Italian virgin wool. Features a slim-fit silhouette and natural horn buttons for a timeless editorial look.',
    details: {
      fabric: ['100% Virgin Wool', 'Satin Lining', 'Natural Horn Buttons'],
      care: ['Professional Dry Clean Only', 'Steam Only', 'Store on Wide Hanger'],
      fit: ['Tailored Slim Fit', 'Model is 6\'2" wearing size 40R', 'Adjustable Sleeves']
    },
    rating: 4.8,
    reviews: 24,
    category: 'Men'
  },
  {
    id: 'silk-kurta-embroidered',
    title: 'Chambray Silk Embroidered Kurta',
    price: '₹850',
    image: '/men_kurta_silk_1775057290350.png',
    description: 'Artisanal chambray silk kurta with hand-done tonal embroidery along the placket. A fusion of heritage craftsmanship and modern lifestyle.',
    details: {
      fabric: ['Chambray Silk', 'Tonal Hand Embroidery', 'Natural Shell Buttons'],
      care: ['Dry Clean Recommended', 'Low Iron', 'Store in Cool Place'],
      fit: ['Relaxed Straight Fit', 'Side Slits', 'Model is wearing size L']
    },
    rating: 4.8,
    reviews: 18,
    category: 'Men'
  },
  {
    id: 'linen-shirt-raw',
    title: 'Hand-Spun Raw Linen Shirt',
    price: '₹450',
    image: '/men_linen_shirt_1775057312090.png',
    description: 'Lightweight linen shirt woven on traditional handlooms. Features a natural raw texture and breathable weave for seasonal versatile wear.',
    details: {
      fabric: ['100% Hand-Spun Linen', 'Natural Dyes', 'Coconut Husk Buttons'],
      care: ['Machine Wash Gentle', 'Line Dry', 'Steam Only'],
      fit: ['Regular Fit', 'Curved Hem', 'Point Collar']
    },
    rating: 4.7,
    reviews: 32,
    category: 'Men'
  },
  {
    id: 'pleated-trousers-signature',
    title: 'Signature Pleated Trousers',
    price: '₹550',
    image: '/men_trousers_grey_1775057332529.png',
    description: 'High-waisted trousers with double pleats and an architectural taper. Crafted from luxury tropical wool for year-round comfort.',
    details: {
      fabric: ['Tropical Virgin Wool', 'Silk Blend Waistband', 'Signature Hardware'],
      care: ['Dry Clean Only', 'Steam Press', 'Specialized Wool Care'],
      fit: ['High Rise', 'Tapered Leg', 'Adjustable Side Tabs']
    },
    rating: 4.9,
    reviews: 15,
    category: 'Men'
  },
  {
    id: 'velvet-bandhgala-jacket',
    title: 'Velvet Tonal Bandhgala Jacket',
    price: '₹1,150',
    image: '/velvet_bandhgala.png',
    description: 'Luxe velvet bandhgala with subtle tonal embroidery. The ultimate statement of evening elegance and artisanal heritage.',
    details: {
      fabric: ['Premium Micro-Velvet', 'Silk Satin Lining', 'Gold Tipped Buttons'],
      care: ['Specialized Velvet Clean', 'Do Not Iron', 'Steam Infusion Only'],
      fit: ['Classic Bandhgala Fit', 'Padded Shoulders', 'Internal Passport Pocket']
    },
    rating: 5.0,
    reviews: 8,
    category: 'Men'
  },
  {
    id: 'cotton-polo-pique',
    title: 'Minimalist Cotton Piqué Polo',
    price: '₹225',
    image: '/men_polo_green_re_1775057386696.png',
    description: 'The definitive luxury polo crafted from extra-long staple Egyptian cotton. Features a refined piqué texture and clean, modernist collar.',
    details: {
      fabric: ['100% Giza Cotton', 'Two-Tone Piqué Weave', 'Reinforced Placket'],
      care: ['Cool Wash Only', 'Dry Flat', 'Avoid Bleach'],
      fit: ['Slim/Modern Fit', 'Ribbed Cuffs', 'Model is 6\'1" wearing size M']
    },
    rating: 4.6,
    reviews: 45,
    category: 'Men'
  },

  // WOMEN
  {
    id: 'silk-tunic-embroidered',
    title: 'Hand-Embroidered Silk Tunic',
    price: '₹795',
    image: '/women_tunic_embroidered_1775057478779.png',
    description: 'Bespoke silk tunic with intricate tonal embroidery. Features side slits and a clean, modernist neckline.',
    details: {
      fabric: ['100% Crepe de Chine Silk', 'Hand-done Tonal Embroidery', 'Natural Shell Buttons'],
      care: ['Dry Clean Recommended', 'Hand Wash Cold', 'Low Iron'],
      fit: ['Relaxed, Fluid Fit', 'Hits at Mid-Thigh', 'Size Down for Tailored Look']
    },
    rating: 4.9,
    reviews: 12,
    category: 'Women'
  },
  {
    id: 'silk-dress-grey',
    title: 'Asymmetric Drape Silk Dress',
    price: '₹1,150',
    image: '/women_silk_dress_grey_1775057498892.png',
    description: 'A sculptural masterpiece in liquidated silk. Features a bias-cut drape and asymmetric hemline for a fluid, editorial silhouette.',
    details: {
      fabric: ['Liquid Satin Silk', 'Unlined for Fluidity', 'Hand-rolled Hems'],
      care: ['Professional Dry Clean Only', 'Steam Only', 'Store Flat'],
      fit: ['Bias Cut (Molds to Body)', 'Midi Length', 'Adjustable Ties']
    },
    rating: 5.0,
    reviews: 7,
    category: 'Women'
  },
  {
    id: 'satin-blouse-silk',
    title: 'Satin-Stitched Silk Blouse',
    price: '₹425',
    image: '/women_blouse_satin_1775057521318.png',
    description: 'Essential luxury silk blouse with hand-done satin stitching. A versatile foundation piece for a curated wardrobe.',
    details: {
      fabric: ['Sand-washed Silk', 'Satin Stitching', 'Concealed Placket'],
      care: ['Hand Wash Only', 'Iron inside out', 'Gentle Detergent'],
      fit: ['Classic Regular Fit', 'Double Cuffs', 'Hits at Waist']
    },
    rating: 4.8,
    reviews: 21,
    category: 'Women'
  },
  {
    id: 'linen-trousers-sculpted',
    title: 'Sculpted Linen Trousers',
    price: '₹525',
    image: '/women_trousers_linen_1775057540379.png',
    description: 'Wide-leg trousers crafted from heavy organic linen. Features deep pleats and a structured drape.',
    details: {
      fabric: ['100% Organic Linen', 'Cotton Taping', 'Sustainable Hardware'],
      care: ['Machine Wash Cold', 'Line Dry', 'Steam Only'],
      fit: ['High Rise', 'Wide Leg', 'Extra Long Inseam']
    },
    rating: 4.7,
    reviews: 15,
    category: 'Women'
  },
  {
    id: 'floral-hand-wrap',
    title: 'Kashmiri Floral Hand Wrap',
    price: '₹650',
    image: '/women_floral_wrap_1775057559234.png',
    description: 'Hand-woven pashmina wrap with traditional Kashmiri floral motifs. Every piece tells its own story of heritage and time.',
    details: {
      fabric: ['100% Hand-loom Pashmina', 'Silk Tonal Embroidery', 'Natural Dyes'],
      care: ['Dry Clean Only', 'Store with Cedar', 'Avoid Abrasive Surfaces'],
      fit: ['Generous Size (2m x 1m)', 'Lightweight and Warm', 'Fringed Edges']
    },
    rating: 4.9,
    reviews: 9,
    category: 'Women'
  },
  {
    id: 'tailored-blazer-architectural',
    title: 'Architectural Tailored Blazer',
    price: '₹1,295',
    image: '/women_lookbook_editorial_1775057578055.png',
    description: 'A monochrome statement piece. Features sharp architectural shoulders and a cinched waist for a modern power-silhouette.',
    details: {
      fabric: ['Structured Wool Crepe', 'Silk Lining', 'Internal Shoulder Pads'],
      care: ['Specialized Dry Clean', 'Steam Only', 'Padded Hanger Storage'],
      fit: ['Cinched Waist', 'Exaggerated Shoulders', 'Single Button Closure']
    },
    rating: 4.8,
    reviews: 5,
    category: 'Women'
  },

  // SAREES
  {
    id: 'royal-banarasi-saree',
    title: 'The Royal Banarasi',
    price: '₹3,295',
    image: '/saree_1.png',
    description: 'A masterpiece of Banarasi weaving, featuring real silver zari and traditional motifs. A drape fit for royalty.',
    details: {
      fabric: ['Katan Silk', 'Real Silver Zari', 'Hand-twisted Yarn'],
      care: ['Dry Clean Only', 'Store in Muslin', 'Avoid Moisture'],
      fit: ['Unstitched Blouse Included', 'Width: 45 Inches', 'Standard 6 Yards']
    },
    rating: 5.0,
    reviews: 12,
    category: 'Sarees'
  },
  {
    id: 'temple-kanjivaram-saree',
    title: 'Temple Kanjivaram',
    price: '₹1,850',
    image: '/saree_2.png',
    description: 'Woven with gold-dipped threads, this Kanjivaram features temple borders and high-contrast silk panels.',
    details: {
      fabric: ['Mulberry Silk', 'Gold-dipped Zari', 'Warp-aligned Weave'],
      care: ['Dry Clean Recommended', 'Fold along Zari lines', 'Professional Polish'],
      fit: ['Heavy Drape', 'Rich Texture', 'Comes with Silk Mark']
    },
    rating: 4.9,
    reviews: 18,
    category: 'Sarees'
  },
  {
    id: 'gossamer-chanderi-saree',
    title: 'Gossamer Chanderi',
    price: '₹950',
    image: '/saree_3.png',
    description: 'Sheer, lightweight Chanderi with delicate hand-painted floral accents. The ultimate expression of summer grace.',
    details: {
      fabric: ['Chanderi Cotton-Silk', 'Hand-painted Accents', 'Sheer Weave'],
      care: ['Gentle Hand Wash', 'Do Not Wring', 'Cool Iron'],
      fit: ['Aereated Drape', 'Lightweight Feel', 'Ideal for Day Events']
    },
    rating: 4.8,
    reviews: 24,
    category: 'Sarees'
  },
  {
    id: 'floral-organza-saree',
    title: 'Floral Hand-Painted Organza',
    price: '₹1,295',
    image: '/saree_4.png',
    description: 'Crisp organza saree with bold hand-painted botanicals. A modernist take on traditional floral drapes.',
    details: {
      fabric: ['Premium Glass Organza', 'Hand-painted Flora', 'Satin Border'],
      care: ['Dry Clean Only', 'Store Roll-wrapped', 'Avoid Over-folding'],
      fit: ['Structured Drape', 'Translucent Frame', 'Model is wearing size S']
    },
    rating: 4.7,
    reviews: 15,
    category: 'Sarees'
  },

  // JEWELLERY
  {
    id: 'emerald-choker-equatorial',
    title: 'The Equatorial Emerald Choker',
    price: '₹12,500',
    image: '/emerald_choker.png',
    description: 'A stunning choker featuring Colombian emeralds set in 22kt hallmarked gold. A masterpiece of artisanal symmetry.',
    details: {
      fabric: ['22kt Gold', 'Colombian Emeralds', 'Baguette Diamonds'],
      care: ['Store in Padded Velvet', 'Professional Stone Check', 'Avoid Sweat/Water'],
      fit: ['Adjustable Fit', 'Contoured Neckline', 'Certified GIA Stones']
    },
    rating: 5.0,
    reviews: 5,
    category: 'Jewellery'
  },
  {
    id: 'heritage-kundan-pair',
    title: 'Heritage Kundan Pair',
    price: '₹4,250',
    image: '/kundan_pair.png',
    description: 'Traditional Bikaneri kundan earrings with meenakari work on the reverse. A timeless bridal essential.',
    details: {
      fabric: ['Pure Gold Foil', 'Natural Gemstones', 'Vitreous Enamel'],
      care: ['Avoid Direct Contact', 'Wipe with Dry Cloth', 'Professional Restoration'],
      fit: ['Weight: 22g each', 'Push Back Closure', 'Hand-drawn Inlay']
    },
    rating: 4.9,
    reviews: 12,
    category: 'Jewellery'
  },
  {
    id: 'jada-craft-choker',
    title: 'The Jada Craft: Heritage Choker',
    price: '₹8,500',
    image: '/jada_choker.png',
    description: 'Bespoke Jada craft choker featuring table-cut diamonds and natural Basra pearls. Heirloom quality craftsmanship.',
    details: {
      fabric: ['Old-cut Diamonds', 'Basra Pearls', '22kt Gold Base'],
      care: ['Store with Desiccant', 'Avoid Humidity', 'Signature Polish Only'],
      fit: ['Thread Closure', 'Neck Hugging Shape', 'Adjustable Width']
    },
    rating: 5.0,
    reviews: 3,
    category: 'Jewellery'
  },
  {
    id: 'diamond-pearl-stellar',
    title: 'Stellar Diamond & South Sea Pearls',
    price: '₹7,295',
    image: '/diamond_pearl.png',
    description: 'Contemporary jewelry set featuring brilliant-cut diamonds and creamy South Sea pearls. Modernist elegance.',
    details: {
      fabric: ['White Gold 18kt', 'VVS Diamonds', 'South Sea Pearls'],
      care: ['Avoid Hard Surfaces', 'Ultrasonic Clean Safe', 'Pearl Luster Wash'],
      fit: ['Lever Back Earrings', '45cm Chain Length', 'Symmetrical Pattern']
    },
    rating: 4.8,
    reviews: 18,
    category: 'Jewellery'
  },

  // KIDS
  {
    id: 'angrakha-silk-set-kids',
    title: 'Angrakha Silk Set',
    price: '₹595',
    image: '/kids_angrakha_set_1775057649911.png',
    description: 'A miniature masterpiece in royal silk. This Angrakha set features hand-stitched borders and soft cotton lining for maximum comfort.',
    details: {
      fabric: ['Pure Silk Outer', 'Hypoallergenic Organic Cotton Lining', 'Resin Button Hardware'],
      care: ['Hand Wash Only', 'Cool Iron', 'Store Flat'],
      fit: ['Junior Ease Fit', 'Adjustable Side Ties', 'Scaling: 2-10 Years']
    },
    rating: 4.9,
    reviews: 8,
    category: 'Kids'
  },
  {
    id: 'cloud-spun-cotton-set-kids',
    title: 'Cloud-spun Cotton Set',
    price: '₹350',
    image: '/kids_cloud_spun_set_1775057668249.png',
    description: 'Ultra-soft cloud-spun cotton set designed for daily luxury. Features breathable weave and reinforced seams for play.',
    details: {
      fabric: ['100% Cloud-spun Cotton', 'OEKO-TEX Certified Dyes', 'Soft-touch Finish'],
      care: ['Machine Wash Gentle', 'Tumble Dry Low', 'No Iron Necessary'],
      fit: ['Regular Play Fit', 'Elasticated Waistband', 'True to Size']
    },
    rating: 4.8,
    reviews: 14,
    category: 'Kids'
  },
  {
    id: 'herringbone-jacket-kids',
    title: 'Grey Herringbone Jacket',
    price: '₹495',
    image: '/kids_jacket.png',
    description: 'Architectural herringbone jacket scaled for the young curator. Features structured shoulders and wool-blend warmth.',
    details: {
      fabric: ['Wool Herringbone Blend', 'Satin Quilted Lining', 'Wood-effect Buttons'],
      care: ['Professional Dry Clean Only', 'Steam Only', 'Store on Child-sized Hanger'],
      fit: ['Smart Tailored Fit', 'Internal Name Label', 'Aged 4-12 Years']
    },
    rating: 4.7,
    reviews: 12,
    category: 'Kids'
  },
  {
    id: 'banarasi-silk-kurta-kids',
    title: 'Banarasi Silk Kurta',
    price: '₹450',
    image: '/kids_hero_traditional_1775057632107.png',
    description: 'Authentic Banarasi weave in a timeless kurta silhouette for children. A legacy piece for festive celebrations.',
    details: {
      fabric: ['Hand-loom Banarasi Silk', 'Silk Blend Lining', 'Gold Tonal Piping'],
      care: ['Dry Clean Recommended', 'Avoid Harsh Fold Lines', 'Store in Fabric Bag'],
      fit: ['Standard Festive Fit', 'Side Slits', 'Easy Neck Entry']
    },
    rating: 5.0,
    reviews: 6,
    category: 'Kids'
  }
]
