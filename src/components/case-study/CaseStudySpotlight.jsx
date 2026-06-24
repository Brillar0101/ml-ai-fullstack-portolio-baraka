import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import './CaseStudySpotlight.css';

/**
 * Template A - "Spotlight"
 * Centered narrative layout. Renders a case study in the project-writeup
 * JSON shape. Any missing section is skipped automatically.
 *
 * @param {{ data: object }} props
 */
function isInternal(href) {
  return href && href.startsWith('/');
}

function CtaButton({ cta }) {
  const className = cta.primary ? 'cs-btn cs-btn-primary' : 'cs-btn cs-btn-secondary';
  if (isInternal(cta.href)) {
    return (
      <Link to={cta.href} className={className}>
        {cta.label}
        {cta.primary && <ArrowRight size={16} />}
      </Link>
    );
  }
  return (
    <a className={className} href={cta.href} target="_blank" rel="noopener noreferrer">
      {cta.label}
      {cta.primary && <ArrowRight size={16} />}
    </a>
  );
}

export default function CaseStudySpotlight({ data }) {
  if (!data) return null;
  const { eyebrow, headline, subhead, cover, metrics = [], sections = [], cta = [] } = data;

  return (
    <article className="cs-spotlight">
      <div className="cs-container">
        <Link to="/projects" className="cs-back">
          <ArrowLeft size={16} /> Back to projects
        </Link>

        {/* Hero */}
        <header className="cs-hero">
          {eyebrow && <p className="cs-eyebrow">{eyebrow}</p>}
          {headline && <h1 className="cs-headline">{headline}</h1>}
          {subhead && <p className="cs-subhead">{subhead}</p>}
        </header>

        {cover && (
          <div className="cs-cover">
            <img src={cover} alt={headline || 'Project cover'} loading="lazy" />
          </div>
        )}

        {/* Metrics row - skipped when empty */}
        {metrics.length > 0 && (
          <div className="cs-metrics">
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
                        {step.body && <p className="cs-text">{step.body}</p>}
                        {step.image && (
                          <div className="cs-step-art">
                            <img src={step.image} alt={step.imageAlt || ''} loading="lazy" />
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                section.body && <p className="cs-text">{section.body}</p>
              )}
            </section>
          ))}
        </div>

        {/* CTA - skipped when empty */}
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
