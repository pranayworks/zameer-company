'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'

const categories = [
  {
    label: 'Sarees',
    subtitle: 'Hand-Woven Royal Weaves',
    span: 'md:col-span-2 md:row-span-2',
    image: 'https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775435769/WhatsApp_Image_2026-04-06_at_5.29.54_AM_zwgfzd.jpg',
    href: '/sarees'
  },
  {
    label: 'Men',
    subtitle: 'Heritage Sherwanis & Suits',
    span: 'md:col-span-1',
    image: 'https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775435764/WhatsApp_Image_2026-04-05_at_11.59.05_PM_do85la.jpg',
    href: '/men'
  },
  {
    label: 'Women',
    subtitle: 'Contemporary Couture Fits',
    span: 'md:col-span-1',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9VoBDh4cqMX3bZppNViUM94vSy6jLOVdkVE4uP9o61H6_Jp9hnVHvP5WDMTOBuCgRC9Y_GQ_QnRk0qH01bxvBfzXjo4-xNrKGEYT_UwksRnae3jkRIrbbAfR-hMei1Yr_zsM6qcsdI74X1v_BYQbOAAVwEE5tHBOqsvqRE-o8PmDBih9hWGLIIDryhTWnVLP-1068D6R_LAZunU_CTbamyFS9uUaAd-wpbppk0bnHCxG-k0f5uuITPxkdetAn22c8mpQzwcbBHl8J',
    href: '/women'
  },
  {
    label: 'Jewellery',
    subtitle: 'Temple Rubies & Statement Chokers',
    span: 'md:col-span-2',
    image: 'https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775435771/WhatsApp_Image_2026-04-05_at_9.50.14_PM_dg9fjw.jpg',
    href: '/jewellery'
  },
]

export function CategoriesGrid() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <section id="categories" ref={ref} className="py-20 md:py-32 px-6 md:px-12 max-w-[1920px] mx-auto bg-[#FAF7F2] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="mb-14 md:mb-20 flex flex-col items-center text-center"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 mb-3">
          <span className="text-gold-gradient font-body uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold">
            Curated Collections
          </span>
        </div>
        <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-[#12131A] tracking-tight font-bold">
          Explore By <span className="text-gold-gradient italic font-serif">Category</span>
        </h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[920px]"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {categories.map((category) => (
          <Link 
            key={category.label} 
            href={category.href}
            className={`${category.span} group relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_50px_rgba(212,175,55,0.2)] transition-all duration-700 cursor-pointer block h-[380px] md:h-full`}
          >
            <motion.div
              className="w-full h-full relative"
              variants={itemVariants}
            >
              <Image
                src={category.image}
                alt={category.label}
                fill
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10]/90 via-[#0B0C10]/30 to-transparent group-hover:from-[#0B0C10]/95 transition-all duration-500" />
              
              <div className="absolute bottom-8 left-8 right-8 z-10">
                <span className="text-[#F3E5AB] font-body uppercase tracking-[0.25em] text-[10px] font-bold block mb-1">
                  {category.subtitle || 'Exclusive Piece'}
                </span>
                <div className="flex justify-between items-center">
                  <h3 className="font-headline text-3xl md:text-4xl text-white font-bold tracking-tight">
                    {category.label}
                  </h3>
                  <div className="w-10 h-10 rounded-full gold-satin text-[#0B0C10] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </section>
  )
}

