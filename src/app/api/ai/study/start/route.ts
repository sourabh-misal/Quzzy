import { NextRequest, NextResponse } from 'next/server';
import { generateInitialStudySession } from '@/lib/ai';
import { StudySession } from '@/types/study';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, username = 'Learner' } = body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json({ error: 'Please provide a valid study topic.' }, { status: 400 });
    }

    const cleanTopic = topic.trim();
    const { concepts, initialQuestion, nextBufferedQuestion } = await generateInitialStudySession(cleanTopic, username);

    const sessionId = `study_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const newSession: StudySession = {
      id: sessionId,
      username: username || 'Learner',
      topic: cleanTopic,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentDifficulty: 'foundational',
      masteryScore: 0,
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      totalQuestions: 0,
      correctCount: 0,
      concepts,
      history: [],
      currentQuestion: initialQuestion,
      questionQueue: nextBufferedQuestion ? [nextBufferedQuestion] : [],
      completed: false
    };

    return NextResponse.json({
      success: true,
      sessionId,
      session: newSession,
      initialQuestion,
      nextBufferedQuestion
    });
  } catch (error: any) {
    console.error('Error starting study session:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to start AI study session.' },
      { status: 500 }
    );
  }
}
