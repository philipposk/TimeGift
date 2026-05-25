import { Button, Hr, Section, Text } from '@react-email/components';
import { EmailLayout, styles } from './_layout';

interface Props {
  organizerName: string;
  recipientLabel: string;
  joinUrl: string;
}

export default function GroupInviteEmail({
  organizerName = 'Someone',
  recipientLabel = 'someone special',
  joinUrl = 'https://timegift.fly.dev/g/group/example',
}: Props) {
  return (
    <EmailLayout preview={`${organizerName} is putting hours together for ${recipientLabel}.`}>
      <Text style={styles.eyebrow}>An invitation</Text>
      <Text style={styles.h}>Add your hours.</Text>
      <Text style={styles.body}>
        {organizerName} is collecting time from a few people for {recipientLabel}. Drop in your share
        and a sentence. We&apos;ll send the whole letter signed by everyone.
      </Text>
      <Hr style={styles.hr} />
      <Section style={{ textAlign: 'center' }}>
        <Button href={joinUrl} style={styles.cta as any}>Add your hours</Button>
      </Section>
    </EmailLayout>
  );
}
