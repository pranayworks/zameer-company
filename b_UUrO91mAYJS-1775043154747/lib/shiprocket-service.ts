import { supabase } from '@/lib/supabase'

// In-memory token cache for Shiprocket Auth
let cachedToken: string | null = null
let tokenExpiryTimestamp: number = 0

export interface ShiprocketOrderItem {
  name: string
  sku: string
  units: number
  selling_price: number
  discount?: number
  tax?: number
  hsn?: string
}

export interface CreateShiprocketOrderInput {
  orderId: string               // FO4 Order ID (e.g., ORD-849201)
  orderDate?: string            // YYYY-MM-DD HH:mm
  customerName: string
  email: string
  phone: string
  address: string
  city?: string
  state?: string
  pincode?: string
  items: ShiprocketOrderItem[]
  paymentMethod: 'Prepaid' | 'COD'
  subtotal: number
  shippingFee: number
  finalTotal: number
  weight?: number               // Default in KG (0.5 kg)
  length?: number
  breadth?: number
  height?: number
}

/**
 * 1. Retrieve or refresh Shiprocket Bearer Authentication Token
 */
export async function getShiprocketToken(): Promise<string | null> {
  const email = process.env.SHIPROCKET_EMAIL
  const password = process.env.SHIPROCKET_PASSWORD

  if (!email || !password) {
    console.warn('Shiprocket Warning: SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD is missing in server environment variables.')
    return null
  }

  // Return cached token if valid (token expires in 10 days, refresh if < 1 hour remaining)
  if (cachedToken && Date.now() < tokenExpiryTimestamp - 3600000) {
    return cachedToken
  }

  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Shiprocket Authentication Failed:', res.status, errText)
      return null
    }

    const data = await res.json()
    if (data.token) {
      cachedToken = data.token
      tokenExpiryTimestamp = Date.now() + 9 * 24 * 60 * 60 * 1000 // Cache for 9 days
      return cachedToken
    }
  } catch (error: any) {
    console.error('Shiprocket Auth API Exception:', error?.message || error)
  }

  return null
}

/**
 * 2. Check Courier Serviceability & Rates by Pincode
 */
export async function checkCourierServiceability(params: {
  deliveryPincode: string
  pickupPincode?: string
  weight?: number
  cod?: boolean
}) {
  const token = await getShiprocketToken()
  if (!token) {
    return { success: false, error: 'Shiprocket authentication unavailable' }
  }

  const pickup = params.pickupPincode || '560038' // Default Atelier Bengaluru warehouse
  const weight = params.weight || 0.5
  const codFlag = params.cod ? 1 : 0

  try {
    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickup}&delivery_postcode=${params.deliveryPincode}&weight=${weight}&cod=${codFlag}`
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const errText = await res.text()
      return { success: false, error: `Shiprocket serviceability error: ${res.statusText}`, details: errText }
    }

    const data = await res.json()
    const availableCouriers = data.data?.available_courier_companies || []

    return {
      success: true,
      couriers: availableCouriers.map((c: any) => ({
        courierId: c.courier_company_id,
        courierName: c.courier_name,
        minWeight: c.min_weight,
        rate: c.rate,
        etd: c.etd,
        estimatedDays: parseInt(c.etd) || 3,
        codAvailable: c.cod === 1,
        rating: c.rating,
      })),
      recommendedCourier: availableCouriers[0] ? {
        courierId: availableCouriers[0].courier_company_id,
        courierName: availableCouriers[0].courier_name,
        rate: availableCouriers[0].rate,
        etd: availableCouriers[0].etd,
      } : null,
    }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to connect to Shiprocket serviceability' }
  }
}

/**
 * Helper to parse address string into components if structured state isn't directly passed
 */
function parseAddressComponents(rawAddress: string, defaultCity = 'Bengaluru', defaultState = 'Karnataka', defaultPincode = '560038') {
  const cleanAddr = rawAddress.replace(/\s\[.* Delivery: ₹\d+\]/, '').trim()
  
  // Try extracting 6-digit Indian pincode
  const pincodeMatch = cleanAddr.match(/\b\d{6}\b/)
  const pincode = pincodeMatch ? pincodeMatch[0] : defaultPincode

  // Simple state & city extraction heuristic
  let city = defaultCity
  let state = defaultState

  if (cleanAddr.toLowerCase().includes('bengaluru') || cleanAddr.toLowerCase().includes('bangalore')) {
    city = 'Bengaluru'
    state = 'Karnataka'
  } else if (cleanAddr.toLowerCase().includes('mumbai')) {
    city = 'Mumbai'
    state = 'Maharashtra'
  } else if (cleanAddr.toLowerCase().includes('delhi')) {
    city = 'New Delhi'
    state = 'Delhi'
  } else if (cleanAddr.toLowerCase().includes('hyderabad')) {
    city = 'Hyderabad'
    state = 'Telangana'
  } else if (cleanAddr.toLowerCase().includes('chennai')) {
    city = 'Chennai'
    state = 'Tamil Nadu'
  } else if (cleanAddr.toLowerCase().includes('kolkata')) {
    city = 'Kolkata'
    state = 'West Bengal'
  }

  return { cleanAddr, city, state, pincode }
}

/**
 * 3. Create Shiprocket Adhoc Order (Prepaid & COD)
 */
export async function createShiprocketOrder(input: CreateShiprocketOrderInput) {
  const token = await getShiprocketToken()
  if (!token) {
    return { success: false, error: 'Shiprocket API credentials missing or authentication failed' }
  }

  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary'
  const parsed = parseAddressComponents(input.address, input.city, input.state, input.pincode)

  const nameParts = (input.customerName || 'Valued Client').trim().split(' ')
  const firstName = nameParts[0] || 'Valued'
  const lastName = nameParts.slice(1).join(' ') || 'Client'

  const formattedDate = input.orderDate || new Date().toISOString().slice(0, 19).replace('T', ' ')

  const payload = {
    order_id: input.orderId,
    order_date: formattedDate,
    pickup_location: pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: parsed.cleanAddr.slice(0, 100),
    billing_address_2: parsed.cleanAddr.slice(100, 200) || '',
    billing_city: input.city || parsed.city,
    billing_pincode: input.pincode || parsed.pincode,
    billing_state: input.state || parsed.state,
    billing_country: 'India',
    billing_email: input.email || 'client@friendsof4.in',
    billing_phone: input.phone?.replace(/[^0-9]/g, '').slice(-10) || '9876543210',
    shipping_is_billing: true,
    order_items: input.items.map(item => ({
      name: item.name || 'FO4 Archival Garment',
      sku: item.sku || `FO4-${(item.name || 'PC').toUpperCase().slice(0, 8)}-${Date.now().toString().slice(-4)}`,
      units: item.units || 1,
      selling_price: item.selling_price || 4800,
      discount: item.discount || 0,
      tax: item.tax || 0,
      hsn: item.hsn || '',
    })),
    payment_method: input.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
    shipping_charges: input.shippingFee || 0,
    sub_total: input.subtotal || input.finalTotal,
    length: input.length || 15,
    breadth: input.breadth || 15,
    height: input.height || 10,
    weight: input.weight || 0.5,
  }

  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok || data.status_code === 400 || data.error) {
      console.error('Shiprocket Order Creation Error Payload Response:', data)
      return {
        success: false,
        error: data.message || data.error || 'Failed to create order on Shiprocket',
        details: data
      }
    }

    const shiprocketOrderId = String(data.order_id)
    const shipmentId = String(data.shipment_id)

    // Update database record in Supabase
    try {
      const cleanOrderId = input.orderId.replace('ORD-', '')
      await supabase
        .from('orders')
        .update({
          shiprocket_order_id: shiprocketOrderId,
          shipment_id: shipmentId,
          shipping_status: 'NEW',
          payment_method: input.paymentMethod,
        })
        .or(`order_id.eq.${cleanOrderId},order_id.eq.${input.orderId}`)
    } catch (dbErr) {
      console.warn('Supabase order update warning:', dbErr)
    }

    return {
      success: true,
      shiprocketOrderId,
      shipmentId,
      status: data.status,
      statusCode: data.status_code,
      data
    }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Network exception calling Shiprocket order creation' }
  }
}

/**
 * 4. Assign Courier & Generate AWB Code
 */
export async function assignCourierAndAWB(shipmentId: string | number, courierId?: string | number) {
  const token = await getShiprocketToken()
  if (!token) return { success: false, error: 'Shiprocket authentication failed' }

  try {
    const payload: any = { shipment_id: String(shipmentId) }
    if (courierId) payload.courier_id = String(courierId)

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok || data.status === 0 || data.awb_assign_status === 0) {
      return {
        success: false,
        error: data.response?.data?.awb_assign_error || data.message || 'AWB assignment failed',
        details: data
      }
    }

    const awbCode = data.response?.data?.awb_code
    const courierName = data.response?.data?.courier_name

    // Update DB with AWB & Courier details
    if (awbCode) {
      try {
        await supabase
          .from('orders')
          .update({
            awb_code: awbCode,
            courier_name: courierName,
            shipping_status: 'AWB_ASSIGNED'
          })
          .eq('shipment_id', String(shipmentId))
      } catch (dbErr) {}
    }

    return {
      success: true,
      awbCode,
      courierName,
      courierCompanyId: data.response?.data?.courier_company_id,
      data
    }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error assigning AWB' }
  }
}

/**
 * 5. Request / Schedule Driver Pickup
 */
export async function scheduleShipmentPickup(shipmentId: string | number) {
  const token = await getShiprocketToken()
  if (!token) return { success: false, error: 'Shiprocket authentication failed' }

  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/courier/generate/pickup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shipment_id: [String(shipmentId)] }),
    })

    const data = await res.json()
    if (!res.ok || data.status === 0) {
      return { success: false, error: data.message || 'Pickup scheduling failed', details: data }
    }

    try {
      await supabase
        .from('orders')
        .update({
          shipping_status: 'PICKUP_SCHEDULED',
          pickup_scheduled_at: new Date().toISOString()
        })
        .eq('shipment_id', String(shipmentId))
    } catch (e) {}

    return {
      success: true,
      pickupScheduledAt: new Date().toISOString(),
      data
    }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error scheduling pickup' }
  }
}

/**
 * 6. Generate & Get Shipping Label URL
 */
export async function generateShipmentLabel(shipmentId: string | number) {
  const token = await getShiprocketToken()
  if (!token) return { success: false, error: 'Shiprocket authentication failed' }

  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/courier/generate/label', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shipment_id: [String(shipmentId)] }),
    })

    const data = await res.json()
    const labelUrl = data.label_url || data.label_created_url

    if (labelUrl) {
      try {
        await supabase
          .from('orders')
          .update({ label_url: labelUrl })
          .eq('shipment_id', String(shipmentId))
      } catch (e) {}

      return { success: true, labelUrl }
    }

    return { success: false, error: data.message || 'Label generation pending or failed', details: data }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error generating label' }
  }
}

/**
 * 7. Track Live Shipment Status by AWB Code
 */
export async function trackShipmentByAWB(awbCode: string) {
  const token = await getShiprocketToken()
  if (!token) return { success: false, error: 'Shiprocket authentication failed' }

  try {
    const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      return { success: false, error: `Tracking API returned status ${res.status}` }
    }

    const data = await res.json()
    const trackingData = data.tracking_data || {}
    const shipmentTrack = trackingData.shipment_track?.[0] || {}
    const trackActivities = trackingData.shipment_track_activities || []

    const currentStatus = shipmentTrack.current_status || trackingData.track_status || 'IN TRANSIT'
    const courierName = shipmentTrack.courier_name || ''
    const etd = shipmentTrack.etd || ''

    return {
      success: true,
      awbCode,
      currentStatus,
      courierName,
      etd,
      origin: shipmentTrack.origin || 'Bengaluru Atelier',
      destination: shipmentTrack.destination || '',
      activities: trackActivities.map((act: any) => ({
        date: act.date,
        activity: act.activity,
        location: act.location,
        status: act['sr-status-label'] || act.status
      })),
      raw: data
    }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Tracking service error' }
  }
}
