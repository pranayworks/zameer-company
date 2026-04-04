import nodemailer from 'nodemailer'

interface SendInvoiceParams {
  email: string
  name: string
  orderId: string
  items: any[]
  total: number
}

export async function sendOrderConfirmationEmail({ email, name, orderId, items, total }: SendInvoiceParams) {
  // Gmail SMTP transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'friendsof4.support@gmail.com',
      // Note: Use an App Password for Gmail, not your personal password
      pass: process.env.GMAIL_APP_PASSWORD, 
    },
  })

  // Format amount for display
  const totalDisplay = `₹${total.toLocaleString('en-IN')}`

  const mailOptions = {
    from: '"Friends of 4 Support" <friendsof4.support@gmail.com>',
    to: email,
    subject: `Order Confirmed: ${orderId} - Friends of 4 Heritage`,
    html: `
      <div style="font-family: 'Times New Roman', Times, serif; color: #1c1c18; max-width: 600px; margin: 0 auto; border: 1px solid #fdf9f2; padding: 40px; background-color: #fdf9f2;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="text-transform: uppercase; letter-spacing: 0.3em; font-weight: 300; font-size: 24px; margin-bottom: 10px;">Friends of 4</h1>
          <p style="text-transform: uppercase; letter-spacing: 0.2em; font-size: 10px; color: #a3851a;">Style of Tradition</p>
        </div>

        <h2 style="font-weight: 300; font-size: 20px; border-bottom: 1px solid #1c1c181a; padding-bottom: 10px;">Order Confirmation</h2>
        <p>Dear ${name},</p>
        <p>Thank you for choosing Friends of 4. Your bespoke order has been successfully placed and is now being meticulously curated by our atelier.</p>
        
        <div style="background-color: #ffffff; padding: 20px; margin: 20px 0; border: 1px solid #1c1c180d;">
          <p style="font-size: 12px; margin-bottom: 15px;"><strong>Order ID:</strong> ${orderId}</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="border-bottom: 1px solid #1c1c181a; text-align: left; text-transform: uppercase; letter-spacing: 0.1em;">
                <th style="padding-bottom: 10px;">Item</th>
                <th style="padding-bottom: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr style="border-bottom: 1px solid #1c1c1808;">
                  <td style="padding: 10px 0;">
                    ${item.name} (${item.quantity})<br/>
                    <small style="color: #747878;">${item.selectedSize ? `Size: ${item.selectedSize}` : ''} ${item.selectedColor ? `Color: ${item.selectedColor}` : ''}</small>
                  </td>
                  <td style="padding: 10px 0; text-align: right;">₹${(typeof item.price === 'number' ? item.price * item.quantity : parseFloat(item.price.replace('₹', '').replace(',', '')) * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding-top: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Grand Total</td>
                <td style="padding-top: 15px; text-align: right; font-weight: bold; font-size: 16px; color: #a3851a;">${totalDisplay}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="margin-top: 40px; border-top: 1px solid #1c1c181a; padding-top: 20px; font-size: 10px; color: #747878; text-align: center;">
          <p>This is an automated confirmation of your order. A digital invoice will be available for download in your account dashboard.</p>
          <p>Should you have any queries, please reach out to our concierge at <a href="mailto:friendsof4.support@gmail.com" style="color: #a3851a;">friendsof4.support@gmail.com</a></p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Order confirmation email sent successfully')
    return { success: true }
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error }
  }
}
