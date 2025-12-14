// Vonage SMS notification utility
export async function sendSMSNotification(
  to: string,
  message: string,
  apiKey?: string,
  apiSecret?: string,
  fromNumber: string = 'TimeGift'
) {
  if (!apiKey || !apiSecret) {
    console.log('[Vonage] SMS notification (placeholder):', { to, message });
    return { success: true, placeholder: true };
  }

  try {
    const response = await fetch('https://rest.nexmo.com/sms/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        api_secret: apiSecret,
        to,
        from: fromNumber,
        text: message,
      }),
    });

    const result = await response.json();

    const status = result?.messages?.[0]?.status;
    if (status && status !== '0') {
      throw new Error(result.messages?.[0]?.['error-text'] || 'Unknown Vonage SMS error');
    }

    return { success: true, placeholder: false, response: result };
  } catch (error) {
    console.error('[Vonage] Error sending SMS:', error);
    return { success: false, error };
  }
}
