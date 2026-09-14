export interface Question {
  question: string;
  options: string[];
  answer: string; // The text of the correct option
  explanation?: string; // Optional explanation of the correct answer
}

export interface Quiz {
  id: string; // Plain identifier (entered by users to join)
  title: string;
  password?: string; // Quiz password for user join authentication
  questions: Question[];
  createdBy?: string;
  createdAt?: number;
  allowRetake?: boolean;   // Whether the quiz can be retaken
  instantFeedback?: boolean; // Show answer immediately after answering (Study Mode)
}

export interface QuizProgress {
  currentQuestionIndex: number;
  selectedAnswers: Record<number, string>; // Maps question index to chosen option string
  completed: boolean;
  score?: number;
  completedAt?: number;
  shuffledQuestions?: Question[]; // Preserves shuffled order for a single active attempt
}

export interface JoinedQuiz {
  quizId: string;
  title: string;
  questionCount: number;
  joinedAt: number;
  progress?: QuizProgress;
  history?: Array<{
    score: number;
    totalQuestions: number;
    completedAt: number;
  }>;
  allowRetake?: boolean;
}

export interface UserSession {
  username: string;
  role: 'admin' | 'user';
}
