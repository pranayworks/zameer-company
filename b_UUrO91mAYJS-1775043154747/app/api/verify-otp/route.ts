import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'fo4_smtp_otp_secret_key_2026'

export async function POST(req: NextRequest) {
  try {
    const { email, otp, token } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Please enter both your email address and 6-digit OTP code.' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanOtp = String(otp).trim()

    if (cleanOtp.length !== 6) {
      return NextResponse.json({ error: 'Please enter a complete 6-digit OTP code.' }, { status: 400 })
    }

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'OTP session expired or missing token. Please request a new code.' }, { status: 400 })
    }

    const parts = token.split('.')
    if (parts.length !== 2) {
      return NextResponse.json({ error: 'Invalid OTP token format. Please request a new code.' }, { status: 400 })
    }

    const [expiresAtStr, signature] = parts
    const expiresAt = Number(expiresAtStr)

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return NextResponse.json({ error: 'OTP code has expired (valid for 10 minutes). Please click Resend OTP.' }, { status: 400 })
    }

    // Verify HMAC signature
    const expectedHash = crypto
      .createHmac('sha256', SECRET)
      .update(`${cleanEmail}:${cleanOtp}:${expiresAtStr}`)
      .digest('hex')

    if (expectedHash !== signature) {
      return NextResponse.json({ error: 'Incorrect 6-digit OTP code. Please check your email inbox and try again.' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      message: 'OTP verified successfully.'
    })
  } catch (error: any) {
    console.error("Error in /api/verify-otp:", error)
    return NextResponse.json({ error: error?.message || 'Failed to verify OTP code.' }, { status: 500 })
  }
}
