import { NextRequest, NextResponse } from 'next/server'
import { createShiprocketOrder } from '@/lib/shiprocket-service'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, customerName, email, phone, address, city, state, pincode, items, paymentMethod, subtotal, shippingFee, finalTotal } = body

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 })
    }

    // Check if order already has a Shiprocket Order ID in DB to prevent duplicates
    const cleanId = String(orderId).replace('ORD-', '')
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .or(`order_id.eq.${cleanId},order_id.eq.${orderId}`)
      .single()

    if (existingOrder?.shiprocket_order_id) {
      return NextResponse.json({
        success: true,
        alreadyCreated: true,
        shiprocketOrderId: existingOrder.shiprocket_order_id,
        shipmentId: existingOrder.shipment_id,
        awbCode: existingOrder.awb_code,
        message: 'Shiprocket order already exists for this FO4 order.'
      })
    }

    // Consolidate order parameters from DB if full payload wasn't sent
    const targetName = customerName || existingOrder?.customer_name || 'Valued Client'
    const targetEmail = email || existingOrder?.email || 'client@friendsof4.in'
    const targetPhone = phone || existingOrder?.phone || '9876543210'
    const targetAddress = address || existingOrder?.address || ''
    const targetPaymentMethod = paymentMethod || existingOrder?.payment_method || 'Prepaid'
    const targetTotal = finalTotal || existingOrder?.price || 4800
    const targetSubtotal = subtotal || targetTotal

    const orderItems = items && Array.isArray(items) && items.length > 0
      ? items.map((i: any) => ({
          name: i.name || i.product_name || 'FO4 Piece',
          sku: i.sku || `FO4-${(i.name || 'PC').slice(0, 6).toUpperCase()}`,
          units: i.quantity || i.units || 1,
          selling_price: i.price || i.selling_price || 4800,
        }))
      : [{
          name: existingOrder?.product_name || 'FO4 Archival Garment',
          sku: `FO4-PIECE-${cleanId}`,
          units: 1,
          selling_price: targetTotal,
        }]

    const result = await createShiprocketOrder({
      orderId: String(orderId),
      customerName: targetName,
      email: targetEmail,
      phone: targetPhone,
      address: targetAddress,
      city,
      state,
      pincode,
      items: orderItems,
      paymentMethod: targetPaymentMethod === 'COD' ? 'COD' : 'Prepaid',
      subtotal: targetSubtotal,
      shippingFee: shippingFee || 0,
      finalTotal: targetTotal,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, details: result.details }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      shiprocketOrderId: result.shiprocketOrderId,
      shipmentId: result.shipmentId,
      status: result.status
    })
  } catch (error: any) {
    console.error('Shiprocket Create Order Route Error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Server error creating Shiprocket order' }, { status: 500 })
  }
}
