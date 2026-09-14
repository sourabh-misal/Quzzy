'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession } from '@/types/quiz';
import { StudySession, StudyQuestion, AnswerEvaluation, ChatMessage } from '@/types/study';
import { getStudySession, saveStudySession } from '@/lib/db';
import ThemeToggle from '@/components/ThemeToggle';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function StudyPracticeArena({ params }: PageProps) {
  const router = useRouter();
  const { sessionId } = React.use(params);

  const [session, setSession] = useState<StudySession | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Question & Socratic States
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState<string[]>([]);
  const [socraticHint, setSocraticHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [revealedSolution, setRevealedSolution] = useState(false);

  // Back-and-Forth Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Advancement & Modals
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  useEffect(() => {
    if (showChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChat]);

  const loadSessionData = async () => {
    setLoading(true);
    setError('');

    // Check user auth
    if (typeof window !== 'undefined') {
      const rawUser = localStorage.getItem('quzzy_session');
      if (!rawUser) {
        router.push('/');
        return;
      }
      try {
        const u = JSON.parse(rawUser);
        setUserSession(u);
      } catch (e) {
        router.push('/');
        return;
      }
    }

    try {
      const data = await getStudySession(sessionId);
      if (!data) {
        setError('Study session not found or has expired.');
        setLoading(false);
        return;
      }

      setSession(data);
      resetQuestionStates();
    } catch (e: any) {
      setError(e?.message || 'Failed to load study session.');
    } finally {
      setLoading(false);
    }
  };

  const resetQuestionStates = () => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setWrongAttempts([]);
    setSocraticHint(null);
    setRevealedSolution(false);
    setShowChat(false);
    setChatMessages([]);
    setChatInput('');
  };

  const handleSelectOption = (opt: string) => {
    if (revealedSolution || isCorrect) return;
    setSelectedOption(opt);
  };

  // Instant Check Answer without giving it away
  const handleCheckAnswer = async () => {
    if (!selectedOption || !session?.currentQuestion) return;

    const currentQ = session.currentQuestion;
    const correct = selectedOption.trim().toLowerCase() === currentQ.answer.trim().toLowerCase();

    setIsAnswerChecked(true);
    setIsCorrect(correct);

    if (correct) {
      // User got it right!
      setRevealedSolution(true);
      // Pre-add a congratulatory message in chat
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          text: `🎯 Spot on! That's right: ${currentQ.explanation}`,
          timestamp: Date.now()
        }
      ]);
    } else {
      // User got it wrong -> DO NOT REVEAL THE ANSWER!
      setWrongAttempts(prev => [...prev, selectedOption]);
      setLoadingHint(true);
      setSocraticHint(null);

      // Fetch fast Socratic hint via Gemini 3.5 flash-lite (<1s)
      try {
        const res = await fetch('/api/ai/study/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'hint',
            question: currentQ,
            selectedAnswer: selectedOption
          })
        });

        const data = await res.json();
        if (data.hint) {
          setSocraticHint(data.hint);
          setChatMessages(prev => [
            ...prev,
            {
              id: `msg_${Date.now()}`,
              role: 'assistant',
              text: `💡 Hint: ${data.hint}`,
              timestamp: Date.now()
            }
          ]);
        }
      } catch (err) {
        setSocraticHint(`Think about the core mental model for ${currentQ.conceptName}. Try rereading the options!`);
      } finally {
        setLoadingHint(false);
      }
    }
  };

  // Allow user to try another option without penalty
  const handleRetryOption = () => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
  };

  // Reveal answer manually if user is stuck
  const handleRevealSolution = () => {
    setRevealedSolution(true);
  };

  // Back-and-forth conversational chat with tutor
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !session?.currentQuestion || sendingChat) return;

    const userText = chatInput.trim();
    setChatInput('');

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setSendingChat(true);

    try {
      const res = await fetch('/api/ai/study/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          question: session.currentQuestion,
          message: userText,
          history: updatedHistory
        })
      });

      const data = await res.json();
      if (data.reply) {
        setChatMessages(prev => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            text: data.reply,
            timestamp: Date.now()
          }
        ]);
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          text: "I'm having a slight connection hiccup, but take a look at the options again and think about what happens step by step!",
          timestamp: Date.now()
        }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  // Move to next adaptive question (syncs session metrics with AI)
  const handleAdvanceToNext = async () => {
    if (!session?.currentQuestion || isAdvancing) return;

    setIsAdvancing(true);
    setError('');

    try {
      // Use the final selected answer or the first wrong attempt for adaptive tracking
      const finalSelected = selectedOption || wrongAttempts[0] || session.currentQuestion.options[0];

      const res = await fetch('/api/ai/study/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session,
          previousQuestion: session.currentQuestion,
          selectedAnswer: finalSelected
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate next question.');
      }

      // Save updated session state
      await saveStudySession(data.updatedSession);
      setSession(data.updatedSession);
      resetQuestionStates();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err?.message || 'Failed to advance to next question.');
    } finally {
      setIsAdvancing(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'foundational':
        return { label: 'Level 1: Foundational', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'intermediate':
        return { label: 'Level 2: Mechanics', bg: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' };
      case 'advanced':
        return { label: 'Level 3: Application', bg: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' };
      case 'mastery':
        return { label: 'Level 4: Edge Cases & Mastery', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      default:
        return { label: difficulty, bg: 'var(--glass-bg)', color: 'var(--text-secondary)', border: 'var(--glass-border)' };
    }
  };

  if (loading) {
    return (
      <div className="center-layout" style={{ minHeight: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading your adaptive practice arena...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="center-layout" style={{ minHeight: '80vh' }}>
        <div className="glass-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⚠️</span>
          <h2 style={{ marginBottom: '0.75rem' }}>Session Error</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={() => router.push('/study')} className="btn btn-primary" style={{ width: '100%' }}>
            Return to Study Hub
          </button>
        </div>
      </div>
    );
  }

  const currentQ = session?.currentQuestion;
  const badge = getDifficultyBadge(currentQ?.difficulty || session?.currentDifficulty || 'foundational');

  return (
    <div style={{ minHeight: '100vh', padding: '1.5rem', maxWidth: '980px', margin: '0 auto', position: 'relative' }}>
      
      {/* Top Header & HUD */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--glass-border)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => router.push('/study')}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            ← Exit
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{session?.topic}</h1>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '0.15rem 0.5rem', 
                borderRadius: 'var(--radius-full)',
                background: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.border}`,
                fontWeight: 700
              }}>
                {badge.label}
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Concept: <strong style={{ color: 'var(--text-primary)' }}>{currentQ?.conceptName}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Streak Indicator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem',
            background: 'var(--glass-bg)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)'
          }}>
            <span>🔥</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              {session?.consecutiveCorrect || 0} Streak
            </span>
          </div>

          {/* Mastery Meter */}
          <div style={{ minWidth: '130px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Mastery</span>
              <strong style={{ color: 'var(--accent-primary)' }}>{session?.masteryScore || 0}%</strong>
            </div>
            <div style={{ width: '100%', height: '7px', background: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.max(5, session?.masteryScore || 0)}%`, 
                height: '100%', 
                background: 'var(--accent-gradient)',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Question Card */}
      {currentQ && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem', position: 'relative' }}>
          
          {/* Question Meta Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                fontWeight: 700 
              }}>
                Question #{(session?.totalQuestions || 0) + 1}
              </span>
              <span style={{ color: 'var(--glass-border)' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: badge.color, fontWeight: 600 }}>
                {currentQ.rationale || 'Adaptive check'}
              </span>
            </div>

            {/* Talk to Tutor Toggle */}
            <button
              onClick={() => setShowChat(!showChat)}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>💬</span>
              <span>{showChat ? 'Hide Tutor Chat' : 'Ask AI Tutor'}</span>
              {chatMessages.length > 0 && (
                <span style={{ 
                  background: 'var(--accent-primary)', 
                  color: '#fff', 
                  fontSize: '0.7rem', 
                  padding: '0.1rem 0.4rem', 
                  borderRadius: '10px' 
                }}>
                  {chatMessages.length}
                </span>
              )}
            </button>
          </div>

          {/* Question Text */}
          <h2 style={{ 
            fontSize: '1.35rem', 
            fontWeight: 700, 
            lineHeight: '1.4', 
            color: 'var(--text-primary)',
            marginBottom: currentQ.codeSnippet ? '1rem' : '1.75rem' 
          }}>
            {currentQ.question}
          </h2>

          {/* Optional Code Snippet */}
          {currentQ.codeSnippet && (
            <pre style={{ 
              background: 'rgba(0, 0, 0, 0.4)', 
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              overflowX: 'auto',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              color: '#e5e7eb',
              marginBottom: '1.75rem'
            }}>
              <code>{currentQ.codeSnippet}</code>
            </pre>
          )}

          {/* Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
            {currentQ.options.map((opt, idx) => {
              const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = selectedOption === opt;
              const isWrongAttempt = wrongAttempts.includes(opt);
              const isCorrectAnswer = opt.trim().toLowerCase() === currentQ.answer.trim().toLowerCase();

              let optStyle: React.CSSProperties = {
                background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'var(--option-bg)',
                border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--option-border)',
                color: 'var(--text-primary)',
                cursor: (revealedSolution || isCorrect) ? 'default' : 'pointer',
                transform: isSelected && !isAnswerChecked ? 'scale(1.006)' : 'none'
              };

              // Highlight wrong attempts without spoiling the right answer!
              if (isWrongAttempt && !revealedSolution) {
                optStyle.background = 'rgba(245, 158, 11, 0.1)';
                optStyle.border = '1px solid rgba(245, 158, 11, 0.4)';
                optStyle.color = 'var(--text-secondary)';
              }

              // Solution revealed state
              if (revealedSolution) {
                if (isCorrectAnswer) {
                  optStyle.background = 'rgba(16, 185, 129, 0.15)';
                  optStyle.border = '1px solid var(--success)';
                } else if (isWrongAttempt) {
                  optStyle.background = 'rgba(239, 68, 68, 0.12)';
                  optStyle.border = '1px solid var(--error)';
                  optStyle.opacity = 0.7;
                } else {
                  optStyle.opacity = 0.5;
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition-fast)',
                    ...optStyle
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--accent-primary)' : 'var(--option-marker-bg)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0
                    }}>
                      {optionLetter}
                    </div>
                    <span style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>{opt}</span>
                  </div>

                  {isWrongAttempt && !revealedSolution && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--warning-text)', fontWeight: 600 }}>
                      ⚠️ Rethink
                    </span>
                  )}

                  {revealedSolution && isCorrectAnswer && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 700 }}>
                      ✓ Correct
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Bar: Check Answer or Retry / Next */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              {/* If incorrect and answer not revealed yet, give Retry and Reveal actions */}
              {isAnswerChecked && isCorrect === false && !revealedSolution && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleRetryOption}
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                  >
                    🔄 Try Another Option
                  </button>
                  <button
                    onClick={handleRevealSolution}
                    className="btn btn-secondary"
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}
                  >
                    Show Solution & Explanation
                  </button>
                </div>
              )}
            </div>

            <div>
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                  className="btn btn-primary"
                  style={{ 
                    padding: '0.75rem 2rem', 
                    fontSize: '1rem', 
                    fontWeight: 700,
                    minWidth: '150px' 
                  }}
                >
                  Check Answer
                </button>
              ) : revealedSolution || isCorrect ? (
                <button
                  onClick={handleAdvanceToNext}
                  disabled={isAdvancing}
                  className="btn btn-primary"
                  style={{ 
                    padding: '0.75rem 2.25rem', 
                    fontSize: '1rem', 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
                  }}
                >
                  {isAdvancing ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="spinner-sm"></span> Loading Next Question...
                    </span>
                  ) : (
                    'Next Adaptive Question →'
                  )}
                </button>
              ) : null}
            </div>
          </div>

          {/* Socratic Hint Box (Shown when user is wrong, WITHOUT spoiling answer) */}
          {isAnswerChecked && isCorrect === false && !revealedSolution && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1.25rem', 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              animation: 'fadeIn var(--transition-normal)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>💡</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--warning-text)' }}>
                    Not quite! Here is a Socratic Hint:
                  </strong>
                </div>
                <button
                  onClick={() => setShowChat(true)}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--accent-primary)', 
                    fontSize: '0.8rem', 
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  💬 Talk with Tutor →
                </button>
              </div>

              {loadingHint ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span className="spinner-sm"></span> Asking AI Tutor for a guiding clue...
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  {socraticHint}
                </p>
              )}
            </div>
          )}

          {/* Full Solution & Celebration (Only shown once solved or manually revealed) */}
          {revealedSolution && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1.25rem', 
              borderRadius: 'var(--radius-md)', 
              background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)',
              border: isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)',
              animation: 'fadeIn var(--transition-normal)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>{isCorrect ? '🎉' : '📖'}</span>
                <strong style={{ fontSize: '1rem', color: isCorrect ? 'var(--success-text)' : 'var(--accent-primary)' }}>
                  {isCorrect ? 'Correct! Concept Solidified' : `Explanation (${currentQ.answer})`}
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                {currentQ.explanation}
              </p>
              {currentQ.foundationalTip && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px dashed var(--glass-border)', paddingTop: '0.5rem' }}>
                  💡 <strong>Rule to Remember:</strong> {currentQ.foundationalTip}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Interactive Back-and-Forth Chat Drawer */}
      {showChat && (
        <div className="glass-card" style={{ 
          padding: '1.5rem', 
          marginBottom: '2rem', 
          border: '1px solid rgba(139, 92, 246, 0.3)',
          animation: 'fadeIn var(--transition-normal)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>💬</span>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                Discussion with AI Tutor
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Ask anything about this question
              </span>
            </div>
            <button 
              onClick={() => setShowChat(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
            >
              ✕
            </button>
          </div>

          {/* Message List */}
          <div style={{ 
            maxHeight: '260px', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem', 
            marginBottom: '1rem',
            paddingRight: '0.5rem'
          }}>
            {chatMessages.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', margin: '1rem 0' }}>
                Ask a question like: <em>"Why is option A incorrect?"</em> or <em>"Can you give me an analogy for this?"</em>
              </p>
            ) : (
              chatMessages.map((msg) => (
                <div 
                  key={msg.id}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '0.65rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.06)',
                    color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.875rem',
                    lineHeight: '1.4'
                  }}
                >
                  {msg.text}
                </div>
              ))
            )}
            {sendingChat && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                AI Tutor is typing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Ask the tutor a question or type your thought..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="input-field"
              disabled={sendingChat}
              style={{ flex: 1, padding: '0.65rem 1rem', fontSize: '0.9rem' }}
            />
            <button
              type="submit"
              disabled={sendingChat || !chatInput.trim()}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* History Drawer Toggle */}
      {session?.history && session.history.length > 0 && (
        <section style={{ marginTop: '2rem' }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              📜 Question History & Solved Items ({session.history.length} completed)
            </span>
            <span>{showHistory ? '▲ Hide' : '▼ View History'}</span>
          </button>

          {showHistory && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {session.history.slice().reverse().map((item, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: item.evaluation.isCorrect ? 'var(--success)' : 'var(--error)' }}>
                      {item.evaluation.isCorrect ? '✓ Correct' : '⚠️ Misconception Addressed'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.question.conceptName} • {item.question.difficulty}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                    {item.question.question}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Your answer: <strong style={{ color: item.evaluation.isCorrect ? 'var(--success)' : 'var(--error)' }}>{item.selectedAnswer}</strong>
                  </div>
                  {!item.evaluation.isCorrect && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Correct answer: <strong>{item.question.answer}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
