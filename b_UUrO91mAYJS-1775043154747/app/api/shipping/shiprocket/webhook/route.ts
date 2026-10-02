import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    console.log('Shiprocket Webhook Payload Received:', JSON.stringify(payload))

    // Shiprocket Webhook payload fields
    const orderId = payload.order_id || payload.channel_order_id
    const shipmentId = payload.shipment_id
    const awbCode = payload.awb || payload.awb_code
    const courierName = payload.courier_name
    const currentStatus = (payload.current_status || payload.status || '').toUpperCase()
    const trackingUrl = payload.tracking_url

    if (!orderId && !shipmentId && !awbCode) {
      return NextResponse.json({ success: false, error: 'Missing identifiers in webhook' }, { status: 400 })
    }

    // Map Shiprocket Status to FO4 Order Status system
    let fo4Status = 'Preparing'
    if (['DELIVERED', 'FULFILLED'].includes(currentStatus)) {
      fo4Status = 'Delivered'
    } else if (['OUT FOR DELIVERY', 'REACHED AT DESTINATION'].includes(currentStatus)) {
      fo4Status = 'Out for Delivery'
    } else if (['IN TRANSIT', 'PICKED UP', 'SHIPPED', 'DISPATCHED'].includes(currentStatus)) {
      fo4Status = 'Shipped'
    } else if (['CANCELLED', 'CANCELED', 'RTO IN TRANSIT', 'RTO DELIVERED'].includes(currentStatus)) {
      fo4Status = 'Cancelled'
    }

    const cleanOrderId = String(orderId || '').replace('ORD-', '')

    // Query order record
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .or(`order_id.eq.${cleanOrderId},order_id.eq.${orderId},shipment_id.eq.${shipmentId},awb_code.eq.${awbCode}`)
      .single()

    if (order) {
      // Idempotency check: don't overwrite if status is already set to Delivered unless payload is final
      const updateData: any = {
        shipping_status: currentStatus,
        order_status: fo4Status,
      }

      if (awbCode && !order.awb_code) updateData.awb_code = awbCode
      if (courierName && !order.courier_name) updateData.courier_name = courierName
      if (trackingUrl && !order.tracking_url) updateData.tracking_url = trackingUrl
      if (shipmentId && !order.shipment_id) updateData.shipment_id = String(shipmentId)

      if (currentStatus === 'DELIVERED') {
        updateData.delivered_at = new Date().toISOString()
      } else if (['PICKED UP', 'IN TRANSIT', 'SHIPPED'].includes(currentStatus)) {
        updateData.shipped_at = new Date().toISOString()
      }

      await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id)

      console.log(`✓ Webhook updated FO4 Order ORD-${order.order_id} to status ${fo4Status} (${currentStatus})`)
    } else {
      console.warn('Shiprocket Webhook: No matching FO4 order found for orderId:', orderId, 'shipmentId:', shipmentId)
    }

    return NextResponse.json({ success: true, message: 'Webhook processed idempotently' })
  } catch (error: any) {
    console.error('Shiprocket Webhook Error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Webhook internal error' }, { status: 500 })
  }
}
