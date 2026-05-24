// AI utilities for OpenAI and Groq.

import OpenAI from 'openai';
// @ts-expect-error - groq-sdk types may not be available
import Groq from 'groq-sdk';

export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// -------------------- Gift message generation ------------------

export async function generateGiftMessage(
  occasion: string,
  recipientName: string,
  relationship: string,
  timeAmount: number,
  timeUnit: string
): Promise<string> {
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
          { role: 'user', content: prompt },
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
          { role: 'system', content: 'You are a thoughtful assistant that helps people write meaningful messages for time gifts. Be warm, genuine, and personal.' },
          { role: 'user', content: prompt },
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
    birthday: `Happy birthday, ${recipientName}! I'm gifting you ${timeAmount} ${timeUnit} of my time - let's celebrate together doing whatever you'd like!`,
    thank_you: `Thank you for everything, ${recipientName}. Here's ${timeAmount} ${timeUnit} of my time to help you with whatever you need.`,
    just_because: `Hey ${recipientName}, I wanted to give you ${timeAmount} ${timeUnit} of my time. Let's spend it together doing something fun!`,
    apology: `I'm sorry, ${recipientName}. I'd like to make it up to you with ${timeAmount} ${timeUnit} of my time. Let's talk and reconnect.`,
    holiday: `Happy holidays, ${recipientName}! Here's ${timeAmount} ${timeUnit} of my time as a gift. Let's make some memories together!`,
  };

  return templates[occasion] || `Hi ${recipientName}, I'm gifting you ${timeAmount} ${timeUnit} of my time. Let's spend it together!`;
}

// -------------------- Gift suggestions -------------------------

export interface GiftSuggestion {
  timeAmount: number;
  timeUnit: 'minutes' | 'hours' | 'days';
  message: string;
  occasion?: string;
}

// Context that can be passed in to personalize suggestions.
export interface SuggestionContext {
  recentRecipients?: string[]; // display names or first names of recent recipients
  recentPurposes?: string[];   // recent purpose_details strings
  occasion?: string | null;
}

// Real LLM-backed suggestions with safe fallback. Returns 3 ideas.
export async function generateGiftSuggestions(
  relationship: string,
  occasion: string | null,
  context: SuggestionContext = {}
): Promise<GiftSuggestion[]> {
  const llmCallable = openai || groq;
  if (!llmCallable) return hardcodedSuggestions(relationship, occasion);

  const sys = `You suggest TimeGifts: an experience where one person gifts a block of their time to another. Return EXACTLY 3 ideas as a JSON array. Each object must have:
- timeAmount (number)
- timeUnit ("minutes" | "hours" | "days")
- message (1 short sentence describing the gift idea)
- occasion (optional string)
Return ONLY the JSON array, no prose, no markdown fences.`;

  const userMsg = `Relationship: ${relationship}
Occasion: ${occasion || 'unspecified'}
Recent recipients: ${(context.recentRecipients || []).slice(0, 5).join(', ') || 'none'}
Recent gift purposes: ${(context.recentPurposes || []).slice(0, 5).join(' | ') || 'none'}

Give 3 fresh, specific suggestions appropriate for the relationship + occasion. Vary the time amounts.`;

  try {
    let raw: string | null | undefined;
    if (openai) {
      const r = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: sys }, { role: 'user', content: userMsg }],
        max_tokens: 400,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });
      raw = r.choices[0]?.message?.content;
    } else if (groq) {
      const r = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: sys }, { role: 'user', content: userMsg }],
        max_tokens: 400,
        temperature: 0.8,
      });
      raw = r.choices[0]?.message?.content;
    }

    if (!raw) return hardcodedSuggestions(relationship, occasion);

    // Tolerate either bare array OR object wrapping array.
    const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    let parsed: any;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return hardcodedSuggestions(relationship, occasion);
    }
    let arr: any[] = Array.isArray(parsed) ? parsed : parsed.suggestions || parsed.ideas || [];
    if (!Array.isArray(arr) || arr.length === 0) return hardcodedSuggestions(relationship, occasion);

    const validated: GiftSuggestion[] = arr
      .filter((s) => typeof s?.timeAmount === 'number' && typeof s?.timeUnit === 'string' && typeof s?.message === 'string')
      .filter((s) => ['minutes', 'hours', 'days'].includes(s.timeUnit))
      .slice(0, 3)
      .map((s) => ({
        timeAmount: Math.max(1, Math.min(30, Math.round(s.timeAmount))),
        timeUnit: s.timeUnit,
        message: String(s.message).slice(0, 200),
        occasion: s.occasion ? String(s.occasion).slice(0, 60) : undefined,
      }));

    if (validated.length === 0) return hardcodedSuggestions(relationship, occasion);
    return validated;
  } catch (err) {
    console.error('Suggestion LLM error:', err);
    return hardcodedSuggestions(relationship, occasion);
  }
}

function hardcodedSuggestions(relationship: string, occasion: string | null): GiftSuggestion[] {
  const suggestions: GiftSuggestion[] = [];
  const r = (relationship || '').toLowerCase();

  if (r.includes('family') || r.includes('parent') || r.includes('sibling')) {
    suggestions.push(
      { timeAmount: 4, timeUnit: 'hours', message: 'A half day together - perfect for family time' },
      { timeAmount: 1, timeUnit: 'days', message: 'A full day together - quality family bonding' },
      { timeAmount: 2, timeUnit: 'hours', message: 'A couple of hours for a meal and conversation' }
    );
  } else if (r.includes('friend')) {
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

  if (occasion === 'birthday') {
    suggestions[0] = { timeAmount: 3, timeUnit: 'hours', message: "Birthday celebration time - let's make it special!" };
  }

  return suggestions;
}
