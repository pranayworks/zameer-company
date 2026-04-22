'use client'

import React, { useState, useEffect, useRef } from 'react'
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
} from '@/lib/admin-helpers'

export default function OthersAdminPage() {
  const category = "Others"
  const displayName = "Our Others Collection"
  const router = useRouter()

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [formData, setFormData] = useState<Partial<Product>>({ ...DEFAULT_FORM_DATA, category })
  const [isDragging, setIsDragging] = useState(false)
  const [isVideoDragging, setIsVideoDragging] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { authorized, email: userEmail } = await checkAdminAuth()
      if (!authorized) {
        alert(`Atelier Access Denied: \n\nAccount [${userEmail || 'Unknown'}] is not authorized to modify the Atelier Collections.`)
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
    setFormData({ ...DEFAULT_FORM_DATA, category, return_policy: 'Can be returned within 5 days' })
    setIsAdding(true)
    setEditingId(null)
  }

  const handleEdit = (product: Product) => {
    setFormData(product)
    setEditingId(product.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this eclectic item?')) return
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
      if (result.note) alert(result.note)
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
      setFormData(prev => {
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

      setFormData(prev => ({ ...prev, video_url: signData.publicUrl }))
      setUploadProgress('')
    } catch (error: any) {
      setUploadProgress('')
      alert('Video logic error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const addToArray = (field: 'fabric' | 'care' | 'fit' | 'sizes', val: string) => {
    if (!val) return
    setFormData(prev => ({ ...prev, [field]: [...((prev[field] as string[]) || []), val] }))
  }

  const removeFromArray = (field: 'fabric' | 'care' | 'fit' | 'sizes', index: number) => {
    setFormData(prev => {
      const arr = [...((prev[field] as string[]) || [])]
      arr.splice(index, 1)
      return { ...prev, [field]: arr }
    })
  }

  if (isAuthorized === null) return (
    <div className="min-h-screen bg-[#fdf9f2] flex items-center justify-center">
      <div className="font-headline text-3xl text-[#1c1c18] opacity-20">Securing the Others Archive...</div>
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
          <span className="text-[#1c1c18] font-bold">Others Collection</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-[#a3851a] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-white">category</span>
              </div>
              <div>
                <h1 className="font-headline text-5xl md:text-6xl tracking-tighter">{displayName}</h1>
                <p className="font-body text-xs text-[#747878] mt-1">Dedicated management for eclectic creations and special pieces.</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleOpenAdd}
              className="gold-satin text-white px-8 py-4 font-body text-[10px] uppercase tracking-widest font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Introduce New Piece
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-24 text-center opacity-40 font-headline text-xl">Loading Eclectic Archive...</div>
        ) : products.length === 0 ? (
          <div className="py-32 text-center bg-white border border-dashed border-[#1c1c18]/10">
            <span className="material-symbols-outlined text-6xl opacity-10 mb-4 block">inventory_2</span>
            <p className="font-body text-xs uppercase tracking-widest text-[#747878] mb-6">No pieces in this dedicated archive yet.</p>
            <button onClick={handleOpenAdd} className="gold-satin text-white px-8 py-4 font-body text-[10px] uppercase tracking-widest font-bold">Introduce First Creation</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <motion.div key={product.id} layout className="bg-white border border-[#1c1c18]/5 flex flex-col shadow-sm hover:shadow-xl transition-all relative group">
                <div className="relative w-full aspect-[3/4] bg-[#fdf9f2] overflow-hidden">
                  <Image src={product.image ? product.image.split(',')[0].trim() : '/placeholder.png'} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  {product.stock === 0 && <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-[9px] uppercase tracking-widest font-bold">Out of Stock</div>}
                </div>
                <div className="p-6">
                  <h3 className="font-headline text-lg leading-tight mb-2">{product.title}</h3>
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-headline text-lg text-[#a3851a]">₹{product.price?.toLocaleString()}</span>
                    <span className="font-body text-[10px] font-bold text-[#747878]">Stock: {product.stock}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <button onClick={() => handleEdit(product)} className="text-[9px] uppercase tracking-widest font-bold bg-[#1c1c18]/5 px-3 py-1.5 rounded-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">edit_square</span> Edit
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-[9px] uppercase tracking-widest font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">trash</span> Trash
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal Appears here (simplified for space, but functionally same as category page) */}
        <AnimatePresence>
          {isAdding && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdding(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="fixed inset-4 md:inset-16 bg-[#fdf9f2] z-[101] shadow-2xl overflow-y-auto p-12">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-10">
                    <h2 className="font-headline text-4xl">{editingId ? 'Refine Eclectic Piece' : 'New Piece Discovery'}</h2>
                    <button onClick={() => setIsAdding(false)} className="material-symbols-outlined text-2xl hover:text-red-500">close</button>
                  </div>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     {/* Form Fields: Category is fixed to Others in this page */}
                     <div className="space-y-6">
                        <input type="text" placeholder="Item ID" required disabled={!!editingId} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-white border-b p-4 outline-none" />
                        <input type="text" placeholder="Display Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white border-b p-4 outline-none" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="number" placeholder="Price (₹)" required value={formData.price} onChange={e => setFormData(p => ({...p, price: Number(e.target.value)}))} className="w-full bg-white border-b p-4 outline-none" />
                          <input type="number" placeholder="Stock" required value={formData.stock} onChange={e => setFormData(p => ({...p, stock: Number(e.target.value)}))} className="w-full bg-white border-b p-4 outline-none" />
                        </div>
                        <textarea placeholder="Archive Description" rows={4} required value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} className="w-full bg-white border-b p-4 outline-none resize-none" />
                        
                        {/* Image Upload Area */}
                        <div className="border-2 border-dashed border-[#a3851a]/20 p-8 text-center bg-white">
                           <span className="material-symbols-outlined text-3xl text-[#a3851a] mb-2">cloud_upload</span>
                           <p className="text-[10px] uppercase tracking-widest mb-4">Masterpiece Asset Upload</p>
                           <input type="file" multiple onChange={handleMultipleFileUpload} className="hidden" id="others-img-upload" />
                           <label htmlFor="others-img-upload" className="gold-satin text-white px-6 py-2 text-[8px] cursor-pointer">Browse Atelier</label>
                           {uploading && <p className="text-[8px] mt-2 animate-pulse">{uploadProgress}</p>}
                        </div>
                     </div>

                     <div className="space-y-6">
                       {/* Categories: In this page, we might want to allow sub-categories or just confirm 'Others' */}
                       <div>
                          <label className="text-[10px] uppercase text-[#747878] mb-2 block">Archive Category</label>
                          <select value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value}))} className="w-full bg-white border-b p-4 outline-none">
                            <option>Others</option>
                            <option>Kids</option>
                            <option>Accessories</option>
                            <option>Special Edition</option>
                          </select>
                       </div>

                       {/* Fabric & Composition */}
                       <div className="space-y-4">
                         <div className="flex items-center justify-between">
                           <label className="text-[10px] uppercase text-[#a3851a] font-bold">Fabric & Composition</label>
                           <label className="flex items-center gap-2 cursor-pointer group">
                             <span className="text-[9px] uppercase tracking-widest text-[#747878] group-hover:text-[#1c1c18] transition-colors">{formData.fabric && formData.fabric.length > 0 ? 'Active' : 'Enable'}</span>
                             <div 
                               onClick={() => setFormData(prev => ({ ...prev, fabric: prev.fabric && prev.fabric.length > 0 ? [] : ['Standard'] }))}
                               className={`w-8 h-4 rounded-full transition-all relative ${formData.fabric && formData.fabric.length > 0 ? 'bg-[#a3851a]' : 'bg-[#1c1c18]/10'}`}
                             >
                               <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${formData.fabric && formData.fabric.length > 0 ? 'right-0.5' : 'left-0.5'}`} />
                             </div>
                           </label>
                         </div>
                         {formData.fabric && formData.fabric.length > 0 && (
                           <div className="animate-in fade-in slide-in-from-top-1">
                             <input type="text" placeholder="Add Fabric/Material and press Enter" onKeyDown={e => {if(e.key==='Enter'){e.preventDefault(); addToArray('fabric', e.currentTarget.value); e.currentTarget.value=''}}} className="w-full bg-white border-b p-3 text-xs outline-none focus:border-[#a3851a]" />
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

                       {/* Care Instructions */}
                       <div className="space-y-4">
                         <div className="flex items-center justify-between">
                           <label className="text-[10px] uppercase text-[#a3851a] font-bold">Care Instructions</label>
                           <label className="flex items-center gap-2 cursor-pointer group">
                             <span className="text-[9px] uppercase tracking-widest text-[#747878] group-hover:text-[#1c1c18] transition-colors">{formData.care && formData.care.length > 0 ? 'Active' : 'Enable'}</span>
                             <div 
                               onClick={() => setFormData(prev => ({ ...prev, care: prev.care && prev.care.length > 0 ? [] : ['Standard Care'] }))}
                               className={`w-8 h-4 rounded-full transition-all relative ${formData.care && formData.care.length > 0 ? 'bg-[#a3851a]' : 'bg-[#1c1c18]/10'}`}
                             >
                               <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${formData.care && formData.care.length > 0 ? 'right-0.5' : 'left-0.5'}`} />
                             </div>
                           </label>
                         </div>
                         {formData.care && formData.care.length > 0 && (
                           <div className="animate-in fade-in slide-in-from-top-1">
                             <input type="text" placeholder="Add Care Instruction and press Enter" onKeyDown={e => {if(e.key==='Enter'){e.preventDefault(); addToArray('care', e.currentTarget.value); e.currentTarget.value=''}}} className="w-full bg-white border-b p-3 text-xs outline-none focus:border-[#a3851a]" />
                             <div className="flex flex-wrap gap-2 mt-2">
                               {formData.care?.map((s,i) => (
                                 <span key={i} className="bg-white border border-[#1c1c18]/10 px-3 py-1 text-[9px] font-bold uppercase flex items-center gap-2">
                                   {s} <button type="button" onClick={()=>removeFromArray('care', i)} className="material-symbols-outlined text-[12px]">close</button>
                                 </span>
                               ))}
                             </div>
                           </div>
                         )}
                       </div>

                       {/* Fit & Measurements */}
                       <div className="space-y-4">
                         <div className="flex items-center justify-between">
                           <label className="text-[10px] uppercase text-[#a3851a] font-bold">Fit & Measurements</label>
                           <label className="flex items-center gap-2 cursor-pointer group">
                             <span className="text-[9px] uppercase tracking-widest text-[#747878] group-hover:text-[#1c1c18] transition-colors">{formData.fit && formData.fit.length > 0 ? 'Active' : 'Enable'}</span>
                             <div 
                               onClick={() => setFormData(prev => ({ ...prev, fit: prev.fit && prev.fit.length > 0 ? [] : ['Standard Fit'] }))}
                               className={`w-8 h-4 rounded-full transition-all relative ${formData.fit && formData.fit.length > 0 ? 'bg-[#a3851a]' : 'bg-[#1c1c18]/10'}`}
                             >
                               <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${formData.fit && formData.fit.length > 0 ? 'right-0.5' : 'left-0.5'}`} />
                             </div>
                           </label>
                         </div>
                         {formData.fit && formData.fit.length > 0 && (
                           <div className="animate-in fade-in slide-in-from-top-1">
                             <input type="text" placeholder="Add Fit/Measurement and press Enter" onKeyDown={e => {if(e.key==='Enter'){e.preventDefault(); addToArray('fit', e.currentTarget.value); e.currentTarget.value=''}}} className="w-full bg-white border-b p-3 text-xs outline-none focus:border-[#a3851a]" />
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

                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase text-[#a3851a] font-bold">Size Management</label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <span className="text-[9px] uppercase tracking-widest text-[#747878] group-hover:text-[#1c1c18] transition-colors">{formData.sizes && formData.sizes.length > 0 ? 'Sizes Enabled' : 'Enable Sizes'}</span>
                              <div 
                                onClick={() => setFormData(prev => ({ ...prev, sizes: prev.sizes && prev.sizes.length > 0 ? [] : ['Standard'] }))}
                                className={`w-8 h-4 rounded-full transition-all relative ${formData.sizes && formData.sizes.length > 0 ? 'bg-[#a3851a]' : 'bg-[#1c1c18]/10'}`}
                              >
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${formData.sizes && formData.sizes.length > 0 ? 'right-0.5' : 'left-0.5'}`} />
                              </div>
                            </label>
                          </div>
                          
                          {formData.sizes && formData.sizes.length > 0 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                              <input 
                                type="text" 
                                placeholder="Add Size/Variant (e.g. Small, 500ml) and press Enter" 
                                onKeyDown={e => {if(e.key==='Enter'){e.preventDefault(); addToArray('sizes', e.currentTarget.value); e.currentTarget.value=''}}} 
                                className="w-full bg-white border-b p-4 text-xs outline-none focus:border-[#a3851a]" 
                              />
                              <div className="flex flex-wrap gap-2">
                                 {formData.sizes?.map((s,i) => (
                                   <span key={i} className="bg-white border border-[#1c1c18]/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                     {s} 
                                     <button type="button" onClick={()=>removeFromArray('sizes', i)} className="material-symbols-outlined text-[14px] hover:text-red-500 transition-colors">close</button>
                                   </span>
                                 ))}
                              </div>
                              <p className="text-[8px] text-[#747878] italic">Note: If sizes are added, users will be required to select one before checkout.</p>
                            </div>
                          )}
                       </div>

                       <textarea placeholder="Return Policy / Specialist Note" rows={2} value={formData.return_policy} onChange={e => setFormData(p => ({...p, return_policy: e.target.value}))} className="w-full bg-white border-b p-4 text-xs outline-none resize-none" />
                     </div>

                     <button type="submit" disabled={loading} className="md:col-span-2 gold-satin text-white py-6 text-[10px] uppercase font-bold tracking-widest shadow-2xl">
                        {loading ? 'Securing Creation...' : editingId ? 'Update Masterpiece' : 'Confirm New Discovery'}
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
