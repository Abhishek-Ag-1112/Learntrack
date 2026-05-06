# 🎓 LearnTrack

A premium personal learning management app built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

Track your courses, build daily streaks, compete on leaderboards, and own your learning progress.

![LearnTrack](https://img.shields.io/badge/React-19-blue?logo=react) ![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite) ![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase) ![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript)

---

## ✨ Features

- **Dashboard** — Overview of all your enrolled courses with progress tracking
- **Course Detail** — Phase-by-phase curriculum with tri-state progress toggles (Not Done → Half Done → Done)
- **Leaderboard** — Per-course rankings showing top learners in real-time
- **Activity Heatmap** — GitHub-style contribution heatmap to visualize your learning streak
- **Todo List** — Personal task manager for daily learning goals
- **Auth** — Secure email/password authentication via Supabase

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- A **Supabase** project ([create one free](https://supabase.com))

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

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values from **Supabase Dashboard → Settings → API**:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set up the database

1. Open the **SQL Editor** in your Supabase dashboard
2. Paste the contents of `schema.sql`
3. Click **Run**

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
| Backend    | Supabase (Auth + PostgreSQL + RLS)  |
| Deployment | Vercel                              |

---

## 📝 License

MIT
