'use client'

import React from 'react'
import { useMode } from '@/context/mode-context'

export function TrustBadges() {
  const { modeDetails } = useMode()

  const guarantees = [
    {
      icon: 'verified_user',
      title: '100% AUTHENTIC HERITAGE',
      description: 'Handcrafted by 7th generation master weavers in Varanasi & Kanjeevaram.'
    },
    {
      icon: 'local_shipping',
      title: 'INSURED EXPRESS DELIVERY',
      description: 'Free Worldwide Express Shipping on all orders above ₹10,000.'
    },
    {
      icon: 'inventory_2',
      title: '24H UNBOXING POLICY',
      description: 'Hassle-free 24-hour instant unboxing replacement & insured returns.'
    },
    {
      icon: 'handshake',
      title: 'DIRECT-TO-CONSUMER',
      description: 'Zero middlemen markup. Pure artisanal direct luxury craftsmanship.'
    }
  ]

  return (
    <section 
      className="py-16 text-[#F4F1EA] border-y transition-colors duration-700 ease-in-out dark-paper-texture"
      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {guarantees.map((g, idx) => (
            <div 
              key={idx} 
              className="flex items-start space-x-4 p-4 border rounded-lg transition-all"
              style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
            >
              <span className="material-symbols-outlined text-3xl flex-shrink-0" style={{ color: modeDetails.accentColor }}>
                {g.icon}
              </span>
              <div>
                <h4 className="font-serif-editorial text-lg tracking-[0.05em] uppercase text-[#F4F1EA]">
                  {g.title}
                </h4>
                <p className="text-xs text-[#D6CEBE]/70 font-light mt-1 leading-relaxed">
                  {g.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

