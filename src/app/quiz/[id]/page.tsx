'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getQuiz } from '@/lib/db';
import { Quiz, Question, UserSession, JoinedQuiz, QuizProgress } from '@/types/quiz';
import ThemeToggle from '@/components/ThemeToggle';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Fisher-Yates Shuffle Algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function QuizPlayerPage({ params }: PageProps) {
  const router = useRouter();
  
  // Unwrapping route parameters
  const { id: quizId } = React.use(params);

  // Auth / Session
  const [session, setSession] = useState<UserSession | null>(null);

  // Active Quiz Info
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Joined List Context
  const [allJoined, setAllJoined] = useState<JoinedQuiz[]>([]);

  // Direct Join Link states
  const [needsLogin, setNeedsLogin] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copied, setCopied] = useState(false);

  // Load session and quiz details
  useEffect(() => {
    loadQuizAndSession();
  }, [quizId]);

  const loadQuizAndSession = async () => {
    setLoading(true);
    setError('');
    try {
      const dbQuiz = await getQuiz(quizId);
      if (!dbQuiz) {
        setError('Quiz not found or has been deleted by the administrator.');
        setLoading(false);
        return;
      }
      
      // Save base quiz data
      setQuiz(dbQuiz);

      const sessionRaw = localStorage.getItem('quzzy_session');
      if (!sessionRaw) {
        setNeedsLogin(true);
        setLoading(false);
        return;
      }

      const s: UserSession = JSON.parse(sessionRaw);
      setSession(s);

      // Admins bypass joining rules and play directly
      if (s.role === 'admin') {
        initializeQuizState(dbQuiz, []);
        setLoading(false);
        return;
      }

      const joinedRaw = localStorage.getItem('quzzy_joined_quizzes');
      const joinedList: JoinedQuiz[] = joinedRaw ? JSON.parse(joinedRaw) : [];
      setAllJoined(joinedList);

      const activeQuiz = joinedList.find(q => q.quizId === dbQuiz.id);
      if (!activeQuiz) {
        if (dbQuiz.password && dbQuiz.password.trim() !== '') {
          setNeedsPassword(true);
        } else {
          await performJoinQuiz(dbQuiz, joinedList);
        }
      } else {
        initializeQuizState(dbQuiz, joinedList);
      }
    } catch (e) {
      setError('An error occurred while loading the quiz.');
    } finally {
      setLoading(false);
    }
  };

  const initializeQuizState = (dbQuiz: Quiz, joinedList: JoinedQuiz[]) => {
    const activeQuiz = joinedList.find(q => q.quizId === dbQuiz.id);
    if (activeQuiz && activeQuiz.progress) {
      setCurrentIdx(activeQuiz.progress.currentQuestionIndex);
      setSelectedAnswers(activeQuiz.progress.selectedAnswers || {});
      setIsCompleted(activeQuiz.progress.completed);
      if (activeQuiz.progress.score !== undefined) {
        setScore(activeQuiz.progress.score);
      }

      if (activeQuiz.progress.shuffledQuestions && activeQuiz.progress.shuffledQuestions.length > 0) {
        setQuiz({
          ...dbQuiz,
          questions: activeQuiz.progress.shuffledQuestions
        });
      } else {
        const shuffledQuestions = shuffleArray(dbQuiz.questions).map(q => ({
          ...q,
          options: shuffleArray(q.options)
        }));
        setQuiz({
          ...dbQuiz,
          questions: shuffledQuestions
        });
        saveProgressToStorage(
          activeQuiz.progress.selectedAnswers || {},
          activeQuiz.progress.currentQuestionIndex,
          activeQuiz.progress.completed,
          activeQuiz.progress.score,
          shuffledQuestions,
          joinedList,
          dbQuiz
        );
      }
    } else {
      const shuffledQuestions = shuffleArray(dbQuiz.questions).map(q => ({
        ...q,
        options: shuffleArray(q.options)
      }));
      setQuiz({
        ...dbQuiz,
        questions: shuffledQuestions
      });

      // For admin play bypass, we do not write progress to localStorage
      if (joinedList.length > 0) {
        saveProgressToStorage({}, 0, false, undefined, shuffledQuestions, joinedList, dbQuiz);
      }
    }
  };

  const performJoinQuiz = async (dbQuiz: Quiz, currentJoined: JoinedQuiz[]) => {
    const newItem: JoinedQuiz = {
      quizId: dbQuiz.id,
      title: dbQuiz.title,
      questionCount: dbQuiz.questions.length,
      joinedAt: Date.now(),
      allowRetake: dbQuiz.allowRetake !== false
    };
    const updated = [newItem, ...currentJoined];
    localStorage.setItem('quzzy_joined_quizzes', JSON.stringify(updated));
    setAllJoined(updated);
    initializeQuizState(dbQuiz, updated);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUsername.trim()) return;

    const s: UserSession = {
      username: inputUsername.trim(),
      role: 'user'
    };
    localStorage.setItem('quzzy_session', JSON.stringify(s));
    setSession(s);
    setNeedsLogin(false);

    if (quiz) {
      if (quiz.password && quiz.password.trim() !== '') {
        setNeedsPassword(true);
      } else {
        performJoinQuiz(quiz, []);
      }
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;

    if (quiz.password && quiz.password.trim() !== inputPassword.trim()) {
      setJoinError('Incorrect password for this quiz.');
      return;
    }

    setNeedsPassword(false);
    setJoinError('');
    performJoinQuiz(quiz, allJoined);
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = window.location.origin + '/quiz/' + quizId;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Sync active progress to LocalStorage
  const saveProgressToStorage = (
    answers: Record<number, string>, 
    idx: number, 
    completed: boolean, 
    finalScore?: number,
    shuffledQs?: Question[],
    overrideJoined?: JoinedQuiz[],
    overrideQuiz?: Quiz
  ) => {
    const activeQuiz = overrideQuiz || quiz;
    const activeJoined = overrideJoined || allJoined;
    
    if (!activeQuiz || activeJoined.length === 0) return;

    const updated = activeJoined.map(item => {
      if (item.quizId === activeQuiz.id) {
        const activeShuffled = shuffledQs || item.progress?.shuffledQuestions || activeQuiz.questions;
        
        const progress: QuizProgress = {
          currentQuestionIndex: idx,
          selectedAnswers: answers,
          completed,
          score: finalScore,
          completedAt: completed ? Date.now() : undefined,
          shuffledQuestions: activeShuffled
        };

        let history = item.history || [];
        if (completed && finalScore !== undefined) {
          history = [
            {
              score: finalScore,
              totalQuestions: activeQuiz.questions.length,
              completedAt: Date.now()
            },
            ...history
          ];
        }

        return {
          ...item,
          progress,
          history
        };
      }
      return item;
    });

    setAllJoined(updated);
    localStorage.setItem('quzzy_joined_quizzes', JSON.stringify(updated));
  };

  const handleSelectOption = (optionText: string) => {
    if (isCompleted) return;
    
    // Lock selection once chosen in Instant Feedback mode
    if (quiz?.instantFeedback && selectedAnswers[currentIdx] !== undefined) {
      return;
    }

    const newAnswers = {
      ...selectedAnswers,
      [currentIdx]: optionText
    };
    setSelectedAnswers(newAnswers);

    if (allJoined.length > 0) {
      saveProgressToStorage(newAnswers, currentIdx, false);
    }
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentIdx < quiz.questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      saveProgressToStorage(selectedAnswers, nextIdx, false);
    }
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      saveProgressToStorage(selectedAnswers, prevIdx, false);
    }
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;

    // Calculate score matching exact answer strings
    let calculatedScore = 0;
    quiz.questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (selected && selected.toLowerCase().trim() === q.answer.toLowerCase().trim()) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
    setIsCompleted(true);
    saveProgressToStorage(selectedAnswers, currentIdx, true, calculatedScore);
  };

  const handleRetakeQuiz = () => {
    if (!quiz) return;

    // Generate new shuffles of questions and options
    const newShuffledQuestions = shuffleArray(quiz.questions).map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }));

    // Reset local states
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsCompleted(false);
    setScore(0);
    setQuiz({
      ...quiz,
      questions: newShuffledQuestions
    });

    if (allJoined.length > 0) {
      const updated = allJoined.map(item => {
        if (item.quizId === quiz.id) {
          const progress: QuizProgress = {
            currentQuestionIndex: 0,
            selectedAnswers: {},
            completed: false,
            shuffledQuestions: newShuffledQuestions
          };
          return {
            ...item,
            progress
          };
        }
        return item;
      });

      setAllJoined(updated);
      localStorage.setItem('quzzy_joined_quizzes', JSON.stringify(updated));
    }
  };

  const handleExit = () => {
    if (session?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="container center-layout">
        <div style={{ color: 'var(--text-secondary)' }}>Loading quiz configurations...</div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container center-layout">
        <div className="glass-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⚠️</span>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--error)' }}>
            Error Playing Quiz
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {error || 'The quiz configuration could not be loaded.'}
          </p>
          <button onClick={handleExit} className="btn btn-primary" style={{ width: '100%' }}>
            Exit
          </button>
        </div>
      </div>
    );
  }

  if (needsLogin) {
    return (
      <div className="container center-layout" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center', animation: 'scaleIn var(--transition-normal)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Join Quiz Room</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Enter a nickname to join <strong style={{ color: 'var(--accent-secondary)' }}>{quiz.title}</strong>
          </p>

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Nickname</label>
              <input
                type="text"
                placeholder="e.g. coder123"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                className="input-field"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '2.75rem', marginTop: '1.5rem' }}>
              Next ➡️
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="container center-layout" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center', animation: 'scaleIn var(--transition-normal)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Password Required</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            This quiz is password protected. Enter the password for <strong style={{ color: 'var(--accent-secondary)' }}>{quiz.title}</strong> to join.
          </p>

          {joinError && (
            <div className="badge-error" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', display: 'block', textAlign: 'center' }}>
              ⚠️ {joinError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Quiz Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="input-field"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '2.75rem', marginTop: '1.5rem' }}>
              Verify & Join Quiz 🚀
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPct = Math.round((answeredCount / quiz.questions.length) * 100);

  // Circular calculations
  const totalQuestions = quiz.questions.length;
  const scorePct = Math.round((score / totalQuestions) * 100) || 0;
  const strokeDashoffset = 408 - (408 * scorePct) / 100;

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      
      {/* Quiz player header */}
      <header className="flex-between glass-card-sm" style={{ padding: '0.75rem 1.5rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            ID: {quiz.id.toUpperCase()}
          </span>
          <h2 style={{ fontSize: '1.2rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px', color: 'var(--text-primary)' }}>
            {quiz.title}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <ThemeToggle />
          <button 
            onClick={handleShareLink} 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            {copied ? '✅ Copied!' : '🔗 Share'}
          </button>
          <button onClick={handleExit} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
            🚪 Exit
          </button>
        </div>
      </header>

      {!isCompleted ? (
        // --- QUIZ GAME PANEL ---
        <div className="glass-card" style={{ padding: '2rem', animation: 'scaleIn var(--transition-normal)' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Question <strong style={{ color: 'var(--text-primary)' }}>{currentIdx + 1}</strong> of <strong>{quiz.questions.length}</strong>
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {progressPct}% Answered
            </span>
          </div>

          <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-full)', marginBottom: '2.5rem', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--accent-gradient)', transition: 'width 0.3s ease' }}></div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 600, lineHeight: '1.5', color: 'var(--text-primary)' }}>
              {currentQuestion.question}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
            {currentQuestion.options.map((option, idx) => {
              const optionLabel = String.fromCharCode(65 + idx);
              const isSelected = selectedAnswers[currentIdx] === option;
              const hasAnswered = selectedAnswers[currentIdx] !== undefined;

              let optionClass = `quiz-option ${isSelected ? 'selected' : ''}`;
              if (quiz?.instantFeedback && hasAnswered) {
                const isCorrect = option.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();
                if (isCorrect) {
                  optionClass = 'quiz-option correct';
                } else if (isSelected) {
                  optionClass = 'quiz-option incorrect';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  className={optionClass}
                  style={{ 
                    alignItems: 'center',
                    cursor: (quiz?.instantFeedback && hasAnswered) ? 'default' : 'pointer',
                    pointerEvents: (quiz?.instantFeedback && hasAnswered) ? 'none' : 'auto'
                  }}
                >
                  <div className="option-marker">{optionLabel}</div>
                  <div style={{ flex: 1 }}>{option}</div>
                </button>
              );
            })}
          </div>

          {quiz?.instantFeedback && selectedAnswers[currentIdx] !== undefined && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div 
                style={{ 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)', 
                  background: selectedAnswers[currentIdx].toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim() 
                    ? 'rgba(16, 185, 129, 0.08)' 
                    : 'rgba(239, 68, 68, 0.08)', 
                  border: selectedAnswers[currentIdx].toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()
                    ? '1px solid var(--success)'
                    : '1px solid var(--error)',
                  color: selectedAnswers[currentIdx].toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()
                    ? 'var(--success)'
                    : 'var(--error)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  animation: 'fadeIn var(--transition-normal)'
                }}
              >
                {selectedAnswers[currentIdx].toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim() ? (
                  <>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>✓</span>
                    <div>
                      <strong>Correct!</strong> Well done.
                    </div>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>✗</span>
                    <div>
                      <strong>Incorrect.</strong> Correct answer is: <strong style={{ textDecoration: 'underline' }}>{currentQuestion.answer}</strong>.
                    </div>
                  </>
                )}
              </div>

              {currentQuestion.explanation && (
                <div 
                  className="glass-card-sm"
                  style={{ 
                    padding: '1rem 1.25rem', 
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--accent-primary)',
                    background: 'var(--option-bg)',
                    animation: 'fadeIn var(--transition-normal)'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.35rem' }}>
                    💡 Explanation
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex-between" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', gap: '1rem' }}>
            <button
              onClick={handlePrevious}
              className="btn btn-secondary"
              style={{ flex: 1, height: '2.75rem' }}
              disabled={currentIdx === 0}
            >
              ⬅️ Previous
            </button>

            {currentIdx < quiz.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="btn btn-primary"
                style={{ flex: 1, height: '2.75rem' }}
              >
                Next ➡️
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="btn btn-success"
                style={{ 
                  flex: 1, 
                  height: '2.75rem', 
                  background: 'var(--success)', 
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                }}
              >
                🏁 Submit Quiz
              </button>
            )}
          </div>
          {answeredCount < quiz.questions.length && currentIdx === quiz.questions.length - 1 && (
            <p style={{ textAlign: 'center', color: 'var(--warning)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
              ⚠️ Please answer all questions before submitting. ({answeredCount}/{quiz.questions.length} answered)
            </p>
          )}
        </div>
      ) : (
        // --- RESULTS PANEL ---
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '3rem 2rem', textAlign: 'center', gap: '1.5rem', animation: 'scaleIn var(--transition-normal)' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', margin: 0 }}>
              Quiz Completed!
            </h2>
            
            <div className="circular-progress">
              <svg viewBox="0 0 150 150" width="150" height="150" style={{ display: 'block', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <circle className="circular-bg" cx="75" cy="75" r="65"></circle>
                <circle 
                  className="circular-fill" 
                  cx="75" 
                  cy="75" 
                  r="65"
                  style={{ strokeDashoffset }}
                ></circle>
              </svg>
              <div className="circular-text">
                <span className="circular-val">{score}/{totalQuestions}</span>
                <span className="circular-lbl">{scorePct}% Score</span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '400px', lineHeight: '1.6' }}>
              {scorePct >= 80 ? '🎉 Amazing! You have a solid understanding of these concepts.' : 
               scorePct >= 50 ? '👍 Good job! Review the answers below to reach perfection.' : 
               '💪 Keep learning! Try restarting the quiz to improve your score.'}
            </p>

            <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '400px', marginTop: '0.5rem' }}>
              {quiz.allowRetake !== false && (
                <button onClick={handleRetakeQuiz} className="btn btn-primary" style={{ flex: 1 }}>
                  🔄 Retake Quiz
                </button>
              )}
              <button onClick={handleExit} className="btn btn-secondary" style={{ flex: 1 }}>
                🏡 Dashboard
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Review Questions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {quiz.questions.map((q, idx) => {
                const selected = selectedAnswers[idx];
                const isCorrect = selected && selected.toLowerCase().trim() === q.answer.toLowerCase().trim();

                return (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: '1.25rem', 
                      background: 'rgba(0,0,0,0.01)', 
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--glass-border)',
                      borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}`
                    }}
                  >
                    <div className="flex-between" style={{ marginBottom: '0.75rem', gap: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        QUESTION {idx + 1}
                      </span>
                      <span className={`badge ${isCorrect ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.7rem' }}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                      {q.question}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {q.options.map((option, optIdx) => {
                        const isOptionSelected = selected === option;
                        const isOptionCorrect = option.toLowerCase().trim() === q.answer.toLowerCase().trim();

                        let optClass = '';
                        if (isOptionCorrect) {
                          optClass = 'correct';
                        } else if (isOptionSelected && !isCorrect) {
                          optClass = 'incorrect';
                        }

                        return (
                          <div 
                            key={optIdx} 
                            className={`quiz-option ${optClass}`}
                            style={{ 
                              cursor: 'default', 
                              padding: '0.75rem 1.15rem', 
                              fontSize: '0.9rem',
                              transform: 'none',
                              alignItems: 'flex-start'
                            }}
                          >
                            <div className="option-marker" style={{ marginTop: '0.1rem' }}>
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <div style={{ lineHeight: '1.5', fontWeight: 600 }}>{option}</div>
                              
                              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                                {isOptionSelected && (
                                  <span style={{ 
                                    fontSize: '0.65rem', 
                                    padding: '0.2rem 0.5rem', 
                                    borderRadius: 'var(--radius-sm)', 
                                    background: 'var(--option-marker-bg)', 
                                    color: 'var(--text-secondary)', 
                                    fontWeight: 700, 
                                    border: '1px solid var(--glass-border)',
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                  }}>
                                    Your Selection
                                  </span>
                                )}
                                {isOptionCorrect && (
                                  <span style={{ 
                                    fontSize: '0.65rem', 
                                    padding: '0.2rem 0.5rem', 
                                    borderRadius: 'var(--radius-sm)', 
                                    background: 'var(--success-bg)', 
                                    color: 'var(--success-text)', 
                                    fontWeight: 700, 
                                    border: '1px solid var(--success-border)',
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                  }}>
                                    Correct Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div 
                        style={{ 
                          marginTop: '1.25rem',
                          padding: '0.85rem 1.15rem', 
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '3px solid var(--accent-primary)',
                          background: 'var(--option-bg)',
                          fontSize: '0.85rem',
                          animation: 'fadeIn var(--transition-normal)'
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.25rem' }}>
                          💡 Explanation
                        </div>
                        <p style={{ margin: 0, lineHeight: '1.4', color: 'var(--text-primary)' }}>
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
