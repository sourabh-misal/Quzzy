'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession } from '@/types/quiz';
import { StudySession } from '@/types/study';
import { getUserStudySessions, saveStudySession } from '@/lib/db';
import ThemeToggle from '@/components/ThemeToggle';

const QUICK_TOPICS = [
  { title: 'JavaScript Event Loop & Microtasks', icon: '⚡', category: 'Frontend/Core' },
  { title: 'React State, Effects & Re-renders', icon: '⚛️', category: 'Frontend' },
  { title: 'Node.js Streams & Asynchronous I/O', icon: '🟢', category: 'Backend' },
  { title: 'Docker Containers, Volumes & Networks', icon: '🐳', category: 'DevOps' },
  { title: 'SQL Indexes, Joins & Execution Plans', icon: '🗄️', category: 'Databases' },
  { title: 'System Design: Caching & Load Balancing', icon: '🏗️', category: 'Architecture' },
  { title: 'REST vs GraphQL vs gRPC Tradeoffs', icon: '🌐', category: 'APIs' },
  { title: 'TypeScript Generics & Conditional Types', icon: '🔷', category: 'Languages' },
];

export default function StudyHubPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [topic, setTopic] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rawSession = localStorage.getItem('quzzy_session');
      if (!rawSession) {
        router.push('/');
        return;
      }
      try {
        const parsed: UserSession = JSON.parse(rawSession);
        setSession(parsed);
        loadSessions(parsed.username);
      } catch (e) {
        router.push('/');
      }
    }
  }, [router]);

  const loadSessions = async (username: string) => {
    setLoadingHistory(true);
    try {
      const userSessions = await getUserStudySessions(username);
      setRecentSessions(userSessions);
    } catch (e) {
      console.error('Failed to load past study sessions:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartStudy = async (studyTopic?: string) => {
    const selectedTopic = (studyTopic || topic).trim();
    if (!selectedTopic) {
      setError('Please enter a topic to study.');
      return;
    }

    setError('');
    setIsStarting(true);

    try {
      const res = await fetch('/api/ai/study/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          username: session?.username || 'Learner'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start AI practice session');
      }

      // Save initial session state to local/firestore
      await saveStudySession(data.session);

      // Navigate to the adaptive practice room
      router.push(`/study/${data.sessionId}`);
    } catch (err: any) {
      console.error('Failed to launch study session:', err);
      setError(err?.message || 'Failed to start AI practice session. Please try again.');
      setIsStarting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
      
      {/* Top Navigation */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            ← Back to Dashboard
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: 800, 
                letterSpacing: '-0.03em',
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                Adaptive AI Study Practice
              </h1>
              <span style={{ 
                background: 'rgba(139, 92, 246, 0.15)', 
                color: 'var(--accent-primary)', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                padding: '0.2rem 0.6rem', 
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                GEMINI POWERED
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
              Deep conceptual mastery with dynamic scaffolding & precaution-first learning
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            User: <strong style={{ color: 'var(--text-primary)' }}>{session?.username}</strong>
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Topic Input Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🎯</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Start New Topic Practice</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Type any concept, library, programming language, or technical subject. The AI will formulate an adaptive diagnostic test and tailor the difficulty according to your understanding.
            </p>

            {error && (
              <div className="badge-error" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleStartStudy(); }}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="topic-input" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Study Topic
                </label>
                <input
                  id="topic-input"
                  type="text"
                  placeholder="e.g. React Reconciliation, SQL Index B-Trees, Docker Networking..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="input-field"
                  disabled={isStarting}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '3.2rem', fontSize: '1rem', fontWeight: 600 }}
                disabled={isStarting || !topic.trim()}
              >
                {isStarting ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span className="spinner-sm"></span> Generating Adaptive Study Plan...
                  </span>
                ) : (
                  'Launch AI Practice Session 🚀'
                )}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 <strong>Precaution Engine:</strong> If you struggle with a question, the AI won't jump ahead—it provides an intuitive mental breakdown and steps down to foundational questions until you understand it thoroughly.
          </div>
        </div>

        {/* How Adaptive Practice Works Card */}
        <div className="glass-card" style={{ background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.75rem' }}>🧠</span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>The Adaptive Mastery Engine</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.2)', 
                color: 'var(--success)', 
                width: '1.75rem', 
                height: '1.75rem', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
                flexShrink: 0
              }}>1</div>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Diagnostic Baseline:</strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Decomposes the topic into 3–4 core milestones and initiates a foundational probe to assess your mental model.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.2)', 
                color: 'var(--error)', 
                width: '1.75rem', 
                height: '1.75rem', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
                flexShrink: 0
              }}>2</div>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Precaution & Scaffolding:</strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Missed an answer? The AI detects the misconception, explains the core rule, and lowers difficulty to foundational principles.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ 
                background: 'rgba(139, 92, 246, 0.2)', 
                color: 'var(--accent-primary)', 
                width: '1.75rem', 
                height: '1.75rem', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
                flexShrink: 0
              }}>3</div>
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Climb to Mastery:</strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  As your streak increases, the AI elevates questions to practical code implementation, architecture tradeoffs, and edge cases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Inspiration Chips */}
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Popular Study Topics
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
          gap: '0.85rem' 
        }}>
          {QUICK_TOPICS.map((item) => (
            <button
              key={item.title}
              onClick={() => { setTopic(item.title); handleStartStudy(item.title); }}
              disabled={isStarting}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                transition: 'all var(--transition-normal)',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.category}
                </span>
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Study Sessions */}
      <section>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Your Study History & Mastery
        </h3>

        {loadingHistory ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Loading past study sessions...
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              You haven't started any AI study sessions yet.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Choose a topic above or enter your own to begin learning with adaptive AI!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentSessions.map((s) => {
              const dateStr = new Date(s.updatedAt || s.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={s.id}
                  className="glass-card"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ minWidth: '220px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{s.topic}</h4>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: 'var(--radius-full)',
                        background: s.currentDifficulty === 'mastery' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                        color: s.currentDifficulty === 'mastery' ? 'var(--warning)' : 'var(--accent-primary)',
                        textTransform: 'capitalize',
                        fontWeight: 600
                      }}>
                        {s.currentDifficulty}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span>Questions: <strong>{s.totalQuestions}</strong></span>
                      <span>Correct: <strong>{s.correctCount}</strong></span>
                      <span>Last updated: {dateStr}</span>
                    </div>

                    {/* Mastery Bar */}
                    <div style={{ marginTop: '0.75rem', maxWidth: '300px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Mastery Level</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{s.masteryScore}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${Math.min(100, Math.max(5, s.masteryScore))}%`, 
                          height: '100%', 
                          background: 'var(--accent-gradient)',
                          borderRadius: '3px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/study/${s.id}`)}
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                  >
                    Resume Practice →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
