import nodemailer from 'nodemailer'

interface SendInvoiceParams {
  email: string
  name: string
  orderId: string
  items: any[]
  total: number
}

export async function sendOrderConfirmationEmail({ email, name, orderId, items, total }: SendInvoiceParams) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'friendsof4.support@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD, 
    },
  })

  const totalDisplay = `₹${total.toLocaleString('en-IN')}`

  const mailOptions = {
    from: '"Friends of 4 Concierge" <friendsof4.support@gmail.com>',
    to: email,
    subject: "Order Confirmed! Here is What Happens Next 🎉",
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1c1c18; max-width: 600px; margin: 0 auto; border: 1px solid #eeeeee; padding: 0; background-color: #ffffff;">
        <div style="background-color: #1c1c18; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; text-transform: uppercase; letter-spacing: 0.4em; font-weight: 300; font-size: 24px; margin: 0;">Friends of 4</h1>
          <p style="color: #a3851a; text-transform: uppercase; letter-spacing: 0.2em; font-size: 10px; margin-top: 10px;">Atelier of Heritage</p>
        </div>

        <div style="padding: 40px;">
          <h2 style="font-weight: 600; font-size: 22px; color: #1c1c18; margin-bottom: 20px;">Order Confirmed</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #444444;">Hello ${name},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #444444;">Your order is being processed with the utmost care. Below are your acquisition details:</p>
          
          <div style="background-color: #f9f9f9; padding: 25px; margin: 25px 0; border-radius: 4px;">
            <p style="font-size: 12px; margin-bottom: 15px; color: #888888;"><strong>Masterpiece ID:</strong> ${orderId}</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="border-bottom: 1px solid #dddddd; text-align: left; color: #1c1c18;">
                  <th style="padding-bottom: 10px;">Item</th>
                  <th style="padding-bottom: 10px; text-align: right;">Valuation</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr style="border-bottom: 1px solid #eeeeee;">
                    <td style="padding: 15px 0;">
                      <span style="font-weight: 600; display: block; margin-bottom: 4px;">${item.name}</span>
                      <span style="color: #666666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">
                        ${item.selectedSize ? `Size: ${item.selectedSize}` : ''} 
                        ${item.selectedColor ? ` | Tone: ${item.selectedColor}` : ''}
                        | Qty: ${item.quantity}
                      </span>
                    </td>
                    <td style="padding: 15px 0; text-align: right; font-weight: 600;">₹${(typeof item.price === 'number' ? item.price * item.quantity : parseFloat(item.price.replace(/[^0-9.]/g, '')) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding-top: 20px; font-weight: bold; font-size: 14px; color: #1c1c18;">Total Amount Paid</td>
                  <td style="padding-top: 20px; text-align: right; font-weight: bold; font-size: 18px; color: #a3851a;">${totalDisplay}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background-color: #fff9eb; border-left: 4px solid #a3851a; padding: 20px; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 13px; color: #7d6613; line-height: 1.5;">
              <strong>What Happens Next:</strong><br/>
              Your order is being processed. Tracking details will be sent to this email within 48-72 hours after shipment.
            </p>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="https://wa.me/917569145624" style="background-color: #25d366; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block;">WhatsApp Support</a>
          </div>
        </div>

        <div style="background-color: #f4f4f4; padding: 30px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #eeeeee;">
          <p style="margin-bottom: 10px;">Friends of 4 Atelier &bull; Style of Tradition</p>
          <p style="margin: 0;">This is an automated communication regarding your acquisition.</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error }
  }
}

export async function sendTrackingEmail({ email, name, orderId, trackingNumber }: { email: string, name: string, orderId: string, trackingNumber: string }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'friendsof4.support@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD, 
    },
  })

  const mailOptions = {
    from: '"Friends of 4 Logistics" <friendsof4.support@gmail.com>',
    to: email,
    subject: "Your Order Has Been Shipped! 🚚",
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1c1c18; max-width: 600px; margin: 0 auto; border: 1px solid #eeeeee; padding: 0; background-color: #ffffff;">
        <div style="background-color: #1c1c18; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; text-transform: uppercase; letter-spacing: 0.4em; font-weight: 300; font-size: 24px; margin: 0;">Friends of 4</h1>
          <p style="color: #a3851a; text-transform: uppercase; letter-spacing: 0.2em; font-size: 10px; margin-top: 10px;">Atelier of Heritage</p>
        </div>

        <div style="padding: 40px;">
          <h2 style="font-weight: 600; font-size: 22px; color: #1c1c18; margin-bottom: 20px;">On Its Way</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #444444;">Hello ${name},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #444444;">Your order <strong>${orderId}</strong> has been shipped and is now on its journey to you!</p>
          
          <div style="background-color: #f9f9f9; padding: 25px; margin: 25px 0; border-radius: 4px; text-align: center;">
            <p style="font-size: 12px; margin-bottom: 5px; color: #888888; text-transform: uppercase; tracking-widest: 0.1em;">Tracking Number</p>
            <p style="font-size: 24px; font-weight: bold; color: #1c1c18; margin: 10px 0;">${trackingNumber}</p>
            <p style="font-size: 13px; color: #444444; margin-top: 15px;">
              Your order is on its way! Expected delivery in 5 to 7 business days.
            </p>
          </div>

          <div style="text-align: center; margin-top: 40px; display: flex; flex-direction: column; gap: 15px;">
            <a href="https://www.delhivery.com/track/package/${trackingNumber}" style="background-color: #1c1c18; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: block; margin-bottom: 15px;">Track Your Order</a>
            <a href="https://wa.me/917569145624" style="background-color: #25d366; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: block;">WhatsApp Support</a>
          </div>
        </div>

        <div style="background-color: #f4f4f4; padding: 30px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #eeeeee;">
          <p style="margin-bottom: 10px;">Friends of 4 Atelier &bull; Style of Tradition</p>
          <p style="margin: 0;">This is an automated communication regarding your shipment.</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending tracking email:', error)
    return { success: false, error }
  }
}

export async function sendOrderCancellationEmail({ email, name, orderId, total }: Omit<SendInvoiceParams, 'items'>) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'friendsof4.support@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD, 
    },
  })

  const totalDisplay = `₹${total.toLocaleString('en-IN')}`

  const mailOptions = {
    from: '"Friends of 4 Concierge" <friendsof4.support@gmail.com>',
    to: email,
    subject: `Cancellation Confirmed: ${orderId} - Friends of 4 Heritage`,
    html: `
      <div style="font-family: 'Times New Roman', Times, serif; color: #1c1c18; max-width: 600px; margin: 0 auto; border: 1px solid #fdf9f2; padding: 40px; background-color: #fdf9f2;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="text-transform: uppercase; letter-spacing: 0.3em; font-weight: 300; font-size: 24px; margin-bottom: 10px;">Friends of 4</h1>
          <p style="text-transform: uppercase; letter-spacing: 0.2em; font-size: 10px; color: #a3851a;">Tradition, Respectfully Closed</p>
        </div>

        <h2 style="font-weight: 300; font-size: 20px; border-bottom: 1px solid #c41e3a33; padding-bottom: 10px; color: #c41e3a;">Order Cancellation</h2>
        <p>Dear ${name},</p>
        <p>This email serves as official confirmation that your masterpiece acquisition (<strong>${orderId}</strong>) has been cancelled as per your request.</p>
        
        <div style="background-color: #ffffff; padding: 20px; margin: 20px 0; border: 1px solid #1c1c180d; opacity: 0.8;">
          <p style="font-size: 12px; margin-bottom: 15px;"><strong>Archived Order:</strong> ${orderId}</p>
          <p style="font-size: 11px;">Total Refund Value: <strong style="color: #a3851a;">${totalDisplay}</strong></p>
        </div>

        <p style="font-size: 12px; color: #747878; margin-top: 20px;">
          <strong>Next Steps:</strong> Our atelier has been notified, and your refund is being processed through our secure payment gateway. You should see the value reflected in your source account within 5-7 business days.
        </p>

        <div style="margin-top: 40px; border-top: 1px solid #1c1c181a; padding-top: 20px; font-size: 10px; color: #747878; text-align: center;">
          <p>We hope to welcome you back to our gallery soon to discover another signature style.</p>
          <p>Should you have any questions about your refund, contact <a href="mailto:friendsof4.support@gmail.com" style="color: #a3851a;">friendsof4.support@gmail.com</a></p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending cancellation email:', error)
    return { success: false, error }
  }
}
