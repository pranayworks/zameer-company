import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

let razorpayInstance: Razorpay | null = null

function getRazorpay() {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'fallback_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'fallback_secret',
    })
  }
  return razorpayInstance
}

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const razorpay = getRazorpay()
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert ₹ to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error)
    
    // Extract the exact error description from Razorpay if available
    const exactError = error?.error?.description || error?.description || error?.message || 'Failed to create order'
    
    return NextResponse.json(
      { error: exactError },
      { status: 500 }
    )
  }
}
