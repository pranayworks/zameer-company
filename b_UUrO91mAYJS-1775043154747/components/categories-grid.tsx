'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'

const categories = [
  {
    label: 'Sarees',
    subtitle: 'Traditional Craftsmanship',
    span: 'md:col-span-2 md:row-span-2',
    image: 'https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775435769/WhatsApp_Image_2026-04-06_at_5.29.54_AM_zwgfzd.jpg',
    href: '/sarees'
  },
  {
    label: 'Men',
    span: 'md:col-span-1',
    image: 'https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775435764/WhatsApp_Image_2026-04-05_at_11.59.05_PM_do85la.jpg',
    href: '/men'
  },
  {
    label: 'Women',
    span: 'md:col-span-1',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9VoBDh4cqMX3bZppNViUM94vSy6jLOVdkVE4uP9o61H6_Jp9hnVHvP5WDMTOBuCgRC9Y_GQ_QnRk0qH01bxvBfzXjo4-xNrKGEYT_UwksRnae3jkRIrbbAfR-hMei1Yr_zsM6qcsdI74X1v_BYQbOAAVwEE5tHBOqsvqRE-o8PmDBih9hWGLIIDryhTWnVLP-1068D6R_LAZunU_CTbamyFS9uUaAd-wpbppk0bnHCxG-k0f5uuITPxkdetAn22c8mpQzwcbBHl8J',
    href: '/women'
  },

  {
    label: 'Jewellery',
    span: 'md:col-span-2',
    image: 'https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775435771/WhatsApp_Image_2026-04-05_at_9.50.14_PM_dg9fjw.jpg',
    href: '/jewellery'
  },
]

export function CategoriesGrid() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="categories" ref={ref} className="py-16 md:py-24 px-6 md:px-12 max-w-[1920px] mx-auto bg-[#f7f3ec]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-12 md:mb-16 flex flex-col items-center"
      >
        <span className="font-body uppercase tracking-widest text-[10px] md:text-xs text-[#735c00] mb-2 block">
          Curated Collections
        </span>
        <h2 className="font-headline text-3xl md:text-4xl text-[#1c1b1b] italic text-center">
          Shop by Category
        </h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6 h-auto md:h-[900px]"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {categories.map((category, index) => (
          <Link 
            key={category.label} 
            href={category.href}
            className={`${category.span} group relative overflow-hidden bg-[#e6e2db] cursor-pointer block`}
          >
            <motion.div
              className="w-full h-full relative"
              variants={itemVariants}
            >
              <Image
                src={category.image}
                alt={category.label}
                fill
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <motion.div
                className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"
                initial={{ opacity: 0.2 }}
                whileHover={{ opacity: 0.4 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute bottom-10 left-10"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-headline text-3xl text-white">
                  {category.label}
                </h3>
                {category.subtitle && (
                  <p className="text-white/80 font-body uppercase tracking-widest text-xs mt-2">
                    {category.subtitle}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </section>
  )
}
