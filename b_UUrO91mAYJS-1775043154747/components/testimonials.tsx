'use client'

import React from 'react'
import { useMode } from '@/context/mode-context'

export function Testimonials() {
  const { modeDetails } = useMode()

  const reviews = [
    {
      name: 'Aditya V. Sharma',
      city: 'Mumbai',
      mode: 'Streetwear Mode',
      piece: 'Gopuram Blueprint Oversized Tee (300 GSM)',
      comment: 'The weight of the 300 GSM fabric is unlike any Indian brand. The technical temple blueprint graphic on the back gets constant compliments at art galleries.'
    },
    {
      name: 'Radhika Mehra',
      city: 'Bengaluru',
      mode: 'Traditional Mode',
      piece: 'Kanjeevaram Temple Border Saree',
      comment: 'The Korvai weave gold zari border is pure heirloom quality. Delivered in a stunning foiled brass trim trunk within 48 hours.'
    },
    {
      name: 'Vikramaditya K.',
      city: 'New Delhi',
      mode: 'Luxury Archive Mode',
      piece: 'Varanasi Zari Monolith Bomber (#04/50)',
      comment: 'An absolute masterpiece. The 24kt gold zari hand embroidery maps ancient temple ceiling math flawlessly. True independent Indian luxury.'
    }
  ]

  const press = [
    { outlet: 'VOGUE INDIA', quote: 'Friends of 4 is redefining Indian D2C luxury through dravidian temple geometry.' },
    { outlet: 'GQ ARCHIVE', quote: 'Streetwear meets 450 GSM heavyweight architecture. A masterclass in tactile heritage.' },
    { outlet: 'ARCHITECTURAL DIGEST', quote: 'Every garment pleat maps a stone column capital.' }
  ]

  return (
    <section 
      className="py-24 text-[#F4F1EA] paper-texture border-t transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] tracking-[0.4em] uppercase font-semibold transition-colors duration-500" style={{ color: modeDetails.accentColor }}>
            CLIENT CURATIONS & PRESS RECOGNITION
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-5xl tracking-[0.08em] font-light uppercase text-[#F4F1EA] mt-2">
            VOICES OF FRIENDS OF 4
          </h2>
        </div>

        {/* PRESS STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 border-b pb-12" style={{ borderColor: modeDetails.borderColor }}>
          {press.map((p, idx) => (
            <div 
              key={idx} 
              className="text-center p-6 border shadow-lg space-y-2 rounded-lg"
              style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
            >
              <h4 className="font-serif-editorial text-xl font-bold tracking-[0.2em] text-[#F4F1EA]">
                {p.outlet}
              </h4>
              <p className="text-xs text-[#D6CEBE]/70 font-light italic leading-relaxed">
                "{p.quote}"
              </p>
            </div>
          ))}
        </div>

        {/* VERIFIED CUSTOMER REVIEWS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, idx) => (
            <div 
              key={idx} 
              className="p-8 space-y-4 flex flex-col justify-between shadow-lg transition-all rounded-lg border"
              style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}
            >
              <div className="space-y-2">
                <div className="flex" style={{ color: modeDetails.accentColor }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm">star</span>
                  ))}
                </div>
                <p className="text-xs text-[#D6CEBE]/80 font-light leading-relaxed">
                  "{r.comment}"
                </p>
              </div>

              <div className="border-t pt-4 font-mono text-[10px]" style={{ borderColor: modeDetails.borderColor }}>
                <p className="font-bold text-[#F4F1EA] uppercase">{r.name} • {r.city}</p>
                <p className="uppercase mt-0.5" style={{ color: modeDetails.accentColor }}>{r.piece}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

