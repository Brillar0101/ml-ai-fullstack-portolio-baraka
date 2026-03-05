import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';
import { CONFIG } from '../config';
import './Footer.css';

const Footer = () => {
  const location = useLocation();

  // Hide footer on home, contact, and admin pages
  const hiddenPaths = ['/', '/contact'];
  if (hiddenPaths.includes(location.pathname) || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Top row: name/brand + nav links + socials */}
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">Barakaeli Lawuo</Link>
          </div>

          <nav className="footer-nav">
            <Link to="/about">About</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          <div className="footer-socials">
            <a href={`https://${CONFIG.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github size={20} />
            </a>
            <a href={`https://${CONFIG.linkedin}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
            <a href={`mailto:${CONFIG.email}`} aria-label="Email">
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom row: copyright */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Barakaeli Lawuo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
