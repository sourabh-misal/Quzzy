export type StudyDifficulty = 'foundational' | 'intermediate' | 'advanced' | 'mastery';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface StudyConcept {
  id: string;
  name: string;
  description: string;
  status: 'learning' | 'mastered' | 'struggling';
}

export interface StudyQuestion {
  id: string;
  conceptId: string;
  conceptName: string;
  difficulty: StudyDifficulty;
  question: string;
  codeSnippet?: string;
  options: string[];
  answer: string; // Exact text of the correct option
  explanation: string; // Educational explanation of why it is correct
  foundationalTip?: string; // Core mental model / rule of thumb if user struggles
  rationale?: string; // Reason why AI selected this question (e.g. "Precaution: Reinforcing core basics")
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  misconceptionInsight?: string; // Explanation of what misconception the user had if wrong
  recommendedAction: 'lower_level' | 'stay_and_reinforce' | 'advance_level' | 'topic_mastered';
  difficultyChange: 'downgraded' | 'maintained' | 'upgraded';
  masteryDelta: number; // e.g. +12 or -5
}

export interface StudyHistoryItem {
  question: StudyQuestion;
  selectedAnswer: string;
  evaluation: AnswerEvaluation;
  timestamp: number;
}

export interface StudySession {
  id: string;
  username: string;
  topic: string;
  createdAt: number;
  updatedAt: number;
  currentDifficulty: StudyDifficulty;
  masteryScore: number; // 0 to 100
  consecutiveCorrect: number;
  consecutiveWrong: number;
  totalQuestions: number;
  correctCount: number;
  concepts: StudyConcept[];
  history: StudyHistoryItem[];
  currentQuestion?: StudyQuestion;
  questionQueue?: StudyQuestion[];
  completed?: boolean;
}
