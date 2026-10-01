import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase'
import { sendOrderConfirmationEmail } from '@/lib/email-service'

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyText)
        .digest('hex')

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
      }
    }

    const payload = JSON.parse(bodyText)
    const event = payload.event

    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload.payload?.payment?.entity
      const orderId = payment?.order_id || payload.payload?.order?.entity?.id
      const paymentId = payment?.id
      const userEmail = payment?.email
      const userName = payment?.notes?.name || payment?.email || 'Valued Client'

      if (orderId) {
        // Update database order payment status
        const { data: updatedOrders, error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'Paid',
            order_status: 'Preparing'
          })
          .eq('order_id', orderId)
          .select()

        if (updateError) {
          console.warn('Webhook DB order update warning:', updateError)
        }

        // Send confirmation invoice if email exists
        if (userEmail) {
          try {
            await sendOrderConfirmationEmail({
              email: userEmail,
              name: userName,
              orderId: orderId,
              items: updatedOrders && updatedOrders.length > 0 ? updatedOrders.map(o => ({
                name: o.product_name,
                price: o.price,
                quantity: 1,
                selectedSize: o.size,
                selectedColor: o.color
              })) : [{ name: 'Archival Masterpiece', price: (payment?.amount || 0) / 100, quantity: 1 }],
              total: (payment?.amount || 0) / 100
            })
          } catch (e) {
            console.warn('Webhook invoice dispatch skipped:', e)
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok', received: true })
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error)
    return NextResponse.json({ error: error?.message || 'Webhook error' }, { status: 500 })
  }
}
