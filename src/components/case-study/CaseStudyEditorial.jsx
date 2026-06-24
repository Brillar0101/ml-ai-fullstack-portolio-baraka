import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Code2 } from 'lucide-react';
import Gallery from './Gallery';
import './CaseStudyEditorial.css';

/**
 * Template B - "Editorial"
 * Brand-gradient hero band with a sticky section nav beside a long-form
 * content column. Same project-writeup JSON shape as Template A; missing
 * fields and sections are skipped.
 */
const slug = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function isInternal(href) {
  return href && href.startsWith('/');
}

function Cta({ cta }) {
  const className = cta.primary ? 'ce-btn ce-btn-primary' : 'ce-btn ce-btn-secondary';
  const inner = (
    <>
      {cta.label}
      {cta.primary && <ArrowRight size={16} />}
    </>
  );
  return isInternal(cta.href) ? (
    <Link to={cta.href} className={className}>{inner}</Link>
  ) : (
    <a className={className} href={cta.href} target="_blank" rel="noopener noreferrer">{inner}</a>
  );
}

function ContentBlocks({ block }) {
  return (
    <>
      {block.body && <p className="ce-text">{block.body}</p>}

      {Array.isArray(block.bullets) && block.bullets.length > 0 && (
        <ul className="ce-list">
          {block.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}

      {block.code && (
        <div className="ce-code">
          {block.codeLabel && (
            <div className="ce-code-head">
              <Code2 size={14} />
              <span>{block.codeLabel}</span>
            </div>
          )}
          <pre>
            <code>{block.code}</code>
          </pre>
        </div>
      )}

      {block.image && (
        <figure className="ce-figure">
          <img src={block.image} alt={block.imageAlt || ''} loading="lazy" />
        </figure>
      )}

      {Array.isArray(block.images) && block.images.length > 0 && (
        <Gallery images={block.images} columns={3} />
      )}

      {Array.isArray(block.tags) && block.tags.length > 0 && (
        <div className="ce-tags">
          {block.tags.map((t, i) => (
            <span className="ce-tag" key={i}>{t}</span>
          ))}
        </div>
      )}
    </>
  );
}

export default function CaseStudyEditorial({ data }) {
  if (!data) return null;
  const { eyebrow, context, headline, subhead, metrics = [], sections = [], cta = [], video, cover } = data;
  const navItems = sections.filter((s) => s.title).map((s) => ({ id: slug(s.title), title: s.title }));

  return (
    <article className="ce-root">
      {/* Gradient hero band */}
      <header className="ce-hero">
        <div className="ce-hero-inner">
          <Link to="/projects" className="ce-back">
            <ArrowLeft size={16} /> Back to projects
          </Link>
          {eyebrow && <p className="ce-eyebrow">{eyebrow}</p>}
          {headline && <h1 className="ce-headline">{headline}</h1>}
          {context && <p className="ce-context">{context}</p>}
          {subhead && <p className="ce-subhead">{subhead}</p>}

          {metrics.length > 0 && (
            <div className="ce-metrics">
              {metrics.map((m, i) => (
                <div className="ce-metric" key={i}>
                  <span className="ce-metric-value">{m.value}</span>
                  <span className="ce-metric-label">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Optional demo video / cover, full-width under the hero */}
      {video ? (
        <div className="ce-media">
          <div className="ce-video">
            <iframe
              src={video}
              title={headline || 'Demo video'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        cover && (
          <div className="ce-media">
            <figure className="ce-cover">
              <img src={cover} alt={headline || 'Project cover'} loading="lazy" />
            </figure>
          </div>
        )
      )}

      {/* Body: sticky nav + content */}
      <div className="ce-layout">
        {navItems.length > 0 && (
          <nav className="ce-nav" aria-label="Sections">
            <ul>
              {navItems.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`}>{n.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="ce-content">
          {sections.map((section, i) => (
            <section className="ce-section" id={slug(section.title)} key={i}>
              {section.title && <h2 className="ce-section-title">{section.title}</h2>}

              {section.type === 'process' && Array.isArray(section.steps) ? (
                section.steps.map((step, j) => (
                  <div className="ce-step" key={j}>
                    {step.title && <h3 className="ce-step-title">{step.title}</h3>}
                    <ContentBlocks block={step} />
                  </div>
                ))
              ) : (
                <ContentBlocks block={section} />
              )}
            </section>
          ))}

          {cta.length > 0 && (
            <div className="ce-cta">
              {cta.map((c, i) => (
                <Cta cta={c} key={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
