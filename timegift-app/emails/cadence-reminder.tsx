import { Button, Hr, Section, Text } from '@react-email/components';
import { EmailLayout, styles } from './_layout';

interface Props {
  friendName: string;
  daysQuiet: number;
  createUrl: string;
}

export default function CadenceReminderEmail({
  friendName = 'A friend',
  daysQuiet = 60,
  createUrl = 'https://timegift.fly.dev/create',
}: Props) {
  return (
    <EmailLayout preview={`${daysQuiet} days since you saw ${friendName}.`}>
      <Text style={styles.eyebrow}>A quiet thread</Text>
      <Text style={styles.h}>
        {daysQuiet} days since {friendName}.
      </Text>
      <Text style={styles.body}>
        Maybe an hour. Maybe a coffee. Maybe nothing — but you asked us to remind you.
      </Text>
      <Hr style={styles.hr} />
      <Section style={{ textAlign: 'center' }}>
        <Button href={createUrl} style={styles.cta as any}>Write something</Button>
      </Section>
    </EmailLayout>
  );
}
