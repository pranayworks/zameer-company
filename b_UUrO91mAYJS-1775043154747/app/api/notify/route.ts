import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (!botToken || botToken.includes('paste_your_token')) {
      return NextResponse.json({ error: 'Atelier Herald credentials not found.' }, { status: 500 });
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: data.description || 'Herald Connection Failed' }, { status: response.status });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Herald Signal Failed' }, { status: 500 });
  }
}
