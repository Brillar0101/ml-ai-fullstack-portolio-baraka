import React from 'react';
import PythonLab from '../../components/labs/PythonLab';
import FlowDiagram from '../../components/diagrams/FlowDiagram';
import SketchTreeDiagram from '../../components/diagrams/SketchTreeDiagram';
import ArchDiagram from '../../components/diagrams/ArchDiagram';

/**
 * Generic renderer for data-driven series blog posts. A post's `body` is an
 * array of typed blocks, so new posts are added as data in seriesPosts.js
 * rather than as new components. Posts follow the teaching spine but mix in
 * whichever blocks fit the concept: prose, code, diagrams, callouts, labs.
 *
 * Block types:
 *   { type: 'p', text }
 *   { type: 'h2', text }
 *   { type: 'ul', items: [string] }
 *   { type: 'terms', items: [{ term, def }] }
 *   { type: 'code', code, lang?, title? }            static code walkthrough
 *   { type: 'diagram', nodes|rows, caption? }        see FlowDiagram.jsx
 *   { type: 'callout', text, title? }                aside / warning / key idea
 *   { type: 'sources', items: [{ title, url?, note? }] }  references at post end
 *   { type: 'lab', code, packages?, height? }        runnable in-browser Python
 */
// Render inline **bold** markers as <strong> so important terms stand out.
function rich(text) {
  if (typeof text !== 'string') return text;
  return text.split('**').map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

function Block({ block }) {
  switch (block.type) {
    case 'h2':
      return <h2>{block.text}</h2>;
    case 'p':
      return <p>{rich(block.text)}</p>;
    case 'ul':
      return <ul>{block.items.map((it, i) => <li key={i}>{rich(it)}</li>)}</ul>;
    case 'terms':
      return (
        <ul className="series-terms">
          {block.items.map((t, i) => (
            <li key={i}><strong>{t.term}</strong>: {rich(t.def)}</li>
          ))}
        </ul>
      );
    case 'code':
      return (
        <figure className="series-code">
          {block.title ? <figcaption>{block.title}</figcaption> : null}
          <pre data-lang={block.lang || ''}><code>{block.code}</code></pre>
        </figure>
      );
    case 'diagram':
      // Three styles, chosen by shape: a `root` tree renders the hand-drawn
      // pastel decision tree (option A); `edges` renders the icon-based
      // architecture diagram (option B); `nodes`/`rows` alone render the
      // simple boxed flow (default).
      if (block.root) {
        return <SketchTreeDiagram title={block.title} caption={block.caption} root={block.root} />;
      }
      if (block.edges) {
        return <ArchDiagram title={block.title} caption={block.caption} nodes={block.nodes} edges={block.edges} groups={block.groups} />;
      }
      return <FlowDiagram nodes={block.nodes} rows={block.rows} caption={block.caption} />;
    case 'callout':
      return (
        <aside className="series-callout">
          {block.title ? <strong className="series-callout-title">{block.title}</strong> : null}
          <p>{rich(block.text)}</p>
        </aside>
      );
    case 'sources':
      return (
        <section className="series-sources">
          <h2>Sources &amp; further reading</h2>
          <ul>
            {block.items.map((s, i) => (
              <li key={i}>
                {s.url
                  ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
                  : <span className="series-source-title">{s.title}</span>}
                {s.note ? <span className="series-source-note"> — {s.note}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      );
    case 'lab':
      return <PythonLab code={block.code} packages={block.packages || []} height={block.height || 300} />;
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
