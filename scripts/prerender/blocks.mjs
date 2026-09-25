// Static HTML for a series post's body blocks. Mirrors the inline syntax of
// src/pages/blog/SeriesPost.jsx closely enough that a crawler which never runs
// JavaScript reads the same text, links, citations, and equations a visitor
// sees. Interactive blocks (labs, explorers, charts) degrade to their caption.
import katex from 'katex';

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const INLINE = /\[([^\]^][^\]]*)\]\((https?:\/\/[^\s)]+)\)|\[\^(\d+(?:,\s*\d+)*)\]|\\\((.+?)\\\)/g;

function tex(source, display) {
  return katex.renderToString(source, { displayMode: display, throwOnError: false, output: 'mathml' });
}

function bold(text) {
  return text.split('**').map((part, i) => (i % 2 === 1 ? `<strong>${esc(part)}</strong>` : esc(part))).join('');
}

export function inline(text) {
  if (typeof text !== 'string') return '';
  let out = '';
  let last = 0;
  let m;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    out += bold(text.slice(last, m.index));
    if (m[1]) {
      out += `<a href="${esc(m[2])}" rel="noopener">${bold(m[1])}</a>`;
    } else if (m[3]) {
      const nums = m[3].split(',').map((n) => n.trim());
      out += `<sup>${nums.map((n) => `<a href="#src-${n}">${n}</a>`).join(',')}</sup>`;
    } else {
      out += tex(m[4], false);
    }
    last = m.index + m[0].length;
  }
  return out + bold(text.slice(last));
}

function caption(text) {
  return text ? `<figcaption>${inline(text)}</figcaption>` : '';
}

function sources(block) {
  const tag = block.numbered ? 'ol' : 'ul';
  const items = block.items.map((s, i) => {
    const id = block.numbered ? ` id="src-${i + 1}"` : '';
    const title = s.url ? `<a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a>` : esc(s.title);
    return `<li${id}>${title}${s.note ? ` (${esc(s.note)})` : ''}</li>`;
  });
  return `<section><h2>Sources</h2><${tag}>${items.join('')}</${tag}></section>`;
}

export function blockHtml(block) {
  switch (block.type) {
    case 'p': return `<p>${inline(block.text)}</p>`;
    case 'h2': return `<h2>${esc(block.text)}</h2>`;
    case 'ul': return `<ul>${block.items.map((it) => `<li>${inline(it)}</li>`).join('')}</ul>`;
    case 'terms':
      return `<dl>${block.items.map((t) => `<dt>${esc(t.term)}</dt><dd>${inline(t.def)}</dd>`).join('')}</dl>`;
    case 'eq': return `<figure>${tex(block.tex, true)}${caption(block.caption)}</figure>`;
    case 'image':
      return `<figure><img src="${esc(block.src)}" alt="${esc(block.alt)}"${block.width ? ` width="${block.width}" height="${block.height}"` : ''}>${caption(block.caption)}</figure>`;
    case 'callout':
      return `<aside>${block.title ? `<strong>${esc(block.title)}</strong> ` : ''}${inline(block.text)}</aside>`;
    case 'code': return `<pre><code>${esc(block.code)}</code></pre>`;
    case 'sources': return sources(block);
    case 'chart':
    case 'diagram':
    case 'explorer':
    case 'lab':
      return block.caption || block.title
        ? `<figure>${caption(block.caption || block.title)}</figure>`
        : '';
    default: return '';
  }
}

export function bodyHtml(body) {
  return (body || []).map(blockHtml).join('\n');
}
