# 🎓 LearnTrack

A premium personal learning management app built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Firebase**.

Track your courses, build daily streaks, compete on leaderboards, and own your learning progress.

![LearnTrack](https://img.shields.io/badge/React-19-blue?logo=react) ![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite) ![Firebase](https://img.shields.io/badge/Firebase-Backend-orange?logo=firebase) ![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript)

---

## ✨ Features

- **Dashboard** — Overview of all your enrolled courses with progress tracking
- **Course Detail** — Phase-by-phase curriculum with tri-state progress toggles (Not Done → Half Done → Done)
- **Leaderboard** — Per-course rankings showing top learners in real-time
- **Activity Heatmap** — GitHub-style contribution heatmap to visualize your learning streak
- **Todo List** — Personal task manager for daily learning goals
- **Auth** — Secure Google authentication via Firebase Auth

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- A **Firebase** project ([create one free](https://console.firebase.google.com))

### 1. Clone the repository

```bash
git clone https://github.com/Abhishek-Ag-1112/Learntrack.git
cd Learntrack
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values from **Firebase Console → Project Settings → General (Your Apps)**:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 4. Set up the database

1. In the **Firebase Console**, navigate to **Firestore Database**
2. Click **Create database** and choose your starting security rules
3. Enable the database and ensure the `users` collection is configured (automatically created on first user activity/login)

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

---

## 🌐 Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import this repo
3. Vercel will auto-detect **Vite** as the framework
4. Add your environment variables under **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**

The `vercel.json` is pre-configured for SPA client-side routing.

---

## 📁 Project Structure

```
learntrack/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ErrorBoundary.tsx
│   │   ├── Heatmap.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Sidebar.tsx
│   │   └── TodoList.tsx
│   ├── pages/            # Route pages
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── CourseDetail.tsx
│   ├── store/            # Global state (AuthContext)
│   ├── utils/            # Helper functions
│   ├── types.ts          # TypeScript interfaces
│   ├── supabaseClient.ts # Supabase init
│   ├── App.tsx           # Router setup
│   └── main.tsx          # Entry point
├── schema.sql            # Supabase database schema
├── vercel.json           # Vercel deployment config
├── .env.example          # Environment variable template
└── package.json
```

---

## 🛡️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, TypeScript 6, Vite 8     |
| Styling    | Tailwind CSS 4                      |
| Backend    | Firebase (Auth + Cloud Firestore)   |
| Deployment | Vercel                              |

---

## 📝 License

MIT
