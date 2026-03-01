import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { CATEGORIES } from '../data/projects';
import './ProjectsPage.css';

const ProjectsPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { projects, loading } = useProjects(activeCategory);

  return (
    <div className="container">
      <header className="page-header">
        <p className="eyebrow">Portfolio</p>
        <h1 className="page-title">Projects</h1>
      </header>

      {/* Category Tabs */}
      <nav className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {/* Project List */}
      {loading ? (
        <div className="projects-loading">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="projects-empty">
          <p className="projects-empty-title">Coming soon</p>
          <p className="projects-empty-desc">
            Projects in this category are currently in development.
          </p>
        </div>
      ) : (
        <div className="project-list">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={project.route}
              className="project-row"
            >
              <div className="project-row-content">
                <div className="project-row-header">
                  <h3 className="project-row-title">{project.title}</h3>
                  {project.featured && <span className="featured-tag">Featured</span>}
                </div>
                <p className="project-row-desc">{project.shortDesc}</p>
                <div className="project-row-tags">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="project-row-tag">{tag}</span>
                  ))}
                </div>
              </div>
              <ArrowRight className="project-row-arrow" size={20} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
