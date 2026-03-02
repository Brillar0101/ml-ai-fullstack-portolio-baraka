import React, { lazy, Suspense } from 'react';
import { PenLine } from 'lucide-react';
import { usePublicPage } from '../hooks/usePublicPage';
import './BlogPage.css';

const PageRenderer = lazy(() => import('../builder/components/PageRenderer').then(m => ({ default: m.PageRenderer })));

const BlogPage = () => {
  const { content, loading } = usePublicPage('/blog');

  if (loading) return <div style={{ minHeight: '60vh' }} />;
  if (content) return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <PageRenderer craftState={content} />
    </Suspense>
  );

  return (
    <div className="blog-page container">
      <header className="page-header">
        <p className="eyebrow">Blog</p>
        <h1 className="page-title">Blog</h1>
      </header>

      <div className="blog-coming-soon">
        <div className="blog-coming-soon-icon">
          <PenLine size={48} />
        </div>
        <h2>Coming Soon</h2>
        <p>
          Working on sharing thoughts on ML, embedded systems, and engineering.
          Stay tuned.
        </p>
      </div>
    </div>
  );
};

export default BlogPage;
