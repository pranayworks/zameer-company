'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
  Product,
  checkAdminAuth,
  fetchProductsByCategory,
  deleteProduct,
  upsertProduct,
  DEFAULT_FORM_DATA,
  CATEGORY_ICONS,
  addColorToProduct,
} from '@/lib/admin-helpers'

export default function GiftHampersAdminPage() {
  const category = "Gift Hampers"
  const displayName = "Gift Hampers Archive"
  const router = useRouter()

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [formData, setFormData] = useState<Partial<Product>>({ ...DEFAULT_FORM_DATA, category })

  useEffect(() => {
    const init = async () => {
      const { authorized, email: userEmail } = await checkAdminAuth()
      if (!authorized) {
        alert(`Atelier Access Denied: \n\nAccount [${userEmail || 'Unknown'}] is not authorized to modify the Gift Archive.`)
        router.push('/')
        return
      }
      setIsAuthorized(true)
      loadProducts()
    }
    init()
  }, [router])

  const loadProducts = async () => {
    setLoading(true)
    const data = await fetchProductsByCategory(category)
    setProducts(data)
    setLoading(false)
  }

  const handleOpenAdd = () => {
    setFormData({ ...DEFAULT_FORM_DATA, category, return_policy: 'Gift hampers are carefully curated and final sale.' })
    setIsAdding(true)
    setEditingId(null)
  }

  const handleEdit = (product: Product) => {
    setFormData(product)
    setEditingId(product.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this hamper from the archive?')) return
    setLoading(true)
    const result = await deleteProduct(id)
    if (!result.success) alert(`Removal blocked: ${result.error}`)
    await loadProducts()
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.image) {
      alert("Atelier requirement: Please select at least one masterpiece image.")
      return
    }
    setLoading(true)
    const result = await upsertProduct(formData, editingId)
    if (!result.success) alert(`Error: ${result.error}`)
    else {
      setIsAdding(false)
      setEditingId(null)
      await loadProducts()
    }
    setLoading(false)
  }

  const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || [])
      if (files.length === 0) return
      setUploading(true)
      setUploadProgress('Preparing files...')

      const formData = new FormData()
      files.slice(0, 10).forEach(file => formData.append('files', file))

      const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
      const uploadData = await res.json()
      if (!res.ok) throw new Error(uploadData.error || 'Atelier Sky-Sync failed')

      const urls = uploadData.urls
      setFormData((prev: Partial<Product>) => {
        const existingData = [
          ...(prev.image?.split(',') || []),
          prev.image2,
          prev.image3
        ].filter(Boolean) as string[]
        const combined = Array.from(new Set([...existingData, ...urls])).slice(0, 12)
        return {
          ...prev,
          image: [combined[0], ...combined.slice(3)].filter(Boolean).join(','),
          image2: combined[1] || '',
          image3: combined[2] || ''
        }
      })
      setUploadProgress('')
    } catch (error: any) {
      setUploadProgress('')
      alert('Upload error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async (e: any) => {
    try {
      const files = Array.from((e.target?.files || e.dataTransfer?.files) || [])
      if (files.length === 0) return
      const file = files[0] as File
      setUploading(true)
      setUploadProgress('Signing cinematic reel access...')
      const signRes = await fetch('/api/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type })
      })
      const signData = await signRes.json()
      if (!signRes.ok) throw new Error(signData.error || 'Signature failed')
      setUploadProgress('Uploading to Archive Storage...')
      const uploadRes = await fetch(signData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      })
      if (!uploadRes.ok) throw new Error('Direct library sync failed.')
      setFormData((prev: Partial<Product>) => ({ ...prev, video_url: signData.publicUrl }))
      setUploadProgress('')
    } catch (error: any) {
      setUploadProgress('')
      alert('Video logic error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const addColor = (name: string, hex: string) => {
    setFormData((prev: Partial<Product>) => addColorToProduct(prev, name, hex))
  }

  const addToArray = (field: 'fabric' | 'care' | 'fit' | 'sizes', val: string) => {
    if (!val) return
    setFormData((prev: Partial<Product>) => ({ ...prev, [field]: [...((prev[field] as string[]) || []), val] }))
  }

  const removeFromArray = (field: 'fabric' | 'care' | 'fit' | 'sizes', index: number) => {
    setFormData((prev: Partial<Product>) => {
      const arr = [...((prev[field] as string[]) || [])]
      arr.splice(index, 1)
      return { ...prev, [field]: arr }
    })
  }

  if (isAuthorized === null) return (
    <div className="min-h-screen bg-[#fdf9f2] flex items-center justify-center">
      <div className="font-headline text-3xl text-[#1c1c18] opacity-20 italic">Securing the Gift Archive...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fdf9f2]">
      <Header />
      <main className="pt-32 pb-24 px-8 md:px-24 max-w-[1920px] mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#747878]">
          <Link href="/admin" className="hover:text-[#1c1c18] transition-colors">Command Center</Link>
          <span>/</span>
          <span className="text-[#1c1c18] font-bold">Gift Hampers</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-[#735c00] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-white">redeem</span>
              </div>
              <div>
                <h1 className="font-headline text-5xl md:text-6xl tracking-tighter">{displayName}</h1>
                <p className="font-body text-xs text-[#747878] mt-1 italic tracking-wide">Managing life's most meaningful milestones through artisanal curations.</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleOpenAdd}
              className="gold-satin text-white px-8 py-4 font-body text-[10px] uppercase tracking-widest font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Introduce New Hamper
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-24 text-center opacity-40 font-headline text-xl">Retrieving Gift Archive...</div>
        ) : products.length === 0 ? (
          <div className="py-32 text-center bg-white border border-dashed border-[#1c1c18]/10">
            <span className="material-symbols-outlined text-6xl opacity-10 mb-4 block">redeem</span>
            <p className="font-body text-xs uppercase tracking-widest text-[#747878] mb-6">The gift archive is currently waiting for curations.</p>
            <button onClick={handleOpenAdd} className="gold-satin text-white px-8 py-4 font-body text-[10px] uppercase tracking-widest font-bold">Create First Hamper</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <motion.div key={product.id} layout className="bg-white border border-[#1c1c18]/5 flex flex-col shadow-sm hover:shadow-xl transition-all relative group">
                <div className="relative w-full aspect-[3/4] bg-[#fdf9f2] overflow-hidden">
                  <Image src={product.image ? product.image.split(',')[0].trim() : '/placeholder.png'} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  {product.stock === 0 && <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-[9px] uppercase tracking-widest font-bold">Sold Out</div>}
                </div>
                <div className="p-6">
                  <h3 className="font-headline text-lg leading-tight mb-2">{product.title}</h3>
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-headline text-lg text-[#a3851a]">₹{product.price?.toLocaleString()}</span>
                    <span className="font-body text-[10px] font-bold text-[#747878]">Available: {product.stock}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <button onClick={() => handleEdit(product)} className="text-[9px] uppercase tracking-widest font-bold bg-[#1c1c18]/5 px-3 py-1.5 rounded-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">edit_square</span> Edit
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-[9px] uppercase tracking-widest font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">trash</span> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {isAdding && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdding(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="fixed inset-4 md:inset-16 bg-[#fdf9f2] z-[101] shadow-2xl overflow-y-auto p-8 md:p-12">
                <div className="max-w-4xl mx-auto">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="font-headline text-4xl">{editingId ? 'Refine Hamper Selection' : 'Unveil New Hamper'}</h2>
                    <button onClick={() => setIsAdding(false)} className="material-symbols-outlined text-2xl hover:text-red-500 transition-colors">close</button>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-[#747878]">Hamper ID</label>
                        <input type="text" placeholder="e.g. HMP-001" required disabled={!!editingId} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-white border-b-2 border-[#1c1c18]/5 p-4 outline-none focus:border-[#a3851a] transition-all" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-[#747878]">Collection Title</label>
                        <input type="text" placeholder="The Heritage Suite" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white border-b-2 border-[#1c1c18]/5 p-4 outline-none focus:border-[#a3851a] transition-all" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest font-bold text-[#747878]">Price (₹)</label>
                          <input type="number" required value={formData.price} onChange={e => setFormData((p: Partial<Product>) => ({...p, price: Number(e.target.value)}))} className="w-full bg-white border-b-2 border-[#1c1c18]/5 p-4 outline-none focus:border-[#a3851a] transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest font-bold text-[#747878]">Inventory</label>
                          <input type="number" required value={formData.stock} onChange={e => setFormData((p: Partial<Product>) => ({...p, stock: Number(e.target.value)}))} className="w-full bg-white border-b-2 border-[#1c1c18]/5 p-4 outline-none focus:border-[#a3851a] transition-all" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest font-bold text-[#747878]">Curation Story</label>
                        <textarea rows={4} required value={formData.description} onChange={e => setFormData((p: Partial<Product>) => ({...p, description: e.target.value}))} className="w-full bg-white border-b-2 border-[#1c1c18]/5 p-4 outline-none focus:border-[#a3851a] transition-all resize-none" placeholder="Describe the soul of this hamper..." />
                      </div>
                      
                      <div className="border-2 border-dashed border-[#a3851a]/20 p-8 text-center bg-white group hover:border-[#a3851a]/40 transition-all">
                        <span className="material-symbols-outlined text-3xl text-[#a3851a] mb-2 group-hover:scale-110 transition-transform">add_a_photo</span>
                        <p className="text-[10px] uppercase tracking-widest mb-4 font-bold">Visual Assets</p>
                        <input type="file" multiple onChange={handleMultipleFileUpload} className="hidden" id="hamper-img-upload" />
                        <label htmlFor="hamper-img-upload" className="gold-satin text-white px-8 py-3 text-[9px] cursor-pointer shadow-lg">Upload from Atelier</label>
                        {uploading && <p className="text-[9px] mt-4 animate-pulse text-[#a3851a] font-bold">{uploadProgress}</p>}
                        {formData.image && (
                          <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            {formData.image.split(',').map((url, i) => (
                              <div key={i} className="relative w-12 h-12 border border-[#1c1c18]/10">
                                <Image src={url.trim()} alt="Preview" fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-widest font-black text-[#a3851a] border-l-2 border-[#a3851a] pl-4 mb-4 block">Curation Specifications</label>
                          
                          <div className="space-y-4">
                             <div>
                                <div className="flex items-center justify-between mb-2">
                                   <label className="text-[9px] uppercase tracking-widest text-[#747878] font-bold">Components Included</label>
                                   <label className="flex items-center gap-2 cursor-pointer group">
                                     <span className="text-[8px] uppercase tracking-widest text-[#747878]">{formData.fabric && formData.fabric.length > 0 ? 'Active' : 'Enable'}</span>
                                     <div 
                                       onClick={() => setFormData((prev: Partial<Product>) => ({ ...prev, fabric: prev.fabric && prev.fabric.length > 0 ? [] : ['Handcrafted Piece'] }))}
                                       className={`w-6 h-3 rounded-full transition-all relative ${formData.fabric && formData.fabric.length > 0 ? 'bg-[#a3851a]' : 'bg-[#1c1c18]/10'}`}
                                     >
                                       <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${formData.fabric && formData.fabric.length > 0 ? 'right-0.5' : 'left-0.5'}`} />
                                     </div>
                                   </label>
                                </div>
                                {formData.fabric && formData.fabric.length > 0 && (
                                  <div className="animate-in fade-in slide-in-from-top-1">
                                     <input 
                                       type="text" 
                                       placeholder="e.g. Silk Scarf, Artisanal Tea" 
                                       onKeyDown={e => {if(e.key==='Enter'){e.preventDefault(); addToArray('fabric', e.currentTarget.value); e.currentTarget.value=''}}} 
                                       className="w-full bg-white border-b p-3 text-xs outline-none focus:border-[#a3851a]" 
                                     />
                                     <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.fabric?.map((s,i) => (
                                          <span key={i} className="bg-white border border-[#1c1c18]/10 px-3 py-1 text-[9px] font-bold uppercase flex items-center gap-2">
                                            {s} <button type="button" onClick={()=>removeFromArray('fabric', i)} className="material-symbols-outlined text-[12px]">close</button>
                                          </span>
                                        ))}
                                     </div>
                                  </div>
                                )}
                             </div>

                             <div>
                                <div className="flex items-center justify-between mb-2">
                                   <label className="text-[9px] uppercase tracking-widest text-[#747878] font-bold">Packaging Details</label>
                                   <label className="flex items-center gap-2 cursor-pointer group">
                                     <span className="text-[8px] uppercase tracking-widest text-[#747878]">{formData.fit && formData.fit.length > 0 ? 'Active' : 'Enable'}</span>
                                     <div 
                                       onClick={() => setFormData((prev: Partial<Product>) => ({ ...prev, fit: prev.fit && prev.fit.length > 0 ? [] : ['Heritage Box'] }))}
                                       className={`w-6 h-3 rounded-full transition-all relative ${formData.fit && formData.fit.length > 0 ? 'bg-[#a3851a]' : 'bg-[#1c1c18]/10'}`}
                                     >
                                       <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${formData.fit && formData.fit.length > 0 ? 'right-0.5' : 'left-0.5'}`} />
                                     </div>
                                   </label>
                                </div>
                                {formData.fit && formData.fit.length > 0 && (
                                  <div className="animate-in fade-in slide-in-from-top-1">
                                     <input 
                                       type="text" 
                                       placeholder="e.g. Handcrafted Wood Box" 
                                       onKeyDown={e => {if(e.key==='Enter'){e.preventDefault(); addToArray('fit', e.currentTarget.value); e.currentTarget.value=''}}} 
                                       className="w-full bg-white border-b p-3 text-xs outline-none focus:border-[#a3851a]" 
                                     />
                                     <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.fit?.map((s,i) => (
                                          <span key={i} className="bg-white border border-[#1c1c18]/10 px-3 py-1 text-[9px] font-bold uppercase flex items-center gap-2">
                                            {s} <button type="button" onClick={()=>removeFromArray('fit', i)} className="material-symbols-outlined text-[12px]">close</button>
                                          </span>
                                        ))}
                                     </div>
                                  </div>
                                )}
                             </div>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase font-black text-[#a3851a]">Palette & Tones</label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <span className="text-[9px] uppercase tracking-widest text-[#747878] group-hover:text-[#1c1c18] transition-colors">{formData.colors && formData.colors.length > 0 ? 'Active' : 'Enable'}</span>
                              <div 
                                onClick={() => setFormData((prev: Partial<Product>) => ({ ...prev, colors: prev.colors && prev.colors.length > 0 ? [] : [{ name: 'Heritage Gold', hex: '#a3851a' }] }))}
                                className={`w-8 h-4 rounded-full transition-all relative ${formData.colors && formData.colors.length > 0 ? 'bg-[#a3851a]' : 'bg-[#1c1c18]/10'}`}
                              >
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${formData.colors && formData.colors.length > 0 ? 'right-0.5' : 'left-0.5'}`} />
                              </div>
                            </label>
                          </div>
                          
                          {formData.colors && formData.colors.length > 0 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="flex flex-wrap gap-2">
                                {formData.colors?.map((c, i) => (
                                  <div key={i} className="flex items-center gap-2 bg-white border p-2 rounded-full shadow-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                                    <span className="text-[9px] font-bold uppercase">{c.name}</span>
                                    <button type="button" onClick={() => setFormData((prev: Partial<Product>) => ({ ...prev, colors: prev.colors?.filter((_, idx) => idx !== i) }))} className="material-symbols-outlined text-[10px] hover:text-red-500">close</button>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input type="text" id="color_name_hmp" className="flex-1 bg-white border-b p-3 text-xs outline-none focus:border-[#a3851a]" placeholder="Theme Name" />
                                <input type="color" id="color_hex_hmp" className="h-10 w-10 p-0 border-0 cursor-pointer" />
                                <button type="button" onClick={() => {
                                  const name = (document.getElementById('color_name_hmp') as HTMLInputElement).value
                                  const hex = (document.getElementById('color_hex_hmp') as HTMLInputElement).value
                                  if (name && hex) { addColor(name, hex); (document.getElementById('color_name_hmp') as HTMLInputElement).value = '' }
                                }} className="bg-[#1c1c18] text-white px-4 text-[9px] uppercase font-bold tracking-widest hover:bg-[#a3851a] transition-all">Add</button>
                              </div>
                            </div>
                          )}
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase font-black text-[#a3851a]">Variant Management</label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <span className="text-[9px] uppercase tracking-widest text-[#747878]">{formData.sizes && formData.sizes.length > 0 ? 'Active' : 'Add Variants'}</span>
                              <div 
                                onClick={() => setFormData((prev: Partial<Product>) => ({ ...prev, sizes: prev.sizes && prev.sizes.length > 0 ? [] : ['Gift Box'] }))}
                                className={`w-8 h-4 rounded-full transition-all relative ${formData.sizes && formData.sizes.length > 0 ? 'bg-[#a3851a]' : 'bg-[#1c1c18]/10'}`}
                              >
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${formData.sizes && formData.sizes.length > 0 ? 'right-0.5' : 'left-0.5'}`} />
                              </div>
                            </label>
                          </div>
                          
                          {formData.sizes && formData.sizes.length > 0 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                              <input 
                                type="text" 
                                placeholder="Add Size / Hamper Type and Enter" 
                                onKeyDown={e => {if(e.key==='Enter'){e.preventDefault(); addToArray('sizes', e.currentTarget.value); e.currentTarget.value=''}}} 
                                className="w-full bg-white border-b p-4 text-xs outline-none focus:border-[#a3851a]" 
                              />
                              <div className="flex flex-wrap gap-2">
                                 {formData.sizes?.map((s,i) => (
                                   <span key={i} className="bg-white border border-[#1c1c18]/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                                     {s} <button type="button" onClick={()=>removeFromArray('sizes', i)} className="material-symbols-outlined text-[14px]">close</button>
                                   </span>
                                 ))}
                              </div>
                            </div>
                          )}
                       </div>

                       <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest font-bold text-[#747878]">Cinematic Reel (Optional)</label>
                          <div className="flex gap-3">
                             <input type="text" placeholder="Video URL or Upload below" value={formData.video_url || ''} onChange={e => setFormData({...formData, video_url: e.target.value})} className="flex-1 bg-white border-b p-3 text-xs outline-none focus:border-[#a3851a]" />
                             <label className="bg-[#1c1c18] text-white px-4 py-3 text-[9px] uppercase font-bold tracking-widest cursor-pointer hover:bg-[#a3851a]">
                                Upload Reel
                                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                             </label>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest font-bold text-[#747878]">Atelier Concierge Note</label>
                          <textarea rows={2} value={formData.return_policy} onChange={e => setFormData((p: Partial<Product>) => ({...p, return_policy: e.target.value}))} className="w-full bg-white border-b-2 border-[#1c1c18]/5 p-4 text-xs outline-none focus:border-[#a3851a] transition-all resize-none italic" />
                       </div>
                    </div>

                    <button type="submit" disabled={loading} className="md:col-span-2 gold-satin text-white py-6 text-[10px] uppercase font-bold tracking-[0.4em] shadow-2xl hover:scale-[1.01] active:scale-100 transition-all">
                       {loading ? 'Securing to Archive...' : editingId ? 'Update Heritage Piece' : 'Introduce to Collection'}
                    </button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
