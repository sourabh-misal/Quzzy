import { NextRequest, NextResponse } from 'next/server';
import { evaluateAndGenerateNext } from '@/lib/ai';
import { StudySession, StudyQuestion, StudyHistoryItem } from '@/types/study';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session, previousQuestion, selectedAnswer, nextBufferedQuestion }: {
      session: StudySession;
      previousQuestion: StudyQuestion;
      selectedAnswer: string;
      nextBufferedQuestion?: StudyQuestion;
    } = body;

    if (!session || !previousQuestion || selectedAnswer === undefined) {
      return NextResponse.json({ error: 'Missing required session parameters.' }, { status: 400 });
    }

    const { evaluation, nextQuestion, updatedConcepts } = await evaluateAndGenerateNext(
      session,
      previousQuestion,
      selectedAnswer
    );

    const isCorrect = evaluation.isCorrect;
    const consecutiveCorrect = isCorrect ? session.consecutiveCorrect + 1 : 0;
    const consecutiveWrong = !isCorrect ? session.consecutiveWrong + 1 : 0;
    const totalQuestions = session.totalQuestions + 1;
    const correctCount = isCorrect ? session.correctCount + 1 : session.correctCount;
    
    // Calculate new mastery score bounded between 0 and 100
    const rawMastery = session.masteryScore + evaluation.masteryDelta;
    const masteryScore = Math.max(0, Math.min(100, rawMastery));

    const historyItem: StudyHistoryItem = {
      question: previousQuestion,
      selectedAnswer,
      evaluation,
      timestamp: Date.now()
    };

    // If client had nextBufferedQuestion in queue, make it active and put the new question in queue
    const activeQuestion = nextBufferedQuestion || nextQuestion;
    const newQueue = nextBufferedQuestion ? [nextQuestion] : [];

    const updatedSession: StudySession = {
      ...session,
      currentDifficulty: activeQuestion.difficulty,
      masteryScore,
      consecutiveCorrect,
      consecutiveWrong,
      totalQuestions,
      correctCount,
      concepts: updatedConcepts,
      history: [...session.history, historyItem],
      currentQuestion: activeQuestion,
      questionQueue: newQueue,
      updatedAt: Date.now()
    };

    return NextResponse.json({
      success: true,
      evaluation,
      nextQuestion: activeQuestion,
      bufferedQuestion: nextBufferedQuestion ? nextQuestion : undefined,
      updatedSession
    });
  } catch (error: any) {
    console.error('Error processing next adaptive question:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to evaluate answer and generate next question.' },
      { status: 500 }
    );
  }
}
