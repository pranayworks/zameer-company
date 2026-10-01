import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const key_id = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_live_Tha2BWyYXOJUkD').trim()
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || 'lWKqLYGPhq3YCWPcHryx6xIk').trim()

    if (key_id && key_secret && key_secret !== 'fallback_secret') {
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
        console.warn("Razorpay API order creation notice:", err?.message || err)
        // Fallback to client-side modal initialization if server order creation fails
        return NextResponse.json({
          orderId: null,
          amount: Math.round(amount * 100),
          currency,
          key: key_id,
          isRealKey: false,
          fallbackMode: true
        })
      }
    }

    return NextResponse.json({
      orderId: null,
      amount: Math.round(amount * 100),
      currency,
      key: key_id,
      isRealKey: false,
      fallbackMode: true
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error?.message || 'Server error during order creation',
      isRealKey: false,
    }, { status: 500 })
  }
}




