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
    links: ['About Us', 'Careers', 'Press', 'Blog', 'Sustainability'],
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
  { icon: 'brand_instagram', label: 'Instagram', href: 'INSTAGRAM_LINK_HERE' },
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

            <motion.div
              className="flex gap-8 mt-6 md:mt-0"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.label === 'Instagram' ? 'hover:text-[#E4405F]' : 'hover:text-[#25D366]'} text-white/60 transition-all duration-300`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  {social.label === 'Instagram' && (
                    <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.848 0-3.204.012-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.947.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  )}
                  {social.label === 'WhatsApp' && (
                    <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  )}
                </motion.a>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
