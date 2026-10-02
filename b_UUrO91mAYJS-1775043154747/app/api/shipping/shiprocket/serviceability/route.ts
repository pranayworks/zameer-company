import { NextRequest, NextResponse } from 'next/server'
import { checkCourierServiceability } from '@/lib/shiprocket-service'

export async function POST(req: NextRequest) {
  try {
    const { pincode, pickup, weight, cod } = await req.json()

    if (!pincode || pincode.length !== 6 || isNaN(Number(pincode))) {
      return NextResponse.json({ success: false, error: 'Valid 6-digit Indian pincode required.' }, { status: 400 })
    }

    const result = await checkCourierServiceability({
      deliveryPincode: pincode,
      pickupPincode: pickup,
      weight: weight ? parseFloat(weight) : 0.5,
      cod: Boolean(cod),
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, details: result.details }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Server error checking serviceability' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pincode = searchParams.get('pincode')
  const pickup = searchParams.get('pickup') || undefined
  const weight = searchParams.get('weight') ? parseFloat(searchParams.get('weight')!) : 0.5
  const cod = searchParams.get('cod') === 'true' || searchParams.get('cod') === '1'

  if (!pincode || pincode.length !== 6 || isNaN(Number(pincode))) {
    return NextResponse.json({ success: false, error: 'Valid 6-digit Indian pincode required.' }, { status: 400 })
  }

  const result = await checkCourierServiceability({
    deliveryPincode: pincode,
    pickupPincode: pickup,
    weight,
    cod,
  })

  return NextResponse.json(result)
}
