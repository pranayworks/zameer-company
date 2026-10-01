'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useMode, BrandMode } from '@/context/mode-context'
import { fetchAllProducts, fetchAllOrders, Product, Order } from '@/lib/admin-helpers'

export interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: string
  options?: { label: string; action: string; payload?: any }[]
  products?: Product[]
  orderResult?: Order
  actionUrl?: { label: string; url: string }
}

export function BujjiChatbot() {
  const router = useRouter()
  const { mode, setMode, modeDetails } = useMode()

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [productsList, setProductsList] = useState<Product[]>([])
  const [ordersList, setOrdersList] = useState<Order[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initial welcome message from Bujji
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: "Hey! 👋 I'm Bujji, your Friends of 4 Atelier AI Companion. How can I assist your luxury experience today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: [
        { label: '🛍️ Browse Collections / Need a Product', action: 'browse_collections' },
        { label: '📦 Order Query / Track Order', action: 'track_order_prompt' },
        { label: '💡 Style & Mode Suggestions', action: 'style_suggestions' },
        { label: '📩 Contact & Atelier Support', action: 'contact_support' },
        { label: '💬 Chat via WhatsApp', action: 'whatsapp_chat' },
      ],
    },
  ])

  // Load products and orders on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prods, ords] = await Promise.all([fetchAllProducts(), fetchAllOrders()])
        setProductsList(prods)
        setOrdersList(ords)
      } catch (err) {
        console.warn('Bujji data init error:', err)
      }
    }
    loadData()
  }, [])

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping])

  const addBotMessage = (
    text: string,
    options?: { label: string; action: string; payload?: any }[],
    products?: Product[],
    orderResult?: Order,
    actionUrl?: { label: string; url: string }
  ) => {
    setIsTyping(true)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options,
          products,
          orderResult,
          actionUrl,
        },
      ])
      setIsTyping(false)
    }, 600)
  }

  const addUserMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  // Handle Option Click
  const handleOptionClick = (option: { label: string; action: string; payload?: any }) => {
    addUserMessage(option.label)

    switch (option.action) {
      case 'browse_collections':
        addBotMessage(
          'Which brand ecosystem would you like to explore today? Select a mode below to view curated masterpieces:',
          [
            { label: '⚡ Streetwear Mode (Tees, Hoodies & Cargos)', action: 'select_mode', payload: 'streetwear' },
            { label: '🏛️ Luxury Archive Mode (24kt Zari Vault & Jackets)', action: 'select_mode', payload: 'archive' },
            { label: '🪔 Traditional Mode (Kanjeevaram Sarees & Silk Kurtas)', action: 'select_mode', payload: 'traditional' },
          ]
        )
        break

      case 'select_mode':
        const targetMode = option.payload as BrandMode
        setMode(targetMode)
        const modeTitle = targetMode === 'streetwear' ? 'STREETWEAR' : targetMode === 'traditional' ? 'TRADITIONAL' : 'LUXURY ARCHIVE'
        
        const modeProducts = productsList.filter(p => {
          if (targetMode === 'streetwear') return p.mode === 'streetwear' || p.category === 'Tees & Tops' || p.category === 'Hoodies & Outerwear'
          if (targetMode === 'traditional') return p.mode === 'traditional' || p.category === 'Architectural Sarees' || p.category === 'Kurtas & Chudidhars'
          return p.mode === 'archive' || p.category === 'Statement Archive'
        }).slice(0, 4)

        addBotMessage(
          `✨ Switched active website theme to **${modeTitle} MODE**!\n\nHere are top highlighted creations from this collection:`,
          [
            { label: '🔍 View All Products in Shop', action: 'go_to_shop' },
            { label: '❓ Ask Another Query', action: 'reset_menu' }
          ],
          modeProducts
        )
        break

      case 'go_to_shop':
        router.push('/')
        setIsOpen(false)
        break

      case 'track_order_prompt':
        addBotMessage(
          '📦 Please type your Order ID (e.g. 8849 or ORD-8849) or your Phone Number in the chat below, and I will search our logistics records for you instantly!'
        )
        break

      case 'style_suggestions':
        addBotMessage(
          '💡 Friends of 4 Atelier Styling Guide:\n\n' +
          '• **Streetwear**: Pair our 320 GSM Brutalist Architectural Polo with Pleated Cargo Trousers for structured silhouette balance.\n' +
          '• **Traditional**: Kanjeevaram Mulberry Silk Saree draped with raw gold zari border for grand evening occasions.\n' +
          '• **Archive**: Limited edition Varanasi Zari Bomber paired with monochrome tailored trousers.\n\n' +
          'Need specific sizing guidance or fabric composition advice?',
          [
            { label: '👕 Size Guide & Fabric Specs', action: 'size_guide' },
            { label: '🛍️ Browse Collections', action: 'browse_collections' }
          ]
        )
        break

      case 'size_guide':
        addBotMessage(
          '📏 **Sizing & Garment Fit Guide**:\n\n' +
          '• **Streetwear Tops**: Cut for a contemporary oversized, drop-shoulder relaxed boxy fit. Order your true size for relaxed style, or one size down for tailored fit.\n' +
          '• **Traditional Sarees**: 6.2 - 6.3 meters featuring unstitched raw silk blouse pieces.\n' +
          '• **Archive Pieces**: Precision structured shoulder cuts tailored to European luxury standards.\n\n' +
          'All garments feature a 7-day boutique exchange guarantee.'
        )
        break

      case 'contact_support':
        addBotMessage(
          '📩 **Friends of 4 Atelier Direct Customer Assistance**:\n\n' +
          'Our customer concierge team is available 24/7 to resolve any questions or custom order requests.\n\n' +
          '📞 **Direct Phone**: +91 9550447883\n' +
          '✉️ **Official Email**: friendsof4.support@gmail.com\n' +
          '📍 **Address**: Bengaluru & Varanasi Atelier Headquarters',
          [
            { label: '💬 Chat on WhatsApp (+91 9550447883)', action: 'whatsapp_chat' },
            { label: '📍 Visit Official Contact Page', action: 'go_contact_page' }
          ]
        )
        break

      case 'go_contact_page':
        router.push('/contact')
        setIsOpen(false)
        break

      case 'whatsapp_chat':
        window.open('https://wa.me/919550447883?text=Hi%20Bujji%2C%20I%20need%20help%20with%20a%20Friends%20of%204%20order%20or%20product.', '_blank')
        break

      case 'reset_menu':
        addBotMessage(
          'What else can I assist you with today?',
          [
            { label: '🛍️ Browse Collections / Need a Product', action: 'browse_collections' },
            { label: '📦 Order Query / Track Order', action: 'track_order_prompt' },
            { label: '💡 Style & Mode Suggestions', action: 'style_suggestions' },
            { label: '📩 Contact & Atelier Support', action: 'contact_support' },
            { label: '💬 Chat via WhatsApp', action: 'whatsapp_chat' },
          ]
        )
        break

      default:
        break
    }
  }

  // Handle Freeform Text Message Submission
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputValue.trim()) return

    const userText = inputValue.trim()
    addUserMessage(userText)
    setInputValue('')

    const lower = userText.toLowerCase()

    // 1. Order Tracking Check (e.g. 8849, ORD-8849, or 10-digit phone)
    const orderMatch = lower.match(/(?:ord-)?(\d{3,10})/)
    if (orderMatch || lower.includes('track') || lower.includes('status') || lower.includes('where is my order')) {
      const searchNum = orderMatch ? orderMatch[1] : ''
      const foundOrder = ordersList.find(o => 
        String(o.order_id).includes(searchNum) || 
        String(o.id).includes(searchNum) || 
        String(o.phone).includes(searchNum)
      )

      if (foundOrder) {
        addBotMessage(
          `📦 **Order Found!**\n\n` +
          `• **Order ID**: ORD-${foundOrder.order_id}\n` +
          `• **Customer**: ${foundOrder.customer_name}\n` +
          `• **Item**: ${foundOrder.product_name} (${foundOrder.size || 'M'})\n` +
          `• **Status**: ${foundOrder.order_status?.toUpperCase() || 'PREPARING'}\n` +
          `• **Total**: ₹${(foundOrder.price || 0).toLocaleString('en-IN')}`,
          [
            { label: '🚚 Open Detailed Live Tracking Page', action: 'go_tracking' },
            { label: '📩 Contact Support for this Order', action: 'contact_support' }
          ],
          undefined,
          foundOrder
        )
        return
      } else if (searchNum.length >= 3) {
        addBotMessage(
          `🔍 I searched our records for Order / Phone containing **${searchNum}**, but could not locate an active order.\n\n` +
          `Please verify the Order ID or reach out to our team directly:`,
          [
            { label: '📞 Call Atelier Support (+91 9550447883)', action: 'contact_support' },
            { label: '💬 Chat on WhatsApp', action: 'whatsapp_chat' }
          ]
        )
        return
      }
    }

    // 2. Product Categories Search
    if (lower.includes('tee') || lower.includes('tshirt') || lower.includes('t-shirt') || lower.includes('polo') || lower.includes('streetwear')) {
      const matchProds = productsList.filter(p => p.category === 'Tees & Tops' || p.mode === 'streetwear').slice(0, 4)
      addBotMessage(
        '⚡ Here are our top Heavyweight Streetwear Tees & Tops:',
        [{ label: '🔍 Explore Streetwear Catalog', action: 'select_mode', payload: 'streetwear' }],
        matchProds
      )
      return
    }

    if (lower.includes('saree') || lower.includes('traditional') || lower.includes('kurta') || lower.includes('silk')) {
      const matchProds = productsList.filter(p => p.category === 'Architectural Sarees' || p.mode === 'traditional').slice(0, 4)
      addBotMessage(
        '🪔 Here are our finest Hand-loomed Kanjeevaram Sarees & Silk creations:',
        [{ label: '🔍 Explore Traditional Catalog', action: 'select_mode', payload: 'traditional' }],
        matchProds
      )
      return
    }

    if (lower.includes('archive') || lower.includes('jacket') || lower.includes('bomber') || lower.includes('zari') || lower.includes('gold')) {
      const matchProds = productsList.filter(p => p.category === 'Statement Archive' || p.mode === 'archive').slice(0, 4)
      addBotMessage(
        '🏛️ Here are our 24kt Gold Zari Vault & Statement Archive Pieces:',
        [{ label: '🔍 Explore Luxury Archive Catalog', action: 'select_mode', payload: 'archive' }],
        matchProds
      )
      return
    }

    // 3. Policy & Sizing Queries
    if (lower.includes('return') || lower.includes('refund') || lower.includes('exchange') || lower.includes('policy')) {
      addBotMessage(
        '🛡️ **Boutique Return & Exchange Guarantee**:\n\n' +
        'We offer a 7-day boutique inspection policy on all orders. If you require a size swap or return, keep the original obsidian packaging intact and contact our team.'
      )
      return
    }

    if (lower.includes('size') || lower.includes('fit') || lower.includes('chart')) {
      addBotMessage(
        '📏 **Size Recommendations**:\n\n' +
        'Our streetwear tees feature a drop-shoulder relaxed boxy fit. Sarees come in standard 6.3M length with unstitched blouse pieces. Need custom size advice?',
        [{ label: '📩 Ask Concierge Team', action: 'contact_support' }]
      )
      return
    }

    // 4. Default Fallback with Human Contact Option
    addBotMessage(
      `I understand you're asking about "${userText}". How would you like me to help you further?`,
      [
        { label: '🛍️ Browse Collections', action: 'browse_collections' },
        { label: '📦 Order Query / Track Order', action: 'track_order_prompt' },
        { label: '📞 Talk to Customer Support (+91 9550447883)', action: 'contact_support' },
        { label: '💬 Chat on WhatsApp', action: 'whatsapp_chat' }
      ]
    )
  }

  return (
    <>
      {/* FLOATING TRIGGER ROBOT BUTTON */}
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 pointer-events-auto">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              onClick={() => {
                setIsOpen(true)
                setIsMinimized(false)
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl backdrop-blur-md border transition-all duration-300 group cursor-pointer"
              style={{
                backgroundColor: `${modeDetails.cardBg}F0`,
                borderColor: modeDetails.accentColor,
                boxShadow: `0 10px 30px ${modeDetails.glowColor}`,
              }}
              aria-label="Ask Bujji AI Assistant"
            >
              {/* Glowing Aura Ring */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white/40"></span>
              </span>

              {/* Robot Avatar Icon */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12"
                style={{ backgroundColor: modeDetails.accentColor }}
              >
                <span className="material-symbols-outlined text-2xl text-black font-bold">smart_toy</span>
              </div>

              {/* Text Badge */}
              <div className="flex flex-col text-left pr-1">
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold" style={{ color: modeDetails.accentColor }}>
                  Bujji AI
                </span>
                <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1">
                  <span>Ask Assistant</span>
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                </span>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* CHATBOT DIALOG MODAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[160] w-[92vw] sm:w-[410px] ${
              isMinimized ? 'h-[70px]' : 'h-[580px] max-h-[85vh]'
            } rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-all duration-300 font-body`}
            style={{
              backgroundColor: '#121212',
              borderColor: `${modeDetails.accentColor}80`,
              boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${modeDetails.glowColor}`,
            }}
          >
            {/* CHATBOT HEADER */}
            <div 
              className="p-4 border-b flex items-center justify-between shrink-0 select-none cursor-pointer"
              style={{ backgroundColor: '#1A1A1A', borderColor: `${modeDetails.borderColor}40` }}
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border"
                  style={{ backgroundColor: modeDetails.accentColor, borderColor: '#FFFFFF40' }}
                >
                  <span className="material-symbols-outlined text-2xl text-black font-bold">smart_toy</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif-editorial text-lg text-white tracking-wider font-bold uppercase">BUJJI</h3>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                      AI ATELIER
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online • AI Assistant</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMinimized(!isMinimized)
                  }}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                  aria-label="Minimize Chat"
                >
                  <span className="material-symbols-outlined text-lg">{isMinimized ? 'expand_less' : 'remove'}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/10 cursor-pointer"
                  aria-label="Close Chat"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            {/* CHAT MESSAGES BODY */}
            {!isMinimized && (
              <>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10" style={{ backgroundColor: '#141414' }}>
                  {messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {/* BUBBLE CONTENT */}
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-2 shadow-lg leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-amber-950/90 text-amber-100 rounded-br-none border border-amber-500/40'
                            : 'bg-[#222222] text-[#F4F1EA] rounded-bl-none border border-white/10'
                        }`}
                      >
                        <p className="whitespace-pre-line font-body">{msg.text}</p>

                        {/* PRODUCT PREVIEW CARDS IN CHAT */}
                        {msg.products && msg.products.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            {msg.products.map(prod => (
                              <div
                                key={prod.id}
                                onClick={() => {
                                  router.push(`/product/${prod.id}`)
                                  setIsOpen(false)
                                }}
                                className="border rounded-xl p-2 bg-black/60 hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between group"
                                style={{ borderColor: `${modeDetails.borderColor}40` }}
                              >
                                <div className="relative w-full h-24 rounded-lg overflow-hidden mb-1.5 bg-zinc-900">
                                  <Image
                                    src={prod.image ? prod.image.split(',')[0].trim() : '/placeholder.jpg'}
                                    alt={prod.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-serif-editorial text-[11px] font-bold text-white line-clamp-1">{prod.title}</h4>
                                  <p className="text-[10px] font-mono text-amber-400 font-bold">₹{(prod.price || 0).toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ORDER TRACKING RESULT IN CHAT */}
                        {msg.orderResult && (
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                router.push('/track-order')
                                setIsOpen(false)
                              }}
                              className="w-full py-2 px-3 bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-[10px] font-mono uppercase font-bold rounded-lg hover:bg-emerald-900 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs">local_shipping</span>
                              <span>OPEN LIVE LOGISTICS PIPELINE →</span>
                            </button>
                          </div>
                        )}

                        <span className="text-[9px] font-mono text-white/40 block text-right">
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* QUICK OPTION CHIPS */}
                      {msg.options && msg.options.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                          {msg.options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleOptionClick(opt)}
                              className="text-[10px] font-mono py-1.5 px-3 rounded-full border transition-all hover:scale-105 cursor-pointer text-left shadow-md"
                              style={{
                                backgroundColor: '#1E1E1E',
                                color: modeDetails.accentColor,
                                borderColor: `${modeDetails.accentColor}50`,
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* TYPING INDICATOR */}
                  {isTyping && (
                    <div className="flex items-center gap-2 text-[#F4F1EA]/60 text-xs font-mono bg-[#222222] p-3 rounded-2xl w-fit border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[10px] ml-1">Bujji is thinking...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* CHATBOT INPUT FORM */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t flex items-center gap-2 shrink-0"
                  style={{ backgroundColor: '#1A1A1A', borderColor: `${modeDetails.borderColor}40` }}
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Ask Bujji anything or type Order ID..."
                    className="flex-1 bg-[#242424] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 font-body transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shrink-0 shadow-lg"
                    style={{
                      backgroundColor: modeDetails.accentColor,
                      color: '#000000',
                    }}
                    aria-label="Send message to Bujji"
                  >
                    <span className="material-symbols-outlined text-lg font-bold">arrow_upward</span>
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
