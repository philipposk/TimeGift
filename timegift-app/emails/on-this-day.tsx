import { Button, Hr, Img, Section, Text } from '@react-email/components';
import { EmailLayout, styles } from './_layout';

interface Props {
  otherName: string;
  yearsAgo: number;
  story?: string | null;
  photoUrl?: string | null;
  giftUrl: string;
}

export default function OnThisDayEmail({
  otherName = 'Someone',
  yearsAgo = 1,
  story,
  photoUrl,
  giftUrl = 'https://timegift.fly.dev/memories',
}: Props) {
  return (
    <EmailLayout preview={`${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago today.`}>
      <Text style={styles.eyebrow}>On this day</Text>
      <Text style={styles.h}>
        {yearsAgo} year{yearsAgo === 1 ? '' : 's'} ago today, you and {otherName}.
      </Text>
      {photoUrl && (
        <Img
          src={photoUrl}
          alt="Memory"
          width="500"
          style={{ borderRadius: 4, margin: '12px 0', maxWidth: '100%' }}
        />
      )}
      {story && <Text style={styles.hand}>{story}</Text>}
      <Hr style={styles.hr} />
      <Section style={{ textAlign: 'center' }}>
        <Button href={giftUrl} style={styles.cta as any}>Open the memory</Button>
      </Section>
    </EmailLayout>
  );
}
