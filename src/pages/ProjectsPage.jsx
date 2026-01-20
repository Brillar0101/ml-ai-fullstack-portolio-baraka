import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PROJECTS } from '../data/projects';
import './ProjectsPage.css';

const ProjectsPage = () => {
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
          <Link
            key={project.id}
            to={project.route}
            className="glass-card project-card"
          >
            {project.featured && <span className="featured-badge">Featured</span>}
            <div className="project-card-header">
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
            </div>
            <p className="project-card-desc">{project.shortDesc}</p>
            <div className="project-tags">
              {project.tags.map((tag, index) => (
                <span key={index} className="project-tag">{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
