import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import PythonLab from '../../components/labs/PythonLab';
import FlowDiagram from '../../components/diagrams/FlowDiagram';
import SketchTreeDiagram from '../../components/diagrams/SketchTreeDiagram';
import ArchDiagram from '../../components/diagrams/ArchDiagram';
import BarChart from '../../components/diagrams/BarChart';
import LineChart from '../../components/diagrams/LineChart';
import Schematic from '../../components/diagrams/Schematic';
import Explorer from '../../components/diagrams/Explorer';
// Shared rules across every diagram renderer, including how they behave on a
// phone. Imported here because this is the one component that renders all of
// them; the file was previously imported nowhere and its rules never applied.
import '../../components/diagrams/DiagramStyles.css';

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
 *   { type: 'eq', tex, caption? }                    display equation (KaTeX)
 *   { type: 'sources', items: [{ title, url?, note? }], numbered? }
 *                                                    references at post end;
 *                                                    numbered lists are the
 *                                                    targets of [^n] citations
 *   { type: 'lab', code, packages?, height? }        runnable in-browser Python
 */
// Render inline markup in body text: **bold** for key terms, [label](url) so
// prose can point at the paper or spec behind a claim, [^n] or [^n,m] for a
// superscript citation into the numbered sources list, and \(tex\) for inline
// math. Dollar signs are left alone because posts quote prices.
const INLINE = /\[([^\]^][^\]]*)\]\((https?:\/\/[^\s)]+)\)|\[\^(\d+(?:,\s*\d+)*)\]|\\\((.+?)\\\)/g;

function bold(text, keyPrefix) {
  return text.split('**').map((part, i) => (
    i % 2 === 1 ? <strong key={`${keyPrefix}b${i}`}>{part}</strong> : part
  ));
}

// KaTeX output is generated from post source we write, never from visitors.
function Tex({ tex, display }) {
  const html = katex.renderToString(tex, { displayMode: display, throwOnError: false });
  return display
    ? <div className="series-eq-tex" dangerouslySetInnerHTML={{ __html: html }} />
    : <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function Cite({ nums }) {
  const list = nums.split(',').map((n) => n.trim());
  return (
    <sup className="series-cite">
      {list.map((n, i) => (
        <React.Fragment key={n}>
          {i > 0 ? ',' : null}
          <a href={`#src-${n}`} aria-label={`Source ${n}`}>{n}</a>
        </React.Fragment>
      ))}
    </sup>
  );
}

function rich(text) {
  if (typeof text !== 'string') return text;
  const out = [];
  let last = 0;
  let m;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) out.push(...bold(text.slice(last, m.index), `t${last}`));
    if (m[1]) {
      out.push(
        <a key={`l${m.index}`} href={m[2]} target="_blank" rel="noopener noreferrer" className="series-inline-link">
          {bold(m[1], `a${m.index}`)}
        </a>,
      );
    } else if (m[3]) {
      out.push(<Cite key={`c${m.index}`} nums={m[3]} />);
    } else {
      out.push(<Tex key={`m${m.index}`} tex={m[4]} display={false} />);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(...bold(text.slice(last), `t${last}`));
  return out;
}

// Stable anchor ids for h2 headings, used by the in-post table of contents.
function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function Block({ block, format }) {
  switch (block.type) {
    case 'h2':
      return <h2 id={slugify(block.text)}>{block.text}</h2>;
    case 'p':
      return <p>{rich(block.text)}</p>;
    case 'ul':
      return <ul>{block.items.map((it, i) => <li key={i}>{rich(it)}</li>)}</ul>;
    case 'terms':
      if (format !== 'build' && block.optional !== false) return null;
      return (
        <ul className="series-terms">
          {block.items.map((t, i) => (
            <li key={i}>
              {t.url
                ? <a href={t.url} target="_blank" rel="noopener noreferrer"><strong>{t.term}</strong></a>
                : <strong>{t.term}</strong>}: {rich(t.def)}
            </li>
          ))}
        </ul>
      );
    case 'code':
      if (format !== 'build' && !block.essential) return null;
      return (
        <figure className="series-code">
          {block.title ? <figcaption>{block.title}</figcaption> : null}
          <pre data-lang={block.lang || ''}><code>{block.code}</code></pre>
        </figure>
      );
    case 'diagram':
      if (format === 'essay' && !block.essential) return null;
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
    case 'chart': {
      // `kind` selects the chart renderer. A caption that cites sources is
      // rendered here, outside the chart's scroll box, so [^n] markers resolve
      // and the text wraps on a phone instead of scrolling with the plot.
      const cited = typeof block.caption === 'string' && block.caption.includes('[^');
      const chartCaption = cited ? undefined : block.caption;
      const withCaption = (chart) => (cited ? (
        <figure className="series-chart">
          {chart}
          <figcaption className="series-chart-caption">{rich(block.caption)}</figcaption>
        </figure>
      ) : chart);
      if (block.kind === 'bar') {
        return withCaption(
          <BarChart
            title={block.title}
            caption={chartCaption}
            yLabel={block.yLabel}
            stacked={block.stacked}
            valueLabels={block.valueLabels}
            series={block.series}
            data={block.data}
            gapArrow={block.gapArrow}
          />
        );
      }
      if (block.kind === 'line') {
        return withCaption(
          <LineChart
            title={block.title}
            caption={chartCaption}
            xLabel={block.xLabel}
            yLabel={block.yLabel}
            yLabelRight={block.yLabelRight}
            xMax={block.xMax}
            yMax={block.yMax}
            yMaxRight={block.yMaxRight}
            series={block.series}
            data={block.data}
            regions={block.regions}
          />
        );
      }
      return null;
    }
    case 'explorer':
      // A parameter the reader can drag, with every state precomputed and
      // declared as data, so what they see came from a real run.
      return (
        <Explorer
          title={block.title}
          caption={block.caption}
          param={block.param}
          bars={block.bars}
          data={block.data}
        />
      );
    case 'schematic':
      return <Schematic title={block.title} caption={block.caption} parts={block.parts} wires={block.wires} />;
    case 'eq':
      return (
        <figure className="series-eq">
          <Tex tex={block.tex} display />
          {block.caption ? <figcaption>{rich(block.caption)}</figcaption> : null}
        </figure>
      );
    case 'image':
      return (
        <figure className="series-image">
          <img src={block.src} alt={block.alt || ''} loading="lazy" width={block.width} height={block.height} />
          {block.caption ? <figcaption>{rich(block.caption)}</figcaption> : null}
        </figure>
      );
    case 'callout':
      return (
        <aside className="series-callout">
          {block.title ? <strong className="series-callout-title">{block.title}</strong> : null}
          <p>{rich(block.text)}</p>
        </aside>
      );
    case 'sources': {
      const ListTag = block.numbered ? 'ol' : 'ul';
      return (
        <section className="series-sources">
          <h2>Sources &amp; further reading</h2>
          <ListTag className={block.numbered ? 'series-sources-numbered' : undefined}>
            {block.items.map((s, i) => (
              <li key={i} id={block.numbered ? `src-${i + 1}` : undefined}>
                {s.url
                  ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
                  : <span className="series-source-title">{s.title}</span>}
                {s.note ? <span className="series-source-note"> — {s.note}</span> : null}
              </li>
            ))}
          </ListTag>
        </section>
      );
    }
    case 'lab':
      // A lab is a code walkthrough the reader can actually run and edit, so
      // it carries the same optional filename label a static code block does.
      return (
        <figure className="series-code series-lab">
          {block.title ? <figcaption>{block.title}</figcaption> : null}
          <PythonLab code={block.code} packages={block.packages || []} height={block.height || 300} />
          {block.caption ? <figcaption className="series-lab-caption">{rich(block.caption)}</figcaption> : null}
        </figure>
      );
    default:
      return null;
  }
}

export default function SeriesPost({ post }) {
  if (!post || !Array.isArray(post.body)) return null;
  // Older series entries do not carry editorial metadata. Give them a stable
  // rotation too, so the full archive does not collapse into one template.
  const format = post.format || (
    post.seriesNum % 3 === 0 ? 'essay' : post.seriesNum % 3 === 1 ? 'field-notes' : 'build'
  );
  // Layer-cake scanning support: posts with 4+ sections get a jump list so
  // readers can navigate by heading instead of scrolling blind.
  const headings = post.body.filter((b) => b.type === 'h2');
  return (
    <>
      {headings.length >= 4 && (
        <nav className="series-toc" aria-label="In this post">
          <span className="series-toc-label">In this post</span>
          <ol>
            {headings.map((h, i) => (
              <li key={i}><a href={'#' + slugify(h.text)}>{h.text}</a></li>
            ))}
          </ol>
        </nav>
      )}
      <article className={`series-body series-format-${format}`}>
        {post.body.map((block, i) => <Block block={block} format={format} key={i} />)}
      </article>
    </>
  );
}
