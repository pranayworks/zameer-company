import { NextRequest, NextResponse } from 'next/server'
import { sendTrackingEmail } from '@/lib/email-service'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, name, orderId, trackingNumber, internalId } = await req.json()

    if (!orderId || !trackingNumber || !internalId) {
      return NextResponse.json({ success: false, error: 'Missing required tracking details' }, { status: 400 })
    }

    // 1. Update database with shipment tracking ID
    const { error: dbError } = await supabase
      .from('orders')
      .update({ 
        shipment_id: trackingNumber,
        order_status: 'Dispatched'
      })
      .eq('id', internalId)

    if (dbError) {
      console.error('Database tracking update error:', dbError)
      return NextResponse.json({ success: false, error: 'Failed to update database' }, { status: 500 })
    }

    // 2. Attempt to send tracking email (if SMTP configured)
    if (email) {
      try {
        const { success } = await sendTrackingEmail({
          email,
          name: name || 'Valued Client',
          orderId,
          trackingNumber,
        })
        if (success) {
          return NextResponse.json({ success: true, note: 'Tracking email sent to client.' })
        }
      } catch (err) {
        console.warn('Tracking email dispatch skipped (SMTP unconfigured):', err)
      }
    }

    return NextResponse.json({ 
      success: true, 
      note: 'Shipment tracking number recorded in order log.' 
    })
  } catch (error: any) {
    console.error('Error in send-tracking-email API:', error)
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 })
  }
}
