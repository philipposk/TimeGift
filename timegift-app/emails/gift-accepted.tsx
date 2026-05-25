import { Button, Hr, Section, Text } from '@react-email/components';
import { EmailLayout, styles } from './_layout';

interface Props {
  recipientName: string;
  amountLabel: string;
  scheduledDateLabel?: string | null;
  giftUrl: string;
}

export default function GiftAcceptedEmail({
  recipientName = 'Your recipient',
  amountLabel = '3 hours',
  scheduledDateLabel,
  giftUrl = 'https://timegift.fly.dev/dashboard',
}: Props) {
  return (
    <EmailLayout preview={`${recipientName} accepted your gift.`}>
      <Text style={styles.eyebrow}>Good news</Text>
      <Text style={styles.h}>{recipientName} said yes.</Text>
      <Text style={styles.body}>
        Your {amountLabel} TimeGift is{scheduledDateLabel ? '' : ' on their list.'}
        {scheduledDateLabel ? ` scheduled for ${scheduledDateLabel}.` : ''}
      </Text>
      {scheduledDateLabel && (
        <Text style={styles.meta}>A calendar invite is attached to this email.</Text>
      )}
      <Hr style={styles.hr} />
      <Section style={{ textAlign: 'center' }}>
        <Button href={giftUrl} style={styles.cta as any}>See the gift</Button>
      </Section>
    </EmailLayout>
  );
}
