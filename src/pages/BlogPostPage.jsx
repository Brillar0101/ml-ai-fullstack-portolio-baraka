import React, { lazy, Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight, Clock, Calendar, Send, User } from 'lucide-react';
import { BLOG_POSTS } from '../data/blog';
import { supabase } from '../lib/supabase';
import './BlogPostPage.css';

// Analytics tracking hook
const useAnalytics = (slug) => {
  const startTime = useRef(Date.now());
  const maxScroll = useRef(0);
  const tracked = useRef(false);

  useEffect(() => {
    if (!supabase || tracked.current) return;
    tracked.current = true;

    // Track pageview
    supabase.from('analytics_events').insert([{
      post_slug: slug,
      event_type: 'pageview',
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    }]);

    // Track scroll depth
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const depth = Math.round((scrollTop / docHeight) * 100);
        if (depth > maxScroll.current) maxScroll.current = depth;
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Send scroll depth + time on page when leaving
    let engagementSent = false;
    const handleLeave = () => {
      if (engagementSent) return;
      const timeOnPage = Math.round((Date.now() - startTime.current) / 1000);
      if (timeOnPage < 2) return; // skip if less than 2 seconds (cleanup noise)
      engagementSent = true;
      supabase.from('analytics_events').insert([{
        post_slug: slug,
        event_type: 'engagement',
        scroll_depth: maxScroll.current,
        time_on_page: timeOnPage,
      }]);
    };

    window.addEventListener('beforeunload', handleLeave);
    return () => {
      handleLeave();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleLeave);
    };
  }, [slug]);
};

// Custom comments component using Supabase
const BlogComments = ({ slug }) => {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_slug', slug)
      .order('created_at', { ascending: true });
    if (data) setComments(data);
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedComment = comment.trim();

    if (!trimmedName || !trimmedComment) {
      setError('Please fill in both fields.');
      return;
    }

    if (!supabase) {
      setError('Comments are temporarily unavailable.');
      return;
    }

    setSubmitting(true);
    setError('');

    const { error: insertError } = await supabase
      .from('blog_comments')
      .insert([{ post_slug: slug, author_name: trimmedName, comment: trimmedComment }]);

    if (insertError) {
      setError('Failed to post comment. Please try again.');
      setSubmitting(false);
      return;
    }

    setName('');
    setComment('');
    setSubmitting(false);
    fetchComments();
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="blog-comments">
      {/* Comment form */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-form-fields">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="comment-input"
            maxLength={50}
          />
          <textarea
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="comment-textarea"
            rows={3}
            maxLength={1000}
          />
        </div>
        {error && <p className="comment-error">{error}</p>}
        <button type="submit" className="comment-submit" disabled={submitting}>
          <Send size={14} />
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments list */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="comments-empty">No comments yet. Be the first to share your thoughts.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-avatar">
                <User size={16} />
              </div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-author">{c.author_name}</span>
                  <span className="comment-date">{formatDate(c.created_at)}</span>
                </div>
                <p className="comment-text">{c.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const postComponents = {
  'your-first-ai-agent': lazy(() => import('./blog/AIAgentPost')),
  'model-merging': lazy(() => import('./blog/ModelMergingPost')),
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.id === slug);
  useAnalytics(slug);

  if (!post || post.comingSoon) return <Navigate to="/blog" replace />;

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
          {/* Comments */}
          <section className="blog-comments-section">
            <h2 className="blog-comments-heading">Comments</h2>
            <BlogComments slug={slug} />
          </section>
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
