import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ContactPage from './pages/ContactPage';
import ClapperboardProject from './pages/ClapperboardProject';
import PSIVRentalsProject from './pages/PSIVRentalsProject';
import SwishVisionProject from './pages/SwishVisionProject';
import { CONFIG } from './config';
import './styles/global.css';

// Page titles for each route
const pageTitles = {
  '/': 'Home',
  '/projects': 'Projects',
  '/contact': 'Contact',
  '/projects/clapperboard': 'Clapperboard Detection',
  '/projects/psiv-rentals': 'PSIV Rentals',
  '/projects/swishvision': 'SwishVision'
};

export default function App() {
  const location = useLocation();

  // Update document title based on route
  useEffect(() => {
    const pageTitle = pageTitles[location.pathname] || 'Home';
    document.title = `${pageTitle} | ${CONFIG.name} - ML/AI Engineer`;
  }, [location.pathname]);

  const isHomePage = location.pathname === '/';

  return (
    <div className="app-container">
      <Navigation />
      <main className={`main-content ${isHomePage ? 'no-scroll' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/projects/clapperboard" element={<ClapperboardProject />} />
          <Route path="/projects/psiv-rentals" element={<PSIVRentalsProject />} />
          <Route path="/projects/swishvision" element={<SwishVisionProject />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
    </div>
  );
}
