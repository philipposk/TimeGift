import { Button, Hr, Section, Text } from '@react-email/components';
import { EmailLayout, styles } from './_layout';

interface Props {
  otherName: string;
  amountLabel: string;
  memoryUrl: string;
}

export default function GiftCompletedEmail({
  otherName = 'Someone',
  amountLabel = '3 hours',
  memoryUrl = 'https://timegift.fly.dev/dashboard',
}: Props) {
  return (
    <EmailLayout preview={`Your time with ${otherName} is complete.`}>
      <Text style={styles.eyebrow}>Kept</Text>
      <Text style={styles.h}>That happened.</Text>
      <Text style={styles.body}>
        {amountLabel} with {otherName}. Drop a photo or a sentence — a memory keeps it on your shelf.
      </Text>
      <Hr style={styles.hr} />
      <Section style={{ textAlign: 'center' }}>
        <Button href={memoryUrl} style={styles.cta as any}>Add a memory</Button>
      </Section>
    </EmailLayout>
  );
}
