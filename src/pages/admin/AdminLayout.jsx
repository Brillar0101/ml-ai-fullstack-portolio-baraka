import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, BarChart3, Image, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/media', icon: Image, label: 'Media' },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin</h2>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            {user?.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="admin-avatar"
              />
            )}
            <span className="admin-username">
              {user?.user_metadata?.user_name || 'Admin'}
            </span>
          </div>
          <button className="admin-signout-btn" onClick={signOut}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
