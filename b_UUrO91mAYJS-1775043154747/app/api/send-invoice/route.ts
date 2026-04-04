import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/lib/email-service'

export async function POST(req: NextRequest) {
  try {
    const { email, name, orderId, items, total } = await req.json()

    if (!email || !orderId || !items || !total) {
      return NextResponse.json({ success: false, error: 'Missing required order details' }, { status: 400 })
    }

    const { success, error } = await sendOrderConfirmationEmail({
      email,
      name,
      orderId,
      items,
      total,
    })

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error in send-invoice API:', error)
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 })
  }
}
