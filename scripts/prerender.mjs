// Post-build step: give every public route its own static HTML.
//
// The site is a client-rendered SPA, so without this every URL returns the
// same empty shell and one generic title. Search engines that do not wait for
// JavaScript, and AI crawlers that never run it, see no article text at all.
// This writes dist/<route>/index.html with the route's own title, description,
// canonical URL, social tags, JSON-LD, and readable body, then generates the
// sitemap, RSS feed, llms.txt, and robots.txt from the same post data so they
// cannot drift. React replaces the static body on load (createRoot, not
// hydrate), so visitors get the normal app.
//
// Only posts whose publish date has passed at build time are written, so a
// scheduled post's text never ships early. A daily rebuild picks up new ones.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { BLOG_POSTS } from '../src/data/blog.js';
import { SERIES_POSTS } from '../src/data/seriesPosts.js';
import { EMBEDDED_POSTS } from '../src/data/embeddedPosts.js';
import { AI_SERIES_POSTS } from '../src/data/aiSeriesPosts.js';
import { caseStudies } from '../src/data/caseStudies.js';
import { isPublished } from '../src/lib/publishing.js';
import { bodyHtml, esc } from './prerender/blocks.mjs';

const SITE = 'https://www.princetekki.com';
const AUTHOR = 'Barakaeli Lawuo';
const SUFFIX = 'Baraka, Computer Engineer';
const DEFAULT_IMAGE = '/og-default.jpg';
const DIST = 'dist';

const template = readFileSync(join(DIST, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) {
  throw new Error('prerender: dist/index.html has no empty #root; run after vite build');
}

// Unknown URLs fall back to this untouched shell (see vercel.json), so a typo
// never renders the home page's content under the wrong address.
writeFileSync(join(DIST, 'app-shell.html'), template);

const abs = (path) => (path.startsWith('http') ? path : SITE + path);

function head(page) {
  const url = abs(page.path);
  const image = abs(page.image || DEFAULT_IMAGE);
  const tags = [
    `<title>${esc(page.title)} | ${SUFFIX}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${page.ogType || 'website'}" />`,
    `<meta property="og:site_name" content="${AUTHOR}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta name="twitter:card" content="${page.image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<link rel="alternate" type="application/rss+xml" title="${AUTHOR}: blog" href="${SITE}/rss.xml" />`,
  ];
  if (page.published) tags.push(`<meta property="article:published_time" content="${page.published}" />`);
  if (page.jsonLd) tags.push(`<script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, '\\u003c')}</script>`);
  return tags.join('\n    ');
}

// Strip the template's generic title/description/social tags; each page
// writes its own.
function baseHead(html) {
  return html
    .replace(/<title>[^<]*<\/title>\s*/, '')
    .replace(/<meta name="description"[^>]*>\s*/, '')
    .replace(/<meta (property="og:|name="twitter:)[^>]*>\s*/g, '')
    .replace(/<!-- Open Graph[^>]*-->\s*/, '');
}

function writePage(page) {
  const html = baseHead(template)
    .replace('</head>', `    ${head(page)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"><main class="prerender container">${page.body}</main></div>`);
  // <route>.html plus vercel.json cleanUrls: served at /route with no
  // trailing-slash redirect, and the same file layout works in vite preview.
  const file = page.path === '/' ? join(DIST, 'index.html') : join(DIST, `${page.path}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const livePosts = BLOG_POSTS.filter((p) => isPublished(p) && !p.comingSoon && !p.draft);
const bodies = [...SERIES_POSTS, ...EMBEDDED_POSTS, ...AI_SERIES_POSTS];

function postPage(post) {
  const full = bodies.find((b) => b.id === post.id);
  const sources = full?.body?.find((b) => b.type === 'sources')?.items || [];
  const description = post.excerpt || post.title;
  return {
    path: post.route,
    title: post.title,
    description,
    image: post.coverImage || null,
    ogType: 'article',
    published: post.publishAt,
    lastmod: post.publishAt,
    body: `<article><h1>${esc(post.title)}</h1><p><em>${esc(AUTHOR)}, ${esc(post.date)}</em></p>${
      full ? bodyHtml(full.body) : `<p>${esc(description)}</p>`
    }</article>`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description,
      datePublished: post.publishAt,
      author: { '@type': 'Person', name: AUTHOR, url: SITE + '/' },
      image: abs(post.coverImage || DEFAULT_IMAGE),
      mainEntityOfPage: abs(post.route),
      keywords: (post.tags || []).join(', '),
      citation: sources.filter((s) => s.url).map((s) => ({ '@type': 'CreativeWork', name: s.title, url: s.url })),
    },
  };
}

const postList = (posts) => `<ul>${posts
  .map((p) => `<li><a href="${esc(p.route)}">${esc(p.title)}</a>: ${esc(p.excerpt || '')}</li>`)
  .join('')}</ul>`;

const projectPages = Object.entries(caseStudies).map(([slug, cs]) => ({
  path: `/projects/${slug}`,
  title: cs.headline,
  description: cs.subhead,
  image: cs.cover || null,
  body: `<article><h1>${esc(cs.headline)}</h1><p>${esc(cs.subhead)}</p></article>`,
}));

const HOME_DESC = 'Barakaeli Lawuo is a computer engineering student at Virginia Tech (Class of 2027) working across cybersecurity, artificial intelligence, and embedded systems.';

const staticPages = [
  {
    path: '/',
    title: 'Home',
    description: HOME_DESC,
    body: `<h1>${AUTHOR}</h1><p>${esc(HOME_DESC)}</p><p><a href="/projects">Projects</a> · <a href="/blog">Blog</a> · <a href="/about">About</a> · <a href="/contact">Contact</a></p>`,
  },
  { path: '/about', title: 'About', description: `About ${AUTHOR}: education, skills, and resume.`, body: `<h1>About ${AUTHOR}</h1><p>${esc(HOME_DESC)}</p>` },
  {
    path: '/projects',
    title: 'Projects',
    description: 'ML pipelines, embedded firmware, PCB designs, and full-stack apps, each written up as a case study.',
    body: `<h1>Projects</h1><ul>${projectPages.map((p) => `<li><a href="${p.path}">${esc(p.title)}</a>: ${esc(p.description)}</li>`).join('')}</ul>`,
  },
  {
    path: '/blog',
    title: 'Blog',
    description: 'Technical writing on how large language models are trained, served, evaluated, and deployed, with sources cited.',
    body: `<h1>Blog</h1>${postList(livePosts)}`,
  },
  { path: '/contact', title: 'Contact', description: `Get in touch with ${AUTHOR}.`, body: '<h1>Contact</h1>' },
  { path: '/privacy', title: 'Privacy', description: 'What this site collects and why.', body: '<h1>Privacy</h1>' },
];

const pages = [...staticPages, ...projectPages, ...livePosts.map(postPage)];
pages.forEach(writePage);

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${(p.lastmod || today).slice(0, 10)}</lastmod></url>`).join('\n')}
</urlset>
`);

writeFileSync(join(DIST, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${SITE}/sitemap.xml
`);

const rssItems = livePosts.slice(0, 50).map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${abs(p.route)}</link>
      <guid>${abs(p.route)}</guid>
      <pubDate>${new Date(p.publishAt).toUTCString()}</pubDate>
      <description>${esc(p.excerpt || '')}</description>
    </item>`).join('\n');
writeFileSync(join(DIST, 'rss.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${AUTHOR}: blog</title>
    <link>${SITE}/blog</link>
    <description>Technical writing on large language models, with sources cited.</description>
    <language>en</language>
${rssItems}
  </channel>
</rss>
`);

// llms.txt (https://llmstxt.org): a plain index an AI assistant can read in
// one request instead of crawling the SPA.
writeFileSync(join(DIST, 'llms.txt'), `# ${AUTHOR}

> ${HOME_DESC} The blog explains how large language models are trained, served, and evaluated, with sources cited.

## Blog posts

${livePosts.map((p) => `- [${p.title}](${abs(p.route)}): ${p.excerpt || ''}`).join('\n')}

## Projects

${projectPages.map((p) => `- [${p.title}](${abs(p.path)}): ${p.description}`).join('\n')}

## Pages

- [About](${SITE}/about)
- [Contact](${SITE}/contact)
`);

console.log(`prerendered ${pages.length} pages (${livePosts.length} posts, ${projectPages.length} projects); wrote sitemap.xml, rss.xml, llms.txt, robots.txt`);
