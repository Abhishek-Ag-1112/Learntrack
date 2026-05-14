import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { FiBookOpen, FiActivity, FiCheckSquare, FiArrowRight } from 'react-icons/fi';

export default function Landing() {
  const navigate = useNavigate();
  const { user, loginWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-background text-textPrimary overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white">
            LT
          </div>
          <span className="text-xl font-bold tracking-tight">LearnTrack</span>
        </div>
        <div>
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-medium border border-white/10 backdrop-blur-sm"
            >
              Go to Dashboard
            </button>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-medium shadow-lg shadow-primary/25"
            >
              Log In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-24 pb-16 relative z-10 flex flex-col items-center text-center">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-surface border border-white/10 text-sm font-medium text-textSecondary">
          ✨ The ultimate learning companion
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Track your learning.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-orange-500">Build your streak.</span><br/>
          Own your progress.
        </h1>
        <p className="text-lg md:text-xl text-textSecondary max-w-2xl mb-10 leading-relaxed">
          The all-in-one personal learning manager designed to help you crush your courses, build daily habits, and stay hyper-organized.
        </p>
        <button 
          onClick={loginWithGoogle}
          className="group flex items-center gap-2 px-8 py-4 rounded-full bg-white text-background font-bold text-lg hover:scale-105 transition-transform"
        >
          Get Started
          <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-32 text-left w-full max-w-5xl">
          <div className="glass-card p-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6 text-2xl">
              <FiBookOpen />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Course Tracking</h3>
            <p className="text-textSecondary">Visualize your progress through entire courses with interactive 3-state checklists.</p>
          </div>
          <div className="glass-card p-8">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary mb-6 text-2xl">
              <FiActivity />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Daily Streaks</h3>
            <p className="text-textSecondary">Build unstoppable momentum with daily activity streaks and beautiful heatmaps.</p>
          </div>
          <div className="glass-card p-8">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 mb-6 text-2xl">
              <FiCheckSquare />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Todo Manager</h3>
            <p className="text-textSecondary">Plan yesterday, today, and tomorrow with a built-in focused task manager.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 mt-auto border-t border-white/10 text-center text-textSecondary text-sm relative z-10">
        <div className="flex justify-center gap-6 mb-4">
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
        <p>© 2026 LearnTrack. All rights reserved.</p>
      </footer>
    </div>
  );
}
