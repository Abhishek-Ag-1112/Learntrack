import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Login() {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="glass-panel p-10 w-full max-w-md relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-3xl mb-8 shadow-xl">
          LT
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-textSecondary mb-8 text-center">
          {isLogin 
            ? 'Sign in to continue your learning journey and keep that streak alive.'
            : 'Join LearnTrack and start building your future today.'}
        </p>

        {error && (
          <div className="w-full bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-textSecondary/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-textSecondary/50 focus:outline-none focus:border-primary transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-textSecondary/50 focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 shadow-lg mt-6 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 text-sm text-textSecondary">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
      
      <button 
        onClick={() => navigate('/')}
        className="mt-8 text-textSecondary hover:text-white transition-colors relative z-10"
      >
        ← Back to home
      </button>
    </div>
  );
}
