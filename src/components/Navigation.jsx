import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Mail, Menu, X } from 'lucide-react';
import { CONFIG } from '../config';
import './Navigation.css';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/projects', label: 'Projects', icon: FolderOpen },
    { path: '/contact', label: 'Contact', icon: Mail }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="nav-container">
      <div className="nav-inner">
        <div className="nav-glass">
          <Link to="/" className="logo">
            {CONFIG.name}
          </Link>
          <div className="nav-links">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <item.icon />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <item.icon />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
