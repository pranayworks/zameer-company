import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendOtpEmail } from '@/lib/email-service'
import { sendOtpSms } from '@/lib/sms-service'

const SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'fo4_smtp_otp_secret_key_2026'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rawTarget = body.target || body.email || body.phone

    if (!rawTarget || typeof rawTarget !== 'string') {
      return NextResponse.json({ error: 'Please enter your email address or 10-digit mobile number.' }, { status: 400 })
    }

    const input = rawTarget.trim()
    const isEmail = input.includes('@')
    const digitsOnly = input.replace(/[^0-9]/g, '')
    const isPhone = !isEmail && digitsOnly.length >= 10

    if (!isEmail && !isPhone) {
      return NextResponse.json({ error: 'Please enter a valid email address or 10-digit mobile number.' }, { status: 400 })
    }

    const cleanTarget = isEmail ? input.toLowerCase() : digitsOnly.slice(-10)

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // 10 minute expiration timestamp
    const expiresAt = Date.now() + 10 * 60 * 1000

    // Compute HMAC signature for stateless verification across serverless instances
    const hash = crypto
      .createHmac('sha256', SECRET)
      .update(`${cleanTarget}:${otp}:${expiresAt}`)
      .digest('hex')

    const token = `${expiresAt}.${hash}`

    let dispatchType: 'email' | 'sms' = isEmail ? 'email' : 'sms'
    let dispatchMsg = ''

    if (isEmail) {
      const mailRes = await sendOtpEmail({ email: cleanTarget, otp })
      if (!mailRes.success) {
        console.warn("SMTP OTP email fallback notice:", mailRes.error)
      }
      dispatchMsg = `A 6-digit OTP code has been dispatched via email to ${cleanTarget}.`
    } else {
      const smsRes = await sendOtpSms({ phone: cleanTarget, otp })
      if (!smsRes.success) {
        console.warn("SMS OTP dispatch notice:", smsRes.error)
      }
      dispatchMsg = `A 6-digit OTP code has been dispatched via SMS to +91 ${cleanTarget}.`
    }

    return NextResponse.json({
      success: true,
      token,
      target: cleanTarget,
      type: dispatchType,
      message: dispatchMsg
    })
  } catch (error: any) {
    console.error("Error in /api/send-otp:", error)
    return NextResponse.json({ error: error?.message || 'Failed to dispatch OTP code.' }, { status: 500 })
  }
}
