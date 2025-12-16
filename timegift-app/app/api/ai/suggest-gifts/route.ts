import { NextResponse, NextRequest } from 'next/server';
import { generateGiftSuggestions } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { relationship, occasion } = body;

    if (!relationship) {
      return NextResponse.json(
        { error: 'Relationship is required' },
        { status: 400 }
      );
    }

    const suggestions = await generateGiftSuggestions(relationship, occasion || null);

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions', details: error.message },
      { status: 500 }
    );
  }
}
