import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PROJECTS } from '../data/projects';
import './ProjectsPage.css';

const ProjectsPage = ({ setCurrentPage, setSelectedProject }) => {
  const handleProjectClick = (project) => {
    if (project.route === 'clapperboard-project') {
      setCurrentPage('clapperboard-project');
    } else if (project.route === 'psiv-rentals-project') {
      setCurrentPage('psiv-rentals-project');
    } else if (project.route === 'swishvision-project') {
      setCurrentPage('swishvision-project');
    } else {
      setSelectedProject(project.id);
      setCurrentPage('project-detail');
    }
  };
  
  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Featured Projects</h1>
        <p className="page-subtitle">
          A collection of my work in machine learning, computer vision, and full-stack development
        </p>
      </header>
      
      <div className="projects-grid">
        {PROJECTS.map((project) => (
          <div 
            key={project.id}
            className="glass-card project-card"
            onClick={() => handleProjectClick(project)}
          >
            {project.featured && <span className="featured-badge">Featured</span>}
            <div 
              className="project-icon-wrapper"
              style={{ background: project.gradient }}
            >
              <project.icon />
            </div>
            <h3 className="project-card-title">
              {project.title}
              <ArrowRight />
            </h3>
            <p className="project-card-desc">{project.shortDesc}</p>
            <div className="project-tags">
              {project.tags.map((tag, index) => (
                <span key={index} className="project-tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
