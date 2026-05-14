import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import type { UserData } from '../types';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createDefaultUserData = (uid: string, name: string, email: string, photoURL: string): UserData => ({
  uid,
  name: name || 'User',
  email: email || '',
  photoURL: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'User'}`,
  streak: 0,
  longestStreak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  progress: {},
  todos: [],
  activity: []
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Load user data from local storage for now, since Supabase was removed
        // and we only added Firebase Auth and Storage.
        const storedData = localStorage.getItem(`user_data_${firebaseUser.uid}`);
        if (storedData) {
          setUser(JSON.parse(storedData));
        } else {
          const newUser = createDefaultUserData(
            firebaseUser.uid,
            firebaseUser.displayName || 'User',
            firebaseUser.email || '',
            firebaseUser.photoURL || ''
          );
          localStorage.setItem(`user_data_${firebaseUser.uid}`, JSON.stringify(newUser));
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUser = async (data: Partial<UserData>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem(`user_data_${user.uid}`, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, updateUser }}>
      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0a0a12',
          color: '#ffffff',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: '#5A32FA',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ opacity: 0.6, fontSize: '14px' }}>Loading LearnTrack...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
