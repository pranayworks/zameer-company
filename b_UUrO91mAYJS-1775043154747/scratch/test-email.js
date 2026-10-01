const nodemailer = require('nodemailer');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const lines = envContent.split('\n');
let pass = '';
lines.forEach(line => {
  if (line.startsWith('GMAIL_APP_PASSWORD=')) {
    pass = line.replace('GMAIL_APP_PASSWORD=', '').trim().replace(/\s+/g, '');
  }
});

async function test() {
  const user = 'friendsof4.support@gmail.com';

  console.log('Testing Gmail SMTP with user:', user, 'and pass:', pass);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  try {
    const info = await transporter.sendMail({
      from: '"Friends of 4 Test" <friendsof4.support@gmail.com>',
      to: 'friendsof4.support@gmail.com',
      subject: 'Test Email Connection',
      text: 'Testing Gmail App Password authentication.'
    });
    console.log('SUCCESS:', info);
  } catch (err) {
    console.error('SMTP ERROR:', err.message || err);
  }
}

test();
