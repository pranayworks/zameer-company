import { NextRequest, NextResponse } from 'next/server'
import { fetchAllProducts, fetchAllOrders, CATEGORIES } from '@/lib/admin-helpers'

export async function POST(req: NextRequest) {
  try {
    const { sheetUrl } = await req.json()
    const targetUrl = sheetUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL

    if (!targetUrl) {
      return NextResponse.json({ error: 'Google Sheets Webhook URL is missing.' }, { status: 400 })
    }

    const [products, orders] = await Promise.all([
      fetchAllProducts(),
      fetchAllOrders()
    ])

    const categoriesGroup: Record<string, any[]> = {}
    CATEGORIES.forEach(cat => {
      categoriesGroup[cat] = products.filter(p => p.category === cat)
    })
    categoriesGroup['Shipment Log'] = orders

    const response = await fetch(targetUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(categoriesGroup)
    })

    const data = await response.json()

    if (response.ok && data.success) {
      return NextResponse.json({
        success: true,
        message: 'Inventory & shipment logs successfully synced to Google Sheets!',
        productsCount: products.length,
        ordersCount: orders.length
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to sync with Google Sheets Apps Script'
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Google Sheets Sync API Error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Sync connection failed' }, { status: 500 })
  }
}
