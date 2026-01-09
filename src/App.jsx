import React, { useState } from 'react';
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

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'projects':
        return <ProjectsPage setCurrentPage={setCurrentPage} setSelectedProject={setSelectedProject} />;
      case 'project-detail':
        return <ProjectDetailPage projectId={selectedProject} setCurrentPage={setCurrentPage} />;
      case 'clapperboard-project':
        return <ClapperboardProject setCurrentPage={setCurrentPage} />;
      case 'psiv-rentals-project':
        return <PSIVRentalsProject setCurrentPage={setCurrentPage} />;
      case 'swishvision-project':
        return <SwishVisionProject setCurrentPage={setCurrentPage} />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };
  
  return (
    <div className="app-container">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
