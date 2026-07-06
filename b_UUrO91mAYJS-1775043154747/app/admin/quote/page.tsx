'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface QuoteItem {
  description: string
  quantity: number
  rate: number
}

export default function QuotationCreatorPage() {
  const router = useRouter()

  // Quotation form states
  const [clientName, setClientName] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [quoteId, setQuoteId] = useState('QT-' + Date.now().toString().slice(-6))
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
  const [leadTime, setLeadTime] = useState('5-7 Business Days')
  const [deliveryCost, setDeliveryCost] = useState(15000) // Default delivery cost in MK
  const [currencySymbol, setCurrencySymbol] = useState('MK') // Malawi Kwacha default for Entire Printers
  const [sigImage, setSigImage] = useState<string | null>(null)

  const [items, setItems] = useState<QuoteItem[]>([
    { description: '', quantity: 1, rate: 0 }
  ])

  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSigImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const updated = [...items]
    updated[index] = {
      ...updated[index],
      [field]: field === 'description' ? value : parseFloat(value) || 0
    }
    setItems(updated)
  }

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.rate * item.quantity), 0)
  const total = subtotal + deliveryCost

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
            <h2 className="font-headline text-2xl text-[#1c1c18]">Quotation Generator</h2>
            <p className="font-body text-xs text-[#747878] leading-relaxed">Fill out the details below to generate a corporate cost estimation sheet. Add scope deliverables dynamically and print directly.</p>

            <div className="space-y-4 font-body text-xs text-[#1c1c18]">
              {/* Client Details */}
              <div className="space-y-2">
                <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Client / Business Name</label>
                <input
                  type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                  className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 outline-none focus:border-[#a3851a]"
                  placeholder="e.g. Lilongwe Excellence Center"
                />
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Address</label>
                <textarea
                  value={clientAddress} onChange={e => setClientAddress(e.target.value)}
                  className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 outline-none focus:border-[#a3851a] h-20 resize-none"
                  placeholder="e.g. Area 3, Barron Avenue, Lilongwe"
                />
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Email</label>
                <input
                  type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                  className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 outline-none focus:border-[#a3851a]"
                  placeholder="client@excellence.com"
                />
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Currency Symbol</label>
                  <input
                    type="text" value={currencySymbol} onChange={e => setCurrencySymbol(e.target.value)}
                    className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 outline-none focus:border-[#a3851a]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Quotation ID</label>
                  <input
                    type="text" value={quoteId} onChange={e => setQuoteId(e.target.value)}
                    className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 outline-none focus:border-[#a3851a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Lead Time</label>
                  <input
                    type="text" value={leadTime} onChange={e => setLeadTime(e.target.value)}
                    className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 outline-none focus:border-[#a3851a]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Delivery / Misc. Cost</label>
                  <input
                    type="number" value={deliveryCost} onChange={e => setDeliveryCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 outline-none focus:border-[#a3851a]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">Valid Until</label>
                <input
                  type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                  className="w-full bg-[#fdf9f2] border border-[#1c1c18]/10 p-2 outline-none focus:border-[#a3851a]"
                />
              </div>

              {/* Signature Upload */}
              <div className="space-y-2 pt-2 border-t border-[#1c1c18]/5">
                <label className="uppercase tracking-widest text-[9px] text-[#747878] font-bold block">CEO Signature Upload</label>
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
              Print Quotation
            </button>
          </div>

          {/* Printable Page Preview */}
          <div className="lg:col-span-2 bg-white border border-[#cbd5e1] p-10 md:p-16 shadow-lg print:border-none print:p-0 print:shadow-none min-h-[900px] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-10 border-b border-neutral-200 pb-6">
                <div className="font-headline text-3xl text-[#0f172a] uppercase tracking-wider font-bold">
                  Entire<span className="text-[#a3851a]">Printers</span>
                </div>
                <div className="bg-[#fef08a] color-[#854d0e] px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded">
                  Cost Quotation
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-8 mb-10 font-body text-xs p-6 bg-slate-50 rounded">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-2">Prepared For</span>
                  <p className="font-bold text-sm text-[#0f172a] mb-1">{clientName || 'Client / Business Name'}</p>
                  {clientAddress ? (
                    <p className="text-neutral-500 whitespace-pre-line leading-relaxed">{clientAddress}</p>
                  ) : (
                    <p className="text-neutral-300 italic">No address provided</p>
                  )}
                  {clientEmail && <p className="text-neutral-500 mt-1">Email: {clientEmail}</p>}
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block mb-2 font-body">Quotation Reference</span>
                  <p className="text-neutral-500 mb-1"><strong>Quote ID:</strong> #{quoteId}</p>
                  <p className="text-neutral-500 mb-1"><strong>Valid Until:</strong> {validUntil}</p>
                  <p className="text-neutral-500"><strong>Lead Time:</strong> {leadTime}</p>
                </div>
              </div>

              {/* Items Entry form */}
              <div className="print:hidden space-y-4 mb-6">
                <span className="text-[9px] uppercase tracking-widest text-[#a3851a] font-bold block">Quotation Deliverables</span>
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <input
                      type="text" value={item.description}
                      onChange={e => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Deliverable details / description..."
                      className="flex-1 bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 text-xs outline-none focus:border-[#a3851a]"
                    />
                    <input
                      type="number" value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-16 bg-[#fdf9f2] border-b border-[#1c1c18]/10 p-3 text-xs text-center outline-none focus:border-[#a3851a]"
                    />
                    <input
                      type="number" value={item.rate}
                      onChange={e => handleItemChange(index, 'rate', e.target.value)}
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
                  Add Deliverable
                </button>
              </div>

              {/* Printable Quote Table */}
              <table className="w-full border-collapse mb-10">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    <th className="py-3 text-left font-body text-[9px] uppercase tracking-widest text-[#0f172a]">Scope of Deliverables</th>
                    <th className="py-3 text-center font-body text-[9px] uppercase tracking-widest text-[#0f172a] w-20">Qty</th>
                    <th className="py-3 text-right font-body text-[9px] uppercase tracking-widest text-[#0f172a] w-28">Rate</th>
                    <th className="py-3 text-right font-body text-[9px] uppercase tracking-widest text-[#0f172a] w-28">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-4 font-body text-xs text-slate-600">{item.description || <span className="text-neutral-300 italic">No scope described</span>}</td>
                      <td className="py-4 text-center font-body text-xs text-slate-600">{item.quantity}</td>
                      <td className="py-4 text-right font-body text-xs text-slate-600">{currencySymbol} {item.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-4 text-right font-body text-xs text-[#0f172a] font-bold">{currencySymbol} {(item.rate * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary box */}
              <div className="flex justify-end mb-10">
                <table className="w-72 font-body text-xs text-slate-600">
                  <tbody>
                    <tr>
                      <td className="py-1 text-left">Subtotal</td>
                      <td className="py-1 text-right">{currencySymbol} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-left">Delivery & Packaging</td>
                      <td className="py-1 text-right">{currencySymbol} {deliveryCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="border-t border-slate-300 font-bold text-slate-800 text-sm">
                      <td className="py-2 text-left uppercase tracking-wider">Estimated Total</td>
                      <td className="py-2 text-right text-lg">{currencySymbol} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms and Specifications footer */}
            <div className="border-t border-slate-200 pt-6 flex justify-between items-end font-body text-[10px] text-slate-500 leading-relaxed">
              <div className="max-w-md">
                <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>Terms & Specifications:</p>
                <p>This quotation is valid for 30 days from the date of issue. Production begins upon a 50% deposit clearance, with the balance due immediately upon delivery verification. Price quotes are in the specified currency.</p>
              </div>
              <div className="w-48 text-center flex flex-col items-center justify-end min-h-[80px]">
                {sigImage ? (
                  <img src={sigImage} alt="CEO Signature" className="max-h-12 max-w-[150px] object-contain mb-2" />
                ) : (
                  <div className="border-b border-neutral-400 w-full h-10 mb-2"></div>
                )}
                <p className="uppercase tracking-widest font-bold text-[#0f172a] text-[9px]">M. Pranay Kumar</p>
                <p className="uppercase tracking-[0.2em] text-[7px] text-[#747878] mt-0.5 font-bold">CEO Signature</p>
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
