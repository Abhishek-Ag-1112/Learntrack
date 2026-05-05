import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = () => {
    login();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="glass-panel p-10 w-full max-w-md relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-3xl mb-8 shadow-xl">
          LT
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-textSecondary mb-10">Sign in to continue your learning journey and keep that streak alive.</p>
        
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 shadow-lg"
        >
          <FcGoogle className="text-2xl" />
          Continue with Google
        </button>
        
        <p className="text-xs text-textSecondary mt-8">
          By continuing, you agree to LearnTrack's Terms of Service and Privacy Policy.
        </p>
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
