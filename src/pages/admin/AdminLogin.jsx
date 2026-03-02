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

  const handleLocalAdmin = () => {
    localStorage.setItem('admin_local_dev', 'true');
    window.location.reload();
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1 className="admin-login-title">Admin Dashboard</h1>
        <p className="admin-login-desc">
          Sign in to manage your portfolio.
        </p>

        {supabase && (
          <button className="admin-login-btn" onClick={signIn} style={{ marginBottom: '12px' }}>
            <Github size={18} />
            Sign in with GitHub
          </button>
        )}

        <button
          className="admin-login-btn"
          onClick={handleLocalAdmin}
          style={{
            background: supabase ? 'transparent' : undefined,
            color: supabase ? 'var(--text)' : undefined,
            border: supabase ? '1px solid var(--border)' : undefined,
          }}
        >
          <Monitor size={18} />
          Enter Local Admin
        </button>
      </div>
    </div>
  );
}
