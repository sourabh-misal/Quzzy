import { NextRequest, NextResponse } from 'next/server';
import { getSocraticHint, chatWithTutor } from '@/lib/ai';
import { StudyQuestion, ChatMessage } from '@/types/study';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, question, selectedAnswer, message, history }: {
      action: 'hint' | 'chat';
      question: StudyQuestion;
      selectedAnswer?: string;
      message?: string;
      history?: ChatMessage[];
    } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question data is required.' }, { status: 400 });
    }

    if (action === 'hint') {
      if (!selectedAnswer) {
        return NextResponse.json({ error: 'selectedAnswer is required for hint.' }, { status: 400 });
      }
      const hint = await getSocraticHint(question, selectedAnswer);
      return NextResponse.json({ success: true, hint });
    }

    if (action === 'chat') {
      if (!message || !message.trim()) {
        return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
      }
      const reply = await chatWithTutor(question, message.trim(), history || []);
      return NextResponse.json({ success: true, reply });
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in coach route:', err);
    return NextResponse.json({ error: err?.message || 'Failed to process coach request.' }, { status: 500 });
  }
}
