import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET

    if (!key_id || !key_secret || key_secret === 'fallback_secret') {
      return NextResponse.json({
        isRealKey: false,
        key: key_id || null,
        error: 'Razorpay API credentials not configured in .env.local'
      })
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    })

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert ₹ to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: key_id,
      isRealKey: true,
    })
  } catch (error: any) {
    console.error('Razorpay order creation error:', error)
    const description = error?.error?.description || error?.description || error?.message || 'Authentication failed'
    return NextResponse.json({
      isRealKey: false,
      error: description,
      statusCode: error?.statusCode || 500
    })
  }
}



