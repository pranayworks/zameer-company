import { NextRequest, NextResponse } from 'next/server'
import { generateShipmentLabel } from '@/lib/shiprocket-service'

export async function POST(req: NextRequest) {
  try {
    const { shipmentId } = await req.json()

    if (!shipmentId) {
      return NextResponse.json({ success: false, error: 'shipmentId is required' }, { status: 400 })
    }

    const result = await generateShipmentLabel(shipmentId)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, details: result.details }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Server error generating label' }, { status: 500 })
  }
}
