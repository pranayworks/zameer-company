import { NextRequest, NextResponse } from 'next/server'
import { assignCourierAndAWB } from '@/lib/shiprocket-service'

export async function POST(req: NextRequest) {
  try {
    const { shipmentId, courierId } = await req.json()

    if (!shipmentId) {
      return NextResponse.json({ success: false, error: 'shipmentId is required' }, { status: 400 })
    }

    const result = await assignCourierAndAWB(shipmentId, courierId)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, details: result.details }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Server error assigning AWB' }, { status: 500 })
  }
}
