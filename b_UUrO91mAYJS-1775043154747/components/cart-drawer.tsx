'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/cart-context'
import { getSessionUser, supabase } from '@/lib/supabase'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter()
  const { cart, updateQuantity, removeFromCart, subtotal, totalItems, placeOrder } = useCart()
  const [profile, setProfile] = useState<{ loyalty_points?: number, customer_segment?: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const isLoggedIn = localStorage.getItem('currentUserEmail');
      if (!isLoggedIn) return;
      
      const { user } = await getSessionUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('loyalty_points, customer_segment')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    };

    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);
  // Payment handled on /checkout page

  // Block body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handlePayment = async () => {
    const { user } = await getSessionUser()
    if (!user) {
      onClose();
      router.push('/signup');
      return;
    }
    // Navigate to the full checkout page
    onClose();
    router.push('/checkout');
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />

          {/* Drawer container (Portaled feel via fixed positioning) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-[#fdf9f2] z-[101] shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-[#1c1c18]/5 flex justify-between items-center bg-white">
              <div>
                 <h2 className="font-headline text-2xl tracking-tighter">Your Bag</h2>
                 <p className="font-body text-[10px] text-[#a3851a] uppercase tracking-widest mt-1">{totalItems} Editorial Pieces</p>
              </div>
              <button 
                onClick={onClose}
                className="material-symbols-outlined text-[#1c1b1b] hover:rotate-90 transition-transform duration-500"
              >
                close
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 relative">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <motion.div 
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-6 pb-8 mb-8 border-b border-[#1c1c18]/5 last:border-0 last:pb-0"
                  >
                    <div className="relative w-24 aspect-[3/4] bg-white overflow-hidden shadow-sm">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-headline text-lg mb-1 leading-tight">{item.name}</h3>
                        {(item.selectedSize || item.selectedColor) && (
                          <span className="font-body text-[10px] uppercase tracking-widest text-[#747878] block mt-1">
                            {item.selectedSize && `Size: ${item.selectedSize}`} 
                            {item.selectedSize && item.selectedColor && ` • `}
                            {item.selectedColor && `Tone: ${item.selectedColor}`}
                          </span>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center border border-[#1c1c18]/10 rounded-sm">
                            <button 
                              onClick={() => updateQuantity(item.id, -1, item.selectedSize, item.selectedColor)}
                              className="px-2 py-1 hover:bg-[#1c1c18]/5 transition-colors"
                            >
                              <span className="material-symbols-outlined text-xs">remove</span>
                            </button>
                            <span className="font-body text-xs min-w-[20px] text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1, item.selectedSize, item.selectedColor)}
                              className="px-2 py-1 hover:bg-[#1c1c18]/5 transition-colors"
                            >
                              <span className="material-symbols-outlined text-xs">add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                         <span className="font-body text-sm font-bold tracking-tight">
                           ₹{(typeof item.price === 'string' ? parseFloat(item.price.replace('$', '').replace('₹', '').replace(',', '')) : item.price).toLocaleString('en-IN')}
                         </span>
                         <button 
                           onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                           className="text-[10px] font-body uppercase tracking-widest text-[#747878] hover:text-red-500 transition-colors"
                         >
                           Remove
                         </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
                  <span className="material-symbols-outlined text-6xl mb-4">shopping_bag</span>
                  <p className="font-body text-sm uppercase tracking-widest">Your bag is empty</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-[#1c1c18]/5 bg-white space-y-6 shadow-2xl">
              
              {/* Loyalty Info & Upsell Prompt */}
              {subtotal > 0 && (() => {
                const segment = profile?.customer_segment || 'Regular';
                let multiplier = 1.0;
                if (segment === 'VIP') {
                  multiplier = 1.5;
                } else if (segment === 'New') {
                  multiplier = 2.0;
                }

                const estimatedPoints = Math.floor((subtotal / 100) * multiplier);
                const currentPoints = profile?.loyalty_points || 0;
                const projectedPoints = currentPoints + estimatedPoints;
                const milestoneTarget = segment === 'VIP' ? 80 : 100;
                
                const spendNeededForMilestone = Math.ceil((milestoneTarget - currentPoints) * (100 / multiplier)) - subtotal;
                const showMilestoneUpsell = spendNeededForMilestone > 0 && spendNeededForMilestone <= 5000 && projectedPoints < milestoneTarget;

                const nextThousand = Math.ceil(subtotal / 1000) * 1000;
                const gap = nextThousand - subtotal;
                const showGapUpsell = gap > 0 && gap <= 500;

                return (
                  <div className="bg-[#a3851a]/5 border border-[#a3851a]/20 p-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-body text-[#747878] uppercase tracking-wider">Estimated Points ({segment})</span>
                      <span className="font-headline text-[#a3851a] font-bold">+{estimatedPoints} pts</span>
                    </div>
                    {showMilestoneUpsell ? (
                      <p className="text-[10px] italic text-[#a3851a] leading-normal mt-1 border-t border-[#a3851a]/15 pt-2">
                        ✨ Add <b>₹{spendNeededForMilestone.toLocaleString('en-IN')}</b> more to unlock your exclusive gift worth of ₹5,000!
                      </p>
                    ) : showGapUpsell ? (
                      <p className="text-[10px] italic text-[#a3851a] leading-normal mt-1 border-t border-[#a3851a]/15 pt-2">
                        💡 Add <b>₹{gap.toLocaleString('en-IN')}</b> more to your cart to earn extra points!
                      </p>
                    ) : null}
                  </div>
                );
              })()}

              <div className="flex justify-between items-center">
                <span className="font-body uppercase tracking-widest text-xs text-[#747878]">Total Value</span>
                <span className="font-headline text-3xl tracking-tight">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="space-y-4">
                <button 
                  disabled={cart.length === 0}
                  onClick={handlePayment}
                  className="w-full gold-satin text-white py-5 font-body uppercase tracking-[0.3em] text-[10px] font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                >
                  <span className="material-symbols-outlined text-sm">payment</span>
                  Proceed to Payment
                </button>
                <button 
                  onClick={onClose}
                  className="w-full text-[10px] font-body uppercase tracking-widest text-[#1c1c18] hover:text-[#a3851a] transition-all"
                >
                  Close Bag
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
