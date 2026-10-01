'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'

export function FloatingWhatsapp() {
  const whatsappUrl = "https://wa.me/919876543210?text=Hello%20Friends%20of%204%20Concierge,%20I%20have%20a%20question%20regarding%20a%20garment%20archival%20piece."

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#0F0F0F] text-[#F4F1EA] border border-[#A88434] p-3 shadow-2xl flex items-center space-x-3 rounded-full hover:bg-[#A88434] hover:text-[#0F0F0F] transition-all duration-300 group"
      aria-label="Contact Concierge on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 text-[#A88434] group-hover:text-[#0F0F0F] transition-colors stroke-[1.75]" />
      <span className="hidden sm:inline text-[10px] font-mono tracking-[0.2em] font-bold uppercase pr-2">
        CONCIERGE HELP
      </span>
    </a>
  )
}
