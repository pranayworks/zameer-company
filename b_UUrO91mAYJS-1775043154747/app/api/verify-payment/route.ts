import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing payment fields' }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    if (expectedSignature === razorpay_signature) {
      return NextResponse.json({ success: true, paymentId: razorpay_payment_id })
    } else {
      return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 })
  }
}
