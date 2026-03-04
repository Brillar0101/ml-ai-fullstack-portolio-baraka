import React, { lazy, Suspense } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight, Clock, Calendar } from 'lucide-react';
import { BLOG_POSTS } from '../data/blog';
import './BlogPostPage.css';

const postComponents = {
  'your-first-ai-agent': lazy(() => import('./blog/AIAgentPost')),
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.id === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const PostContent = postComponents[slug];
  const relatedPosts = BLOG_POSTS.filter(p => p.id !== slug);

  return (
    <div className="blog-post-page container">
      {/* Hero */}
      <div className="blog-post-hero" style={{ background: post.coverGradient }}>
        <div className="blog-post-hero-overlay" />
        <div className="blog-post-hero-content">
          <div className="blog-post-category">{post.category}</div>
          <h1 className="blog-post-title">{post.title}</h1>
          <div className="blog-post-meta">
            <span>Baraka</span>
            <span>{post.date}</span>
          </div>
        </div>
      </div>

      {/* Back link */}
      <Link to="/blog" className="blog-back-link">
        <ChevronLeft size={16} />
        All Posts
      </Link>

      {/* Main layout: content + sidebar */}
      <div className="blog-post-layout">
        <article className="blog-post-content">
          {PostContent && (
            <Suspense fallback={<div style={{ minHeight: '40vh' }} />}>
              <PostContent />
            </Suspense>
          )}
        </article>

        <aside className="blog-post-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-heading">MORE BLOGS</h3>
            {relatedPosts.length > 0 ? (
              <div className="sidebar-posts">
                {relatedPosts.map(rp => (
                  <Link to={rp.route} key={rp.id} className="sidebar-card">
                    <div className="sidebar-card-cover" style={{ background: rp.coverGradient }} />
                    <div className="sidebar-card-body">
                      <div className="sidebar-card-category">{rp.category}</div>
                      <div className="sidebar-card-title">{rp.title}</div>
                      <div className="sidebar-card-link">
                        Read more <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="sidebar-coming-soon">
                <p>More posts coming soon.</p>
                <p className="sidebar-coming-soon-sub">
                  Working on sharing thoughts on ML, embedded systems, and engineering.
                </p>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-heading">ABOUT THIS POST</h3>
            <div className="sidebar-meta">
              <div className="sidebar-meta-row">
                <Clock size={14} />
                <span>{post.readTime}</span>
              </div>
              <div className="sidebar-meta-row">
                <Calendar size={14} />
                <span>{post.date}</span>
              </div>
            </div>
            <div className="sidebar-tags">
              {post.tags.map(tag => (
                <span key={tag} className="sidebar-tag">{tag}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogPostPage;
