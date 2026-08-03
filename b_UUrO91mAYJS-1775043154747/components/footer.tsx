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
  { icon: 'chat', label: 'WhatsApp', href: 'https://wa.me/919550447883?text=Greetings%20Friends%20of%204%2C%20I%20have%20a%20query%20regarding%20an%20order%20or%20product.' },
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
    <footer className="bg-[#0B0C10] text-white py-24 px-6 md:px-12 border-t border-[#D4AF37]/20 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-[1920px] mx-auto relative z-10">
        {/* Newsletter Section */}
        <motion.div
          className="mb-20 pb-20 border-b border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-gold-gradient font-body uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold block mb-3">ATELIER DISPATCHES</span>
            <h3 className="font-headline text-3xl md:text-4xl font-extrabold mb-4 text-white">
              Stay Connected To The <span className="text-gold-gradient italic font-serif">Heritage</span>
            </h3>
            <p className="text-white/60 font-body text-xs md:text-sm mb-10 font-light leading-relaxed">
              Subscribe to receive private invitations to new capsule releases, master artisan stories, and exclusive trunk show events.
            </p>
          </div>
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
              <h4 className="font-headline text-xl mb-6 text-white font-bold tracking-tight border-b border-[#D4AF37]/30 pb-2 inline-block">
                {section.title}
              </h4>
              <ul className="space-y-3.5">
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
                        className="text-white/60 font-body text-xs md:text-sm hover:text-[#D4AF37] transition-colors duration-300 cursor-pointer block"
                      >
                        <motion.span
                          whileHover={{ x: 4, color: '#D4AF37', display: 'inline-block' }}
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
        <div className="flex flex-wrap items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-all duration-700 pb-12 border-b border-white/10 mb-12">
           <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-bold">Encrypted Atelier Checkout</span>
           <div className="flex gap-8 items-center">
              <span className="font-headline text-2xl text-white tracking-widest italic font-bold select-none">RAZORPAY</span>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex gap-4 text-white/80">
                 <span className="material-symbols-outlined text-2xl">credit_card</span>
                 <span className="material-symbols-outlined text-2xl">account_balance</span>
                 <span className="material-symbols-outlined text-2xl">wallet</span>
                 <span className="material-symbols-outlined text-2xl">lock</span>
              </div>
           </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="pt-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative w-10 h-10 shrink-0 p-1 bg-white rounded-full border border-[#D4AF37]/40 shadow-md">
                  <Image src="/logo.png" alt="Friends of 4 Logo" fill className="object-contain p-1" />
                </div>
                <div className="flex flex-col">
                  <p className="font-headline text-xl leading-none mb-1 font-bold text-white">Style Of Traditionals</p>
                  <p className="font-body text-[9px] text-[#D4AF37] uppercase tracking-[0.25em] font-bold leading-none">Friends of 4 Atelier</p>
                </div>
              </div>
              <p className="text-white/40 text-[10px] font-body mt-3">
                © {new Date().getFullYear()} Friends of 4 Heritage. All rights reserved. Handcrafted in India.
              </p>
            </div>

            <div className="flex gap-8">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.label === 'Instagram' ? 'hover:text-[#E4405F]' : 'hover:text-[#25D366]'} text-white/70 transition-all duration-300 flex items-center justify-center p-2 bg-white/5 rounded-full border border-white/10 hover:border-[#D4AF37]`}
                  aria-label={social.label}
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {social.label === 'Instagram' && (
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.848 0-3.204.012-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.947.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    )}
                    {social.label === 'WhatsApp' && (
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
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
