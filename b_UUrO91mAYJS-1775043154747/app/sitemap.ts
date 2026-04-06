import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { products as staticProducts } from '@/data/products'

// Force dynamic rendering to ensure fresh data from Supabase
export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://friendsof4.in'

  let productUrls: any[] = []

  try {
    // 1. Try fetching from Supabase (Live Inventory)
    const { data: dbProducts } = await supabase
      .from('products')
      .select('id')
      .limit(1000)

    if (dbProducts && dbProducts.length > 0) {
      productUrls = dbProducts.map((p) => ({
        url: `${baseUrl}/product/${encodeURIComponent(p.id)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    } else {
      // 2. Fallback to static data if DB is empty or fails
      productUrls = staticProducts.map((p) => ({
        url: `${baseUrl}/product/${encodeURIComponent(p.id)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Sitemap DB Fetch Error:', error)
    // Fallback to static data on error
    productUrls = staticProducts.map((p) => ({
      url: `${baseUrl}/product/${encodeURIComponent(p.id)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  }

  const staticUrls = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/sarees`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/men`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/women`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/jewellery`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  return [...staticUrls, ...productUrls]
}
