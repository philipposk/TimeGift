// WhatsApp notification utility
export async function sendWhatsAppNotification(
  to: string,
  message: string,
  apiKey?: string,
  apiSecret?: string,
  fromNumber?: string
) {
  if (!apiKey || !apiSecret || !fromNumber) {
    console.log('[WhatsApp] Notification (placeholder):', { to, message });
    return { success: true, placeholder: true };
  }

  try {
    const response = await fetch('https://api.nexmo.com/v0.1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        from: { type: 'whatsapp', number: fromNumber },
        to: { type: 'whatsapp', number: to },
        message: {
          content: {
            type: 'text',
            text: message,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Vonage WhatsApp error: ${response.status} ${errorBody}`);
    }

    return { success: true, placeholder: false };
  } catch (error) {
    console.error('[WhatsApp] Error sending message:', error);
    return { success: false, error };
  }
}
