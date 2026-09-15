'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAllQuizzes, 
  getQuiz, 
  saveQuiz, 
  deleteQuiz, 
  changeAdminPassword,
  verifyAdminPassword
} from '@/lib/db';
import { Quiz, Question, UserSession, JoinedQuiz } from '@/types/quiz';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminPage() {
  const router = useRouter();
  
  // Guard / Auth
  const [session, setSession] = useState<UserSession | null>(null);
  
  // View Toggle: Admin Console vs Play Mode
  const [isAdminPlayMode, setIsAdminPlayMode] = useState(false);

  // --- ADMIN CONSOLE STATES ---
  const [quizId, setQuizId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizPassword, setQuizPassword] = useState('');
  const [allowRetake, setAllowRetake] = useState(true);
  const [instantFeedback, setInstantFeedback] = useState(false);
  const [uploadedQuestions, setUploadedQuestions] = useState<Question[]>([]);
  const [jsonFileName, setJsonFileName] = useState('');
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Collision Modal State
  const [showCollisionModal, setShowCollisionModal] = useState(false);
  const [existingQuiz, setExistingQuiz] = useState<Quiz | null>(null);

  // Quizzes List States
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [editingPasswords, setEditingPasswords] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [expandedQuizzes, setExpandedQuizzes] = useState<Record<string, boolean>>({});

  // Password Settings States
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // AI Model Diagnostics States
  const [aiStatus, setAiStatus] = useState<{
    status: 'online' | 'degraded' | 'offline';
    model: string;
    latencyMs: number;
    apiKeyConfigured: boolean;
    rateLimits: { rpm: string; tpm: string; rpd: string };
    error?: string;
  } | null>(null);
  const [loadingAiStatus, setLoadingAiStatus] = useState(false);

  // --- ADMIN PLAY MODE STATES ---
  const [joinedQuizzes, setJoinedQuizzes] = useState<JoinedQuiz[]>([]);
  const [loadingJoined, setLoadingJoined] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  // Check auth & initialize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionRaw = localStorage.getItem('quzzy_session');
      if (!sessionRaw) {
        router.push('/');
        return;
      }
      try {
        const s: UserSession = JSON.parse(sessionRaw);
        if (s.role !== 'admin') {
          router.push('/');
        } else {
          setSession(s);
          loadQuizzes();
          loadJoinedQuizzes();
          fetchAiStatus();
        }
      } catch (e) {
        router.push('/');
      }
    }
  }, [router]);

  const fetchAiStatus = async () => {
    setLoadingAiStatus(true);
    try {
      const res = await fetch('/api/ai/status');
      const data = await res.json();
      setAiStatus(data);
    } catch (err) {
      console.error('Failed to fetch AI status:', err);
    } finally {
      setLoadingAiStatus(false);
    }
  };

  // Auto-populate Title and Password if Quiz ID already exists
  useEffect(() => {
    const cleanId = quizId.trim().toLowerCase();
    if (!cleanId) return;

    const existing = quizzes.find(q => q.id === cleanId);
    if (existing) {
      setQuizTitle(existing.title);
      setQuizPassword(existing.password || '');
    }
  }, [quizId, quizzes]);

  const loadQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const list = await getAllQuizzes();
      setQuizzes(list);
      
      const pMap: Record<string, string> = {};
      list.forEach(q => {
        pMap[q.id] = q.password || '';
      });
      setEditingPasswords(pMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const loadJoinedQuizzes = async () => {
    setLoadingJoined(true);
    if (typeof window === 'undefined') return;

    try {
      const joinedRaw = localStorage.getItem('quzzy_joined_quizzes');
      const localJoined: JoinedQuiz[] = joinedRaw ? JSON.parse(joinedRaw) : [];
      
      const updatedList = await Promise.all(
        localJoined.map(async (item) => {
          try {
            const dbQuiz = await getQuiz(item.quizId);
            if (dbQuiz) {
              return {
                ...item,
                title: dbQuiz.title,
                questionCount: dbQuiz.questions.length
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
      setLoadingJoined(false);
    }
  };

  // Generate random 6-character ID
  const handleGenerateId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setQuizId(id);
    setQuizTitle('');
    setQuizPassword('');
    setCreateError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('quzzy_session');
    router.push('/');
  };

  // Strict JSON Parser & Validator
  const parseAndValidateJSON = (jsonText: string): { questions: Question[], error?: string } => {
    try {
      const data = JSON.parse(jsonText);
      let questionsRaw: any[] = [];
      
      if (Array.isArray(data)) {
        questionsRaw = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.questions)) {
        questionsRaw = data.questions;
      } else {
        return { questions: [], error: 'JSON must be an array of questions or an object with a "questions" array.' };
      }

      if (questionsRaw.length === 0) {
        return { questions: [], error: 'No questions found in the JSON.' };
      }

      const validatedQuestions: Question[] = [];

      for (let i = 0; i < questionsRaw.length; i++) {
        const q = questionsRaw[i];
        if (typeof q.question !== 'string' || !q.question.trim()) {
          return { questions: [], error: `Question at index ${i} has a missing or invalid "question" text.` };
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          return { questions: [], error: `Question at index ${i} ("${q.question.substring(0, 20)}...") must have at least 2 options.` };
        }
        
        const options: string[] = q.options.map((opt: any) => String(opt).trim());
        if (options.some((opt: string) => !opt)) {
          return { questions: [], error: `Question at index ${i} has empty options.` };
        }

        let answerText = '';
        const rawAnswer = q.answer;
        
        if (rawAnswer === undefined || rawAnswer === null) {
          return { questions: [], error: `Question at index ${i} is missing the "answer" field.` };
        }

        // 1. Try to see if rawAnswer matches one of the options exactly (case-insensitive)
        const answerStr = String(rawAnswer).trim();
        const textMatch = options.find(opt => opt.toLowerCase() === answerStr.toLowerCase());
        
        if (textMatch) {
          answerText = textMatch; // Normalize to exact casing from options list
        } else {
          // 2. If it is NOT an exact text match, check if it could be a 1-based option index (like 1, 2, 3, 4)
          // or a string like "Option 1", "Option 2", "Option 3", "Option 4" (case-insensitive)
          let indexVal: number | null = null;
          
          const optionRegex = /^option\s+(\d+)$/i;
          const matchOption = answerStr.match(optionRegex);
          
          if (matchOption) {
            indexVal = parseInt(matchOption[1], 10);
          } else if (/^\d+$/.test(answerStr)) {
            indexVal = parseInt(answerStr, 10);
          }
          
          if (indexVal !== null) {
            const idxZeroBased = indexVal - 1;
            if (idxZeroBased >= 0 && idxZeroBased < options.length) {
              answerText = options[idxZeroBased];
            } else {
              return { 
                questions: [], 
                error: `Question at index ${i}: Answer reference "${answerStr}" resolves to option index ${indexVal}, which is out of bounds (options count is ${options.length}).` 
              };
            }
          } else {
            return { 
              questions: [], 
              error: `Question at index ${i}: Answer "${rawAnswer}" does not match any of the choices: [${options.join(', ')}] and is not a valid option number (1-${options.length}).` 
            };
          }
        }

        // Validate optional explanation field
        let explanationText: string | undefined = undefined;
        if (q.explanation !== undefined && q.explanation !== null) {
          if (typeof q.explanation !== 'string') {
            return { questions: [], error: `Question at index ${i} "explanation" must be a string.` };
          }
          explanationText = q.explanation.trim();
        }

        validatedQuestions.push({
          question: q.question.trim(),
          options,
          answer: answerText,
          ...(explanationText ? { explanation: explanationText } : {})
        });
      }

      return { questions: validatedQuestions };
    } catch (err: any) {
      return { questions: [], error: `Invalid JSON syntax: ${err.message}` };
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError('');
    setCreateError('');
    setCreateSuccess('');
    
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = parseAndValidateJSON(text);
      if (result.error) {
        setValidationError(result.error);
        setUploadedQuestions([]);
      } else {
        setUploadedQuestions(result.questions);
      }
    };
    reader.readAsText(file);
  };

  // Direct card uploader bypass
  const handleCardJsonUpload = (e: React.ChangeEvent<HTMLInputElement>, quiz: Quiz) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = parseAndValidateJSON(text);
      if (result.error) {
        alert(`Validation Error: ${result.error}`);
      } else {
        setExistingQuiz(quiz);
        setUploadedQuestions(result.questions);
        // Pre-populate creation values in case they merge/overwrite
        setQuizTitle(quiz.title);
        setQuizPassword(quiz.password || '');
        setShowCollisionModal(true);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset uploader
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    const cleanId = quizId.trim().toLowerCase();
    const cleanTitle = quizTitle.trim();

    if (!cleanId) {
      setCreateError('Please enter a Quiz ID.');
      return;
    }
    if (!cleanTitle) {
      setCreateError('Please enter a Quiz Title.');
      return;
    }
    if (uploadedQuestions.length === 0) {
      setCreateError('Please upload a valid JSON questions sheet.');
      return;
    }

    try {
      const existing = await getQuiz(cleanId);
      if (existing) {
        setExistingQuiz(existing);
        setShowCollisionModal(true);
      } else {
        await saveNewQuiz(cleanId, cleanTitle, quizPassword, uploadedQuestions);
      }
    } catch (err) {
      setCreateError('Failed to create quiz. Check your connection.');
    }
  };

  const saveNewQuiz = async (id: string, title: string, pass: string, questionsList: Question[]) => {
    const newQuiz: Quiz = {
      id,
      title,
      password: pass.trim(),
      questions: questionsList,
      createdBy: session?.username,
      createdAt: Date.now(),
      allowRetake,
      instantFeedback
    };
    await saveQuiz(newQuiz);
    setCreateSuccess(`Quiz "${title}" (${id}) published successfully!`);
    resetForm();
    loadQuizzes();
  };

  const handleCollisionAppend = async () => {
    if (!existingQuiz) return;
    try {
      const mergedQuestions = [...existingQuiz.questions, ...uploadedQuestions];
      const updatedQuiz: Quiz = {
        ...existingQuiz,
        title: quizTitle.trim() || existingQuiz.title,
        password: quizPassword.trim() || existingQuiz.password,
        questions: mergedQuestions,
        allowRetake,
        instantFeedback
      };
      await saveQuiz(updatedQuiz);
      setCreateSuccess(`Appended questions to existing Quiz ID: ${existingQuiz.id}`);
      setShowCollisionModal(false);
      resetForm();
      loadQuizzes();
    } catch (e) {
      setCreateError('Failed to append questions.');
    }
  };

  const handleCollisionReplace = async () => {
    if (!existingQuiz) return;
    try {
      const updatedQuiz: Quiz = {
        ...existingQuiz,
        title: quizTitle.trim() || existingQuiz.title,
        password: quizPassword.trim() || existingQuiz.password,
        questions: uploadedQuestions,
        allowRetake,
        instantFeedback
      };
      await saveQuiz(updatedQuiz);
      setCreateSuccess(`Replaced questions for Quiz ID: ${existingQuiz.id}`);
      setShowCollisionModal(false);
      resetForm();
      loadQuizzes();
    } catch (e) {
      setCreateError('Failed to replace questions.');
    }
  };

  const resetForm = () => {
    handleGenerateId();
    setQuizTitle('');
    setQuizPassword('');
    setAllowRetake(true);
    setInstantFeedback(false);
    setUploadedQuestions([]);
    setJsonFileName('');
    setValidationError('');
  };

  const handleUpdatePassword = async (qId: string) => {
    const newPass = editingPasswords[qId] || '';
    try {
      const quiz = quizzes.find(q => q.id === qId);
      if (quiz) {
        const updated = { ...quiz, password: newPass.trim() };
        await saveQuiz(updated);
        loadQuizzes();
      }
    } catch (e) {
      alert(`Failed to update password for quiz ${qId}`);
    }
  };

  const handleDeleteQuiz = async (qId: string) => {
    if (confirm(`Are you absolutely sure you want to delete Quiz ID: ${qId}?`)) {
      try {
        await deleteQuiz(qId);
        loadQuizzes();
      } catch (e) {
        alert('Failed to delete quiz.');
      }
    }
  };

  const handleToggleQuizOption = async (quiz: Quiz, optionKey: 'allowRetake' | 'instantFeedback', checked: boolean) => {
    try {
      const updated = {
        ...quiz,
        [optionKey]: checked
      };
      await saveQuiz(updated);
      loadQuizzes();
    } catch (e) {
      alert('Failed to update quiz settings.');
    }
  };

  const handleExportQuiz = (quiz: Quiz) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quiz.questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${quiz.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const togglePasswordVisibility = (qId: string) => {
    setShowPasswords(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const toggleQuizDetails = (qId: string) => {
    setExpandedQuizzes(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPass || !newPass || !confirmPass) {
      setPassError('Please fill in all fields.');
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }

    try {
      const isValid = await verifyAdminPassword(currentPass);
      if (!isValid) {
        setPassError('Current password is incorrect.');
        return;
      }
      
      await changeAdminPassword(newPass);
      setPassSuccess('Admin password changed successfully!');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      setPassError('Failed to change password.');
    }
  };

  // --- PLAY MODE ACTION HANDLERS ---
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
        setJoinError('Quiz not found.');
        setJoining(false);
        return;
      }

      if (quiz.password && quiz.password.trim() !== '') {
        if (quiz.password.trim() !== joinPassword.trim()) {
          setJoinError('Incorrect password.');
          setJoining(false);
          return;
        }
      }

      const newJoinedItem: JoinedQuiz = {
        quizId: quiz.id,
        title: quiz.title,
        questionCount: quiz.questions.length,
        joinedAt: Date.now()
      };

      const updatedList = [newJoinedItem, ...joinedQuizzes];
      localStorage.setItem('quzzy_joined_quizzes', JSON.stringify(updatedList));
      setJoinedQuizzes(updatedList);
      
      setJoinId('');
      setJoinPassword('');
      setShowJoinModal(false);
    } catch (err) {
      setJoinError('Failed to join quiz.');
    } finally {
      setJoining(false);
    }
  };

  const handleRemoveQuiz = (qId: string) => {
    if (confirm('Leave this quiz? Your score progress will be deleted.')) {
      const updated = joinedQuizzes.filter(q => q.quizId !== qId);
      localStorage.setItem('quzzy_joined_quizzes', JSON.stringify(updated));
      setJoinedQuizzes(updated);
    }
  };

  const handleResetQuiz = (qId: string) => {
    if (confirm('Reset quiz progress?')) {
      const updated = joinedQuizzes.map(q => {
        if (q.quizId === qId) {
          return { ...q, progress: undefined };
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
            Quzzy Admin Console
          </h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Welcome, {session.username}</span>
        </div>
        
        {/* Toggle Mode, Theme & Logout Buttons */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ThemeToggle />
          <button 
            onClick={() => {
              setIsAdminPlayMode(!isAdminPlayMode);
              loadJoinedQuizzes();
            }} 
            className="btn btn-primary"
            style={{ 
              padding: '0.5rem 1.25rem', 
              fontSize: '0.9rem',
              background: isAdminPlayMode ? 'var(--accent-gradient)' : 'var(--option-bg)',
              border: isAdminPlayMode ? 'none' : '1px solid var(--option-border)'
            }}
          >
            {isAdminPlayMode ? '⚙️ Admin Console' : '🎮 Test / Play Mode'}
          </button>
          
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
            Logout
          </button>
        </div>
      </header>

      {isAdminPlayMode ? (
        // ==============================================
        // ADMIN PLAY MODE INTERFACE
        // ==============================================
        <main style={{ flex: 1, animation: 'fadeIn var(--transition-normal)' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <span>🎮</span> Play Test Quizzes
            </h2>
            <button 
              onClick={() => setShowJoinModal(true)} 
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
            >
              ➕ Join Quiz
            </button>
          </div>

          {loadingJoined ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>
              Loading player dashboards...
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
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No Play-Test Quizzes Joined</h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto' }}>
                  Click "Join Quiz" above, enter a Quiz ID (e.g. from your active list) to start playing.
                </p>
              </div>
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
                            <span style={{ color: 'var(--text-primary)' }}>Best: {Math.max(...item.history.map(h => h.score))}/{item.questionCount}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>Runs: {item.history.length}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                      <button 
                        onClick={() => handlePlayQuiz(item.quizId)} 
                        className="btn btn-primary"
                        style={{ flex: 2, padding: '0.5rem 1rem', fontSize: '0.85rem', minWidth: '100px' }}
                      >
                        {isCompleted ? '🔄 Retake Quiz' : hasProgress ? '▶️ Resume' : '🚀 Start Quiz'}
                      </button>
                      
                      {hasProgress && (
                        <button 
                          onClick={() => handleResetQuiz(item.quizId)} 
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                        >
                          Reset
                        </button>
                      )}

                      <button 
                        onClick={() => handleRemoveQuiz(item.quizId)} 
                        className="btn btn-danger"
                        style={{ flex: '0 0 auto', padding: '0.5rem', fontSize: '0.85rem' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Join Quiz Overlay Modal */}
          {showJoinModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                  Join Quiz to Play
                </h3>

                {joinError && (
                  <div className="badge-error" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', display: 'block', textAlign: 'center' }}>
                    ⚠️ {joinError}
                  </div>
                )}

                <form onSubmit={handleJoinSubmit}>
                  <div className="form-group">
                    <label>Quiz ID</label>
                    <input
                      type="text"
                      placeholder="e.g. math101"
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value)}
                      className="input-field"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label>Quiz Password (if required)</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '2.75rem' }} disabled={joining}>
                      {joining ? 'Joining...' : 'Join'}
                    </button>
                    <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-secondary" style={{ flex: 1, height: '2.75rem' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      ) : (
        // ==============================================
        // ADMIN CONSOLE MODE INTERFACE
        // ==============================================
        <main style={{ flex: 1, animation: 'fadeIn var(--transition-normal)' }}>
          {/* AI Model & Engine Diagnostics Card */}
          <section className="glass-card" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>🤖</span>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    AI Engine & Model Diagnostics
                  </h2>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Active LLM runtime powering the Adaptive Study Arena & Socratic Coach
                  </p>
                </div>
              </div>

              <button 
                onClick={fetchAiStatus} 
                disabled={loadingAiStatus}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {loadingAiStatus ? 'Pinging...' : '🔄 Test AI Ping'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Model</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
                  {aiStatus?.model || 'gemini-3.5-flash-lite'}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status & Latency</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: aiStatus?.status === 'online' ? '#10b981' : (aiStatus?.status === 'degraded' ? '#f59e0b' : '#ef4444') 
                  }} />
                  <strong style={{ fontSize: '0.95rem', color: aiStatus?.status === 'online' ? '#10b981' : '#f59e0b' }}>
                    {aiStatus ? (aiStatus.status === 'online' ? `Online (${aiStatus.latencyMs}ms)` : 'Degraded') : 'Checking...'}
                  </strong>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RPM / TPM Quota</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  15 RPM • 250K TPM
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Cap & Resiliency</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  500 RPD (Auto-Fallback ON)
                </div>
              </div>
            </div>
          </section>

          <div className="grid-cols-1-2-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', alignItems: 'start', animation: 'fadeIn var(--transition-normal)' }}>
            
            {/* Create Quiz Form */}
            <section className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                Publish New or Update Quiz
              </h2>

            {createError && (
              <div className="badge-error" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'block', textAlign: 'center' }}>
                ⚠️ {createError}
              </div>
            )}

            {createSuccess && (
              <div className="badge-success" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'block', textAlign: 'center' }}>
                🎉 {createSuccess}
              </div>
            )}

            <form onSubmit={handleCreateQuiz}>
              <div className="form-group">
                <label>Quiz ID (alphanumeric, lowercase)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="e.g. math101"
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    className="input-field"
                    style={{ flex: 1 }}
                    required
                  />
                  <button type="button" onClick={handleGenerateId} className="btn btn-secondary" style={{ padding: '0 1rem', fontSize: '0.85rem' }} title="Generate ID">
                    🔄 Auto
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Quiz Title</label>
                <input
                  type="text"
                  placeholder="e.g. World History Trivia"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label>Quiz Password (users must enter this to join)</label>
                <input
                  type="text"
                  placeholder="e.g. joinpass (optional)"
                  value={quizPassword}
                  onChange={(e) => setQuizPassword(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group" style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={allowRetake}
                    onChange={(e) => setAllowRetake(e.target.checked)}
                    style={{ width: '1.05rem', height: '1.05rem', cursor: 'pointer' }}
                  />
                  Allow Retakes
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={instantFeedback}
                    onChange={(e) => setInstantFeedback(e.target.checked)}
                    style={{ width: '1.05rem', height: '1.05rem', cursor: 'pointer' }}
                  />
                  Instant Feedback (Study Mode)
                </label>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Upload Questions JSON</label>
                <div 
                  style={{
                    border: '2px dashed var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.75rem',
                    textAlign: 'center',
                    background: 'var(--option-bg)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📁</span>
                  {jsonFileName ? (
                    <span style={{ color: 'var(--accent-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {jsonFileName}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Click or drag questions `.json` sheet here
                    </span>
                  )}
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowFormatGuide(!showFormatGuide)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    {showFormatGuide ? '📖 Hide Format Guide' : '📖 Show JSON Format Guide'}
                  </button>
                </div>

                {showFormatGuide && (
                  <div
                    className="glass-card-sm"
                    style={{
                      marginTop: '1rem',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--glass-border)',
                      fontSize: '0.8rem',
                      lineHeight: '1.5',
                      animation: 'fadeIn var(--transition-normal)'
                    }}
                  >
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>📄</span> JSON File Specification
                    </h4>
                    <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-secondary)' }}>
                      Your JSON file can be a direct array of questions or an object containing a <code>"questions"</code> array.
                    </p>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Required Schema:</div>
                    <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
                      <li style={{ marginBottom: '0.25rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>question</strong>: (string) The text of the question.
                      </li>
                      <li style={{ marginBottom: '0.25rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>options</strong>: (array of strings) The choices (at least 2 choices).
                      </li>
                      <li style={{ marginBottom: '0.25rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>answer</strong>: (string or number) The correct option. You can enter:
                        <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem', listStyleType: 'circle' }}>
                          <li>The <strong style={{ color: 'var(--accent-secondary)' }}>exact text</strong> of the choice (e.g. <code>"Chrome's V8 Engine"</code>). <span style={{ fontStyle: 'italic' }}>(Recommended)</span></li>
                          <li>The <strong style={{ color: 'var(--accent-secondary)' }}>1-based option number</strong> (e.g. <code>1</code> for Option A, <code>2</code> for Option B, etc.).</li>
                          <li>An option label like <code>"Option 1"</code>, <code>"Option 2"</code>, etc.</li>
                        </ul>
                      </li>
                      <li>
                        <strong style={{ color: 'var(--text-primary)' }}>explanation</strong>: (string, optional) An explanation shown to users to explain why this choice is correct.
                      </li>
                    </ul>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Example Format:</div>
                    <pre
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        overflowX: 'auto',
                        color: '#a78bfa',
                        fontSize: '0.75rem',
                        margin: 0
                      }}
                    >
{`[
  {
    "question": "What is Node.js built on?",
    "options": [
      "Chrome's V8 Engine",
      "Mozilla's SpiderMonkey",
      "Safari's JavaScriptCore"
    ],
    "answer": "Chrome's V8 Engine",
    "explanation": "Node.js uses the V8 engine to execute JavaScript on the server."
  },
  {
    "question": "Which of these is a front-end framework?",
    "options": ["Express", "React", "MongoDB"],
    "answer": 2,
    "explanation": "React is a popular UI library. Express is backend, and MongoDB is a database."
  }
]`}
                    </pre>
                  </div>
                )}
              </div>

              {validationError && (
                <div className="badge-error" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem', fontSize: '0.8rem', display: 'block' }}>
                  {validationError}
                </div>
              )}

              {uploadedQuestions.length > 0 && !showCollisionModal && (
                <div className="badge-success" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem', fontSize: '0.8rem', display: 'block', textAlign: 'center' }}>
                  ✅ Ready: Verified {uploadedQuestions.length} Questions
                </div>
              )}

              {uploadedQuestions.length > 0 && !showCollisionModal && (
                <div style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  marginTop: '1rem',
                  fontSize: '0.75rem',
                  background: 'rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Question Sheet Preview:</div>
                  {uploadedQuestions.map((q, idx) => (
                    <div key={idx} style={{ padding: '0.25rem 0', borderBottom: idx < uploadedQuestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <strong>Q{idx + 1}:</strong> {q.question} <span style={{ color: 'var(--success)' }}>({q.answer})</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.5rem', height: '3rem' }}
                disabled={uploadedQuestions.length === 0}
              >
                🚀 Publish / Update Quiz
              </button>
            </form>
          </section>

          {/* Right Side: Quizzes list & Global config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Active Quizzes List */}
            <section className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                Active Quizzes
              </h2>

              {loadingQuizzes ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                  Loading quizzes database...
                </div>
              ) : quizzes.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem', border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
                  No active quizzes found. Generate and upload one!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="glass-card-sm" style={{ padding: '1.25rem', background: 'var(--option-bg)' }}>
                      
                      <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                        <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => toggleQuizDetails(quiz.id)}>
                          <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0', color: 'var(--accent-secondary)' }}>
                            {quiz.title}
                          </h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            ID: <strong style={{ color: 'var(--text-primary)' }}>{quiz.id}</strong> • {quiz.questions.length} questions
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleExportQuiz(quiz)} className="btn btn-secondary btn-icon" style={{ padding: '0.4rem', fontSize: '0.9rem' }} title="Export JSON">
                            📥
                          </button>
                          <button onClick={() => handleDeleteQuiz(quiz.id)} className="btn btn-danger btn-icon" style={{ padding: '0.4rem', fontSize: '0.9rem' }} title="Delete Quiz">
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Direct card JSON uploader trigger */}
                      <div style={{ marginTop: '0.75rem', position: 'relative', display: 'inline-block' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          📥 Replace/Append Questions JSON
                        </button>
                        <input
                          type="file"
                          accept=".json"
                          onChange={(e) => handleCardJsonUpload(e, quiz)}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', flexWrap: 'wrap', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                          <input 
                            type="checkbox" 
                            checked={quiz.allowRetake !== false} 
                            onChange={(e) => handleToggleQuizOption(quiz, 'allowRetake', e.target.checked)} 
                          />
                          Allow Retakes
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                          <input 
                            type="checkbox" 
                            checked={!!quiz.instantFeedback} 
                            onChange={(e) => handleToggleQuizOption(quiz, 'instantFeedback', e.target.checked)} 
                          />
                          Instant Feedback (Study Mode)
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>Pass:</span>
                        <input
                          type={showPasswords[quiz.id] ? "text" : "password"}
                          value={editingPasswords[quiz.id] || ''}
                          onChange={(e) => setEditingPasswords({ ...editingPasswords, [quiz.id]: e.target.value })}
                          className="input-field"
                          style={{ height: '2rem', padding: '0.25rem 0.5rem', fontSize: '0.85rem', flex: 1, border: 'none', background: 'transparent' }}
                        />
                        <button type="button" onClick={() => togglePasswordVisibility(quiz.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                          {showPasswords[quiz.id] ? '👁️' : '🙈'}
                        </button>
                        <button 
                          onClick={() => handleUpdatePassword(quiz.id)} 
                          className="btn btn-primary" 
                          style={{ padding: '0.25rem 0.75rem', height: '2rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
                          disabled={editingPasswords[quiz.id] === (quiz.password || '')}
                        >
                          Save
                        </button>
                      </div>

                      {expandedQuizzes[quiz.id] && (
                        <div style={{
                          marginTop: '1rem',
                          borderTop: '1px solid var(--glass-border)',
                          paddingTop: '0.75rem',
                          fontSize: '0.75rem',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          animation: 'fadeIn var(--transition-normal)'
                        }}>
                          <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Questions ({quiz.questions.length}):</div>
                          {quiz.questions.map((q, qidx) => (
                            <div key={qidx} style={{ marginBottom: '0.5rem', padding: '0.25rem', background: 'rgba(0,0,0,0.02)', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                              <strong>{qidx + 1}. {q.question}</strong>
                              <div style={{ color: 'var(--text-secondary)', marginLeft: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                                {q.options.map((opt, oidx) => (
                                  <span key={oidx} style={{ color: opt === q.answer ? 'var(--success)' : 'inherit', fontWeight: opt === q.answer ? 600 : 'normal' }}>
                                    [{opt}]
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Admin Password Settings */}
            <section className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                Admin Password Settings
              </h2>

              {passError && (
                <div className="badge-error" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'block', textAlign: 'center' }}>
                  ⚠️ {passError}
                </div>
              )}

              {passSuccess && (
                <div className="badge-success" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'block', textAlign: 'center' }}>
                  🎉 {passSuccess}
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit}>
                <div className="form-group">
                  <label>Current Admin Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>New Admin Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
                  Update Admin Password
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
      )}

      {/* Collision Modal */}
      {showCollisionModal && existingQuiz && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ Quiz ID Collision Detected
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              The Quiz ID <strong style={{ color: 'var(--text-primary)' }}>"{existingQuiz.id}"</strong> already exists in the database with the title <strong>"{existingQuiz.title}"</strong> (contains {existingQuiz.questions.length} questions). 
              <br/><br/>
              How would you like to update the questions?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={handleCollisionAppend} className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                ➕ Append Questions (Merge with existing)
              </button>
              <button onClick={handleCollisionReplace} className="btn btn-danger" style={{ justifyContent: 'flex-start', background: 'rgba(239, 68, 68, 0.1)' }}>
                🔄 Replace Questions (Overwrite completely)
              </button>
              <button 
                onClick={() => {
                  setShowCollisionModal(false);
                  setExistingQuiz(null);
                  setUploadedQuestions([]);
                }} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
