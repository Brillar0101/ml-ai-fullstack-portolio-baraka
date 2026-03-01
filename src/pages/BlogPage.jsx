import React from 'react';
import { PenLine } from 'lucide-react';
import './BlogPage.css';

const BlogPage = () => {
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
