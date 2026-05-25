import { Resend } from 'resend';
import { render } from '@react-email/render';
import ical from 'ical-generator';
import * as React from 'react';

const resendKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM_EMAIL || 'Timegift <hello@timegift.dev>';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://timegift.fly.dev';

const resend = resendKey ? new Resend(resendKey) : null;

interface SendArgs {
  to: string | string[];
  subject: string;
  template: React.ReactElement;
  attachments?: { filename: string; content: string | Buffer }[];
  replyTo?: string;
}

// Send an email rendered from a react-email template. Silently no-ops when
// RESEND_API_KEY is missing - caller does not need to check.
export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn('[mailer] RESEND_API_KEY missing - email not sent:', args.subject);
    return { ok: false, error: 'Email not configured' };
  }
  try {
    const html = await render(args.template);
    const text = await render(args.template, { plainText: true });
    const res = await resend.emails.send({
      from: fromAddress,
      to: args.to,
      subject: args.subject,
      html,
      text,
      reply_to: args.replyTo,
      attachments: args.attachments?.map((a) => ({
        filename: a.filename,
        content: typeof a.content === 'string' ? a.content : a.content.toString('base64'),
      })),
    } as any);
    if ((res as any).error) {
      return { ok: false, error: (res as any).error?.message };
    }
    return { ok: true, id: (res as any).data?.id };
  } catch (err: any) {
    console.error('[mailer] send failed:', err?.message || err);
    return { ok: false, error: err?.message };
  }
}

// Generate an .ics calendar invite for a scheduled gift. Returns the raw text
// suitable for use as a Resend attachment.
export function buildIcs(args: {
  uid: string;
  start: Date;
  durationMinutes: number;
  title: string;
  description?: string;
  organizerEmail?: string;
  organizerName?: string;
  attendees?: { email: string; name?: string }[];
  url?: string;
}): string {
  const cal = ical({ name: 'Timegift', prodId: { company: 'Timegift', product: 'Timegift' } });
  cal.createEvent({
    id: args.uid,
    start: args.start,
    end: new Date(args.start.getTime() + args.durationMinutes * 60 * 1000),
    summary: args.title,
    description: args.description,
    url: args.url,
    organizer: args.organizerEmail
      ? { email: args.organizerEmail, name: args.organizerName || 'Timegift' }
      : undefined,
    attendees: args.attendees?.map((a) => ({ email: a.email, name: a.name })),
  });
  return cal.toString();
}

export const APP_URL = appUrl;
