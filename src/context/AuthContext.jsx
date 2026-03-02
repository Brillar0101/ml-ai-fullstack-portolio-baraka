import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check local dev mode first (works with or without Supabase)
    const localAdmin = localStorage.getItem('admin_local_dev');
    if (localAdmin === 'true') {
      setUser({ id: 'local', user_metadata: { user_name: 'Local Admin' } });
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdmin(userId) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('github_user_id', userId)
        .single();

      setIsAdmin(!error && !!data);
    } catch {
      setIsAdmin(false);
    }
    setLoading(false);
  }

  async function signIn() {
    if (!supabase) {
      // Local dev mode: grant admin access without OAuth
      localStorage.setItem('admin_local_dev', 'true');
      setUser({ id: 'local', user_metadata: { user_name: 'Local Admin' } });
      setIsAdmin(true);
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/admin`
      }
    });
  }

  async function signOut() {
    localStorage.removeItem('admin_local_dev');
    setUser(null);
    setIsAdmin(false);
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
