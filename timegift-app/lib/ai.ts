// AI utilities for OpenAI and Groq

import OpenAI from 'openai';
// @ts-ignore - groq-sdk types may not be available
import Groq from 'groq-sdk';

// Initialize OpenAI
export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Initialize Groq
export const groq = process.env.GROQ_API_KEY
  ? new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  : null;

// Generate gift message suggestion using AI
export async function generateGiftMessage(
  occasion: string,
  recipientName: string,
  relationship: string,
  timeAmount: number,
  timeUnit: string
): Promise<string> {
  // Try OpenAI first, fallback to Groq, then default message
  const prompt = `Write a heartfelt, warm message for a time gift. 
Occasion: ${occasion}
Recipient: ${recipientName}
Relationship: ${relationship}
Time: ${timeAmount} ${timeUnit}

Make it personal, warm, and genuine. Keep it under 100 words.`;

  try {
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a thoughtful assistant that helps people write meaningful messages for time gifts. Be warm, genuine, and personal.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.8,
      });

      return completion.choices[0]?.message?.content || getDefaultMessage(occasion, recipientName, timeAmount, timeUnit);
    }

    if (groq) {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a thoughtful assistant that helps people write meaningful messages for time gifts. Be warm, genuine, and personal.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.8,
      });

      return completion.choices[0]?.message?.content || getDefaultMessage(occasion, recipientName, timeAmount, timeUnit);
    }
  } catch (error) {
    console.error('AI generation error:', error);
  }

  return getDefaultMessage(occasion, recipientName, timeAmount, timeUnit);
}

function getDefaultMessage(occasion: string, recipientName: string, timeAmount: number, timeUnit: string): string {
  const templates: Record<string, string> = {
    birthday: `Happy birthday, ${recipientName}! I'm gifting you ${timeAmount} ${timeUnit} of my time - let's celebrate together doing whatever you'd like! 🎉`,
    thank_you: `Thank you for everything, ${recipientName}. Here's ${timeAmount} ${timeUnit} of my time to help you with whatever you need.`,
    just_because: `Hey ${recipientName}, I wanted to give you ${timeAmount} ${timeUnit} of my time. Let's spend it together doing something fun!`,
    apology: `I'm sorry, ${recipientName}. I'd like to make it up to you with ${timeAmount} ${timeUnit} of my time. Let's talk and reconnect.`,
    holiday: `Happy holidays, ${recipientName}! Here's ${timeAmount} ${timeUnit} of my time as a gift. Let's make some memories together!`,
  };

  return templates[occasion] || `Hi ${recipientName}, I'm gifting you ${timeAmount} ${timeUnit} of my time. Let's spend it together!`;
}

// Generate gift suggestions based on relationship and occasion
export async function generateGiftSuggestions(
  relationship: string,
  occasion: string | null
): Promise<Array<{ timeAmount: number; timeUnit: string; message: string }>> {
  const suggestions: Array<{ timeAmount: number; timeUnit: string; message: string }> = [];

  // Base suggestions by relationship
  if (relationship.includes('family') || relationship.includes('parent') || relationship.includes('sibling')) {
    suggestions.push(
      { timeAmount: 4, timeUnit: 'hours', message: 'A half day together - perfect for family time' },
      { timeAmount: 1, timeUnit: 'days', message: 'A full day together - quality family bonding' },
      { timeAmount: 2, timeUnit: 'hours', message: 'A couple of hours for a meal and conversation' }
    );
  } else if (relationship.includes('friend')) {
    suggestions.push(
      { timeAmount: 2, timeUnit: 'hours', message: 'A couple of hours to hang out and catch up' },
      { timeAmount: 3, timeUnit: 'hours', message: 'An afternoon together doing something fun' },
      { timeAmount: 1, timeUnit: 'days', message: 'A full day adventure together' }
    );
  } else {
    suggestions.push(
      { timeAmount: 1, timeUnit: 'hours', message: 'An hour together - perfect for a coffee or quick activity' },
      { timeAmount: 2, timeUnit: 'hours', message: 'A couple of hours to spend quality time together' },
      { timeAmount: 3, timeUnit: 'hours', message: 'An afternoon together' }
    );
  }

  // Adjust for occasion
  if (occasion === 'birthday') {
    suggestions[0] = { timeAmount: 3, timeUnit: 'hours', message: 'Birthday celebration time - let\'s make it special!' };
  }

  return suggestions;
}
