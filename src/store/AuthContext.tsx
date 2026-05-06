import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { UserData } from '../types';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createDefaultUserData = (user_id: string, name: string, email: string, photoURL: string): UserData => ({
  uid: user_id,
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
    // Safety timeout — never stay loading forever
    const timeout = setTimeout(() => {
      setLoading(false);
      console.warn('Auth loading timed out after 10s — forcing render');
    }, 10000);

    // Check active session on initial load
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchOrCreateUser(session.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setUser(null);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }
      if (session?.user) {
        await fetchOrCreateUser(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrCreateUser = async (authUser: any) => {
    try {
      // Small delay to let the DB trigger create the row first
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', authUser.id)
        .single();

      if (data && !error) {
        // User row exists (created by trigger or previously)
        setUser({
          uid: data.uid,
          name: data.name || 'User',
          email: data.email || authUser.email || '',
          photoURL: data.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || 'User'}`,
          streak: data.streak || 0,
          longestStreak: data.longestStreak || 0,
          lastActiveDate: data.lastActiveDate || new Date().toISOString().split('T')[0],
          progress: data.progress || {},
          todos: data.todos || [],
          activity: data.activity || []
        });
      } else if (error && error.code === 'PGRST116') {
        // Not found — trigger may not have fired yet, create manually via upsert
        const newUserData = createDefaultUserData(
          authUser.id,
          authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User',
          authUser.email || '',
          authUser.user_metadata?.avatar_url || ''
        );

        const { error: upsertError } = await supabase
          .from('users')
          .upsert([newUserData], { onConflict: 'uid' });

        if (upsertError) {
          console.error('Error upserting user:', upsertError);
        }
        setUser(newUserData);
      } else {
        console.error('Error fetching user:', error);
        setUser(null);
      }
    } catch (err) {
      console.error('Unexpected auth error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // Directly fetch user data so we don't rely on the async listener
    if (data.user) {
      await fetchOrCreateUser(data.user);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });
    if (error) throw error;
    // Directly fetch/create user data so we don't rely on the async listener
    if (data.user) {
      await fetchOrCreateUser(data.user);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUser = async (data: Partial<UserData>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated); // Optimistic UI update
      try {
        const { data: updatedData, error } = await supabase
          .from('users')
          .update(data)
          .eq('uid', user.uid)
          .select();
          
        if (error) {
          console.error('Error updating user data in Supabase:', error);
          setUser(user); // Revert on failure
        } else if (!updatedData || updatedData.length === 0) {
          console.error('Update completed but no rows were modified. Possible RLS issue or row missing.');
          setUser(user);
        }
      } catch (error) {
        console.error('Unexpected error updating user data:', error);
        setUser(user); // Revert on failure
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
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
