# Session memory — AI Engineering series build (2026-06-25)

A record of the work and decisions from the session that built the AI
Engineering content system, so a future session can pick up with full context.

## What was built

- **A hands-on blog + demo series** on building with foundation models, written
  as original teaching content (own explanations and example code, no excerpts
  from any source).
- **35 series blog posts** (26 original + 9 backlog ideas built in the
  2026-06-25 continuation), each 1000+ words, following a fixed teaching spine:
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

## Publishing state (rolling rollout, restaged 2026-06-25)

The model changed from "everything queued in the future" to "established
back-catalog + ongoing daily drip", at the user's request.

- **Back-catalog (history, already live):** the original 26 series posts
  (seriesNum 5-30) are backdated **one per week, 2025-12-31 through 2026-06-24**,
  oldest = most foundational (foundation-models) to newest (kv-cache). They look
  like a blog that has been running ~6 months and are all visible now.
- **Daily drip (new content, forward):** backlog ideas publish **one per day
  from 2026-06-26** (seriesNum 31+). The first 10 built land 2026-06-26 through
  2026-07-05 (probabilistic nature, multilingual, domain-specific, functional
  correctness, AI as a judge, jailbreaking, build vs buy, eval pipeline,
  capabilities that matter, information-extraction prompts).
- Two CORE_POSTS in `blog.js`: your-first-ai-agent (March 2026) and
  next-word-sampling (2026-06-25). Left as-is.
- **Convention for new posts:** append before the final `];` in
  `seriesPosts.js`, use the next seriesNum (41+), and take the next open daily
  date (continue from 2026-07-06). Re-date logic keys off seriesNum:
  <=30 weekly history, >=31 daily from 2026-06-26.
- Watch out: 5 posts once had duplicate metadata lines (now cleaned). Keep one
  `readTime/seriesNum/publishAt` line per post.
- There is no "coming soon" state by design: a post is either out or it is not.
- The drip gate is **client-side**: a future-dated post is hidden from the list
  and redirects from its direct URL, but its text still ships in the JS bundle.
  Fine for a personal blog; would need a server/build step to be truly secret.

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

- See `content/ideas.md` for remaining planned ideas, kept current as items
  ship. As of 2026-06-25, the 9 pure-blog ideas above are done.
- Remaining **blogs** (data-only, continue the daily drip): information-
  extraction prompts, RAG architecture, RAG beyond text, agent tools/planning/
  failure modes (3), agent memory, model merging, data synthesis, AI synthesis &
  distillation, inference metrics, AI accelerators, routers/gateways, five-step
  app architecture, observability, designing for user feedback.
- Remaining **demos** (heavier: each needs a React demo page + Pyodide lab +
  companion blog + route + test): the 3 stubbed ones (tokenization, embeddings-
  search, quantization), plus attention, few-shot, batching, numerical formats,
  similarity metrics, Elo arena, memory-math calculator, LoRA, dedup.
- Working order this session: clear the pure blogs on the drip first, then start
  the demos beginning with the 3 stubbed ones.
