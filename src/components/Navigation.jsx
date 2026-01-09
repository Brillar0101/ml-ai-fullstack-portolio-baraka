import React, { useState } from 'react';
import { Home, FolderOpen, Mail, Menu, X } from 'lucide-react';
import { CONFIG } from '../config';
import './Navigation.css';

const Navigation = ({ currentPage, setCurrentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'contact', label: 'Contact', icon: Mail }
  ];
  
  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
  };
  
  return (
    <nav className="nav-container">
      <div className="nav-inner">
        <div className="nav-glass">
          <div 
            className="logo" 
            onClick={() => setCurrentPage('home')} 
            style={{ cursor: 'pointer' }}
          >
            {CONFIG.name}
          </div>
          <div className="nav-links">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <item.icon />
                {item.label}
              </button>
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
          <button
            key={item.id}
            className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
