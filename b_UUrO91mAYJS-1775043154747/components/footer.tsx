'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Newsletter } from './newsletter'

const footerSections = [
  {
    title: 'Shop',
    links: ['Men', 'Women', 'Sarees', 'Jewellery'],
  },
  {
    title: 'Company',
    links: ['About Us'],
  },
  {
    title: 'Support',
    links: ['Contact', 'FAQ', 'Shipping', 'Returns'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Sitemap'],
  },
]

const socialLinks = [
  { icon: 'brand_instagram', label: 'Instagram', href: 'https://www.instagram.com/friendsof4.in?igsh=MW9ybHV4aGY5OHExMw%3D%3D&utm_source=qr' },
  { icon: 'chat', label: 'WhatsApp', href: 'https://wa.me/919550447883?text=Greetings%20Friends%20of%204%20Atelier%2C%20I%20am%20interested%20in%20your%20latest%20collections%20and%20bespoke%20services.' },
]

export function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <footer className="bg-[#1c1b1b] text-white py-24 px-12">
      <div className="max-w-[1920px] mx-auto">
        {/* Newsletter Section */}
        <motion.div
          className="mb-20 pb-20 border-b border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="font-headline text-3xl mb-4 text-center">
            Stay Updated
          </h3>
          <p className="text-white/60 text-center mb-10 font-body">
            Subscribe to our newsletter for exclusive offers and new arrivals.
          </p>
          <Newsletter variant="footer" />
        </motion.div>

        {/* Footer Links */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {footerSections.map((section) => (
            <motion.div key={section.title} variants={itemVariants}>
              <h4 className="font-headline text-lg mb-6 text-white">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => {
                    const hrefMap: Record<string, string> = {
                      'Men': '/men',
                      'Women': '/women',
                      'Sarees': '/sarees',
                      'Jewellery': '/jewellery',
                      'Contact': '/contact',
                      'About Us': '/visionaries',
                      'Returns': '/legal/refund-policy',
                      'Shipping': '/legal/shipping-policy',
                      'Privacy Policy': '/legal/privacy-policy',
                      'Terms of Service': '/legal/terms-of-service',
                      'Cookie Policy': '/legal/cookie-policy',
                    }
                  const href = hrefMap[link] || '#'
                  
                  return (
                    <li key={link}>
                      <Link 
                        href={href}
                        className="text-white/60 font-body text-sm hover:text-white transition-colors duration-300 cursor-pointer block"
                      >
                        <motion.span
                          whileHover={{ x: 5, color: '#fff', display: 'inline-block' }}
                        >
                          {link}
                        </motion.span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Payment Trust Partners */}
        <div className="flex flex-wrap items-center gap-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700 pb-12 border-b border-white/5 mb-12">
           <span className="text-[10px] uppercase tracking-[0.4em] text-white/60 mb-2 md:mb-0">Atelier Trust</span>
           <div className="flex gap-8 items-center">
              <span className="font-headline text-2xl text-white tracking-widest italic select-none">RAZORPAY</span>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex gap-4">
                 <span className="material-symbols-outlined text-3xl">credit_card</span>
                 <span className="material-symbols-outlined text-3xl">account_balance</span>
                 <span className="material-symbols-outlined text-3xl">wallet</span>
              </div>
           </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-white/10 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image src="/logo.png" alt="Friends of 4 Logo" width={44} height={44} className="object-contain" />
                <div className="flex flex-col">
                  <p className="font-headline text-xl leading-none mb-1">Style Of Traditionals</p>
                  <p className="font-body text-[10px] text-white/50 uppercase tracking-widest leading-none">Friends of 4</p>
                </div>
              </div>
              <p className="text-white/40 text-[10px] font-body mt-4">
                © {new Date().getFullYear()} Friends of 4 Heritage. All rights reserved.
              </p>
            </div>

            <div className="flex gap-10 mt-6 md:mt-0">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.label === 'Instagram' ? 'hover:text-[#E4405F]' : 'hover:text-[#25D366]'} text-white/60 transition-all duration-300 flex items-center justify-center`}
                  aria-label={social.label}
                >
                  <motion.div
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {social.label === 'Instagram' && (
                      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.848 0-3.204.012-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.947.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    )}
                    {social.label === 'WhatsApp' && (
                      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.197 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.804 1.063 3.907 1.623 6.046 1.623h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
