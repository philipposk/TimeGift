import { Button, Hr, Section, Text } from '@react-email/components';
import { EmailLayout, styles } from './_layout';

interface Props {
  senderName: string;
  amountLabel: string; // e.g. "3 hours"
  purpose: string;     // free-text
  message: string;
  claimUrl: string;
}

export default function GiftReceivedEmail({
  senderName = 'A friend',
  amountLabel = '3 hours',
  purpose = 'anything you want',
  message = 'A long, warm letter would go here.',
  claimUrl = 'https://timegift.fly.dev/g/example',
}: Props) {
  return (
    <EmailLayout preview={`${senderName} just sent you ${amountLabel}.`}>
      <Text style={styles.eyebrow}>From</Text>
      <Text style={{ ...styles.body, fontSize: 18, marginBottom: 20 }}>{senderName}</Text>

      <Text style={styles.eyebrow}>They&apos;re giving you</Text>
      <Text style={{ ...styles.h, marginBottom: 4 }}>{amountLabel}</Text>
      <Text style={{ ...styles.body, color: '#a8501e', fontStyle: 'italic', marginBottom: 20 }}>
        for {purpose.toLowerCase()}
      </Text>

      <Hr style={styles.hr} />

      <Text style={styles.hand}>{message}</Text>

      <Section style={{ textAlign: 'center', marginTop: 24 }}>
        <Button href={claimUrl} style={styles.cta as any}>
          Open the letter
        </Button>
      </Section>

      <Text style={{ ...styles.meta, textAlign: 'center', marginTop: 16 }}>
        Or paste this link into a browser:&nbsp;{claimUrl}
      </Text>
    </EmailLayout>
  );
}
