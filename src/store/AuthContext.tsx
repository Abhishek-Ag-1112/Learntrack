import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserData } from '../types';

interface AuthContextType {
  user: UserData | null;
  login: () => void;
  logout: () => void;
  updateUser: (data: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser: UserData = {
  uid: 'user-123',
  name: 'Alex Developer',
  email: 'alex@example.com',
  photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  streak: 12,
  longestStreak: 15,
  lastActiveDate: new Date().toISOString().split('T')[0],
  progress: {},
  todos: [
    { id: '1', text: 'Finish React setup', date: new Date().toISOString().split('T')[0], completed: true },
    { id: '2', text: 'Solve 2 Sum problem', date: new Date().toISOString().split('T')[0], completed: false }
  ],
  activity: [
    { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], count: 3 },
    { date: new Date().toISOString().split('T')[0], count: 1 }
  ]
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('learntrack_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const login = () => {
    let saved = localStorage.getItem('learntrack_user');
    if (!saved) {
      localStorage.setItem('learntrack_user', JSON.stringify(mockUser));
      setUser(mockUser);
    } else {
      setUser(JSON.parse(saved));
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (data: Partial<UserData>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('learntrack_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
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
