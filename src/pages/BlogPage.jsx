import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '../data/blog';
import './BlogPage.css';

const BlogPage = () => {
  return (
    <div className="blog-page">
      {/* Hero Banner */}
      <div className="blog-hero">
        <div className="blog-hero-bg" />
        <div className="blog-hero-content">
          <p className="blog-hero-eyebrow">ABOUT</p>
          <h1 className="blog-hero-title">Blog</h1>
          <p className="blog-hero-desc">
            Sharing what I learn about ML, AI agents, embedded systems, and hardware design.
            Tutorials, project breakdowns, and engineering notes.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="blog-cards-section container">
        {BLOG_POSTS.length > 0 ? (
          <div className="blog-cards-grid">
            {BLOG_POSTS.map(post => (
              <Link to={post.route} key={post.id} className="blog-card">
                <div className="blog-card-cover" style={{ background: post.coverGradient }}>
                  <div className="blog-card-cover-content">
                    <span className="blog-card-series">{post.series}</span>
                  </div>
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-category">{post.category}</div>
                  <h2 className="blog-card-title">{post.title}</h2>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-footer">
                    <div className="blog-card-meta">
                      <span>Baraka</span>
                      <span>{post.date}</span>
                    </div>
                    <div className="blog-card-link">
                      Read more <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <h2>Coming Soon</h2>
            <p>Working on sharing thoughts on ML, embedded systems, and engineering. Stay tuned.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
