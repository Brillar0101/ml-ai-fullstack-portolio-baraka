// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "retrieval-algorithms",
  "title": "Retrieval: keyword, embeddings, and hybrid",
  "excerpt": "Three ways to find relevant text, each with a blind spot. Why the best systems use more than one.",
  "category": "AI",
  "chapter": "Chapter 6",
  "tags": [
    "Retrieval",
    "Search",
    "RAG"
  ],
  "seriesNum": 29,
  "publishAt": "2026-06-17T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Imagine a support team upgrading their help search to a shiny new embedding-based system. The demos are great, until a customer searches for the exact error code \"ERR_4011\" and gets nothing useful. The old dumb keyword search would have found it instantly, because the code appears verbatim in one document."
    },
    {
      "type": "p",
      "text": "The new smart system understood meaning beautifully and fumbled an exact match. Retrieval sounds like one thing, but there are a few ways to do it, and they fail in opposite directions. Knowing the trade is how you stop a RAG system from missing answers that should have been easy."
    },
    {
      "type": "h2",
      "text": "The intuition: matching words versus matching meaning"
    },
    {
      "type": "p",
      "text": "There are two fundamentally different ways to decide whether a passage is relevant. The old way, keyword search, matches the actual words: it finds passages that literally contain the terms in your query. The newer way, embedding or semantic search, matches meaning using the vectors from the embeddings post, so it can find a passage that means the same thing even with entirely different words. These are not two flavors of the same method. They are looking at different things, words versus meaning, which is exactly why they succeed and fail on opposite kinds of queries."
    },
    {
      "type": "h2",
      "text": "Where each one shines and breaks"
    },
    {
      "type": "p",
      "text": "Keyword search is unbeatable on precise, literal terms: product codes, error strings, proper names, anything where the exact characters matter and a paraphrase would be wrong. Its weakness is that it is blind to wording, so it misses a perfect answer that simply used different words than the query. Embedding search is the mirror image. It shines on natural-language questions where the answer is phrased differently from the question, finding \"ending your subscription\" for \"how do I cancel.\" Its weakness is that it can sail right past an exact term it should have nailed, treating \"ERR_4011\" as just another bit of meaning rather than a string that must match. Each method's strength is the other's blind spot."
    },
    {
      "type": "h2",
      "text": "Walk the error-code fix"
    },
    {
      "type": "p",
      "text": "Replay the support team. Their pure-embedding system understood meaning but had no special respect for the literal string \"ERR_4011,\" so the code did not stand out and the right document never surfaced."
    },
    {
      "type": "p",
      "text": "The fix is not to abandon embeddings and go back to keyword, which would relapse on natural questions. It is hybrid search: run both a keyword search and an embedding search, then combine their results. The keyword side catches the exact error code, the embedding side catches the conversational questions, and merged together they cover both. After the switch, \"ERR_4011\" returns the right page and \"my app keeps crashing on startup\" still finds the relevant troubleshooting passage. Neither method alone could do both."
    },
    {
      "type": "h2",
      "text": "The search terms behind search"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Keyword retrieval",
          "def": "finding passages that share the exact words of the query, like classic search. Great for literal terms, blind to paraphrase."
        },
        {
          "term": "Semantic retrieval",
          "def": "finding passages with similar meaning using embeddings, even when the words differ. Great for natural questions, weak on exact strings."
        },
        {
          "term": "Hybrid retrieval",
          "def": "running both keyword and semantic search and combining the results to get the strengths of each."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Picking a retriever for your data"
    },
    {
      "type": "p",
      "text": "A simple way to decide: think about what your queries actually look like. If they hinge on exact terms, part numbers, codes, names, identifiers, lean on keyword search, because a paraphrase there is a wrong answer. If they are natural-language questions where people will phrase things every which way, lean on embeddings. And when in doubt, which is most of the time, hybrid is the safe default, because real users send a mix of both and hybrid covers the gap either pure method would leave. Hybrid costs a little more to run, since you are doing two searches and merging, and for most production systems that cost is well worth not missing obvious answers."
    },
    {
      "type": "h2",
      "text": "A note on the merge step"
    },
    {
      "type": "p",
      "text": "Hybrid is not quite as simple as \"run both and concatenate,\" and the one extra idea worth knowing is how the two result lists get combined. Keyword and embedding searches produce scores that are not directly comparable, so you need a way to fairly blend two ranked lists into one. There are standard, well-worn techniques for this that you mostly get for free from a search library or vector database, so you rarely implement it by hand. The point to carry is just that combining is a real step with sensible defaults, not an afterthought, and that you do not have to invent it yourself to benefit from hybrid retrieval."
    },
    {
      "type": "lab",
      "height": 460,
      "title": "Two retrievers failing on opposite queries, then fused",
      "caption": "Embedding search picks the wrong document for the error code, because a bare product code carries no topic to match on. Keyword search rescues it. On the plain-English question the roles reverse.",
      "code": "import math\n\n# Keyword search and embedding search, each failing on\n# exactly the query the other one handles, and a hybrid that\n# covers both. The embeddings are written by hand over three\n# traits so you can see why each method lands where it does.\n# [ billing, auth, crashes ]\nDOCS = [\n    (\"d1\", \"Error ERR_4011 means the session token expired. Sign in again.\",\n           [0.1, 0.9, 0.2]),\n    (\"d2\", \"If the app closes unexpectedly on startup, clear the cache and reopen.\",\n           [0.2, 0.3, 0.9]),\n    (\"d3\", \"Ending your subscription takes effect at the next billing date.\",\n           [0.9, 0.1, 0.0]),\n]\n\n# An embedding model given the bare string \"ERR_4011\" has\n# nothing to work with: it is not a word, it carries no\n# topic, so the vector comes out vague. That vagueness is\n# the failure this lab is about.\nQUERIES = {\n    \"ERR_4011\":                         [0.6, 0.3, 0.5],\n    \"my app keeps crashing on startup\": [0.1, 0.2, 0.95],\n}\n\ndef keyword_score(q, text):\n    qw = {w.strip(\".,?\").lower() for w in q.split()}\n    tw = {w.strip(\".,?\").lower() for w in text.split()}\n    return len(qw & tw) / (len(qw) + 1e-9)\n\ndef cosine(a, b):\n    dot = sum(x * y for x, y in zip(a, b))\n    na = math.sqrt(sum(x * x for x in a)); nb = math.sqrt(sum(y * y for y in b))\n    return dot / (na * nb + 1e-9)\n\ndef normalise(scores):\n    lo, hi = min(scores.values()), max(scores.values())\n    if hi - lo < 1e-9:\n        return {k: 0.0 for k in scores}\n    return {k: (v - lo) / (hi - lo) for k, v in scores.items()}\n\nKEYWORD_WEIGHT = 0.6      # exact terms are trusted a little harder than topic\n\nfor q, qvec in QUERIES.items():\n    kw = {d[0]: keyword_score(q, d[1]) for d in DOCS}\n    em = {d[0]: cosine(qvec, d[2]) for d in DOCS}\n    nk, ne = normalise(kw), normalise(em)\n    hy = {k: KEYWORD_WEIGHT * nk[k] + (1 - KEYWORD_WEIGHT) * ne[k] for k in kw}\n    best = lambda s: max(s, key=s.get)\n\n    print('query: \"%s\"' % q)\n    print(\"   %-11s %-32s -> %s\" % (\"keyword\",\n          \"  \".join(\"%s %.2f\" % (k, v) for k, v in kw.items()), best(kw)))\n    print(\"   %-11s %-32s -> %s\" % (\"embedding\",\n          \"  \".join(\"%s %.2f\" % (k, v) for k, v in em.items()), best(em)))\n    print(\"   %-11s %-32s -> %s\" % (\"hybrid\",\n          \"  \".join(\"%s %.2f\" % (k, v) for k, v in hy.items()), best(hy)))\n    print()\n\nprint(\"On the error code, embedding search picks the wrong document: with no\")\nprint(\"topic to grab onto it spreads its bet and lands on d2. Keyword search\")\nprint(\"gets it instantly, because the string is right there.\")\nprint(\"On the plain-English question, keyword search only limps to the answer\")\nprint(\"through the words 'app', 'on' and 'startup', while embedding is certain.\")\nprint(\"Weighted together, both queries land on the right document.\")\n\n# Try it: set KEYWORD_WEIGHT to 0.2 and the error code query\n# breaks again. There is no universally correct weight,\n# which is why this is a thing you tune against your own\n# traffic rather than copy from a tutorial.\n"
    },
    {
      "type": "h2",
      "text": "One more step: re-ranking"
    },
    {
      "type": "p",
      "text": "There is a useful refinement worth knowing once hybrid is in place, called re-ranking. The idea is to retrieve generously and then sort carefully. First you let keyword and embedding search pull a wider net of candidate passages, say the top twenty, optimizing to not miss the right one."
    },
    {
      "type": "p",
      "text": "Then a second, more careful model looks at the query and each candidate together and re-scores them for actual relevance, and you keep only the best few to send to the model. The first stage is fast and a little blunt, the second is slower and sharper, and splitting the work this way often beats trying to get the ranking perfect in one pass. You do not need it on day one, but when good answers are getting retrieved yet buried below worse ones, re-ranking is the standard fix."
    },
    {
      "type": "h2",
      "text": "How many to retrieve"
    },
    {
      "type": "p",
      "text": "A small decision that quietly matters is how many passages you feed the model. Too few and you risk leaving out the chunk that held the answer. Too many and you drown the model in mostly-irrelevant text, which costs more tokens and, as the context-length post warned, makes the model more likely to lose the important part in the middle."
    },
    {
      "type": "p",
      "text": "There is no universal right number, but the instinct to \"send everything just in case\" is usually wrong. A handful of high-quality passages typically beats a large pile, because precision in what you retrieve translates directly into precision in what the model answers. Tune this by watching real questions, the same way you tune chunk size."
    },
    {
      "type": "h2",
      "text": "Hybrid beats dogma"
    },
    {
      "type": "p",
      "text": "There is no single best retriever, only trade-offs that run in opposite directions. Keyword search owns exact terms and misses paraphrase, embedding search owns meaning and fumbles exact strings, and most strong systems blend the two rather than betting on one, then re-rank and send only the best few passages. If your RAG system is mysteriously missing answers that obviously exist in your documents, the cause is very often a retrieval method that is blind to the kind of query you just sent, and hybrid search is usually the cure."
    }
  ]
};
