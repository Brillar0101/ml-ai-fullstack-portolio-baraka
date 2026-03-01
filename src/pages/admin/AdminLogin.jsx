import React from 'react';
import { Navigate } from 'react-router-dom';
import { Github, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
  const { user, isAdmin, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="admin-login-page">
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1 className="admin-login-title">Admin Dashboard</h1>
        <p className="admin-login-desc">
          {supabase
            ? 'Sign in with GitHub to manage your portfolio.'
            : 'Supabase not configured. Sign in with local dev mode to manage projects.'}
        </p>
        <button className="admin-login-btn" onClick={signIn}>
          {supabase ? <Github size={18} /> : <Monitor size={18} />}
          {supabase ? 'Sign in with GitHub' : 'Enter Local Admin'}
        </button>
      </div>
    </div>
  );
}
