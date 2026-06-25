import React from 'react';
import { Link } from 'react-router-dom';
import PythonLab from '../../components/labs/PythonLab';

/**
 * Generic renderer for data-driven series blog posts. A post's `body` is an
 * array of typed blocks, so new posts are added as data in seriesPosts.js
 * rather than as new components. Every post follows the teaching spine:
 * question -> intuition -> defined terms -> mechanism -> (optional do it) -> takeaway.
 *
 * Block types:
 *   { type: 'p', text }
 *   { type: 'h2', text }
 *   { type: 'ul', items: [string] }
 *   { type: 'terms', items: [{ term, def }] }
 *   { type: 'lab', code, packages?, height? }
 *   { type: 'demoLink', to, label }
 */
function Block({ block }) {
  switch (block.type) {
    case 'h2':
      return <h2>{block.text}</h2>;
    case 'p':
      return <p>{block.text}</p>;
    case 'ul':
      return <ul>{block.items.map((it, i) => <li key={i}>{it}</li>)}</ul>;
    case 'terms':
      return (
        <ul className="series-terms">
          {block.items.map((t, i) => (
            <li key={i}><strong>{t.term}</strong>: {t.def}</li>
          ))}
        </ul>
      );
    case 'lab':
      return <PythonLab code={block.code} packages={block.packages || []} height={block.height || 300} />;
    case 'demoLink':
      return (
        <p>
          <Link to={block.to} className="blog-cta-link">{block.label || 'Open the interactive lab'} →</Link>
        </p>
      );
    default:
      return null;
  }
}

export default function SeriesPost({ post }) {
  if (!post || !Array.isArray(post.body)) return null;
  return (
    <>
      {post.body.map((block, i) => <Block block={block} key={i} />)}
    </>
  );
}
