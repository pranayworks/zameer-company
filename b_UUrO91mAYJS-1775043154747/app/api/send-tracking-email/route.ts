import { NextRequest, NextResponse } from 'next/server'
import { sendTrackingEmail } from '@/lib/email-service'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, name, orderId, trackingNumber, internalId } = await req.json()

    if (!email || !orderId || !trackingNumber || !internalId) {
      return NextResponse.json({ success: false, error: 'Missing required details' }, { status: 400 })
    }

    // 1. Update database
    const { error: dbError } = await supabase
      .from('orders')
      .update({ 
        shipment_id: trackingNumber,
        order_status: 'Shipped'
      })
      .eq('id', internalId)

    if (dbError) {
      console.error('Database update error:', dbError)
      return NextResponse.json({ success: false, error: 'Failed to update database' }, { status: 500 })
    }

    // 2. Send tracking email
    const { success, error: emailError } = await sendTrackingEmail({
      email,
      name,
      orderId,
      trackingNumber,
    })

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      console.error('Email send error:', emailError)
      return NextResponse.json({ success: false, error: 'Failed to send tracking email' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error in send-tracking-email API:', error)
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 })
  }
}
