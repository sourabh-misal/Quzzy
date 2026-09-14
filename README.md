# ⚡ Quzzy — Adaptive AI Study Arena & Next-Gen Quiz Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsourabh-misal%2FQuzzy)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-3.5%20Flash%20Lite-orange?logo=google)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-yellow?logo=firebase)](https://firebase.google.com/)

**Quzzy** is a modern, full-stack learning platform combining an **Adaptive AI Study Arena** with a **High-Performance Quiz Engine**. Powered by Google Gemini and Firebase, Quzzy guides learners from foundational mental models to advanced mastery while diagnosing misconceptions in real time.

Live URL: [https://quzzy.vercel.app](https://quzzy.vercel.app)

---

## 🌟 Key Features

### 1. 🧠 Adaptive AI Study Arena
- **Mastery-Based Learning**: Enter any technical topic (e.g., *React Fiber*, *Distributed Systems*, *Docker Networking*). Quzzy dynamically breaks it down into logical progressive concepts.
- **Diagnostic Scaffolding & Precaution Protocol**:
  - If you answer correctly, difficulty levels advance (*Foundational → Mechanics → Application → Edge Cases*).
  - If you struggle, the AI detects the specific misconception, drops difficulty to reinforce the core principle, and provides scaffolded explanations.
- **Live Mastery Radar**: Real-time mastery score (0–100%) tracking streak, concept statuses (*learning*, *struggling*, *mastered*), and difficulty progression.

### 2. 💡 Interactive Socratic Tutor
- **Socratic Hints**: When you pick an incorrect answer, request an AI hint that nudges your thinking without spoiling the answer.
- **In-Session Tutor Chat**: Have a real-time conversational Q&A with your AI study coach about the specific question, edge cases, and syntax.

### 3. 🎯 Full Quiz Platform
- **Quiz Code Join**: Enter a Quiz PIN to instantly participate in timed or untimed quizzes.
- **Admin Studio**: Create custom quizzes, set passcodes, configure retakes, and toggle instant feedback mode.
- **Shuffled & Anti-Cheat Attempts**: Randomized options and questions preserved across active attempts.

---

## 🚀 How to Use the Application

### A. Studying with the AI Arena (`/study`)
1. Navigate to the **Study Hub** from your Dashboard or visit `/study`.
2. Pick one of the **Quick Topics** (e.g., *JavaScript Event Loop*, *Node.js Streams*, *SQL Indexes*) or type your own custom topic into the search bar.
3. Click **"Start Practice Session"**. The AI generates:
   - 3–4 sub-concepts covering the topic from basics to advanced.
   - A foundational diagnostic question.
4. **Answer Questions**:
   - Select an option and click **"Check Answer"**.
   - If incorrect, you can review the misconception insight, ask for a **Socratic Hint**, or chat with the **AI Coach**.
   - Click **"Continue to Next Concept"** to move forward adaptively.
5. Review your progress history anytime with the **"View History"** drawer.

---

### B. Taking a Pre-Made Quiz (`/dashboard`)
1. Log in or enter your learner username.
2. Under **"Join Quiz"**, enter the **Quiz ID** (e.g., `react-nextjs-200`, `nodejs-100`, `js-fundamentals`) and password (if required).
3. Select your answers and track your progress bar in real time.
4. Submit your quiz to see your final score, percentage, and detailed question-by-question breakdown.

---

### C. Admin & Quiz Management (`/admin`)
1. Navigate to `/admin`.
2. Create and configure new quizzes:
   - Set Quiz ID, Title, and optional security password.
   - Toggle **Allow Retake** and **Instant Feedback (Study Mode)**.
   - Add questions with multiple-choice options, correct answer keys, and educational explanations.
3. Save to Firebase Firestore to make the quiz immediately accessible to all students.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Language**: TypeScript (Strict Mode)
- **AI Engine**: Google Gemini API (`gemini-3.5-flash-lite` / `gemini-2.5-flash`)
- **Database & Auth**: Firebase Firestore
- **Styling**: Vanilla CSS with modern Glassmorphism design tokens and Dark/Light theme switching

---

## 🔑 Environment Variables

To run the application locally or deploy on Vercel, configure the following variables in `.env.local`:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite

# Firebase (Firestore)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 💻 Local Development

```bash
# 1. Clone the repository
git clone https://github.com/sourabh-misal/Quzzy.git
cd Quzzy

# 2. Install dependencies
npm install

# 3. Start development server with Turbopack
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience Quzzy!

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
