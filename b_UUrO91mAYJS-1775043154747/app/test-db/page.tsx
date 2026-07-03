'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AuditResult {
  table: string
  exists: boolean
  columns: Record<string, boolean>
}

const AUDIT_SCHEMA = {
  users: ['id', 'name', 'email', 'phone', 'created_at'],
  profiles: ['id', 'name', 'email', 'phone', 'address', 'created_at'],
  products: [
    'id',
    'title',
    'price',
    'image',
    'image2',
    'image3',
    'description',
    'category',
    'stock',
    'colors',
    'sizes',
    'fabric',
    'care',
    'fit',
    'video_url',
    'return_policy',
    'created_at'
  ],
  orders: [
    'id',
    'order_id',
    'customer_name',
    'email',
    'phone',
    'address',
    'product_name',
    'size',
    'color',
    'price',
    'order_status',
    'payment_status',
    'shipment_id',
    'user_id',
    'created_at'
  ]
}

const RESOLVER_SQL = `-- 🏛️ ATELIER DATABASE REPAIR & RESOLVER SCRIPT
-- Copy this script and paste it into the Supabase Dashboard SQL Editor to automatically repair missing schemas.

-- 1. Create Core Tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Repair Users Schema
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Repair Profiles Schema
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- 4. Repair Products Schema
ALTER TABLE products ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image2 TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image3 TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS care TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS fit TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS return_policy TEXT;

-- 5. Repair Orders Schema
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'Pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Paid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID;
`

export default function TestDbPage() {
  const [results, setResults] = useState<Record<string, AuditResult>>({})
  const [loading, setLoading] = useState(true)
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'failed'>('idle')
  const [testEmailAddr, setTestEmailAddr] = useState('mamidipranay07@gmail.com')
  const [copySuccess, setCopySuccess] = useState(false)

  const runAudit = async () => {
    setLoading(true)
    const auditData: Record<string, AuditResult> = {}
    
    for (const [table, cols] of Object.entries(AUDIT_SCHEMA)) {
      const { error: tableError } = await supabase.from(table).select('id').limit(1)
      const exists = !tableError || (tableError.code !== 'P0001' && !tableError.message.includes('does not exist'))
      
      const columnsStatus: Record<string, boolean> = {}
      if (exists) {
        for (const col of cols) {
          const { error: colError } = await supabase.from(table).select(col).limit(1)
          columnsStatus[col] = !colError
        }
      } else {
        cols.forEach(col => {
          columnsStatus[col] = false
        })
      }
      
      auditData[table] = {
        table,
        exists,
        columns: columnsStatus
      }
    }
    
    setResults(auditData)
    setLoading(false)
  }

  const checkTelegram = async () => {
    setTelegramStatus('testing')
    try {
      const testMessage = `<b>🛡️ SYSTEM AUDIT BOT VERIFICATION 🛡️</b>\n\n` +
        `• <b>Status</b>: Active Connection Verified\n` +
        `• <b>Timestamp</b>: ${new Date().toLocaleString()}\n\n` +
        `<i>Your Telegram notification channel is fully authenticated.</i>`
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testMessage })
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setTelegramStatus('success')
      } else {
        setTelegramStatus('failed')
      }
    } catch {
      setTelegramStatus('failed')
    }
  }

  const sendTestEmail = async () => {
    if (!testEmailAddr.trim()) return
    setEmailStatus('sending')
    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmailAddr,
          name: 'Atelier Schema Audit Tester',
          orderId: 'TEST-' + Math.floor(Math.random() * 9000 + 1000),
          items: [
            { name: 'Heritage Saree (Diagnostic Test)', quantity: 1, price: 99, size: 'Standard', color: 'Gold' }
          ],
          total: 99
        })
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setEmailStatus('success')
      } else {
        setEmailStatus('failed')
      }
    } catch {
      setEmailStatus('failed')
    }
  }

  const handleCopySql = () => {
    navigator.clipboard.writeText(RESOLVER_SQL)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 3000)
  }

  useEffect(() => {
    runAudit()
    checkTelegram()
  }, [])

  return (
    <div className="min-h-screen bg-[#0b0f0b] text-[#e6edf3] py-16 px-6 font-mono select-none">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Title */}
        <div className="flex items-center justify-between border-b border-[#2e382e]/50 pb-6">
          <div className="flex items-center gap-3">
            <span className="text-[#9eff00] text-3xl">🛡️</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Deep Schema Audit <span className="text-[#9eff00] text-sm font-normal">v2.1</span></h1>
              <p className="text-[10px] text-[#8b949e] uppercase tracking-widest mt-1">Friends of 4 atelier diagnostics center</p>
            </div>
          </div>
          <button 
            onClick={runAudit} 
            className="border border-[#2e382e] hover:border-[#9eff00] hover:text-[#9eff00] bg-[#151c15] text-[10px] uppercase tracking-widest px-4 py-2 text-white font-bold transition-all"
          >
            Re-Run Diagnostics
          </button>
        </div>

        {/* Telegram Section */}
        <div className="border border-[#2e382e] bg-[#121612] p-6 rounded shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="text-xs uppercase font-bold text-white tracking-widest">Telegram Bot Diagnostic</h3>
                <p className="text-[10px] text-[#8b949e] uppercase mt-0.5">Verify server notification channel token & configuration</p>
              </div>
            </div>
            {telegramStatus === 'testing' && (
              <span className="text-[10px] uppercase bg-yellow-500/10 text-yellow-500 px-3 py-1 font-bold tracking-widest rounded-full animate-pulse border border-yellow-500/20">Testing Connection...</span>
            )}
            {telegramStatus === 'success' && (
              <span className="text-[10px] uppercase bg-green-500/10 text-green-500 px-3 py-1 font-bold tracking-widest rounded-full border border-green-500/20">🟢 Connected</span>
            )}
            {telegramStatus === 'failed' && (
              <span className="text-[10px] uppercase bg-red-500/10 text-red-500 px-3 py-1 font-bold tracking-widest rounded-full border border-red-500/20">🔴 Connection Failed</span>
            )}
          </div>
          <button 
            onClick={checkTelegram}
            disabled={telegramStatus === 'testing'}
            className="w-full bg-[#9eff00] hover:bg-[#82d100] text-black text-[10px] uppercase tracking-widest font-black py-3 rounded text-center transition-all disabled:opacity-50"
          >
            Trigger Telegram Diagnostic Notification
          </button>
        </div>

        {/* Email System Section */}
        <div className="border border-[#2e382e] bg-[#121612] p-6 rounded shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">✉️</span>
              <div>
                <h3 className="text-xs uppercase font-bold text-white tracking-widest">Email System Diagnostic</h3>
                <p className="text-[10px] text-[#8b949e] uppercase mt-0.5">Verify SMTP and Resend API service delivery</p>
              </div>
            </div>
            {emailStatus === 'sending' && (
              <span className="text-[10px] uppercase bg-yellow-500/10 text-yellow-500 px-3 py-1 font-bold tracking-widest rounded-full animate-pulse border border-yellow-500/20">Sending...</span>
            )}
            {emailStatus === 'success' && (
              <span className="text-[10px] uppercase bg-green-500/10 text-green-500 px-3 py-1 font-bold tracking-widest rounded-full border border-green-500/20">🟢 Email Dispatched</span>
            )}
            {emailStatus === 'failed' && (
              <span className="text-[10px] uppercase bg-red-500/10 text-red-500 px-3 py-1 font-bold tracking-widest rounded-full border border-red-500/20">🔴 Dispatch Failed</span>
            )}
          </div>
          
          <div className="flex gap-4">
            <input 
              type="email" 
              value={testEmailAddr}
              onChange={e => setTestEmailAddr(e.target.value)}
              placeholder="Enter test email address..." 
              className="flex-1 bg-[#1c231c] border border-[#2e382e] p-3 text-xs focus:border-[#9eff00] outline-none text-white font-mono"
            />
            <button 
              onClick={sendTestEmail}
              disabled={emailStatus === 'sending'}
              className="bg-[#9eff00] hover:bg-[#82d100] text-black text-[10px] uppercase tracking-widest font-black px-6 py-3 rounded transition-all disabled:opacity-50"
            >
              Send Diagnostic Test Email
            </button>
          </div>
        </div>

        {/* Database Tables Section */}
        <div className="space-y-8">
          <div className="border-b border-[#2e382e]/50 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#9eff00] flex items-center gap-2">
              <span>🗄️</span> Database Schema Check
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12 border border-[#2e382e]/50 bg-[#121612] text-xs text-[#8b949e] animate-pulse uppercase tracking-widest">
              Executing schema query tests...
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(results).map(([table, data]) => (
                <div key={table} className="border border-[#2e382e] bg-[#121612] rounded p-6 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-[#2e382e]/30 pb-3">
                    <span className="text-sm font-bold text-white uppercase tracking-wider">{table}</span>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold border ${data.exists ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {data.exists ? 'Table Found' : 'Missing Table'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(data.columns).map(([col, valid]) => (
                      <div 
                        key={col} 
                        className={`border rounded p-3 flex items-center justify-between transition-colors ${valid ? 'border-green-500/20 bg-green-500/[0.02]' : 'border-red-500/20 bg-red-500/[0.02]'}`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[8px] text-[#8b949e] uppercase font-bold tracking-widest">column</span>
                          <span className="text-xs font-semibold text-white mt-0.5">{col}</span>
                        </div>
                        <span className={`text-base font-bold ${valid ? 'text-[#9eff00]' : 'text-red-500'}`}>
                          {valid ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Final Resolver Section */}
        <div className="border border-[#2e382e] bg-[#121612] rounded p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs uppercase font-bold text-[#9eff00] tracking-widest">Final Resolver Code</h3>
              <p className="text-[10px] text-[#8b949e] uppercase mt-0.5">Run this SQL code directly in your Supabase SQL editor to resolve database schema errors</p>
            </div>
            <button 
              onClick={handleCopySql}
              className="border border-[#2e382e] hover:border-[#9eff00] hover:text-[#9eff00] bg-[#1c231c] text-[10px] uppercase tracking-widest px-4 py-2 text-white font-bold transition-all"
            >
              {copySuccess ? 'Copied ✅' : 'Copy SQL to Clipboard'}
            </button>
          </div>
          <pre className="bg-[#0b0f0b] border border-[#2e382e] p-4 text-[9px] text-[#7ee787] overflow-x-auto rounded max-h-72 font-mono leading-relaxed">
            {RESOLVER_SQL}
          </pre>
        </div>

      </div>
    </div>
  )
}
