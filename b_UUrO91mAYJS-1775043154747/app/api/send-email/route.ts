import { NextRequest, NextResponse } from 'next/server'
import { sendCustomClientEmail, sendBroadcastAnnouncementEmail } from '@/lib/email-service'

export async function POST(req: NextRequest) {
  try {
    const { mode, email, emails, name, subject, messageBody, appPassword } = await req.json()

    if (!subject || !messageBody) {
      return NextResponse.json({ success: false, error: 'Subject and message content are required.' }, { status: 400 })
    }

    if (mode === 'broadcast') {
      const recipientList: string[] = Array.isArray(emails) ? emails.filter(Boolean) : []
      if (recipientList.length === 0) {
        return NextResponse.json({ success: false, error: 'No recipient email addresses found.' }, { status: 400 })
      }

      const res = await sendBroadcastAnnouncementEmail({
        recipientEmails: recipientList,
        subject,
        messageBody,
        customPass: appPassword
      })

      if (res.success) {
        return NextResponse.json({
          success: true,
          count: recipientList.length,
          note: `✓ Broadcast email sent to ${recipientList.length} clients from friendsof4.support@gmail.com!`
        })
      } else {
        const errStr = res.error ? String(res.error) : 'Failed to dispatch broadcast.'
        const isBadCreds = errStr.includes('535') || errStr.includes('BadCredentials') || errStr.includes('Username and Password not accepted')
        const finalError = isBadCreds
          ? 'Gmail Authentication Error (535 Bad Credentials): Please ensure 2-Step Verification is ON for friendsof4.support@gmail.com and generate a fresh 16-character App Password at https://myaccount.google.com/apppasswords then update GMAIL_APP_PASSWORD in .env.local.'
          : errStr
        return NextResponse.json({ success: false, error: finalError }, { status: 500 })
      }
    } else {
      // Single client email
      if (!email) {
        return NextResponse.json({ success: false, error: 'Target customer email address is required.' }, { status: 400 })
      }

      const res = await sendCustomClientEmail({
        toEmail: email,
        name: name || 'Valued Client',
        subject,
        messageBody,
        customPass: appPassword
      })

      if (res.success) {
        return NextResponse.json({
          success: true,
          note: `✓ Email successfully delivered to ${email} from friendsof4.support@gmail.com!`
        })
      } else {
        const errStr = res.error ? String(res.error) : 'Failed to send email.'
        const isBadCreds = errStr.includes('535') || errStr.includes('BadCredentials') || errStr.includes('Username and Password not accepted')
        const finalError = isBadCreds
          ? 'Gmail Authentication Error (535 Bad Credentials): Please ensure 2-Step Verification is ON for friendsof4.support@gmail.com and generate a fresh 16-character App Password at https://myaccount.google.com/apppasswords then update GMAIL_APP_PASSWORD in .env.local.'
          : errStr
        return NextResponse.json({ success: false, error: finalError }, { status: 500 })
      }
    }
  } catch (error: any) {
    console.error('Error in send-email API:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}
