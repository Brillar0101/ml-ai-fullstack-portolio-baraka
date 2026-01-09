import React from 'react';
import { ChevronLeft, Layers } from 'lucide-react';
import { PROJECTS } from '../data/projects';
import './ProjectDetailPage.css';

const ProjectDetailPage = ({ projectId, setCurrentPage }) => {
  const project = PROJECTS.find(p => p.id === projectId);
  
  if (!project) {
    return (
      <div className="container">
        <p>Project not found</p>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="project-detail">
        <button className="back-button" onClick={() => setCurrentPage('projects')}>
          <ChevronLeft />
          Back to Projects
        </button>
        
        <header className="project-detail-header">
          <div 
            className="project-detail-icon"
            style={{ background: project.gradient }}
          >
            <project.icon />
          </div>
          <h1 className="project-detail-title">{project.title}</h1>
          <p className="project-detail-desc">{project.shortDesc}</p>
          <div className="project-tags">
            {project.tags.map((tag, index) => (
              <span key={index} className="project-tag">{tag}</span>
            ))}
          </div>
        </header>
        
        <div className="glass-card project-detail-content">
          <div className="content-placeholder">
            <Layers />
            <p>Project content coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
