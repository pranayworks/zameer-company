'use client'

import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { CategoriesGrid } from '@/components/categories-grid'
import { FeaturedProducts } from '@/components/featured-products'
import { AboutSection } from '@/components/about-section'
import { WhyChooseUs } from '@/components/why-choose-us'
import { Footer } from '@/components/footer'

export default function Home() {
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
