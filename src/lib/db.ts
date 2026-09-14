import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { Quiz } from '@/types/quiz';
import { StudySession } from '@/types/study';

const DEFAULT_ADMIN_PASSWORD = 'admin123';

// Helper to determine if we should use Firebase
const isOnlineMode = (): boolean => {
  return db !== null;
};

// --- ADMIN PASSWORD OPERATIONS ---

export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  if (isOnlineMode() && db) {
    try {
      const docRef = doc(db, 'quzzy_settings', 'admin');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data().password === password;
      } else {
        // Initial setup on Firestore
        await setDoc(docRef, { password: DEFAULT_ADMIN_PASSWORD });
        return password === DEFAULT_ADMIN_PASSWORD;
      }
    } catch (err) {
      console.error("Firestore read password failed, checking local fallback:", err);
    }
  }

  // Local Storage Fallback
  if (typeof window !== 'undefined') {
    const savedPassword = localStorage.getItem('quzzy_admin_password');
    if (!savedPassword) {
      localStorage.setItem('quzzy_admin_password', DEFAULT_ADMIN_PASSWORD);
      return password === DEFAULT_ADMIN_PASSWORD;
    }
    return password === savedPassword;
  }
  
  return password === DEFAULT_ADMIN_PASSWORD;
};

export const changeAdminPassword = async (newPassword: string): Promise<void> => {
  if (isOnlineMode() && db) {
    try {
      const docRef = doc(db, 'quzzy_settings', 'admin');
      await setDoc(docRef, { password: newPassword });
      console.log("Admin password updated on Firestore.");
    } catch (err) {
      console.error("Firestore password update failed:", err);
      throw err;
    }
  }

  // Local Storage fallback/update
  if (typeof window !== 'undefined') {
    localStorage.setItem('quzzy_admin_password', newPassword);
  }
};

// --- QUIZ OPERATIONS ---

export const getQuiz = async (quizId: string): Promise<Quiz | null> => {
  const cleanId = quizId.trim().toLowerCase();
  
  if (isOnlineMode() && db) {
    try {
      const docRef = doc(db, 'quzzy_quizzes', cleanId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Quiz;
      }
      return null;
    } catch (err) {
      console.error(`Firestore getQuiz(${cleanId}) failed, falling back to local:`, err);
    }
  }

  // Local Storage Fallback
  if (typeof window !== 'undefined') {
    const quizzesRaw = localStorage.getItem('quzzy_local_quizzes');
    if (quizzesRaw) {
      const quizzes: Quiz[] = JSON.parse(quizzesRaw);
      return quizzes.find(q => q.id.toLowerCase() === cleanId) || null;
    }
  }
  
  return null;
};

export const saveQuiz = async (quiz: Quiz): Promise<void> => {
  const cleanQuiz: Quiz = {
    ...quiz,
    id: quiz.id.trim().toLowerCase(),
    createdAt: quiz.createdAt || Date.now()
  };

  if (isOnlineMode() && db) {
    try {
      const docRef = doc(db, 'quzzy_quizzes', cleanQuiz.id);
      await setDoc(docRef, cleanQuiz);
      console.log(`Quiz saved to Firestore: ${cleanQuiz.id}`);
    } catch (err) {
      console.error("Firestore saveQuiz failed, using local storage backup:", err);
      throw err;
    }
  }

  // Local Storage backup / Primary local save
  if (typeof window !== 'undefined') {
    const quizzesRaw = localStorage.getItem('quzzy_local_quizzes');
    let quizzes: Quiz[] = quizzesRaw ? JSON.parse(quizzesRaw) : [];
    
    // Remove if exists
    quizzes = quizzes.filter(q => q.id.toLowerCase() !== cleanQuiz.id.toLowerCase());
    quizzes.push(cleanQuiz);
    
    localStorage.setItem('quzzy_local_quizzes', JSON.stringify(quizzes));
  }
};

export const deleteQuiz = async (quizId: string): Promise<void> => {
  const cleanId = quizId.trim().toLowerCase();

  if (isOnlineMode() && db) {
    try {
      const docRef = doc(db, 'quzzy_quizzes', cleanId);
      await deleteDoc(docRef);
      console.log(`Quiz deleted from Firestore: ${cleanId}`);
    } catch (err) {
      console.error(`Firestore deleteQuiz(${cleanId}) failed:`, err);
      throw err;
    }
  }

  // Local Storage
  if (typeof window !== 'undefined') {
    const quizzesRaw = localStorage.getItem('quzzy_local_quizzes');
    if (quizzesRaw) {
      let quizzes: Quiz[] = JSON.parse(quizzesRaw);
      quizzes = quizzes.filter(q => q.id.toLowerCase() !== cleanId);
      localStorage.setItem('quzzy_local_quizzes', JSON.stringify(quizzes));
    }
  }
};

export const getAllQuizzes = async (): Promise<Quiz[]> => {
  if (isOnlineMode() && db) {
    try {
      const q = collection(db, 'quzzy_quizzes');
      const snap = await getDocs(q);
      const quizzes = snap.docs.map(d => d.data() as Quiz);
      // Sort by createdAt descending
      return quizzes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (err) {
      console.error("Firestore getAllQuizzes failed, reading local storage:", err);
    }
  }

  // Local Storage Fallback
  if (typeof window !== 'undefined') {
    const quizzesRaw = localStorage.getItem('quzzy_local_quizzes');
    if (quizzesRaw) {
      const quizzes: Quiz[] = JSON.parse(quizzesRaw);
      return quizzes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
  }
  
  return [];
};

// --- AI STUDY SESSION OPERATIONS ---

export const saveStudySession = async (session: StudySession): Promise<void> => {
  const cleanSession: StudySession = {
    ...session,
    updatedAt: Date.now()
  };

  if (isOnlineMode() && db) {
    try {
      const docRef = doc(db, 'quzzy_study_sessions', cleanSession.id);
      await setDoc(docRef, cleanSession);
      console.log(`Study session saved to Firestore: ${cleanSession.id}`);
    } catch (err) {
      console.error("Firestore saveStudySession failed, falling back to local storage:", err);
    }
  }

  // Local Storage fallback / cache
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('quzzy_local_study_sessions');
    let sessions: StudySession[] = raw ? JSON.parse(raw) : [];
    sessions = sessions.filter(s => s.id !== cleanSession.id);
    sessions.unshift(cleanSession);
    // Keep last 30 sessions locally
    if (sessions.length > 30) sessions = sessions.slice(0, 30);
    localStorage.setItem('quzzy_local_study_sessions', JSON.stringify(sessions));
  }
};

export const getStudySession = async (sessionId: string): Promise<StudySession | null> => {
  if (isOnlineMode() && db) {
    try {
      const docRef = doc(db, 'quzzy_study_sessions', sessionId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as StudySession;
      }
    } catch (err) {
      console.error(`Firestore getStudySession(${sessionId}) failed, checking local:`, err);
    }
  }

  // Local Storage Fallback
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('quzzy_local_study_sessions');
    if (raw) {
      const sessions: StudySession[] = JSON.parse(raw);
      return sessions.find(s => s.id === sessionId) || null;
    }
  }

  return null;
};

export const getUserStudySessions = async (username: string): Promise<StudySession[]> => {
  const cleanUser = username.trim().toLowerCase();

  if (isOnlineMode() && db) {
    try {
      const q = query(
        collection(db, 'quzzy_study_sessions'),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      const sessions = snap.docs.map(d => d.data() as StudySession);
      return sessions.filter(s => s.username?.toLowerCase() === cleanUser);
    } catch (err) {
      console.error("Firestore getUserStudySessions failed, checking local storage:", err);
    }
  }

  // Local Storage Fallback
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('quzzy_local_study_sessions');
    if (raw) {
      const sessions: StudySession[] = JSON.parse(raw);
      return sessions
        .filter(s => s.username?.toLowerCase() === cleanUser)
        .sort((a, b) => b.updatedAt - a.updatedAt);
    }
  }

  return [];
};
