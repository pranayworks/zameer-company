import { NextRequest, NextResponse } from 'next/server'
import { trackShipmentByAWB } from '@/lib/shiprocket-service'

export async function GET(
  req: NextRequest,
  { params }: { params: { awb: string } }
) {
  try {
    const awbCode = params.awb

    if (!awbCode) {
      return NextResponse.json({ success: false, error: 'AWB code parameter is required' }, { status: 400 })
    }

    const result = await trackShipmentByAWB(awbCode)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Server error tracking shipment' }, { status: 500 })
  }
}
