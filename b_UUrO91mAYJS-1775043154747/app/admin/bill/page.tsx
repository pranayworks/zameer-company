'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useMode } from '@/context/mode-context'

interface InvoiceItem {
  description: string
  quantity: number
  price: number
}

export default function BillBookPage() {
  const router = useRouter()
  const { modeDetails, mode } = useMode()
  
  // Invoice form states
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('INV-' + Date.now().toString().slice(-6))
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
  const [paymentMode, setPaymentMode] = useState('UPI / Bank Transfer / Card')
  const [taxRate, setTaxRate] = useState(18) // GST 18%
  const [sigImage, setSigImage] = useState<string | null>(null)
  const [signatoryRole, setSignatoryRole] = useState<'ceo' | 'founder'>('ceo')
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Atelier Limited Creation', quantity: 1, price: 6800 }
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
            BILL BOOK & TAX INVOICE GENERATOR • {mode.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
          {/* Interactive Form Controls */}
          <div className="lg:col-span-1 p-6 border rounded-2xl space-y-6 print:hidden shadow-xl" style={{ backgroundColor: modeDetails.cardBg, borderColor: modeDetails.borderColor }}>
            <h2 className="font-serif-editorial text-2xl text-white uppercase">Invoice Generator</h2>
            <p className="font-mono text-xs text-[#D6CEBE]/70 leading-relaxed">Fill out client details below to generate a custom GST invoice matching {mode.toUpperCase()} mode styling.</p>

            <div className="space-y-4 font-mono text-xs text-white">
              <div className="space-y-1">
                <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">Client / Business Name</label>
                <input
                  type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                  className="w-full border p-2.5 outline-none rounded"
                  style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">Full Address & Pincode</label>
                <textarea
                  value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                  className="w-full border p-2.5 outline-none h-20 resize-none rounded"
                  style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  placeholder="Plot 42, Indiranagar, Bengaluru - 560038"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">Email</label>
                  <input
                    type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full border p-2.5 outline-none rounded"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">Phone</label>
                  <input
                    type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full border p-2.5 outline-none rounded"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">Invoice No.</label>
                  <input
                    type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full border p-2.5 outline-none rounded"
                    style={{ backgroundColor: modeDetails.themeBg, borderColor: modeDetails.borderColor }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">GST Rate (%)</label>
                  <input
                    type="number" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
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
                <label className="uppercase text-[9px] text-[#D6CEBE] font-bold block">Upload Signature Image</label>
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
              Print VAT / GST Invoice
            </button>
          </div>

          {/* Printable Invoice Page Preview */}
          <div className="lg:col-span-2 bg-white text-black p-10 md:p-14 shadow-2xl rounded-2xl print:border-none print:p-0 print:shadow-none min-h-[850px] flex flex-col justify-between border border-gray-300">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
                <div>
                  <h1 className="font-serif-editorial text-3xl text-black font-bold uppercase tracking-wider">Friends of 4</h1>
                  <p className="font-mono text-[9px] text-gray-600 uppercase tracking-widest mt-1">FRIENDS OF 4 FASHION HOUSE LLP • GSTIN: 29AAAF48444M1Z5</p>
                </div>
                <div className="text-right font-mono">
                  <h2 className="font-serif-editorial text-2xl text-black font-bold uppercase">TAX INVOICE</h2>
                  <p className="text-xs font-bold text-gray-800 mt-1">#{invoiceNumber}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-8 mb-8 font-mono text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Billed To</span>
                  <p className="font-bold text-sm text-black mb-1">{customerName || 'Client Name'}</p>
                  <p className="text-gray-700 whitespace-pre-line">{customerAddress || 'No address provided'}</p>
                  {customerPhone && <p className="text-gray-700 mt-1">Tel: {customerPhone}</p>}
                  {customerEmail && <p className="text-gray-700">Email: {customerEmail}</p>}
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Invoice Details</span>
                  <p className="text-gray-700 mb-1"><strong>Issue Date:</strong> {invoiceDate}</p>
                  <p className="text-gray-700 mb-1"><strong>Due Date:</strong> {dueDate}</p>
                  <p className="text-gray-700"><strong>Payment Mode:</strong> {paymentMode}</p>
                </div>
              </div>

              {/* Printable Table */}
              <table className="w-full border-collapse mb-8 font-mono text-xs">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="py-2.5 text-left uppercase text-[9px]">Description</th>
                    <th className="py-2.5 text-center uppercase text-[9px] w-20">Qty</th>
                    <th className="py-2.5 text-right uppercase text-[9px] w-28">Rate</th>
                    <th className="py-2.5 text-right uppercase text-[9px] w-28">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3 text-gray-800">{item.description || 'Line item'}</td>
                      <td className="py-3 text-center text-gray-800">{item.quantity}</td>
                      <td className="py-3 text-right text-gray-800">₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 text-right text-black font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Box */}
              <div className="flex justify-end mb-8 font-mono text-xs">
                <table className="w-72">
                  <tbody>
                    <tr>
                      <td className="py-1 text-left text-gray-600">Subtotal</td>
                      <td className="py-1 text-right text-black font-bold">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-left text-gray-600">GST / Tax ({taxRate}%)</td>
                      <td className="py-1 text-right text-black font-bold">₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="border-t-2 border-black font-bold text-black text-sm">
                      <td className="py-2 text-left uppercase">Grand Total</td>
                      <td className="py-2 text-right text-base">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms and Signatures */}
            <div className="border-t border-gray-300 pt-6 flex justify-between items-end font-mono text-[9px] text-gray-600 leading-relaxed">
              <div className="max-w-md">
                <span className="uppercase font-bold text-black block mb-1">Terms & Conditions</span>
                <p>Computer generated GST invoice. Valid without physical stamp under IT Act 2000. All items subject to Friends of 4 guarantee.</p>
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
