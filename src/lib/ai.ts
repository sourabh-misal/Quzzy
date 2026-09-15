import { StudyConcept, StudyDifficulty, StudyQuestion, StudySession, AnswerEvaluation, ChatMessage } from '@/types/study';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

// Helper to call Gemini REST API
async function callGemini(prompt: string, systemInstruction?: string, isJson: boolean = true): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload: Record<string, any> = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.3
    }
  };

  if (isJson) {
    payload.generationConfig.responseMimeType = 'application/json';
  }

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Gemini API error response:', errorBody);
    throw new Error(`Gemini API failed with status ${res.status}: ${errorBody}`);
  }

  const data = await res.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('No content returned from Gemini API.');
  }

  return textContent;
}

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Generates the initial study plan: breaks topic into sub-concepts and generates two diagnostic progressive questions
 * (Question 1 active, Question 2 buffered in the pipeline for zero lag).
 */
export async function generateInitialStudySession(topic: string, username: string = 'Learner'): Promise<{
  concepts: StudyConcept[];
  initialQuestion: StudyQuestion;
  nextBufferedQuestion?: StudyQuestion;
}> {
  const systemInstruction = `You are an expert tutor and instructional designer specializing in adaptive mastery learning.
Your goal is to guide students to truly understand topics from first principles.
Output MUST strictly be valid JSON adhering to the specified schema.`;

  const prompt = `The user wants to study and master the topic: "${topic}".
1. Break down this topic into 3 to 4 logical, progressive learning concepts (from basic fundamentals to advanced applications).
2. Generate TWO progressive questions:
   - Question 1: At "foundational" difficulty level testing core definition, mental model, or intuition.
   - Question 2: At "foundational" or "intermediate" difficulty level testing practical mechanics or real-world behavior.
3. For each question include 4 clear multiple-choice options, exactly one correct answer (matching one option word for word), an educational explanation, and a foundationalTip.

Return strictly JSON with this exact structure:
{
  "concepts": [
    {
      "id": "concept_1",
      "name": "Concept Name",
      "description": "Short 1-sentence description of what this concept covers",
      "status": "learning"
    }
  ],
  "initialQuestions": [
    {
      "id": "q_1",
      "conceptId": "concept_1",
      "conceptName": "Concept Name",
      "difficulty": "foundational",
      "question": "First question text?",
      "codeSnippet": null,
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "explanation": "Why this answer is correct and how to think about it.",
      "foundationalTip": "Core mental model or rule of thumb for this concept.",
      "rationale": "Diagnostic check on core fundamentals."
    },
    {
      "id": "q_2",
      "conceptId": "concept_1",
      "conceptName": "Concept Name",
      "difficulty": "intermediate",
      "question": "Second progressive question text?",
      "codeSnippet": null,
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "explanation": "Why this answer is correct.",
      "foundationalTip": "Tip for this mechanic.",
      "rationale": "Pipeline buffer: Testing practical behavior."
    }
  ]
}`;

  try {
    const rawText = await callGemini(prompt, systemInstruction);
    const parsed = JSON.parse(cleanJsonString(rawText));
    
    const concepts: StudyConcept[] = (parsed.concepts || []).map((c: any, idx: number) => ({
      id: c.id || `concept_${idx + 1}`,
      name: c.name,
      description: c.description,
      status: 'learning' as const
    }));

    const qList = parsed.initialQuestions || (parsed.initialQuestion ? [parsed.initialQuestion] : []);

    const initialQuestion: StudyQuestion = {
      id: `q_${Date.now()}_1`,
      conceptId: qList[0]?.conceptId || concepts[0]?.id || 'concept_1',
      conceptName: qList[0]?.conceptName || concepts[0]?.name || 'Core Fundamentals',
      difficulty: qList[0]?.difficulty || 'foundational',
      question: qList[0]?.question || `What is the fundamental purpose of ${topic}?`,
      codeSnippet: qList[0]?.codeSnippet || undefined,
      options: qList[0]?.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      answer: qList[0]?.answer || 'Option 1',
      explanation: qList[0]?.explanation || 'Core concept explanation.',
      foundationalTip: qList[0]?.foundationalTip,
      rationale: qList[0]?.rationale || 'Diagnostic check on core fundamentals.'
    };

    let nextBufferedQuestion: StudyQuestion | undefined = undefined;
    if (qList[1]) {
      nextBufferedQuestion = {
        id: `q_${Date.now()}_2`,
        conceptId: qList[1].conceptId || concepts[0]?.id || 'concept_1',
        conceptName: qList[1].conceptName || concepts[0]?.name || 'Core Fundamentals',
        difficulty: qList[1].difficulty || 'intermediate',
        question: qList[1].question,
        codeSnippet: qList[1].codeSnippet || undefined,
        options: qList[1].options,
        answer: qList[1].answer,
        explanation: qList[1].explanation,
        foundationalTip: qList[1].foundationalTip,
        rationale: qList[1].rationale || 'Buffered question for zero-lag pipeline.'
      };
    }

    return { concepts, initialQuestion, nextBufferedQuestion };
  } catch (err) {
    console.error('generateInitialStudySession failed, falling back to local generator:', err);
    return getFallbackInitialSession(topic);
  }
}

/**
 * Adaptive evaluation & next question generation with strict PRECAUTION heuristics:
 * If the user makes a mistake:
 * - Identify the misconception
 * - Lower or lock difficulty at 'foundational'
 * - Provide immediate scaffolding explanation
 * - Generate a simpler reinforcement question
 */
export async function evaluateAndGenerateNext(
  session: StudySession,
  previousQuestion: StudyQuestion,
  selectedAnswer: string
): Promise<{
  evaluation: AnswerEvaluation;
  nextQuestion: StudyQuestion;
  updatedConcepts: StudyConcept[];
}> {
  const isCorrect = selectedAnswer.trim().toLowerCase() === previousQuestion.answer.trim().toLowerCase();
  
  // Calculate streaks
  const newConsecutiveCorrect = isCorrect ? session.consecutiveCorrect + 1 : 0;
  const newConsecutiveWrong = !isCorrect ? session.consecutiveWrong + 1 : 0;

  const systemInstruction = `You are an expert adaptive tutor practicing Mastery-Based Learning and Diagnostic Scaffolding.
Your primary directive: If a student struggles, take precautions immediately. DO NOT advance to complex topics while fundamentals are weak. Step down difficulty to foundational level, address their misconception, and test the core intuition.`;

  const prompt = `Topic: "${session.topic}"
Current Concepts: ${JSON.stringify(session.concepts)}
Current Session Difficulty: "${session.currentDifficulty}"
User Streak: ${newConsecutiveCorrect} correct in a row, ${newConsecutiveWrong} incorrect in a row.

PREVIOUS QUESTION:
- Concept: "${previousQuestion.conceptName}" (${previousQuestion.conceptId})
- Difficulty: "${previousQuestion.difficulty}"
- Question: "${previousQuestion.question}"
- Options: ${JSON.stringify(previousQuestion.options)}
- Expected Correct Answer: "${previousQuestion.answer}"
- User's Selected Answer: "${selectedAnswer}"
- Is Match: ${isCorrect}

CRITICAL PEDAGOGICAL RULES FOR THIS STEP:
1. EVALUATION:
   - If User is INCORRECT:
     * Point out clearly why "${selectedAnswer}" is mistaken (the misconception).
     * Provide the correct mental model ("explanation").
     * Set "difficultyChange" to "downgraded" (or "maintained" if already foundational).
     * Set "recommendedAction" to "lower_level" or "stay_and_reinforce".
     * Set "masteryDelta" to -5.
   - If User is CORRECT:
     * Explain why it is right and celebrate the insight.
     * If streak is 2 or more at current level, "difficultyChange" is "upgraded" and "recommendedAction" is "advance_level".
     * Otherwise "difficultyChange" is "maintained" and "recommendedAction" is "stay_and_reinforce".
     * Set "masteryDelta" to +10.

2. NEXT QUESTION GENERATION (PRECAUTION PROTOCOL):
   - If User was INCORRECT:
     * PRECAUTION MANDATE: The next question MUST be at "foundational" difficulty level.
     * Target the root concept of the mistake with a simpler, intuitive question or clear analogy.
     * Set "rationale" explaining: "Precaution: Reinforcing basic concept after misconception on [topic/concept]".
   - If User was CORRECT:
     * If advanced, generate an "intermediate" or "advanced" question testing practical application, syntax, or edge cases.
     * Set "rationale" explaining: "Advancing to test practical application/edge case".
   - Ensure 4 unique options, exactly one matches "answer".

3. CONCEPT STATUS:
   - Mark concept as "struggling" if user missed this concept, or "mastered" if answered correctly 2+ times, or "learning".

Return strictly JSON format:
{
  "evaluation": {
    "isCorrect": ${isCorrect},
    "selectedAnswer": "${selectedAnswer}",
    "correctAnswer": "${previousQuestion.answer}",
    "explanation": "Clear explanation of the correct answer and reasoning.",
    "misconceptionInsight": ${isCorrect ? 'null' : '"Detailed breakdown of what the user likely misunderstood"'},
    "recommendedAction": "${!isCorrect ? 'lower_level' : (newConsecutiveCorrect >= 2 ? 'advance_level' : 'stay_and_reinforce')}",
    "difficultyChange": "${!isCorrect ? 'downgraded' : (newConsecutiveCorrect >= 2 ? 'upgraded' : 'maintained')}",
    "masteryDelta": ${isCorrect ? 10 : -5}
  },
  "updatedConcepts": [
    { "id": "string", "name": "string", "description": "string", "status": "learning" | "mastered" | "struggling" }
  ],
  "nextQuestion": {
    "id": "q_${Date.now()}",
    "conceptId": "string",
    "conceptName": "string",
    "difficulty": "${!isCorrect ? 'foundational' : (newConsecutiveCorrect >= 2 && session.currentDifficulty === 'foundational' ? 'intermediate' : session.currentDifficulty)}",
    "question": "Question text",
    "codeSnippet": null,
    "options": ["A", "B", "C", "D"],
    "answer": "A",
    "explanation": "Detailed explanation",
    "foundationalTip": "Core tip or mental model",
    "rationale": "Reason this question was selected"
  }
}`;

  try {
    const rawText = await callGemini(prompt, systemInstruction);
    const parsed = JSON.parse(cleanJsonString(rawText));

    // Ensure types and integrity
    const evaluation: AnswerEvaluation = {
      isCorrect,
      selectedAnswer,
      correctAnswer: previousQuestion.answer,
      explanation: parsed.evaluation?.explanation || previousQuestion.explanation,
      misconceptionInsight: parsed.evaluation?.misconceptionInsight || undefined,
      recommendedAction: parsed.evaluation?.recommendedAction || (isCorrect ? 'stay_and_reinforce' : 'lower_level'),
      difficultyChange: parsed.evaluation?.difficultyChange || (isCorrect ? 'maintained' : 'downgraded'),
      masteryDelta: typeof parsed.evaluation?.masteryDelta === 'number' ? parsed.evaluation.masteryDelta : (isCorrect ? 10 : -5)
    };

    const nextQ: StudyQuestion = {
      id: `q_${Date.now()}`,
      conceptId: parsed.nextQuestion?.conceptId || previousQuestion.conceptId,
      conceptName: parsed.nextQuestion?.conceptName || previousQuestion.conceptName,
      difficulty: parsed.nextQuestion?.difficulty || (isCorrect ? 'intermediate' : 'foundational'),
      question: parsed.nextQuestion?.question || 'What is the primary purpose of this feature?',
      codeSnippet: parsed.nextQuestion?.codeSnippet || undefined,
      options: parsed.nextQuestion?.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      answer: parsed.nextQuestion?.answer || 'Option 1',
      explanation: parsed.nextQuestion?.explanation || 'Explanation of this concept.',
      foundationalTip: parsed.nextQuestion?.foundationalTip || undefined,
      rationale: parsed.nextQuestion?.rationale || (isCorrect ? 'Moving to application' : 'Reinforcing core foundations')
    };

    const updatedConcepts: StudyConcept[] = (parsed.updatedConcepts && parsed.updatedConcepts.length > 0)
      ? parsed.updatedConcepts
      : session.concepts.map(c => {
          if (c.id === previousQuestion.conceptId) {
            return {
              ...c,
              status: isCorrect ? (newConsecutiveCorrect >= 2 ? 'mastered' : 'learning') : 'struggling'
            };
          }
          return c;
        });

    return { evaluation, nextQuestion: nextQ, updatedConcepts };
  } catch (err) {
    console.error('evaluateAndGenerateNext failed, using adaptive fallback:', err);
    return getFallbackEvaluation(session, previousQuestion, selectedAnswer, isCorrect);
  }
}

// Resilient Fallback Handlers for offline / network issues
function getFallbackInitialSession(topic: string): { 
  concepts: StudyConcept[]; 
  initialQuestion: StudyQuestion;
  nextBufferedQuestion?: StudyQuestion;
} {
  const cleanTopic = topic.trim();
  const concepts: StudyConcept[] = [
    { id: 'c1', name: `${cleanTopic} Fundamentals`, description: `Core concepts and purpose of ${cleanTopic}`, status: 'learning' },
    { id: 'c2', name: `${cleanTopic} Mechanics`, description: `How ${cleanTopic} operates in practice`, status: 'learning' },
    { id: 'c3', name: `${cleanTopic} Patterns & Pitfalls`, description: `Common errors and best practices in ${cleanTopic}`, status: 'learning' }
  ];

  const initialQuestion: StudyQuestion = {
    id: `q_${Date.now()}_1`,
    conceptId: 'c1',
    conceptName: `${cleanTopic} Fundamentals`,
    difficulty: 'foundational',
    question: `What is the fundamental purpose of ${cleanTopic}?`,
    options: [
      `To provide an efficient, standardized mechanism for managing and structuring ${cleanTopic} logic`,
      `To completely replace runtime execution and hardware compilation`,
      `To serve solely as temporary legacy syntax without practical usage`,
      `To enforce strict database serialization on all network requests`
    ],
    answer: `To provide an efficient, standardized mechanism for managing and structuring ${cleanTopic} logic`,
    explanation: `${cleanTopic} is primarily designed to provide structured, predictable patterns for development.`,
    foundationalTip: `Always anchor your understanding in what real problem ${cleanTopic} solves.`,
    rationale: `Diagnostic foundational check for ${cleanTopic}.`
  };

  const nextBufferedQuestion: StudyQuestion = {
    id: `q_${Date.now()}_2`,
    conceptId: 'c2',
    conceptName: `${cleanTopic} Mechanics`,
    difficulty: 'intermediate',
    question: `When implementing ${cleanTopic} in production, what is a primary operational consideration?`,
    options: [
      `Ensure proper lifecycle handling, boundary isolation, and error tolerance`,
      `Disable memory garbage collection to increase raw loop speed`,
      `Hardcode network endpoints directly into core computation routines`,
      `Bypass asynchronous processing loops to force synchronous bottlenecks`
    ],
    answer: `Ensure proper lifecycle handling, boundary isolation, and error tolerance`,
    explanation: `Robust architecture requires clean lifecycle boundaries and fault-tolerant error handling.`,
    foundationalTip: `Focus on lifecycle safety and predictable data flow.`,
    rationale: `Lookahead buffered question for seamless transition.`
  };

  return { concepts, initialQuestion, nextBufferedQuestion };
}

function getFallbackEvaluation(
  session: StudySession,
  previousQuestion: StudyQuestion,
  selectedAnswer: string,
  isCorrect: boolean
): { evaluation: AnswerEvaluation; nextQuestion: StudyQuestion; updatedConcepts: StudyConcept[] } {
  const nextDiff: StudyDifficulty = !isCorrect ? 'foundational' : (session.consecutiveCorrect >= 1 ? 'intermediate' : 'foundational');
  
  const evaluation: AnswerEvaluation = {
    isCorrect,
    selectedAnswer,
    correctAnswer: previousQuestion.answer,
    explanation: previousQuestion.explanation,
    misconceptionInsight: isCorrect ? undefined : `You selected "${selectedAnswer}". Remember the core rule: ${previousQuestion.foundationalTip || previousQuestion.explanation}`,
    recommendedAction: isCorrect ? 'stay_and_reinforce' : 'lower_level',
    difficultyChange: isCorrect ? 'maintained' : 'downgraded',
    masteryDelta: isCorrect ? 10 : -5
  };

  const nextQuestion: StudyQuestion = {
    id: `q_${Date.now()}`,
    conceptId: previousQuestion.conceptId,
    conceptName: previousQuestion.conceptName,
    difficulty: nextDiff,
    question: !isCorrect 
      ? `[Foundation Check] Which of the following best reflects the core principle of ${previousQuestion.conceptName}?`
      : `[Application Test] In a practical scenario involving ${previousQuestion.conceptName}, what is the recommended practice?`,
    options: [
      `Maintain clean separation and follow deterministic lifecycle rules`,
      `Bypass state validation and write directly to global memory`,
      `Disable all async dispatchers to force blocking execution`,
      `Ignore error boundaries and suppress thrown exceptions`
    ],
    answer: `Maintain clean separation and follow deterministic lifecycle rules`,
    explanation: `Best practices emphasize predictability, immutability, and following deterministic lifecycle rules.`,
    foundationalTip: previousQuestion.foundationalTip || `Understand the underlying flow step by step.`,
    rationale: !isCorrect 
      ? `Precaution: Stepping down to reinforce core concept of ${previousQuestion.conceptName}`
      : `Stepping forward to test practical implementation.`
  };

  const updatedConcepts = session.concepts.map(c => {
    if (c.id === previousQuestion.conceptId) {
      return {
        ...c,
        status: isCorrect ? ('learning' as const) : ('struggling' as const)
      };
    }
    return c;
  });

  return { evaluation, nextQuestion, updatedConcepts };
}

/**
 * Generates an instant Socratic hint for an incorrect answer.
 * Strictly avoids revealing the answer or which option is correct.
 */
export async function getSocraticHint(
  question: StudyQuestion,
  selectedAnswer: string
): Promise<string> {
  const systemInstruction = `You are a brilliant Socratic tutor and mentor.
A student selected an incorrect option on a multiple-choice question.
DO NOT REVEAL THE CORRECT ANSWER.
DO NOT say things like "Option B is correct" or "The answer is...".
Instead, provide a concise (1 to 2 sentences), intuitive hint or mental nudge that leads the student to realize why their current choice doesn't fit, and encourages them to reconsider.`;

  const prompt = `Question: "${question.question}"
Options: ${JSON.stringify(question.options)}
Expected Answer: "${question.answer}" (DO NOT REVEAL THIS)
Student Chose: "${selectedAnswer}"
Concept: "${question.conceptName}"

Write a warm, 1-2 sentence guiding Socratic hint.`;

  try {
    const text = await callGemini(prompt, systemInstruction, false);
    return text.trim();
  } catch (err) {
    console.error('getSocraticHint error:', err);
    return `Think about what makes "${question.conceptName}" unique. Re-read the options carefully—what would happen if "${selectedAnswer}" were true?`;
  }
}

/**
 * Back-and-forth conversational tutor for the active question.
 * Allows student to ask questions, verify assumptions, or seek clarification.
 */
export async function chatWithTutor(
  question: StudyQuestion,
  userMessage: string,
  history: ChatMessage[] = []
): Promise<string> {
  const systemInstruction = `You are an encouraging, expert technical study coach.
The student is currently working on this question:
"${question.question}"
Correct concept: "${question.conceptName}"
Expected Answer: "${question.answer}" (DO NOT explicitly reveal this directly unless the student has already answered correctly or explicitly asked for the solution after multiple attempts).
Your goal: Guide them with concise, clear explanations. Address their specific curiosity or confusion directly. Keep responses friendly, clear, and under 3-4 sentences.`;

  const conversationContext = history
    .slice(-4)
    .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
    .join('\n');

  const prompt = `${conversationContext ? `Recent Conversation:\n${conversationContext}\n` : ''}
Student asks: "${userMessage}"
Tutor response:`;

  try {
    const text = await callGemini(prompt, systemInstruction, false);
    return text.trim();
  } catch (err) {
    console.error('chatWithTutor error:', err);
    return "That's an interesting question! Look closely at how this mechanism behaves at runtime and how state changes sequentially.";
  }
}

/**
 * Diagnostic health check for the active Gemini AI model.
 * Returns model info, latency, and connectivity status for the admin console.
 */
export async function checkAiStatus(): Promise<{
  status: 'online' | 'degraded' | 'offline';
  model: string;
  latencyMs: number;
  apiKeyConfigured: boolean;
  rateLimits: {
    rpm: string;
    tpm: string;
    rpd: string;
  };
  error?: string;
}> {
  const modelName = GEMINI_MODEL;
  const apiKeyConfigured = !!GEMINI_API_KEY;

  if (!apiKeyConfigured) {
    return {
      status: 'offline',
      model: modelName,
      latencyMs: 0,
      apiKeyConfigured: false,
      rateLimits: { rpm: '15 RPM', tpm: '250K TPM', rpd: '500 RPD' },
      error: 'GEMINI_API_KEY environment variable is not configured.'
    };
  }

  const startTime = Date.now();
  try {
    const reply = await callGemini('Ping check. Reply with {"pong": true}', undefined, true);
    const latencyMs = Date.now() - startTime;
    return {
      status: 'online',
      model: modelName,
      latencyMs,
      apiKeyConfigured: true,
      rateLimits: { rpm: '15 RPM', tpm: '250K TPM', rpd: '500 RPD' }
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      status: 'degraded',
      model: modelName,
      latencyMs,
      apiKeyConfigured: true,
      rateLimits: { rpm: '15 RPM', tpm: '250K TPM', rpd: '500 RPD' },
      error: err?.message || 'Failed to ping Gemini API'
    };
  }
}
