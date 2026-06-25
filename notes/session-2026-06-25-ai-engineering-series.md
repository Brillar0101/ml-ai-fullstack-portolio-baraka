# Session memory — AI Engineering series build (2026-06-25)

A record of the work and decisions from the session that built the AI
Engineering content system, so a future session can pick up with full context.

## What was built

- **A hands-on blog + demo series** on building with foundation models, written
  as original teaching content (own explanations and example code, no excerpts
  from any source).
- **26 series blog posts**, each 1000+ words, following a fixed teaching spine:
  concrete real scenario, plain-language intuition, a walked example, defined
  terms, the mechanism, and a takeaway. Key terms are bolded.
- **1 interactive demo** at `/demos/sampling`: temperature / top-k / top-p
  sliders with a live distribution, plus an in-browser Python lab.
- **An in-browser Python runtime** (`src/components/labs/PythonLab.jsx`) using
  Pyodide, so labs run client-side with no backend.

## Key architecture

- Blog content is **data-driven**: posts live as objects in
  `src/data/seriesPosts.js` and render through `src/pages/blog/SeriesPost.jsx`.
  New posts = new data, no new components. The renderer supports `**bold**`.
- Two hand-built posts remain as components: `AIAgentPost`, `SamplingPost`.
- Demos are registered in `src/data/demos.js`; each demo requires a companion
  `blog` field. Demo pages live in `src/pages/demos/`.
- **Date-gated drip publishing** (`src/lib/publishing.js`): every post has a
  `publishAt`; it only shows once that date passes. `BlogPage` filters the list,
  and `BlogPostPage` redirects future-dated posts, so a scheduled post is hidden
  from both the list and its direct URL until its day.
- The "Demo" tab is in the main nav; `/demos` lists published demos.

## Publishing state

- 20 posts are scheduled **one per day, 2026-06-26 through 2026-07-15**, hidden
  until their date. The rest are live now.
- There is no "coming soon" state by design: a post is either out or it is not.

## The authoring skill

- `~/.claude/skills/lab-writeup/SKILL.md` is the single source of truth for
  writing posts and demos. It enforces: original content only, blog-can-stand-
  alone but demo-needs-a-blog, define terms first, humanize (no em dashes, no
  rule-of-three), anchor every post in a concrete real scenario, minimum 1000
  words, and the file mechanics above.

## Decisions worth remembering

- Do not name or reference any source book in the content or UI.
- Real incidents are used as scenarios, in original words and accurately (e.g.
  the Remoteli bot injection, the Mata v. Avianca fake-citations case, the Air
  Canada chatbot ruling, the Bard demo error, AutoGPT looping, llama.cpp 4-bit).
- Body paragraphs are justified site-wide; the "More blogs" sidebar is capped at
  4 with one-line titles so it never overruns the article.
- Word-count verification uses a node script that counts quoted strings of 4+
  words (it slightly undercounts, so aim a bit over 1000).

## Backlog

- See `content/ideas.md` for ~34 planned ideas (≈9 demos, rest blogs) grouped by
  theme. Next up: finish the 3 stubbed demos (tokenization, embeddings-search,
  quantization), then the high-impact new demos (attention, few-shot, batching,
  numerical formats), then keep the daily drip stocked.
