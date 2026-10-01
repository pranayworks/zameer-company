'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useMode } from '@/context/mode-context'

interface QuoteItem {
  description: string
  quantity: number
  rate: number
}

export default function QuotationCreatorPage() {
  const router = useRouter()
  const { modeDetails, mode } = useMode()

  // Quotation form states
  const [clientName, setClientName] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [quoteId, setQuoteId] = useState('QT-' + Date.now().toString().slice(-6))
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
  const [leadTime, setLeadTime] = useState('5-7 Business Days')
  const [deliveryCost, setDeliveryCost] = useState(500)
  const [currencySymbol, setCurrencySymbol] = useState('₹')
  const [sigImage, setSigImage] = useState<string | null>(null)
  const [signatoryRole, setSignatoryRole] = useState<'ceo' | 'founder'>('ceo')

  const [items, setItems] = useState<QuoteItem[]>([
    { description: 'Custom Haute Couture Commission', quantity: 1, rate: 12000 }
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
    <div className="min-h-screen font-body transition-colors duration-700 print:bg-white print:text-black" style={{ backgroundColor: modeDetails.themeBg, color: '#F4F1EA' }}>
      <div className="print:hidden">
        <Header />
      </div>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto print:pt-0 print:pb-0 print:px-0">
        
        {/* BACK BUTTON */}
        <div className="mb-6 print:hidden flex items-center justify-between">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold transition-all hover:opacity-80"
            style={{ color: modeDetails.accentColor }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Command Center
          </button>

          <span className="text-[10px] font-mono uppercase tracking-widest text-[#D6CEBE]/70">
            CLIENT QUOTATION CREATOR • {mode.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
          {/* Interactive Form Controls */}
          <div className="lg:col-span-1 p-6 border rounded-2xl space-y-6 print:hidden shadow-xl" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
            <h2 className="font-serif-editorial text-2xl text-white uppercase">Quotation Generator</h2>
            <p className="font-mono text-xs text-[#D6CEBE]/70 leading-relaxed">Fill out details below to generate a corporate cost estimation sheet matching {mode.toUpperCase()} mode.</p>

            <div className="space-y-4 font-mono text-xs text-white">
              <div className="space-y-1">
                <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">Client / Business Name</label>
                <input
                  type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                  className="w-full border p-2.5 outline-none rounded"
                  style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  placeholder="e.g. Zameer Luxury Enterprise"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">Address</label>
                <textarea
                  value={clientAddress} onChange={e => setClientAddress(e.target.value)}
                  className="w-full border p-2.5 outline-none h-20 resize-none rounded"
                  style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  placeholder="e.g. Indiranagar, Bengaluru"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">Email</label>
                <input
                  type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                  className="w-full border p-2.5 outline-none rounded"
                  style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  placeholder="client@domain.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">Quotation ID</label>
                  <input
                    type="text" value={quoteId} onChange={e => setQuoteId(e.target.value)}
                    className="w-full border p-2.5 outline-none rounded"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">Lead Time</label>
                  <input
                    type="text" value={leadTime} onChange={e => setLeadTime(e.target.value)}
                    className="w-full border p-2.5 outline-none rounded"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">Signatory Representative</label>
                <select
                  value={signatoryRole}
                  onChange={e => setSignatoryRole(e.target.value as 'ceo' | 'founder')}
                  className="w-full border p-2.5 text-xs outline-none rounded cursor-pointer"
                  style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                >
                  <option value="ceo">M. Pranay Kumar (CEO)</option>
                  <option value="founder">Zameer Pattan (Founder)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">Signature Upload</label>
                <input
                  type="file" accept="image/*" onChange={handleSigUpload}
                  className="w-full text-xs text-[#D6CEBE]"
                />
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="w-full py-4 text-xs font-mono font-bold uppercase tracking-widest rounded transition-all shadow-lg flex items-center justify-center gap-2"
              style={{ backgroundColor: modeDetails.accentColor, color: modeDetails.themeBg }}
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Print Client Quotation
            </button>
          </div>

          {/* Printable Page Preview */}
          <div className="lg:col-span-2 bg-white text-black p-10 md:p-14 shadow-2xl rounded-2xl print:border-none print:p-0 print:shadow-none min-h-[850px] flex flex-col justify-between border border-gray-300">
            <div>
              <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-6">
                <div>
                  <h1 className="font-serif-editorial text-3xl font-bold text-black uppercase">FRIENDS OF 4</h1>
                  <p className="font-mono text-[9px] text-gray-600 uppercase tracking-widest mt-1">HAUTE COUTURE & ARCHITECTURAL STREETWEAR QUOTATION</p>
                </div>
                <div className="text-right font-mono">
                  <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase rounded">COST ESTIMATION</span>
                  <p className="text-xs text-gray-700 mt-2 font-bold">Ref: #{quoteId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 font-mono text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Prepared For</span>
                  <p className="font-bold text-sm text-black mb-1">{clientName || 'Client Name'}</p>
                  <p className="text-gray-700 whitespace-pre-line">{clientAddress || 'No address provided'}</p>
                  {clientEmail && <p className="text-gray-700 mt-1">Email: {clientEmail}</p>}
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Quotation Metadata</span>
                  <p className="text-gray-700 mb-1"><strong>Valid Until:</strong> {validUntil}</p>
                  <p className="text-gray-700"><strong>Production Lead Time:</strong> {leadTime}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full border-collapse mb-8 font-mono text-xs">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="py-2.5 text-left uppercase text-[9px]">Deliverable Scope</th>
                    <th className="py-2.5 text-center uppercase text-[9px] w-20">Qty</th>
                    <th className="py-2.5 text-right uppercase text-[9px] w-28">Rate</th>
                    <th className="py-2.5 text-right uppercase text-[9px] w-28">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3 text-gray-800">{item.description || 'Deliverable'}</td>
                      <td className="py-3 text-center text-gray-800">{item.quantity}</td>
                      <td className="py-3 text-right text-gray-800">{currencySymbol} {item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 text-right text-black font-bold">{currencySymbol} {(item.rate * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-8 font-mono text-xs">
                <table className="w-72">
                  <tbody>
                    <tr>
                      <td className="py-1 text-left text-gray-600">Subtotal</td>
                      <td className="py-1 text-right text-black font-bold">{currencySymbol} {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-left text-gray-600">Insured Transport</td>
                      <td className="py-1 text-right text-black font-bold">{currencySymbol} {deliveryCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="border-t-2 border-black font-bold text-black text-sm">
                      <td className="py-2 text-left uppercase">Estimated Total</td>
                      <td className="py-2 text-right text-base">{currencySymbol} {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-6 flex justify-between items-end font-mono text-[9px] text-gray-600 leading-relaxed">
              <div className="max-w-md">
                <span className="uppercase font-bold text-black block mb-1">Specifications</span>
                <p>This quotation is valid for 30 days. Custom commissions commence upon 50% deposit clearance.</p>
              </div>
              <div className="w-48 text-center flex flex-col items-center justify-end">
                {sigImage ? (
                  <img src={sigImage} alt="Signature" className="max-h-12 max-w-[140px] object-contain mb-1" />
                ) : (
                  <div className="border-b border-black w-full h-8 mb-1"></div>
                )}
                <p className="uppercase font-bold text-black text-[9px]">
                  {signatoryRole === 'ceo' ? 'M. Pranay Kumar' : 'Zameer Pattan'}
                </p>
                <p className="uppercase text-[8px] text-gray-500 font-bold">
                  {signatoryRole === 'ceo' ? 'CEO Representative' : 'Founder Representative'}
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
