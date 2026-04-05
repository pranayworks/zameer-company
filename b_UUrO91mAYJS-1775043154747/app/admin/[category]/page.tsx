'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { use } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'
import {
  Product,
  checkAdminAuth,
  fetchProductsByCategory,
  deleteProduct,
  upsertProduct,
  DEFAULT_FORM_DATA,
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_DESCRIPTIONS,
} from '@/lib/admin-helpers'

export default function AdminCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: rawCategory } = use(params)
  const category = decodeURIComponent(rawCategory)
  const displayName = CATEGORIES.includes(category as any) ? category : category
  const router = useRouter()

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<Partial<Product>>({ ...DEFAULT_FORM_DATA, category })

  useEffect(() => {
    const init = async () => {
      const { authorized } = await checkAdminAuth()
      if (!authorized) {
        alert("Atelier Access Denied.")
        router.push('/')
        return
      }
      setIsAuthorized(true)
      loadProducts()
    }
    init()
  }, [router, category])

  const loadProducts = async () => {
    setLoading(true)
    const data = await fetchProductsByCategory(category)
    setProducts(data)
    setLoading(false)
  }

  const handleOpenAdd = () => {
    setFormData({ ...DEFAULT_FORM_DATA, category: category === 'Others' ? 'Kids' : category })
    setIsAdding(true)
    setEditingId(null)
  }

  const handleEdit = (product: Product) => {
    setFormData(product)
    setEditingId(product.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this item? This will also remove it from all customer wishlists.')) return
    setLoading(true)
    const result = await deleteProduct(id)
    if (!result.success) {
      alert(`Removal blocked: ${result.error}`)
    }
    await loadProducts()
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await upsertProduct(formData, editingId)
    if (!result.success) {
      alert(`Error: ${result.error}`)
    } else {
      if (result.note) alert(result.note)
      setIsAdding(false)
      setEditingId(null)
      setFormData({ ...DEFAULT_FORM_DATA, category })
      await loadProducts()
    }
    setLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath)
      setFormData(prev => ({ ...prev, image: publicUrl }))
      alert("Image uploaded successfully!")
    } catch (error: any) {
      alert("Error uploading: " + error.message)
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

  const addColor = (name: string, hex: string) => {
    if (!name || !hex) return
    setFormData(prev => ({ ...prev, colors: [...(prev.colors || []), { name, hex }] }))
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#fdf9f2] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="font-headline text-3xl text-[#1c1c18] opacity-20"
        >
          Securing the Atelier...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdf9f2]">
      <Header />

      <main className="pt-32 pb-24 px-8 md:px-24 max-w-[1920px] mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#747878]">
          <Link href="/admin" className="hover:text-[#1c1c18] transition-colors">Command Center</Link>
          <span>/</span>
          <span className="text-[#1c1c18] font-bold">{displayName}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-[#1c1c18] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-white">{CATEGORY_ICONS[category] || 'category'}</span>
              </div>
              <div>
                <h1 className="font-headline text-5xl md:text-6xl tracking-tighter">{displayName}</h1>
                <p className="font-body text-xs text-[#747878] mt-1">{CATEGORY_DESCRIPTIONS[category] || 'Custom Collection'}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="border border-[#1c1c18]/20 px-8 py-4 font-body text-[10px] uppercase tracking-widest font-bold hover:bg-[#1c1c18] hover:text-white transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Dashboard
            </Link>
            <button
              onClick={handleOpenAdd}
              className="gold-satin text-white px-8 py-4 font-body text-[10px] uppercase tracking-widest font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add {displayName === 'Others' ? 'Item' : displayName.replace(/s$/, '')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Total Items</span>
            <p className="font-headline text-4xl mt-2">{products.length}</p>
          </div>
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">In Stock</span>
            <p className="font-headline text-4xl mt-2 text-green-600">{products.filter(p => p.stock > 0).length}</p>
          </div>
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Out of Stock</span>
            <p className="font-headline text-4xl mt-2 text-red-500">{products.filter(p => p.stock === 0).length}</p>
          </div>
          <div className="bg-white p-6 border border-[#1c1c18]/5 shadow-sm">
            <span className="font-body text-[10px] uppercase tracking-widest text-[#747878]">Low Stock ({"<"}10)</span>
            <p className="font-headline text-4xl mt-2 text-amber-500">{products.filter(p => p.stock > 0 && p.stock < 10).length}</p>
          </div>
        </div>

        {/* Product Grid */}
        {loading && products.length === 0 ? (
          <div className="py-24 text-center opacity-40 font-headline text-xl">Loading {displayName} Collection...</div>
        ) : products.length === 0 ? (
          <div className="py-32 text-center bg-white border border-dashed border-[#1c1c18]/10">
            <span className="material-symbols-outlined text-6xl opacity-10 mb-4 block">{CATEGORY_ICONS[category] || 'inventory_2'}</span>
            <p className="font-body text-xs uppercase tracking-widest text-[#747878] mb-6">No masterpieces in this collection yet.</p>
            <button
              onClick={handleOpenAdd}
              className="gold-satin text-white px-8 py-4 font-body text-[10px] uppercase tracking-widest font-bold"
            >
              Introduce First Creation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#1c1c18]/5 flex flex-col shadow-sm hover:shadow-xl transition-all relative group"
              >
                <div className="relative w-full aspect-[3/4] bg-[#fdf9f2] overflow-hidden">
                  <Image
                    src={product.image || '/placeholder.png'}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {product.stock === 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-[9px] uppercase tracking-widest font-bold">
                      Out of Stock
                    </div>
                  )}
                  {product.stock > 0 && product.stock < 10 && (
                    <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 text-[9px] uppercase tracking-widest font-bold">
                      Low Stock: {product.stock}
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-headline text-lg leading-tight mb-2">{product.title}</h3>
                  <p className="font-body text-[11px] text-[#747878] line-clamp-2 mb-4 flex-1">{product.description}</p>
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-headline text-lg text-[#a3851a]">₹{product.price?.toLocaleString()}</span>
                    <span className={`font-body text-[10px] font-bold ${product.stock < 10 ? 'text-red-500' : 'text-[#747878]'}`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[#1c1c18]/10 mt-auto">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-[9px] uppercase tracking-widest text-[#1c1c18] hover:text-[#a3851a] font-bold transition-all flex items-center gap-1 bg-[#1c1c18]/5 px-3 py-1.5 rounded-sm"
                    >
                      <span className="material-symbols-outlined text-[13px]">edit_square</span>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-[9px] uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 font-bold transition-all flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-sm"
                    >
                      <span className="material-symbols-outlined text-[13px]">delete</span>
                      Trash
                    </button>
                    <Link
                      href={`/product/${product.id}`}
                      target="_blank"
                      className="text-[9px] uppercase tracking-widest text-[#a3851a] hover:text-[#1c1c18] font-bold transition-all flex items-center gap-1 group/link ml-auto"
                    >
                      View
                      <span className="material-symbols-outlined text-[11px] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform">north_east</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {isAdding && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsAdding(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="fixed inset-8 md:inset-16 bg-[#fdf9f2] z-[101] shadow-2xl overflow-y-auto p-8 md:p-12"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="flex justify-between items-center mb-12">
                    <h2 className="font-headline text-4xl">{editingId ? 'Edit Masterpiece' : `New ${displayName} Creation`}</h2>
                    <button onClick={() => setIsAdding(false)} className="material-symbols-outlined text-2xl hover:text-red-500 transition-colors">close</button>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Column */}
                    <div className="space-y-8">
                      <div>
                        <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Item ID (Used in URLs)</label>
                        <input
                          type="text" required disabled={!!editingId}
                          value={formData.id}
                          onChange={e => setFormData({ ...formData, id: e.target.value })}
                          className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none disabled:opacity-50"
                          placeholder="e.g. emerald-silk-saree"
                        />
                      </div>
                      <div>
                        <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Display Title</label>
                        <input
                          type="text" required value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none"
                          placeholder="e.g. Royal Hand-woven Saree"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Price (₹)</label>
                          <input
                            type="number" required value={formData.price}
                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                            className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Stock</label>
                          <input
                            type="number" required value={formData.stock}
                            onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                            className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Description</label>
                        <textarea
                          rows={4} required value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none resize-none"
                        />
                      </div>
                      {/* Images */}
                      <div className="space-y-4">
                        <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Product Images</label>
                        <div className="flex flex-col gap-4">
                          <div className="flex gap-4">
                            <input
                              type="text" required value={formData.image}
                              onChange={e => setFormData({ ...formData, image: e.target.value })}
                              className="flex-1 bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none text-sm"
                              placeholder="Primary image URL"
                            />
                            <label className="cursor-pointer bg-[#1c1c18] text-white px-6 py-4 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-[#a3851a] transition-all shrink-0">
                              <span className="material-symbols-outlined text-[14px]">{uploading ? 'sync' : 'upload'}</span>
                              {uploading ? '...' : 'Upload'}
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                          </div>
                          <input
                            type="text" value={formData.image2 || ''}
                            onChange={e => setFormData({ ...formData, image2: e.target.value })}
                            className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none text-sm"
                            placeholder="Secondary image URL"
                          />
                          <input
                            type="text" value={formData.image3 || ''}
                            onChange={e => setFormData({ ...formData, image3: e.target.value })}
                            className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none text-sm"
                            placeholder="Tertiary image URL"
                          />
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            {[formData.image, formData.image2, formData.image3].map((img, idx) => img && (
                              <div key={idx} className="relative aspect-[3/2] bg-white border border-[#1c1c18]/5 overflow-hidden">
                                <Image src={img} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Video URL</label>
                        <input
                          type="text" value={formData.video_url || ''}
                          onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                          className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none text-sm"
                          placeholder="e.g https://cdn.example.com/reel.mp4"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                      <div>
                        <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Category</label>
                        <select
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="w-full bg-white border-b border-[#1c1c18]/20 p-4 focus:border-[#a3851a] outline-none appearance-none"
                        >
                          <option>Men</option>
                          <option>Women</option>
                          <option>Sarees</option>
                          <option>Jewellery</option>
                          <option>Kids</option>
                        </select>
                      </div>

                      {/* Fabric */}
                      <div className="space-y-3">
                        <label className="font-body text-[10px] uppercase tracking-[0.2em] text-[#a3851a] font-bold">Fabric & Composition</label>
                        <div className="flex gap-3">
                          <input type="text" id="fabricInput"
                            className="flex-1 bg-white border-b border-[#1c1c18]/20 p-3 focus:border-[#a3851a] outline-none text-sm"
                            placeholder="e.g. 100% Mulberry Silk"
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = e.currentTarget.value; if (v) { addToArray('fabric', v); e.currentTarget.value = ''; } } }}
                          />
                          <button type="button" onClick={() => { const i = document.getElementById('fabricInput') as any; if (i?.value) { addToArray('fabric', i.value); i.value = ''; } }} className="bg-[#1c1c18] text-white px-5 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#a3851a]">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.fabric?.map((f, i) => (
                            <span key={i} className="bg-[#fdf9f2] border border-[#1c1c18]/10 px-3 py-1 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                              {f}
                              <button type="button" onClick={() => removeFromArray('fabric', i)} className="material-symbols-outlined text-[14px] hover:text-red-500 opacity-40 hover:opacity-100">close</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Care */}
                      <div className="space-y-3">
                        <label className="font-body text-[10px] uppercase tracking-[0.2em] text-[#a3851a] font-bold">Care Instructions</label>
                        <div className="flex gap-3">
                          <input type="text" id="careInput"
                            className="flex-1 bg-white border-b border-[#1c1c18]/20 p-3 focus:border-[#a3851a] outline-none text-sm"
                            placeholder="e.g. Gentle Hand Wash"
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = e.currentTarget.value; if (v) { addToArray('care', v); e.currentTarget.value = ''; } } }}
                          />
                          <button type="button" onClick={() => { const i = document.getElementById('careInput') as any; if (i?.value) { addToArray('care', i.value); i.value = ''; } }} className="bg-[#1c1c18] text-white px-5 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#a3851a]">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.care?.map((c, i) => (
                            <span key={i} className="bg-[#fdf9f2] border border-[#1c1c18]/10 px-3 py-1 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                              {c}
                              <button type="button" onClick={() => removeFromArray('care', i)} className="material-symbols-outlined text-[14px] hover:text-red-500 opacity-40 hover:opacity-100">close</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Fit */}
                      <div className="space-y-3">
                        <label className="font-body text-[10px] uppercase tracking-[0.2em] text-[#a3851a] font-bold">Fit & Measurements</label>
                        <div className="flex gap-3">
                          <input type="text" id="fitInput"
                            className="flex-1 bg-white border-b border-[#1c1c18]/20 p-3 focus:border-[#a3851a] outline-none text-sm"
                            placeholder="e.g. Tailored Silhouette"
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = e.currentTarget.value; if (v) { addToArray('fit', v); e.currentTarget.value = ''; } } }}
                          />
                          <button type="button" onClick={() => { const i = document.getElementById('fitInput') as any; if (i?.value) { addToArray('fit', i.value); i.value = ''; } }} className="bg-[#1c1c18] text-white px-5 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#a3851a]">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.fit?.map((f, i) => (
                            <span key={i} className="bg-[#fdf9f2] border border-[#1c1c18]/10 px-3 py-1 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                              {f}
                              <button type="button" onClick={() => removeFromArray('fit', i)} className="material-symbols-outlined text-[14px] hover:text-red-500 opacity-40 hover:opacity-100">close</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Colors */}
                      <div>
                        <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-3 block">Colors</label>
                        <div className="flex flex-wrap gap-3 mb-4">
                          {formData.colors?.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white border p-2 rounded-full shadow-sm">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.hex }} />
                              <span className="text-[10px] font-bold">{c.name}</span>
                              <button type="button" onClick={() => setFormData({ ...formData, colors: formData.colors?.filter((_, idx) => idx !== i) })} className="material-symbols-outlined text-[10px]">close</button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input type="text" id="color_name_cat" className="w-1/2 p-2 border-b text-xs outline-none" placeholder="Color Name" />
                          <input type="color" id="color_hex_cat" className="h-10 w-10 p-0 border-0" />
                          <button type="button" onClick={() => {
                            const name = (document.getElementById('color_name_cat') as HTMLInputElement).value
                            const hex = (document.getElementById('color_hex_cat') as HTMLInputElement).value
                            if (name && hex) { addColor(name, hex); (document.getElementById('color_name_cat') as HTMLInputElement).value = '' }
                          }} className="text-xs font-bold uppercase tracking-widest border border-[#a3851a] text-[#a3851a] px-4">Add</button>
                        </div>
                      </div>

                      {/* Sizes */}
                      <div>
                        <label className="font-body text-[10px] uppercase tracking-widest text-[#747878] mb-2 block">Available Sizes</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {formData.sizes?.map((s, i) => (
                            <div key={i} className="bg-white border px-3 py-2 flex items-center gap-2 shadow-sm">
                              <span className="text-[10px] uppercase font-bold tracking-widest">{s}</span>
                              <button type="button" onClick={() => removeFromArray('sizes', i)} className="material-symbols-outlined text-[12px] opacity-40 hover:opacity-100">close</button>
                            </div>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Enter size and press Enter"
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToArray('sizes', e.currentTarget.value); e.currentTarget.value = '' } }}
                          className="w-full bg-white border-b border-[#1c1c18]/20 p-4 text-sm outline-none focus:border-[#a3851a]"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 pt-8">
                      <button
                        type="submit" disabled={loading}
                        className="w-full gold-satin text-white py-6 font-body uppercase tracking-[0.3em] text-[10px] font-bold shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {loading ? 'Curating...' : editingId ? 'Update Masterpiece' : 'Confirm New Creation'}
                      </button>
                    </div>
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
