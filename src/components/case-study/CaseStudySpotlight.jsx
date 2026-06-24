import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Code2 } from 'lucide-react';
import Gallery from './Gallery';
import './CaseStudySpotlight.css';

/**
 * Template A - "Spotlight"
 * Centered narrative layout. Renders a case study in the project-writeup
 * JSON shape. Any missing field or section is skipped automatically.
 */
function isInternal(href) {
  return href && href.startsWith('/');
}

function CtaButton({ cta }) {
  const className = cta.primary ? 'cs-btn cs-btn-primary' : 'cs-btn cs-btn-secondary';
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

/* Renders every optional content field a section or step may carry. */
function ContentBlocks({ block }) {
  return (
    <>
      {block.body && <p className="cs-text">{block.body}</p>}

      {Array.isArray(block.bullets) && block.bullets.length > 0 && (
        <ul className="cs-list">
          {block.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}

      {block.code && (
        <div className="cs-code">
          {block.codeLabel && (
            <div className="cs-code-head">
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
        <figure className="cs-figure">
          <img src={block.image} alt={block.imageAlt || ''} loading="lazy" />
        </figure>
      )}

      {Array.isArray(block.images) && block.images.length > 0 && (
        <Gallery images={block.images} columns={3} />
      )}

      {Array.isArray(block.tags) && block.tags.length > 0 && (
        <div className="cs-tags">
          {block.tags.map((t, i) => (
            <span className="cs-tag" key={i}>{t}</span>
          ))}
        </div>
      )}
    </>
  );
}

export default function CaseStudySpotlight({ data }) {
  if (!data) return null;
  const { eyebrow, context, headline, subhead, cover, metrics = [], sections = [], cta = [] } = data;

  return (
    <article className="cs-spotlight">
      <div className="cs-container">
        <Link to="/projects" className="cs-back">
          <ArrowLeft size={16} /> Back to projects
        </Link>

        {/* Hero */}
        <header className="cs-hero">
          {eyebrow && <p className="cs-eyebrow">{eyebrow}</p>}
          {context && <p className="cs-context">{context}</p>}
          {headline && <h1 className="cs-headline">{headline}</h1>}
          {subhead && <p className="cs-subhead">{subhead}</p>}
        </header>

        {cover && (
          <div className="cs-cover">
            <img src={cover} alt={headline || 'Project cover'} loading="lazy" />
          </div>
        )}

        {/* Metrics row */}
        {metrics.length > 0 && (
          <div className="cs-metrics" style={{ '--cs-metric-cols': Math.min(metrics.length, 4) }}>
            {metrics.map((m, i) => (
              <div className="cs-metric" key={i}>
                <div className="cs-metric-value">{m.value}</div>
                <div className="cs-metric-label">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Sections */}
        <div className="cs-body">
          {sections.map((section, i) => (
            <section className="cs-section" key={i}>
              {section.title && <h2 className="cs-section-title">{section.title}</h2>}

              {section.type === 'process' && Array.isArray(section.steps) ? (
                <ol className="cs-steps">
                  {section.steps.map((step, j) => (
                    <li className="cs-step" key={j}>
                      <div className="cs-step-index">{String(j + 1).padStart(2, '0')}</div>
                      <div className="cs-step-body">
                        {step.title && <h3 className="cs-step-title">{step.title}</h3>}
                        <ContentBlocks block={step} />
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <ContentBlocks block={section} />
              )}
            </section>
          ))}
        </div>

        {/* CTA */}
        {cta.length > 0 && (
          <div className="cs-cta">
            {cta.map((c, i) => (
              <CtaButton cta={c} key={i} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
