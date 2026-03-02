import React, { useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { usePublicPage } from '../hooks/usePublicPage';
import { CATEGORIES } from '../data/projects';
import './ProjectsPage.css';

const PageRenderer = lazy(() => import('../builder/components/PageRenderer').then(m => ({ default: m.PageRenderer })));

const ProjectsPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { projects, loading } = useProjects(activeCategory);
  const { content: builderContent, loading: builderLoading } = usePublicPage('/projects');

  if (builderLoading) return <div style={{ minHeight: '60vh' }} />;
  if (builderContent) return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <PageRenderer craftState={builderContent} />
    </Suspense>
  );

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
          {projects.map((project) => {
            const isDev = project.status === 'in-development';
            const Row = isDev ? 'div' : Link;
            const rowProps = isDev
              ? { className: 'project-row project-row-disabled' }
              : { to: project.route, className: 'project-row' };

            return (
              <Row key={project.id} {...rowProps}>
                <div className="project-row-content">
                  <div className="project-row-header">
                    <h3 className="project-row-title">{project.title}</h3>
                    {project.featured && <span className="featured-tag">Featured</span>}
                    {isDev && <span className="dev-tag">In Development</span>}
                  </div>
                  <p className="project-row-desc">{project.shortDesc}</p>
                  <div className="project-row-tags">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="project-row-tag">{tag}</span>
                    ))}
                  </div>
                </div>
                {!isDev && <ArrowRight className="project-row-arrow" size={20} />}
              </Row>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
