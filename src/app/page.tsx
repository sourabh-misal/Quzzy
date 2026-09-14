'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verifyAdminPassword } from '@/lib/db';
import { UserSession } from '@/types/quiz';
import ThemeToggle from '@/components/ThemeToggle';

export default function GatewayPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionRaw = localStorage.getItem('quzzy_session');
      if (sessionRaw) {
        try {
          const session: UserSession = JSON.parse(sessionRaw);
          if (session.role === 'admin') {
            router.push('/admin');
          } else if (session.role === 'user') {
            router.push('/dashboard');
          }
        } catch (e) {
          localStorage.removeItem('quzzy_session');
        }
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Please enter a username');
      return;
    }

    // Trigger Admin Mode if user enters 'admin' but password field isn't shown yet
    if (cleanUsername.toLowerCase() === 'admin' && !isAdminMode) {
      setIsAdminMode(true);
      return;
    }

    setLoading(true);

    try {
      if (isAdminMode) {
        const isValid = await verifyAdminPassword(password);
        if (isValid) {
          const session: UserSession = {
            username: cleanUsername,
            role: 'admin'
          };
          localStorage.setItem('quzzy_session', JSON.stringify(session));
          router.push('/admin');
        } else {
          setError('Invalid admin password');
          setLoading(false);
        }
      } else {
        // Normal user login (password-less)
        const session: UserSession = {
          username: cleanUsername,
          role: 'user'
        };
        localStorage.setItem('quzzy_session', JSON.stringify(session));
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="center-layout" style={{ padding: '1rem', position: 'relative' }}>
      
      {/* Theme Toggle in Top Right */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <ThemeToggle />
      </div>

      <div className="glass-card" style={{ maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '0.5rem',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            letterSpacing: '-0.04em'
          }}>
            Quzzy
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isAdminMode 
              ? 'Admin Dashboard Authentication' 
              : 'Enter a username to join and play quizzes'}
          </p>
        </div>

        {error && (
          <div className="badge-error" style={{ 
            padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1.5rem',
            width: '100%',
            display: 'block',
            textAlign: 'center',
            fontSize: '0.875rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                // Turn off admin mode if they clear or change from 'admin'
                if (e.target.value.toLowerCase().trim() !== 'admin' && isAdminMode) {
                  setIsAdminMode(false);
                  setPassword('');
                }
              }}
              className="input-field"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          {isAdminMode && (
            <div className="form-group" style={{ animation: 'fadeIn var(--transition-normal)' }}>
              <label htmlFor="password">Admin Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
                disabled={loading}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', height: '3rem' }}
            disabled={loading}
          >
            {loading ? 'Entering...' : (isAdminMode ? 'Authenticate' : 'Get Started')}
          </button>
        </form>
      </div>
    </div>
  );
}
