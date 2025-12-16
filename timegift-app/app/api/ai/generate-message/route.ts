import { NextResponse, NextRequest } from 'next/server';
import { generateGiftMessage } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { occasion, recipientName, relationship, timeAmount, timeUnit } = body;

    if (!occasion || !recipientName || !relationship || !timeAmount || !timeUnit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const message = await generateGiftMessage(
      occasion,
      recipientName,
      relationship,
      timeAmount,
      timeUnit
    );

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('Error generating message:', error);
    return NextResponse.json(
      { error: 'Failed to generate message', details: error.message },
      { status: 500 }
    );
  }
}
