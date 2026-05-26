import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { UserData } from '../types';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserData> | ((prev: UserData) => Partial<UserData>)) => Promise<void>;
  recordActivity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createDefaultUserData = (uid: string, name: string, email: string, photoURL: string): UserData => ({
  uid,
  name: name || 'User',
  email: email || '',
  photoURL: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'User'}`,
  streak: 0,
  longestStreak: 0,
  lastActiveDate: (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })(),
  progress: {},
  todos: [],
  activity: [],
  habits: []
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data() as UserData;
            setUser({
              ...data,
              streak: data.streak ?? 0,
              longestStreak: data.longestStreak ?? 0,
              lastActiveDate: data.lastActiveDate ?? null,
              progress: data.progress ?? {},
              todos: data.todos ?? [],
              activity: data.activity ?? [],
              habits: data.habits ?? []
            });
          } else {
            const newUser = createDefaultUserData(
              firebaseUser.uid,
              firebaseUser.displayName || 'User',
              firebaseUser.email || '',
              firebaseUser.photoURL || ''
            );
            await setDoc(userRef, newUser);
            setUser(newUser);
          }
        } catch (error) {
          console.error("Error fetching user from Firestore:", error);
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

  const updateUser = async (data: Partial<UserData> | ((prev: UserData) => Partial<UserData>)) => {
    if (user) {
      setUser(prev => {
        if (!prev) return null;
        const resolvedData = typeof data === 'function' ? data(prev) : data;
        const updated = { ...prev, ...resolvedData };
        
        // Perform Firestore update with the resolved data
        const userRef = doc(db, 'users', prev.uid);
        updateDoc(userRef, resolvedData).catch((error) => {
          console.error("Error updating user in Firestore:", error);
        });

        return updated;
      });
    }
  };

  const recordActivity = async () => {
    await updateUser((prev) => {
      // Use local date for streak calculations
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      let newStreak = prev.streak;
      let newLongestStreak = prev.longestStreak;
      let newLastActiveDate = prev.lastActiveDate;
      const newActivity = [...prev.activity];

      // Update heatmap count
      const todayActivityIndex = newActivity.findIndex(a => a.date === todayStr);
      if (todayActivityIndex !== -1) {
        newActivity[todayActivityIndex].count += 1;
      } else {
        newActivity.push({ date: todayStr, count: 1 });
      }

      // Update streak logic
      if (prev.streak === 0) {
        // First activity ever
        newStreak = 1;
        newLastActiveDate = todayStr;
      } else if (prev.lastActiveDate !== todayStr) {
        if (!prev.lastActiveDate) {
          newStreak = 1;
        } else {
          const lastActive = new Date(prev.lastActiveDate);
          const today = new Date(todayStr);
          const diffTime = Math.abs(today.getTime() - lastActive.getTime());
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays === 1) {
            // Consecutive day
            newStreak += 1;
          } else if (diffDays > 1) {
            // Streak broken
            newStreak = 1;
          }
        }
        newLastActiveDate = todayStr;
      }

      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
      }

      return {
        streak: newStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: newLastActiveDate,
        activity: newActivity
      };
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, updateUser, recordActivity }}>
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
