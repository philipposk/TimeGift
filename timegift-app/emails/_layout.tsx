import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

const main = { backgroundColor: '#f4efe6', fontFamily: 'Georgia, "Iowan Old Style", serif', margin: 0, padding: 0 };
const container = { width: '100%', maxWidth: 560, margin: '0 auto', padding: '40px 24px' };
const card = {
  background: '#fbf7ee',
  border: '1px solid #d9d0bf',
  borderRadius: 6,
  padding: '32px 36px',
  boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 18px 40px -28px rgba(60,40,20,0.25)',
};
const footer = { color: '#6f6962', fontSize: 12, textAlign: 'center' as const, marginTop: 28 };
const brand = { fontSize: 18, color: '#1b1816', fontWeight: 400, marginBottom: 24, letterSpacing: '-0.02em' };

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={brand}>
            Time<em style={{ color: '#a8501e', fontStyle: 'italic' }}>gift</em>
          </Section>
          <Section style={card}>{children}</Section>
          <Hr style={{ borderColor: '#e6dfd1', margin: '24px 0 12px' }} />
          <Text style={footer}>A small, deliberate thing. timegift.fly.dev</Text>
        </Container>
      </Body>
    </Html>
  );
}

export const styles = {
  eyebrow: {
    color: '#6f6962',
    fontSize: 11,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    margin: '0 0 6px',
  },
  h: { fontSize: 28, color: '#1b1816', lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.02em' },
  body: { fontSize: 17, color: '#2b2622', lineHeight: 1.55, margin: '0 0 16px' },
  hand: { fontSize: 19, color: '#2b2622', lineHeight: 1.55, fontStyle: 'italic' as const, margin: '0 0 16px' },
  hr: { borderColor: '#d9d0bf', margin: '20px 0' },
  meta: { fontSize: 12, color: '#6f6962', margin: '4px 0' },
  cta: {
    display: 'inline-block',
    background: '#a8501e',
    color: '#fdf8ed',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 14,
    fontWeight: 500,
    padding: '12px 22px',
    borderRadius: 4,
    textDecoration: 'none',
    marginTop: 8,
  },
};
