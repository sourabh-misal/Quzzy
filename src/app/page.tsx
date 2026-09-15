'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verifyAdminPassword, saveStudySession, getQuiz } from '@/lib/db';
import { canUseAi } from '@/lib/quota';
import ThemeToggle from '@/components/ThemeToggle';
import AiQuotaBadge from '@/components/AiQuotaBadge';

// Curated drill tracks for immediate 1-click launch
const DRILL_CATEGORIES = [
  {
    id: 'syntax',
    badge: '⚡ Syntax & Bug-Fixing',
    badgeColor: '#f59e0b',
    description: 'Diagnose runtime errors, type traps, and subtle edge cases.',
    items: [
      {
        title: 'JavaScript Quirks, Coercion & Closures',
        desc: 'Object equality, truthy/falsy gotchas, and lexical scope traps.',
        topic: 'JavaScript Syntax Gotchas, Coercion and Stale Closures'
      },
      {
        title: 'React Hook Dependencies & Re-render Cycles',
        desc: 'Stale state in useEffect, infinite loops, and memoization traps.',
        topic: 'React Hook Dependencies, Stale Closures and Re-renders'
      },
      {
        title: 'TypeScript Generics & Discriminated Unions',
        desc: 'Narrowing union types, conditional types, and keyof inferences.',
        topic: 'TypeScript Generics, Type Narrowing and Discriminated Unions'
      },
      {
        title: 'Python Scope & Memory Mutability Gotchas',
        desc: 'Default mutable arguments, late binding lambdas, and generator quirks.',
        topic: 'Python Scope Rules, Mutable Defaults and Generator Syntax'
      }
    ]
  },
  {
    id: 'dsa',
    badge: '🧩 DSA & Algorithmic Intuition',
    badgeColor: '#8b5cf6',
    description: 'Master time/space complexities and fundamental problem-solving patterns.',
    items: [
      {
        title: 'Two-Pointer & Sliding Window Invariants',
        desc: 'Optimal contiguous subarrays, shrink/expand conditions, and bounds.',
        topic: 'Two-Pointer Technique and Sliding Window Algorithmic Patterns'
      },
      {
        title: 'Binary Search Edge Cases & Boundary Conditions',
        desc: 'Off-by-one errors, lower/upper bounds, and condition predicates.',
        topic: 'Binary Search Edge Cases, Invariants and Boundary Search'
      },
      {
        title: 'Graph Traversal: BFS vs DFS State Tracking',
        desc: 'Cycle detection, visited sets, topological sorting, and shortest paths.',
        topic: 'Graph Algorithms: BFS, DFS, Cycle Detection and State Traversal'
      },
      {
        title: 'Dynamic Programming Recurrence Relations',
        desc: 'Subproblem overlap, base cases, and optimal state transitions.',
        topic: 'Dynamic Programming: Memoization and Tabulation Recurrence'
      }
    ]
  },
  {
    id: 'concepts',
    badge: '🏗️ Architecture & Core Concepts',
    badgeColor: '#06b6d4',
    description: 'Deep dive into system mechanisms, databases, and runtime internals.',
    items: [
      {
        title: 'Node.js Event Loop, Microtasks & Streams',
        desc: 'process.nextTick, Promise queues, backpressure, and worker threads.',
        topic: 'Node.js Event Loop Microtask Phases and Stream Backpressure'
      },
      {
        title: 'SQL B-Tree Indexes & Query Execution Plans',
        desc: 'Composite index ordering, table scans, join algorithms, and EXPLAIN.',
        topic: 'SQL Indexes, B-Trees, Execution Plans and Query Optimization'
      },
      {
        title: 'System Design: Caching, Invalidation & Sharding',
        desc: 'Cache-aside, write-through, LRU evictions, and database partitions.',
        topic: 'System Design: Distributed Caching, Eviction and Database Sharding'
      },
      {
        title: 'Docker Networks, Volumes & Layer Caching',
        desc: 'Bridge vs host networking, bind mounts, and multi-stage builds.',
        topic: 'Docker Containers, Bridge Networks, Volumes and Multi-Stage Builds'
      }
    ]
  }
];

const PRESET_QUIZZES = [
  { id: 'react-nextjs-200', title: 'React & Next.js Pro (200 Qs)', count: 200, tag: 'Frontend' },
  { id: 'nodejs-100', title: 'Node.js & Backend Architecture (100 Qs)', count: 100, tag: 'Backend' },
  { id: 'js-fundamentals', title: 'JavaScript Core Fundamentals (50 Qs)', count: 50, tag: 'Core' }
];

export default function HomePage() {
  const router = useRouter();

  // User handle state
  const [username, setUsername] = useState('Learner');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // Search / Custom Topic Launch State
  const [customTopic, setCustomTopic] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState('');

  // Quiz PIN Join State
  const [quizPin, setQuizPin] = useState('');
  const [quizPassword, setQuizPassword] = useState('');
  const [joiningQuiz, setJoiningQuiz] = useState(false);
  const [quizJoinError, setQuizJoinError] = useState('');
  const [needsQuizPass, setNeedsQuizPass] = useState(false);

  // Admin Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // Active Tab for Drills
  const [activeTab, setActiveTab] = useState<'syntax' | 'dsa' | 'concepts'>('syntax');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('quzzy_session');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.username) setUsername(parsed.username);
        } catch (e) {}
      }
    }
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nameInput.trim() || 'Learner';
    setUsername(clean);
    setIsEditingName(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('quzzy_session', JSON.stringify({ username: clean, role: 'user' }));
    }
  };

  // Launch Adaptive Study Session
  const handleStartPractice = async (topicToStart?: string) => {
    const topic = (topicToStart || customTopic).trim();
    if (!topic) {
      setLaunchError('Please enter a topic or select a drill below.');
      return;
    }

    if (!canUseAi()) {
      setLaunchError('Daily AI question quota reached! It resets at midnight to conserve bandwidth.');
      return;
    }

    setLaunchError('');
    setIsLaunching(true);

    try {
      const res = await fetch('/api/ai/study/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          username: username || 'Learner'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start AI practice arena.');
      }

      // Save initial session to private local browser storage
      await saveStudySession(data.session);

      // Save session in local user record
      if (typeof window !== 'undefined') {
        localStorage.setItem('quzzy_session', JSON.stringify({ username: username || 'Learner', role: 'user' }));
      }

      router.push(`/study/${data.sessionId}`);
    } catch (err: any) {
      setLaunchError(err?.message || 'Failed to initialize AI study arena. Please try again.');
      setIsLaunching(false);
    }
  };

  // Join Quiz via PIN / Code
  const handleJoinQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = quizPin.trim().toLowerCase();
    if (!cleanId) return;

    setQuizJoinError('');
    setJoiningQuiz(true);

    try {
      const quiz = await getQuiz(cleanId);
      if (!quiz) {
        setQuizJoinError(`Quiz "${cleanId}" not found. Please verify the code.`);
        setJoiningQuiz(false);
        return;
      }

      if (quiz.password && !needsQuizPass && quiz.password !== quizPassword) {
        setNeedsQuizPass(true);
        setJoiningQuiz(false);
        return;
      }

      if (quiz.password && quiz.password !== quizPassword) {
        setQuizJoinError('Incorrect quiz password.');
        setJoiningQuiz(false);
        return;
      }

      // Save session
      if (typeof window !== 'undefined') {
        localStorage.setItem('quzzy_session', JSON.stringify({ username: username || 'Learner', role: 'user' }));
      }

      router.push(`/quiz/${cleanId}`);
    } catch (err: any) {
      setQuizJoinError(err?.message || 'Failed to join quiz.');
      setJoiningQuiz(false);
    }
  };

  // Admin Access Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setCheckingAdmin(true);

    try {
      const isValid = await verifyAdminPassword(adminPassword);
      if (isValid) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('quzzy_session', JSON.stringify({ username: 'Admin', role: 'admin' }));
        }
        router.push('/admin');
      } else {
        setAdminError('Invalid admin password.');
        setCheckingAdmin(false);
      }
    } catch (err) {
      setAdminError('Authentication error. Please try again.');
      setCheckingAdmin(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '1.5rem', maxWidth: '1180px', margin: '0 auto', position: 'relative' }}>
      
      {/* Top Navigation Bar */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--glass-border)',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            fontSize: '1.75rem', 
            fontWeight: 900,
            letterSpacing: '-0.04em',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ⚡ Quzzy
          </div>
          <span style={{ 
            fontSize: '0.75rem', 
            padding: '0.15rem 0.5rem', 
            borderRadius: 'var(--radius-full)', 
            background: 'rgba(99, 102, 241, 0.15)', 
            color: 'var(--accent-primary)',
            fontWeight: 700
          }}>
            AI Arena
          </span>
        </div>

        {/* Right Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Learner Handle Selector */}
          {isEditingName ? (
            <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input 
                type="text" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your Name"
                className="input-field"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', width: '130px' }}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}>
                Save
              </button>
            </form>
          ) : (
            <button 
              onClick={() => { setNameInput(username); setIsEditingName(true); }}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Click to change your learner name"
            >
              <span>👤</span>
              <strong>{username}</strong>
              <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>✎</span>
            </button>
          )}

          {/* AI Quota Meter */}
          <AiQuotaBadge />

          {/* Admin Portal Button */}
          <button 
            onClick={() => setShowAdminModal(true)}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
          >
            🛡️ Admin
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section — AI Practice Launcher */}
      <section style={{ textAlign: 'center', marginBottom: '3rem', padding: '1rem 0' }}>
        <div style={{ 
          display: 'inline-block',
          padding: '0.35rem 1rem', 
          borderRadius: 'var(--radius-full)', 
          background: 'rgba(139, 92, 246, 0.12)', 
          border: '1px solid rgba(139, 92, 246, 0.25)',
          color: '#a78bfa',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          ✨ Adaptive Mastery Engine with Socratic Coaching
        </div>

        <h1 style={{ 
          fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', 
          fontWeight: 900, 
          letterSpacing: '-0.04em',
          lineHeight: 1.15,
          marginBottom: '1rem'
        }}>
          Master Technical Concepts <br />
          <span style={{ 
            background: 'var(--accent-gradient)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Without The Guesswork
          </span>
        </h1>

        <p style={{ 
          color: 'var(--text-secondary)', 
          maxWidth: '640px', 
          margin: '0 auto 2rem auto', 
          fontSize: '1.05rem',
          lineHeight: 1.6
        }}>
          Enter any language, algorithm, or framework topic. Quzzy diagnoses your misconceptions in real time, scales difficulty, and scaffolds your understanding.
        </p>

        {/* Big Search / Prompt Bar */}
        <div className="glass-card" style={{ 
          maxWidth: '720px', 
          margin: '0 auto', 
          padding: '0.5rem 0.75rem',
          display: 'flex', 
          gap: '0.75rem',
          alignItems: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <span style={{ fontSize: '1.25rem', paddingLeft: '0.5rem', opacity: 0.6 }}>🔍</span>
          <input 
            type="text" 
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartPractice()}
            placeholder="E.g. JavaScript Event Loop, React Fiber, Binary Search, SQL Indexes..."
            style={{ 
              flex: 1, 
              border: 'none', 
              outline: 'none', 
              background: 'transparent', 
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 500
            }}
          />
          <button 
            onClick={() => handleStartPractice()}
            disabled={isLaunching}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap', fontWeight: 700 }}
          >
            {isLaunching ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
                Initializing...
              </span>
            ) : (
              '⚡ Practice Topic'
            )}
          </button>
        </div>

        {launchError && (
          <div style={{ 
            marginTop: '1rem', 
            color: 'var(--error)', 
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            ⚠️ {launchError}
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          marginTop: '1.25rem', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Popular:</span>
          {[
            'JavaScript Event Loop',
            'React Hook Dependencies',
            'Two-Pointer Technique',
            'SQL Indexing',
            'TypeScript Generics'
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => { setCustomTopic(chip); handleStartPractice(chip); }}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      {/* Interactive Drill Arena Tabs */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
              🎯 Targeted AI Drill Categories
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Pick a category to launch zero-lag adaptive problem solving.
            </p>
          </div>

          {/* Drill Category Tab Buttons */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--glass-bg)', 
            padding: '0.35rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--glass-border)',
            gap: '0.35rem' 
          }}>
            {DRILL_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id as any)}
                className={`btn ${activeTab === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  padding: '0.4rem 0.85rem', 
                  fontSize: '0.85rem',
                  border: activeTab === cat.id ? 'none' : 'transparent' 
                }}
              >
                {cat.badge}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Drill Category Cards */}
        {DRILL_CATEGORIES.filter(c => c.id === activeTab).map(category => (
          <div key={category.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {category.items.map((item, idx) => (
              <div 
                key={idx}
                className="glass-card"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  padding: '1.5rem',
                  transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 700, 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255,255,255,0.06)',
                      color: category.badgeColor,
                      border: '1px solid var(--glass-border)'
                    }}>
                      Drill Track
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>4 Concepts</span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    {item.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {item.desc}
                  </p>
                </div>

                <button
                  onClick={() => handleStartPractice(item.topic)}
                  disabled={isLaunching}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  Start Practice →
                </button>
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* Classic Quiz Arena (PIN & Preset Quizzes) */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ 
          background: 'var(--glass-bg)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                🏆 Join Quiz with PIN or Code
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                Have a code from your instructor or want to challenge ready-made question banks?
              </p>
            </div>

            {/* Quick PIN Join Form */}
            <form onSubmit={handleJoinQuiz} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input 
                type="text" 
                value={quizPin}
                onChange={(e) => setQuizPin(e.target.value)}
                placeholder="Enter Quiz ID (e.g. react-nextjs-200)"
                className="input-field"
                style={{ width: '230px', padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
                required
              />

              {needsQuizPass && (
                <input 
                  type="password" 
                  value={quizPassword}
                  onChange={(e) => setQuizPassword(e.target.value)}
                  placeholder="Quiz Password"
                  className="input-field"
                  style={{ width: '150px', padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
                  required
                />
              )}

              <button 
                type="submit" 
                disabled={joiningQuiz}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
              >
                {joiningQuiz ? 'Joining...' : 'Enter Quiz →'}
              </button>
            </form>
          </div>

          {quizJoinError && (
            <div className="badge-error" style={{ marginBottom: '1.25rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
              ⚠️ {quizJoinError}
            </div>
          )}

          {/* Preset Question Banks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {PRESET_QUIZZES.map(q => (
              <div 
                key={q.id}
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{q.tag}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {q.count} Qs</span>
                  </div>
                  <strong style={{ fontSize: '0.9rem' }}>{q.title}</strong>
                </div>

                <button 
                  onClick={() => { setQuizPin(q.id); router.push(`/quiz/${q.id}`); }}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Play →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Authentication Modal */}
      {showAdminModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0, 0, 0, 0.7)', 
          backdropFilter: 'blur(8px)',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>🛡️ Admin Studio Login</h2>
              <button 
                onClick={() => { setShowAdminModal(false); setAdminError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Enter the admin password to access quiz creation, question uploads, and live AI model diagnostics.
            </p>

            {adminError && (
              <div className="badge-error" style={{ marginBottom: '1rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
                ⚠️ {adminError}
              </div>
            )}

            <form onSubmit={handleAdminLogin}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Password</label>
                <input 
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="input-field"
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button"
                  onClick={() => { setShowAdminModal(false); setAdminError(''); }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={checkingAdmin}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {checkingAdmin ? 'Verifying...' : 'Unlock Studio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        paddingTop: '2rem', 
        borderTop: '1px solid var(--glass-border)', 
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <p style={{ margin: 0 }}>
          ⚡ <strong>Quzzy</strong> — Adaptive Mastery Learning Platform powered by Google Gemini 3.5 & Firebase.
        </p>
      </footer>

    </div>
  );
}
