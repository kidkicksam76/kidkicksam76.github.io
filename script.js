import { serve } from "https://deno.land"

serve(async (req) => {
  try {
    // Only accept POST requests from Supabase Webhooks
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const payload = await req.json()
    
    // Extract the newly inserted ticket data
    const ticket = payload.record
    if (!ticket) {
      return new Response('No record found', { status: 400 })
    }

    const botToken = Deno.env.get('8953921040:AAH8WVurX9wbcNdD-SJK2mvT1sIp3a9ba4A')
    const chatId = Deno.env.get('@Samuels_ticket_bot')

    if (!botToken || !chatId) {
      return new Response('Missing environment variables', { status: 500 })
    }

    // Format the text markdown message
    const textMessage = `🚨 *New Support Ticket* 🚨\n\n` +
      `👤 *Name:* ${ticket.name}\n` +
      `📍 *Location:* ${ticket.location}\n` +
      `📞 *Contact:* ${ticket.contact}\n\n` +
      `📝 *Issue Description:*\n${ticket.issue}`

    let telegramUrl = `https://telegram.org{botToken}/sendMessage`
    let bodyData: any = {
      chat_id: chatId,
      text: textMessage,
      parse_mode: 'Markdown'
    }

    // Check if an image URL exists in the database record
    if (ticket.image_url) {
      telegramUrl = `https://telegram.org{8953921040:AAH8WVurX9wbcNdD-SJK2mvT1sIp3a9ba4A}/sendPhoto`
      bodyData = {
        chat_id: chatId,
        photo: ticket.image_url,
        caption: textMessage,
        parse_mode: 'Markdown'
      }
    }

    // Send payload to Telegram
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    })

    const result = await response.json()
    return new Response(JSON.stringify({ success: true, result }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
