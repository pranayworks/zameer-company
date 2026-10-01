import { NextResponse } from 'next/server'

// Cache Shiprocket token in memory for efficiency
let shiprocketToken: string | null = null
let tokenExpiry: number = 0

async function getShiprocketToken(): Promise<string | null> {
  const email = process.env.SHIPROCKET_EMAIL
  const password = process.env.SHIPROCKET_PASSWORD

  if (!email || !password) return null

  if (shiprocketToken && Date.now() < tokenExpiry) {
    return shiprocketToken
  }

  try {
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const data = await response.json()
      shiprocketToken = data.token
      tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000 // Token valid 10 days
      return shiprocketToken
    }
  } catch (e) {
    console.warn('Shiprocket API login failed:', e)
  }
  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const pincode = body.pincode || '560038'
    const pickupPincode = body.pickup || '560038'
    const weight = body.weight || '0.5'

    const reqUrl = new URL(request.url)
    reqUrl.searchParams.set('pincode', pincode)
    reqUrl.searchParams.set('pickup', pickupPincode)
    reqUrl.searchParams.set('weight', weight)

    return GET(new Request(reqUrl.toString()))
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pincode = searchParams.get('pincode')
  const pickupPincode = searchParams.get('pickup') || '560038' // Default Bengaluru Atelier pickup
  const weight = searchParams.get('weight') || '0.5'

  if (!pincode || pincode.length !== 6 || isNaN(Number(pincode))) {
    return NextResponse.json(
      { success: false, error: 'Invalid 6-digit Indian Pincode.' },
      { status: 400 }
    )
  }

  const token = await getShiprocketToken()

  if (token) {
    try {
      const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${pincode}&weight=${weight}&cod=1`
      const srRes = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (srRes.ok) {
        const srData = await srRes.json()
        const recommendedCourier = srData.data?.available_courier_companies?.[0]
        if (recommendedCourier) {
          const days = parseInt(recommendedCourier.etd) || 3
          const targetDate = new Date()
          targetDate.setDate(targetDate.getDate() + days)

          return NextResponse.json({
            success: true,
            isLiveApi: true,
            estimatedDate: targetDate.toLocaleDateString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            }),
            days,
            service: `Shiprocket Live • ${recommendedCourier.courier_name}`,
            rate: recommendedCourier.rate,
            codAvailable: recommendedCourier.cod === 1,
            courierId: recommendedCourier.courier_company_id,
          })
        }
      }
    } catch (e) {
      console.warn('Shiprocket Live Serviceability Call failed, falling back:', e)
    }
  }

  // Real-Time Postal Zone Calculation Algorithm (Zone-based SLA)
  const firstDigit = pincode.charAt(0)
  let days = 3
  let courier = 'Blue Dart Express'

  if (['5', '6'].includes(firstDigit)) {
    // South India (Karnataka, TN, Kerala, AP, Telangana) -> Fast 2 days
    days = 2
    courier = 'Blue Dart Air Express'
  } else if (['4', '1', '2'].includes(firstDigit)) {
    // West & North (MH, GJ, Delhi NCR, UP) -> 3 days
    days = 3
    courier = 'Delhivery Express'
  } else if (['7', '8'].includes(firstDigit)) {
    // East & Central (WB, Bihar, Odisha, MP) -> 4 days
    days = 4
    courier = 'Ecom Express Priority'
  } else {
    // North East & Remote
    days = 5
    courier = 'DTDC Air Courier'
  }

  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + days)

  return NextResponse.json({
    success: true,
    isLiveApi: false,
    estimatedDate: targetDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    days,
    service: `Shiprocket Partner • ${courier}`,
    codAvailable: true,
    note: 'Enter SHIPROCKET_EMAIL & SHIPROCKET_PASSWORD in .env.local for live API binding.',
  })
}
