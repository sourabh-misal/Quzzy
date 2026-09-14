'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getQuiz } from '@/lib/db';
import { UserSession, JoinedQuiz } from '@/types/quiz';
import ThemeToggle from '@/components/ThemeToggle';

export default function UserDashboardPage() {
  const router = useRouter();

  // Guard / Auth
  const [session, setSession] = useState<UserSession | null>(null);

  // Joined Quizzes list
  const [joinedQuizzes, setJoinedQuizzes] = useState<JoinedQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Join Quiz Modal State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  // Load session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionRaw = localStorage.getItem('quzzy_session');
      if (!sessionRaw) {
        router.push('/');
        return;
      }
      try {
        const s: UserSession = JSON.parse(sessionRaw);
        if (s.role !== 'user') {
          router.push('/');
        } else {
          setSession(s);
          loadJoinedQuizzes();
        }
      } catch (e) {
        router.push('/');
      }
    }
  }, [router]);

  const loadJoinedQuizzes = async () => {
    setLoading(true);
    if (typeof window === 'undefined') return;

    try {
      const joinedRaw = localStorage.getItem('quzzy_joined_quizzes');
      const localJoined: JoinedQuiz[] = joinedRaw ? JSON.parse(joinedRaw) : [];
      
      // Update details from database
      const updatedList = await Promise.all(
        localJoined.map(async (item) => {
          try {
            const dbQuiz = await getQuiz(item.quizId);
            if (dbQuiz) {
              return {
                ...item,
                title: dbQuiz.title,
                questionCount: dbQuiz.questions.length,
                allowRetake: dbQuiz.allowRetake !== false
              };
            }
            return {
              ...item,
              title: item.title + ' (Archived)',
              archived: true
            };
          } catch (e) {
            return item;
          }
        })
      );
      
      const sorted = updatedList.sort((a, b) => b.joinedAt - a.joinedAt);
      setJoinedQuizzes(sorted);
      localStorage.setItem('quzzy_joined_quizzes', JSON.stringify(sorted));
    } catch (err) {
      console.error("Failed to load joined quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('quzzy_session');
    router.push('/');
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setJoining(true);

    const cleanId = joinId.trim().toLowerCase();
    if (!cleanId) {
      setJoinError('Please enter a Quiz ID.');
      setJoining(false);
      return;
    }

    const alreadyJoined = joinedQuizzes.some(q => q.quizId.toLowerCase() === cleanId);
    if (alreadyJoined) {
      setJoinError('You have already joined this quiz.');
      setJoining(false);
      return;
    }

    try {
      const quiz = await getQuiz(cleanId);
      if (!quiz) {
        setJoinError('Quiz not found. Double check the ID.');
        setJoining(false);
        return;
      }

      if (quiz.password && quiz.password.trim() !== '') {
        if (quiz.password.trim() !== joinPassword.trim()) {
          setJoinError('Incorrect password for this quiz.');
          setJoining(false);
          return;
        }
      }

      const newJoinedItem: JoinedQuiz = {
        quizId: quiz.id,
        title: quiz.title,
        questionCount: quiz.questions.length,
        joinedAt: Date.now(),
        allowRetake: quiz.allowRetake !== false
      };

      const updatedList = [newJoinedItem, ...joinedQuizzes];
      localStorage.setItem('quzzy_joined_quizzes', JSON.stringify(updatedList));
      setJoinedQuizzes(updatedList);
      
      setJoinId('');
      setJoinPassword('');
      setShowJoinModal(false);
    } catch (err) {
      setJoinError('An error occurred. Check connection.');
    } finally {
      setJoining(false);
    }
  };

  const handleRemoveQuiz = (qId: string) => {
    if (confirm('Are you sure you want to remove this quiz from your dashboard? Your progress will be lost.')) {
      const updated = joinedQuizzes.filter(q => q.quizId !== qId);
      localStorage.setItem('quzzy_joined_quizzes', JSON.stringify(updated));
      setJoinedQuizzes(updated);
    }
  };

  const handleResetQuiz = (qId: string) => {
    if (confirm('Restart quiz? This will reset your current progress.')) {
      const updated = joinedQuizzes.map(q => {
        if (q.quizId === qId) {
          return {
            ...q,
            progress: undefined
          };
        }
        return q;
      });
      localStorage.setItem('quzzy_joined_quizzes', JSON.stringify(updated));
      setJoinedQuizzes(updated);
    }
  };

  const handlePlayQuiz = (qId: string) => {
    router.push(`/quiz/${qId}`);
  };

  if (!session) return null;

  return (
    <div className="container">
      {/* Header bar */}
      <header className="flex-between glass-card-sm" style={{ padding: '1rem 2rem', marginBottom: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Quzzy Dashboard
          </h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Welcome, {session.username}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <ThemeToggle />
          <button 
            onClick={() => router.push('/study')}
            className="btn btn-primary"
            style={{ 
              padding: '0.5rem 1.15rem', 
              fontSize: '0.9rem',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
            }}
          >
            🧠 AI Study Practice
          </button>
          <button 
            onClick={() => setShowJoinModal(true)} 
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1.15rem', fontSize: '0.9rem' }}
          >
            ➕ Join Quiz
          </button>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Logout
          </button>
        </div>
      </header>

      {/* Main dashboard content */}
      <main style={{ flex: 1 }}>
        {/* AI Study Practice Hero Card */}
        <div className="glass-card" style={{ 
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          padding: '1.75rem',
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🧠</span>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>
                Adaptive AI Study & Practice Hub
              </h3>
              <span style={{ 
                background: 'rgba(139, 92, 246, 0.25)', 
                color: 'var(--accent-primary)', 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                padding: '0.15rem 0.55rem', 
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(139, 92, 246, 0.4)'
              }}>
                NEW FEATURE
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.5', margin: 0 }}>
              Enter any technical topic. The AI generates adaptive diagnostic questions, detects conceptual misunderstandings, and takes precautions to strengthen your basics before advancing to complex scenarios.
            </p>
          </div>
          <button 
            onClick={() => router.push('/study')}
            className="btn btn-primary"
            style={{ 
              padding: '0.8rem 1.6rem', 
              fontSize: '0.95rem', 
              fontWeight: 700, 
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)'
            }}
          >
            Launch AI Study Practice →
          </button>
        </div>

        <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <span>📚</span> Preset Quizzes
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>
            Loading dashboard...
          </div>
        ) : joinedQuizzes.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--text-secondary)', 
            padding: '5rem 2rem', 
            border: '2px dashed var(--glass-border)', 
            borderRadius: 'var(--radius-lg)',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ fontSize: '3rem' }}>🎯</span>
            <div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No Quizzes Joined Yet</h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto' }}>
                Ask your Admin for a Quiz ID and password, click the "+" button, and start playing!
              </p>
            </div>
            <button 
              onClick={() => setShowJoinModal(true)} 
              className="btn btn-primary"
              style={{ marginTop: '0.5rem' }}
            >
              Join Your First Quiz
            </button>
          </div>
        ) : (
          <div className="grid-cols-1-2-3">
            {joinedQuizzes.map((item) => {
              const hasProgress = !!item.progress;
              const isCompleted = item.progress?.completed;
              const answersCount = hasProgress ? Object.keys(item.progress?.selectedAnswers || {}).length : 0;
              
              let badge = <span className="badge badge-primary">Not Started</span>;
              if (isCompleted) {
                const score = item.progress?.score || 0;
                const pct = Math.round((score / item.questionCount) * 100) || 0;
                badge = <span className="badge badge-success">Completed ({score}/{item.questionCount} • {pct}%)</span>;
              } else if (hasProgress && answersCount > 0) {
                badge = <span className="badge badge-warning">In Progress ({answersCount}/{item.questionCount})</span>;
              }

              return (
                <div key={item.quizId} className="glass-card-sm" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  
                  {/* Top segment */}
                  <div>
                    <div className="flex-between" style={{ marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        ID: {item.quizId.toUpperCase()}
                      </span>
                      {badge}
                    </div>

                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Questions: {item.questionCount}
                    </p>

                    {/* Attempt History */}
                    {item.history && item.history.length > 0 && (
                      <div style={{ 
                        background: 'var(--bg-tertiary)', 
                        padding: '0.5rem 0.75rem', 
                        borderRadius: 'var(--radius-sm)', 
                        border: '1px solid var(--glass-border)',
                        marginBottom: '1rem',
                        fontSize: '0.75rem' 
                      }}>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.25rem' }}>PAST ATTEMPTS:</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-primary)' }}>Best Score: {Math.max(...item.history.map(h => h.score))}/{item.questionCount}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>Attempts: {item.history.length}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Buttons segment */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <button 
                      onClick={() => handlePlayQuiz(item.quizId)} 
                      className="btn btn-primary"
                      style={{ flex: 2, padding: '0.5rem 1rem', fontSize: '0.85rem', minWidth: '100px' }}
                      disabled={isCompleted && item.allowRetake === false}
                    >
                      {isCompleted ? (item.allowRetake === false ? '🔒 Completed' : '🔄 Retake Quiz') : hasProgress ? '▶️ Resume' : '🚀 Start Quiz'}
                    </button>
                    
                    {hasProgress && item.allowRetake !== false && (
                      <button 
                        onClick={() => handleResetQuiz(item.quizId)} 
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                        title="Restart quiz progress"
                      >
                        Reset
                      </button>
                    )}

                    <button 
                      onClick={() => handleRemoveQuiz(item.quizId)} 
                      className="btn btn-danger"
                      style={{ flex: '0 0 auto', padding: '0.5rem', fontSize: '0.85rem' }}
                      title="Leave / Delete Quiz"
                    >
                      🗑️
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Join Quiz Modal Overlay */}
      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Join a Quiz
            </h3>

            {joinError && (
              <div className="badge-error" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', display: 'block', textAlign: 'center' }}>
                ⚠️ {joinError}
              </div>
            )}

            <form onSubmit={handleJoinSubmit}>
              <div className="form-group">
                <label htmlFor="joinId">Quiz ID</label>
                <input
                  id="joinId"
                  type="text"
                  placeholder="e.g. math101"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="input-field"
                  required
                  autoFocus
                  disabled={joining}
                />
              </div>

              <div className="form-group">
                <label htmlFor="joinPassword">Quiz Password (if required)</label>
                <input
                  id="joinPassword"
                  type="password"
                  placeholder="Enter quiz password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className="input-field"
                  disabled={joining}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1, height: '2.75rem' }}
                  disabled={joining}
                >
                  {joining ? 'Searching...' : 'Join'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinError('');
                    setJoinId('');
                    setJoinPassword('');
                  }} 
                  className="btn btn-secondary"
                  style={{ flex: 1, height: '2.75rem' }}
                  disabled={joining}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
