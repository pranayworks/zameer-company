'use client'

import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { ThreeWorldEntry } from '@/components/three-world-entry'
import { FeaturedArchiveDrop } from '@/components/featured-archive-drop'
import { HeritageStoryTeaser } from '@/components/heritage-story-teaser'
import { TrustBadges } from '@/components/trust-badges'
import { Testimonials } from '@/components/testimonials'
import { Footer } from '@/components/footer'
import { FloatingWhatsapp } from '@/components/floating-whatsapp'
import { useMode } from '@/context/mode-context'

export default function HomePage() {
  const { modeDetails } = useMode()

  return (
    <main 
      className="min-h-screen text-[#F4F1EA] relative transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: modeDetails.themeBg }}
    >
      <Header />
      <HeroSection />
      <ThreeWorldEntry />
      <FeaturedArchiveDrop />
      <HeritageStoryTeaser />
      <TrustBadges />
      <Testimonials />
      <Footer />
      <FloatingWhatsapp />
    </main>
  )
}

