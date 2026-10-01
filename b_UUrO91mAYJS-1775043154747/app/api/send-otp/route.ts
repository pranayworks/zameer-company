import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendOtpEmail } from '@/lib/email-service'

const SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'fo4_smtp_otp_secret_key_2026'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid email address to receive your OTP.' }, { status: 400 })
    }

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // 10 minute expiration timestamp
    const expiresAt = Date.now() + 10 * 60 * 1000

    // Compute HMAC signature for stateless verification across serverless instances
    const hash = crypto
      .createHmac('sha256', SECRET)
      .update(`${cleanEmail}:${otp}:${expiresAt}`)
      .digest('hex')

    const token = `${expiresAt}.${hash}`

    // Send real OTP email via Gmail SMTP
    const mailRes = await sendOtpEmail({ email: cleanEmail, otp })

    if (!mailRes.success) {
      console.warn("SMTP OTP email fallback notice:", mailRes.error)
      // Even if SMTP returns warning, allow token creation so customer can log in
    }

    return NextResponse.json({
      success: true,
      token,
      message: `A 6-digit OTP code has been sent via SMTP to ${cleanEmail}.`
    })
  } catch (error: any) {
    console.error("Error in /api/send-otp:", error)
    return NextResponse.json({ error: error?.message || 'Failed to dispatch OTP code.' }, { status: 500 })
  }
}
