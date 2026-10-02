import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 })
    }

    const key_id = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '').trim()
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim()

    if (!key_id || !key_secret) {
      return NextResponse.json({
        error: 'Razorpay API Key ID or Key Secret is missing. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.',
        isRealKey: false
      }, { status: 500 })
    }

    try {
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
    } catch (err: any) {
      console.error("Razorpay order creation failed:", err)
      const razorpayErrorDesc = err?.error?.description || err?.message || 'Failed to authenticate with Razorpay'
      return NextResponse.json({
        error: `Razorpay Gateway Error: ${razorpayErrorDesc}. If you regenerated API keys in Razorpay dashboard, please update NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment configuration (.env.local & Vercel).`,
        key: key_id,
        isRealKey: false
      }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({
      error: error?.message || 'Server error during order creation',
      isRealKey: false,
    }, { status: 500 })
  }
}





