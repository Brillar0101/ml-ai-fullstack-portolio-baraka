import React, { useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { usePublicPage } from '../hooks/usePublicPage';
import { CATEGORIES } from '../data/projects';
import './ProjectsPage.css';

const PageRenderer = lazy(() => import('../builder/components/PageRenderer').then(m => ({ default: m.PageRenderer })));

const CATEGORY_LABELS = {
  'ml-ai': 'ML / AI',
  'embedded': 'Embedded Systems',
  'hardware': 'Hardware Design',
};

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
    <div className="projects-page">
      {/* Hero Banner */}
      <div className="projects-hero">
        <div className="projects-hero-bg" />
        <div className="projects-hero-content">
          <p className="projects-hero-eyebrow">PORTFOLIO</p>
          <h1 className="projects-hero-title">Projects</h1>
          <p className="projects-hero-desc">
            ML pipelines, embedded firmware, PCB designs, and full-stack applications.
            Each project built from the ground up.
          </p>
        </div>
      </div>

      <div className="container">
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

        {/* Project Cards Grid */}
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
          <div className="projects-cards-grid">
            {projects.map((project) => {
              const isDev = project.status === 'in-development';
              const Card = isDev ? 'div' : Link;
              const cardProps = isDev
                ? { className: 'project-card project-card-disabled' }
                : { to: project.route, className: 'project-card' };

              return (
                <Card key={project.id} {...cardProps}>
                  <div className="project-card-body">
                    <div className="project-card-category">
                      {CATEGORY_LABELS[project.category] || project.category}
                    </div>
                    <div className="project-card-header">
                      <h2 className="project-card-title">{project.title}</h2>
                      {project.featured && <span className="featured-tag">Featured</span>}
                      {isDev && <span className="dev-tag">In Development</span>}
                    </div>
                    <p className="project-card-desc">{project.shortDesc}</p>
                    <div className="project-card-tags">
                      {project.tags.map((tag, index) => (
                        <span key={index} className="project-card-tag">{tag}</span>
                      ))}
                    </div>
                    {!isDev && (
                      <div className="project-card-footer">
                        <div className="project-card-link">
                          View project <ArrowRight size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
