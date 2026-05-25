import { Button, Hr, Section, Text } from '@react-email/components';
import { EmailLayout, styles } from './_layout';

interface Props {
  otherName: string;
  amountLabel: string;
  scheduledDateLabel: string;
  giftUrl: string;
  quote?: string;
}

export default function GiftReminderEmail({
  otherName = 'Someone',
  amountLabel = '3 hours',
  scheduledDateLabel = 'tomorrow',
  giftUrl = 'https://timegift.fly.dev/dashboard',
  quote = 'You have been summoned.',
}: Props) {
  return (
    <EmailLayout preview={`Your TimeGift with ${otherName} is ${scheduledDateLabel}.`}>
      <Text style={styles.eyebrow}>{quote}</Text>
      <Text style={styles.h}>{otherName} &amp; you, {scheduledDateLabel}.</Text>
      <Text style={styles.body}>{amountLabel} of time you set aside. The day is here. Show up.</Text>
      <Hr style={styles.hr} />
      <Section style={{ textAlign: 'center' }}>
        <Button href={giftUrl} style={styles.cta as any}>See the details</Button>
      </Section>
    </EmailLayout>
  );
}
