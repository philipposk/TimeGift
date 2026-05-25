// Minimal .vcf (vCard) parser. Handles VERSION 3.0 + 4.0 common shapes.
// Returns name + email + phone tuples for friend invite seeding.

export interface VCard {
  fullName: string;
  email?: string;
  phone?: string;
}

export function parseVcf(text: string): VCard[] {
  const cards: VCard[] = [];
  // Split on BEGIN:VCARD / END:VCARD; tolerate CRLF and folded lines.
  const unfolded = text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const blocks = unfolded.split(/BEGIN:VCARD/i).slice(1);
  for (const blockRaw of blocks) {
    const block = blockRaw.split(/END:VCARD/i)[0];
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    let fn = '';
    let n = '';
    let email = '';
    let phone = '';

    for (const line of lines) {
      const [keyRaw, ...rest] = line.split(':');
      if (!rest.length) continue;
      const value = rest.join(':');
      const key = keyRaw.toLowerCase();

      if (key.startsWith('fn')) fn = value.trim();
      else if (key.startsWith('n') && !n) {
        // N:Last;First;Middle;Prefix;Suffix - we want First Last
        const parts = value.split(';').map((p) => p.trim());
        n = [parts[1], parts[0]].filter(Boolean).join(' ');
      } else if (key.startsWith('email')) {
        if (!email) email = value.trim();
      } else if (key.startsWith('tel')) {
        if (!phone) phone = value.trim().replace(/[^\d+]/g, '');
      }
    }

    const name = fn || n;
    if (!name && !email && !phone) continue;
    cards.push({ fullName: name || email || phone || 'Unknown', email: email || undefined, phone: phone || undefined });
  }
  return cards;
}
