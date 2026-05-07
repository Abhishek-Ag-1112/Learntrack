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

  const fetchOrCreateUser = async (authUser: any): Promise<void> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile && !profileError) {
        // Fetch relations concurrently
        const [
          { data: progressData },
          { data: todosData },
          { data: activityData }
        ] = await Promise.all([
          supabase.from('progress').select('*').eq('user_id', authUser.id),
          supabase.from('todos').select('*').eq('user_id', authUser.id),
          supabase.from('activity').select('*').eq('user_id', authUser.id)
        ]);

        const progress: any = {};
        progressData?.forEach(p => {
          if (!progress[p.course_id]) progress[p.course_id] = {};
          progress[p.course_id][p.lecture_id] = p.status;
        });

        setUser({
          uid: profile.id,
          name: profile.name || 'User',
          email: profile.email || authUser.email || '',
          photoURL: profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'User'}`,
          streak: profile.streak || 0,
          longestStreak: profile.longestStreak || 0,
          lastActiveDate: profile.lastActiveDate || new Date().toISOString().split('T')[0],
          progress,
          todos: todosData?.map(t => ({ id: t.id, text: t.text, date: t.date, completed: t.completed })) || [],
          activity: activityData?.map(a => ({ date: a.date, count: a.count })) || []
        });
      } else if (profileError && profileError.code === 'PGRST116') {
        // Row not found — create it
        const newUserData = createDefaultUserData(
          authUser.id,
          authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User',
          authUser.email || '',
          authUser.user_metadata?.avatar_url || ''
        );

        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert([{
            id: newUserData.uid,
            name: newUserData.name,
            email: newUserData.email,
            photoURL: newUserData.photoURL,
            streak: newUserData.streak,
            longestStreak: newUserData.longestStreak,
            lastActiveDate: newUserData.lastActiveDate
          }], { onConflict: 'id' });

        if (upsertError) {
          console.error('Error upserting user:', upsertError);
        }
        setUser(newUserData);
      } else {
        console.error('Error fetching user:', profileError);
        setUser(null);
      }
    } catch (err) {
      console.error('Unexpected auth error:', err);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Use onAuthStateChange as the SOLE source of truth.
    // It fires immediately with INITIAL_SESSION on mount,
    // so we do NOT also call getSession() (which causes a race condition).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        // SIGNED_IN, INITIAL_SESSION, TOKEN_REFRESHED, etc.
        try {
          await fetchOrCreateUser(session.user);
        } catch (err) {
          console.error('Auth state change error:', err);
          setUser(null);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    );

    // Safety timeout — if onAuthStateChange never fires (rare edge case)
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth loading timed out after 5s — forcing render');
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

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
        // Profile updates
        const profileUpdates: any = {};
        if (data.name !== undefined) profileUpdates.name = data.name;
        if (data.email !== undefined) profileUpdates.email = data.email;
        if (data.photoURL !== undefined) profileUpdates.photoURL = data.photoURL;
        if (data.streak !== undefined) profileUpdates.streak = data.streak;
        if (data.longestStreak !== undefined) profileUpdates.longestStreak = data.longestStreak;
        if (data.lastActiveDate !== undefined) profileUpdates.lastActiveDate = data.lastActiveDate;

        if (Object.keys(profileUpdates).length > 0) {
          const { error } = await supabase.from('profiles').update(profileUpdates).eq('id', user.uid);
          if (error) console.error('Error updating profile:', error);
        }

        // Todos — delete old, insert new
        if (data.todos !== undefined) {
          const { error: delErr } = await supabase.from('todos').delete().eq('user_id', user.uid);
          if (delErr) console.error('Error deleting todos:', delErr);
          if (data.todos.length > 0) {
            const todosToInsert = data.todos.map(t => ({
              id: t.id,
              user_id: user.uid,
              text: t.text,
              date: t.date,
              completed: t.completed
            }));
            const { error: insErr } = await supabase.from('todos').insert(todosToInsert);
            if (insErr) console.error('Error inserting todos:', insErr);
          }
        }

        // Activity — delete old, insert new
        if (data.activity !== undefined) {
          const { error: delErr } = await supabase.from('activity').delete().eq('user_id', user.uid);
          if (delErr) console.error('Error deleting activity:', delErr);
          if (data.activity.length > 0) {
            const activityToInsert = data.activity.map(a => ({
              user_id: user.uid,
              date: a.date,
              count: a.count
            }));
            const { error: insErr } = await supabase.from('activity').insert(activityToInsert);
            if (insErr) console.error('Error inserting activity:', insErr);
          }
        }

        // Progress — upsert changed entries
        if (data.progress !== undefined) {
          const progressToUpsert: any[] = [];
          Object.entries(data.progress).forEach(([courseId, lectures]) => {
            Object.entries(lectures).forEach(([lectureId, status]) => {
              progressToUpsert.push({
                user_id: user.uid,
                course_id: courseId,
                lecture_id: lectureId,
                status
              });
            });
          });
          if (progressToUpsert.length > 0) {
            const { error: upsertErr } = await supabase
              .from('progress')
              .upsert(progressToUpsert, { onConflict: 'user_id, course_id, lecture_id' });
            if (upsertErr) console.error('Error upserting progress:', upsertErr);
          }
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
