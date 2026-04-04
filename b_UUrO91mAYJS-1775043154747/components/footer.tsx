'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Newsletter } from './newsletter'

const footerSections = [
  {
    title: 'Shop',
    links: ['Men', 'Women', 'Sarees', 'Jewellery', 'Accessories'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Press', 'Blog', 'Sustainability'],
  },
  {
    title: 'Support',
    links: ['Contact', 'FAQ', 'Shipping', 'Returns', 'Size Guide'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Sitemap'],
  },
]

const socialLinks = [
  { icon: 'facebook', label: 'Facebook' },
  { icon: 'X', label: 'Twitter' },
  { icon: 'instagram', label: 'Instagram' },
  { icon: 'pinterest', label: 'Pinterest' },
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
                      'Returns': '/legal/refund-policy',
                      'Shipping': '/legal/shipping-policy',
                      'Privacy Policy': '/legal/privacy-policy',
                      'Terms of Service': '/legal/terms-of-service',
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
                <Image src="/logo.png" alt="Friends of 4 Logo" width={32} height={32} className="object-contain invert brightness-0" />
                <p className="font-headline text-lg">Style of Tradition</p>
              </div>
              <p className="text-white/40 text-sm font-body">
                © {new Date().getFullYear()} Friends of 4. All rights reserved.
              </p>
            </div>

            {/* Social Links */}
            <motion.div
              className="flex gap-6 mt-6 md:mt-0"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href="#"
                  className="text-white/60 hover:text-white transition-colors"
                  variants={itemVariants}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {social.icon}
                  </span>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
