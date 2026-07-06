'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface InvoiceItem {
  description: string
  quantity: number
  price: number
}

export default function BillBookPage() {
  const router = useRouter()
  
  // Invoice form states
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('INV-' + Date.now().toString().slice(-6))
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
  const [paymentMode, setPaymentMode] = useState('Bank Transfer')
  const [taxRate, setTaxRate] = useState(15) // Default VAT
  const [sigImage, setSigImage] = useState<string | null>(null)
  const [signatoryRole, setSignatoryRole] = useState<'ceo' | 'founder'>('ceo')
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, price: 0 }
  ])

  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        
        // Process image to remove background and make strokes bold
        const img = new Image()
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            if (!ctx) {
              setSigImage(base64)
              return
            }
            
            // Draw bold offsets (up, down, left, right, and diagonals) to make the strokes thicker/bold
            ctx.drawImage(img, -1.5, 0)
            ctx.drawImage(img, 1.5, 0)
            ctx.drawImage(img, 0, -1.5)
            ctx.drawImage(img, 0, 1.5)
            ctx.drawImage(img, -1, -1)
            ctx.drawImage(img, 1, 1)
            ctx.drawImage(img, 0, 0)
            
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imgData.data
            
            // Find max brightness (background level)
            let maxB = 0
            for (let i = 0; i < data.length; i += 4) {
              const b = (data[i] + data[i + 1] + data[i + 2]) / 3
              if (b > maxB) maxB = b
            }
            
            // Adaptive threshold
            const threshold = Math.max(130, maxB - 45)
            
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]
              const alpha = data[i + 3]
              const brightness = (r + g + b) / 3
              
              if (alpha < 50 || brightness > threshold) {
                // Make background fully transparent
                data[i + 3] = 0
              } else {
                // Force dark ink to solid black
                data[i] = 12   // Very dark ink black
                data[i + 1] = 12
                data[i + 2] = 12
                data[i + 3] = 255
              }
            }
            
            ctx.putImageData(imgData, 0, 0)
            setSigImage(canvas.toDataURL('image/png'))
          } catch (err) {
            console.error('Error processing signature image, using fallback:', err)
            setSigImage(base64)
          }
        }
        img.onerror = () => {
          setSigImage(base64)
        }
        img.src = base64
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items]
    updated[index] = {
      ...updated[index],
      [field]: field === 'description' ? value : parseFloat(value) || 0
    }
    setItems(updated)
  }

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const taxAmount = (subtotal * taxRate) / 100
  const grandTotal = subtotal + taxAmount

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-[#fdf9f2] print:bg-white print:p-0">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="pt-32 pb-24 px-6 md:px-24 max-w-[1200px] mx-auto print:pt-0 print:pb-0 print:px-0">
        {/* Back Link */}
        <div className="mb-8 print:hidden">
          <Link href="/admin" className="text-xs uppercase tracking-widest text-[#a3851a] hover:text-[#1c1c18] font-bold transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Command Center
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 print:block">
          {/* Interactive Form Controls */}
          <div className="lg:col-span-1 bg-white border border-[#1c1c18]/5 p-6 md:p-8 space-y-6 print:hidden shadow-sm">
            <h2 className="font-headline text-2xl text-[#1c1c18]">Invoice Generator</h2>
            <p className="font-body text-xs text-[#747878] leading-relaxed">Fill out the details below to generate a custom branded bill. You can add items dynamically and print the result directly.</p>

            <div className="space-y-4 font-body text-xs text-[#1c1c18]">
              {/* Customer Details */}
              <div className="space-y-2">
                <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Client Name</label>
                <input
                  type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 outline-none focus:border-[#a3851a]"
                  placeholder="e.g. Zameer Enterprises"
                />
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Address</label>
                <textarea
                  value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                  className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 outline-none focus:border-[#a3851a] h-20 resize-none"
                  placeholder="e.g. Plot 42, Heritage Avenue, Lilongwe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Email</label>
                  <input
                    type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 outline-none focus:border-[#a3851a]"
                    placeholder="contact@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Phone</label>
                  <input
                    type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 outline-none focus:border-[#a3851a]"
                    placeholder="+265..."
                  />
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Invoice No.</label>
                  <input
                    type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 outline-none focus:border-[#a3851a]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Tax / VAT Rate (%)</label>
                  <input
                    type="number" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 outline-none focus:border-[#a3851a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Issue Date</label>
                  <input
                    type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
                    className="w-full bg-[#fdf9f2] border border-[#1c1c18]/10 p-2 outline-none focus:border-[#a3851a]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Due Date</label>
                  <input
                    type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-[#fdf9f2] border border-[#1c1c18]/10 p-2 outline-none focus:border-[#a3851a]"
                  />
                </div>
              </div>

              {/* Signatory Select Dropdown */}
              <div className="space-y-2 pt-2 border-t border-[#1c1c18]/5">
                <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Signatory Representative</label>
                <select
                  value={signatoryRole}
                  onChange={e => setSignatoryRole(e.target.value as 'ceo' | 'founder')}
                  className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 text-xs outline-none focus:border-[#a3851a] cursor-pointer"
                >
                  <option value="ceo">M. Pranay Kumar (CEO)</option>
                  <option value="founder">Zameer Pattan (Founder)</option>
                </select>
              </div>

              {/* Signature Upload */}
              <div className="space-y-2 pt-2 border-t border-[#1c1c18]/5">
                <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Signature Image Upload</label>
                <input
                  type="file" accept="image/*" onChange={handleSigUpload}
                  className="w-full text-xs text-[#747878] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-[9px] file:uppercase file:tracking-wider file:font-black file:bg-[#1c1c18] file:text-white hover:file:bg-[#a3851a] file:cursor-pointer"
                />
                {sigImage && (
                  <button 
                    onClick={() => setSigImage(null)}
                    className="text-[9px] uppercase tracking-widest text-red-500 font-bold hover:underline block"
                  >
                    Remove Signature
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="w-full bg-[#9eff00] hover:bg-[#82d100] text-black text-[10px] uppercase tracking-widest font-black py-4 rounded text-center transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Print Invoice
            </button>
          </div>

          {/* Printable Invoice Page Preview */}
          <div className="lg:col-span-2 bg-white border border-[#e2e8f0] p-10 md:p-16 shadow-lg print:border-none print:p-0 print:shadow-none min-h-[900px] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-[#a3851a] pb-6 mb-8">
                <div>
                  <h1 className="font-headline text-3xl text-[#1c1b1b] uppercase tracking-wider margin-0">Friends of 4</h1>
                  <p className="font-body text-[9px] text-[#747878] uppercase tracking-[0.2em] mt-1">Boutique of Curated Tradition</p>
                </div>
                <div className="text-right">
                  <h2 className="font-headline text-2xl text-[#a3851a] uppercase tracking-wider margin-0">Invoice</h2>
                  <p className="font-mono text-xs text-[#747878] mt-1">#{invoiceNumber}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-8 mb-10 font-body text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#a3851a] font-bold block mb-2">Billed To</span>
                  <p className="font-bold text-sm text-[#1c1b1b] mb-1">{customerName || 'Client / Business Name'}</p>
                  {customerAddress ? (
                    <p className="text-[#747878] whitespace-pre-line leading-relaxed">{customerAddress}</p>
                  ) : (
                    <p className="text-neutral-300 italic">No address provided</p>
                  )}
                  {customerPhone && <p className="text-[#747878] mt-1">Tel: {customerPhone}</p>}
                  {customerEmail && <p className="text-[#747878]">Email: {customerEmail}</p>}
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-widest text-[#a3851a] font-bold block mb-2 font-body">Invoice Metadata</span>
                  <p className="text-[#747878] mb-1"><strong>Issue Date:</strong> {invoiceDate}</p>
                  <p className="text-[#747878] mb-1"><strong>Due Date:</strong> {dueDate}</p>
                  <p className="text-[#747878]"><strong>Payment Term:</strong> {paymentMode}</p>
                </div>
              </div>

              {/* Items Section */}
              <div className="print:hidden space-y-4 mb-6">
                <span className="text-[9px] uppercase tracking-widest text-[#a3851a] font-bold block">Invoice Line Items</span>
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <input
                      type="text" value={item.description}
                      onChange={e => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Line item description..."
                      className="flex-1 bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 text-xs outline-none focus:border-[#a3851a]"
                    />
                    <input
                      type="number" value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-16 bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 text-xs text-center outline-none focus:border-[#a3851a]"
                    />
                    <input
                      type="number" value={item.price}
                      onChange={e => handleItemChange(index, 'price', e.target.value)}
                      placeholder="Rate"
                      className="w-28 bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 text-xs text-right outline-none focus:border-[#a3851a]"
                    />
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700 material-symbols-outlined text-sm"
                      disabled={items.length === 1}
                    >
                      delete
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddItem}
                  className="text-xs uppercase tracking-widest text-[#a3851a] hover:text-[#1c1c18] font-bold transition-all flex items-center gap-1 mt-2"
                >
                  <span className="material-symbols-outlined text-xs">add</span>
                  Add Line Item
                </button>
              </div>

              {/* Printable Table */}
              <table className="w-full border-collapse mb-10">
                <thead>
                  <tr className="border-b-2 border-neutral-200">
                    <th className="py-3 text-left font-body text-[9px] uppercase tracking-widest text-[#1c1c18]">Description</th>
                    <th className="py-3 text-center font-body text-[9px] uppercase tracking-widest text-[#1c1c18] w-20">Qty</th>
                    <th className="py-3 text-right font-body text-[9px] uppercase tracking-widest text-[#1c1c18] w-28">Rate</th>
                    <th className="py-3 text-right font-body text-[9px] uppercase tracking-widest text-[#1c1c18] w-28">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-neutral-100">
                      <td className="py-4 font-body text-xs text-[#334155]">{item.description || <span className="text-neutral-300 italic">No description entered</span>}</td>
                      <td className="py-4 text-center font-body text-xs text-[#334155]">{item.quantity}</td>
                      <td className="py-4 text-right font-body text-xs text-[#334155]">₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-4 text-right font-body text-xs text-[#1c1c18] font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Box */}
              <div className="flex justify-end mb-10">
                <table className="w-72 font-body text-xs text-[#334155]">
                  <tbody>
                    <tr>
                      <td className="py-1 text-left">Subtotal</td>
                      <td className="py-1 text-right">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-left">Tax / VAT ({taxRate}%)</td>
                      <td className="py-1 text-right">₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="border-t border-neutral-200 font-bold text-[#a3851a] text-sm">
                      <td className="py-2 text-left uppercase tracking-wider">Estimated Total</td>
                      <td className="py-2 text-right text-lg">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms and Signatures */}
            <div className="border-t border-neutral-200 pt-8 flex justify-between items-end font-body text-[10px] text-[#747878] leading-relaxed">
              <div className="max-w-md">
                <span className="uppercase tracking-widest text-[#a3851a] font-bold block mb-1">Boutique Specifications</span>
                <p>Please clear the estimated total within 14 days of invoice issue. Standard custom orders are finalized upon deposit clearance and adhere to our boutique preservation guidelines.</p>
              </div>
              <div className="w-48 text-center flex flex-col items-center justify-end min-h-[80px]">
                {sigImage ? (
                  <img src={sigImage} alt="Signature" className="max-h-12 max-w-[150px] object-contain mb-2" />
                ) : (
                  <div className="border-b border-neutral-400 w-full h-10 mb-2"></div>
                )}
                <p className="uppercase tracking-widest font-bold text-[#1c1c18] text-[9px]">
                  {signatoryRole === 'ceo' ? 'M. Pranay Kumar' : 'Zameer Pattan'}
                </p>
                <p className="uppercase tracking-[0.2em] text-[7px] text-[#747878] mt-0.5 font-bold">
                  {signatoryRole === 'ceo' ? 'CEO Signature' : 'Founder Signature'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  )
}
