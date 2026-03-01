import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Github, Linkedin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { CONFIG } from '../config';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/projects', label: 'Projects' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' }
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Hide nav on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          Baraka
        </Link>

        <div className="nav-right">
          <div className="nav-links">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="/assets/resume.pdf"
              className="nav-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Resume
            </a>
          </div>

          <div className="nav-social">
            <a
              href={`https://${CONFIG.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-icon-btn"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
            <a
              href={`https://${CONFIG.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-icon-btn"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
          </div>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-link ${isActive(link.to) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="/assets/resume.pdf"
            className="mobile-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Resume
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
