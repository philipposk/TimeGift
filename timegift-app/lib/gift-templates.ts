// Gift Templates Library

export interface GiftTemplate {
  id: string;
  name: string;
  category: 'birthday' | 'holiday' | 'thank_you' | 'apology' | 'just_because' | 'anniversary' | 'congratulations';
  description: string;
  defaultTimeAmount: number;
  defaultTimeUnit: 'minutes' | 'hours' | 'days';
  defaultMessage: string;
  suggestedMessage: string;
  icon: string;
  color: string;
}

export const giftTemplates: GiftTemplate[] = [
  {
    id: 'birthday',
    name: 'Birthday Gift',
    category: 'birthday',
    description: 'Celebrate their special day with quality time together',
    defaultTimeAmount: 3,
    defaultTimeUnit: 'hours',
    defaultMessage: 'Happy birthday! I\'m gifting you {timeAmount} {timeUnit} of my time - let\'s celebrate together doing whatever you\'d like! 🎉',
    suggestedMessage: 'Happy birthday! I\'m gifting you {timeAmount} {timeUnit} of my time - let\'s celebrate together doing whatever you\'d like! 🎉',
    icon: '🎂',
    color: 'pink',
  },
  {
    id: 'thank_you',
    name: 'Thank You Gift',
    category: 'thank_you',
    description: 'Show appreciation with your time',
    defaultTimeAmount: 2,
    defaultTimeUnit: 'hours',
    defaultMessage: 'Thank you for everything! Here\'s {timeAmount} {timeUnit} of my time to help you with whatever you need.',
    suggestedMessage: 'Thank you for everything! Here\'s {timeAmount} {timeUnit} of my time to help you with whatever you need.',
    icon: '🙏',
    color: 'purple',
  },
  {
    id: 'just_because',
    name: 'Just Because',
    category: 'just_because',
    description: 'No special occasion needed - just because you care',
    defaultTimeAmount: 2,
    defaultTimeUnit: 'hours',
    defaultMessage: 'Hey! I wanted to give you {timeAmount} {timeUnit} of my time. Let\'s spend it together doing something fun!',
    suggestedMessage: 'Hey! I wanted to give you {timeAmount} {timeUnit} of my time. Let\'s spend it together doing something fun!',
    icon: '💝',
    color: 'blue',
  },
  {
    id: 'apology',
    name: 'Apology Gift',
    category: 'apology',
    description: 'Make amends with quality time',
    defaultTimeAmount: 2,
    defaultTimeUnit: 'hours',
    defaultMessage: 'I\'m sorry. I\'d like to make it up to you with {timeAmount} {timeUnit} of my time. Let\'s talk and reconnect.',
    suggestedMessage: 'I\'m sorry. I\'d like to make it up to you with {timeAmount} {timeUnit} of my time. Let\'s talk and reconnect.',
    icon: '💚',
    color: 'green',
  },
  {
    id: 'holiday',
    name: 'Holiday Gift',
    category: 'holiday',
    description: 'Spread holiday cheer with your time',
    defaultTimeAmount: 3,
    defaultTimeUnit: 'hours',
    defaultMessage: 'Happy holidays! Here\'s {timeAmount} {timeUnit} of my time as a gift. Let\'s make some memories together!',
    suggestedMessage: 'Happy holidays! Here\'s {timeAmount} {timeUnit} of my time as a gift. Let\'s make some memories together!',
    icon: '🎄',
    color: 'red',
  },
  {
    id: 'anniversary',
    name: 'Anniversary Gift',
    category: 'anniversary',
    description: 'Celebrate milestones together',
    defaultTimeAmount: 4,
    defaultTimeUnit: 'hours',
    defaultMessage: 'Happy anniversary! Let\'s celebrate with {timeAmount} {timeUnit} of quality time together.',
    suggestedMessage: 'Happy anniversary! Let\'s celebrate with {timeAmount} {timeUnit} of quality time together.',
    icon: '💑',
    color: 'pink',
  },
  {
    id: 'congratulations',
    name: 'Congratulations',
    category: 'congratulations',
    description: 'Celebrate their achievements',
    defaultTimeAmount: 2,
    defaultTimeUnit: 'hours',
    defaultMessage: 'Congratulations! Here\'s {timeAmount} {timeUnit} of my time to celebrate your success together!',
    suggestedMessage: 'Congratulations! Here\'s {timeAmount} {timeUnit} of my time to celebrate your success together!',
    icon: '🎊',
    color: 'yellow',
  },
];

export function getTemplateById(id: string): GiftTemplate | undefined {
  return giftTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): GiftTemplate[] {
  return giftTemplates.filter(t => t.category === category);
}

export function formatTemplateMessage(template: GiftTemplate, recipientName?: string): string {
  let message = template.defaultMessage
    .replace('{timeAmount}', template.defaultTimeAmount.toString())
    .replace('{timeUnit}', template.defaultTimeUnit);
  
  if (recipientName) {
    message = message.replace(/\{recipientName\}/g, recipientName);
  }
  
  return message;
}
