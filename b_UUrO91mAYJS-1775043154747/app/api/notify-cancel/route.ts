import { NextRequest, NextResponse } from 'next/server'
import { sendOrderCancellationEmail } from '@/lib/email-service'

export async function POST(req: NextRequest) {
  try {
    const { email, name, orderId, total } = await req.json()

    if (!email || !orderId || !total) {
      return NextResponse.json({ success: false, error: 'Missing required cancellation details' }, { status: 400 })
    }

    const { success, error } = await sendOrderCancellationEmail({
      email,
      name,
      orderId,
      total,
    })

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: 'Failed to send cancellation email' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error in notify-cancel API:', error)
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 })
  }
}
