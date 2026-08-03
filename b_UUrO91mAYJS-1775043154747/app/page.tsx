'use client'

import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { CategoriesGrid } from '@/components/categories-grid'
import { FeaturedProducts } from '@/components/featured-products'
import { AboutSection } from '@/components/about-section'
import { WhyChooseUs } from '@/components/why-choose-us'
import { Footer } from '@/components/footer'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('type=recovery') || hash.includes('error_code=') || hash.includes('access_token=')) {
        router.push('/reset-password' + hash);
      }
    }
  }, [router]);

  return (
    <main className="w-full bg-[#fdf9f2]">
      <Header />
      <HeroSection />
      <FeaturedProducts />
      <AboutSection />
      <CategoriesGrid />
      <WhyChooseUs />
      <Footer />
    </main>
  )
}
