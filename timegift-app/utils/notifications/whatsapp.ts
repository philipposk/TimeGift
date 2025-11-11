// WhatsApp notification utility
export async function sendWhatsAppNotification(
  to: string,
  message: string,
  apiKey?: string
) {
  if (!apiKey) {
    console.log('[WhatsApp] Notification (placeholder):', { to, message });
    return { success: true, placeholder: true };
  }

  try {
    // Actual WhatsApp Business API call would go here
    console.log('[WhatsApp] Would send message:', { to, message });
    
    // Uncomment and implement when ready to use actual WhatsApp API:
    // const response = await fetch('https://api.whatsapp.com/send', {
    //   method: 'POST',
    //   headers: { 
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${apiKey}`
    //   },
    //   body: JSON.stringify({
    //     to: to,
    //     type: 'text',
    //     text: { body: message },
    //   }),
    // });
    
    return { success: true, placeholder: false };
  } catch (error) {
    console.error('[WhatsApp] Error sending message:', error);
    return { success: false, error };
  }
}
