// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "chunking-for-rag",
  "title": "Chunking: the unglamorous heart of good RAG",
  "excerpt": "How you split documents decides what your system can retrieve. Get chunking wrong and nothing downstream saves you.",
  "category": "AI",
  "chapter": "Chapter 6",
  "tags": [
    "RAG",
    "Chunking",
    "Retrieval"
  ],
  "seriesNum": 28,
  "publishAt": "2026-06-10T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Picture a RAG system built over a company handbook that keeps giving half-answers. Asked about parental leave, it returns a passage that starts mid-sentence about eligibility and cuts off right before the actual number of weeks. The model is fine, the embeddings are fine, and the answer is genuinely not retrievable, because the policy got split down the middle when the document was cut into pieces. People obsess over which embedding model to use and skip the humble step that quietly decided their fate: how you cut your documents into chunks. Bad chunking caps the quality of everything downstream, and no clever model recovers from it."
    },
    {
      "type": "h2",
      "text": "The intuition: retrievers fetch pieces, not documents"
    },
    {
      "type": "p",
      "text": "Here is the thing people miss. A retriever does not hand the model whole documents, it hands it chunks, the pieces you chopped your documents into ahead of time. Each chunk gets its own embedding and is retrieved as a unit. That means the chunk is the smallest thing your system can find, so if the answer to a question is spread across two chunks, or buried in a chunk that is mostly about something else, retrieval struggles. The quality ceiling of the whole system is set at the moment you decide where to cut, long before any query arrives."
    },
    {
      "type": "h2",
      "text": "Why too big and too small both fail"
    },
    {
      "type": "p",
      "text": "Chunk size is a balance with a failure mode on each end. Make chunks too big and a single chunk covers several topics at once, so its embedding becomes a blur that is a little bit about everything and a strong match for nothing. Ask a precise question and the right giant chunk may not stand out, and even when it is retrieved, the model has to wade through a lot of unrelated text to find the answer. Make chunks too small and you lose the context that gave the text meaning: a sentence pulled out of its paragraph can be retrieved and still be useless, because the detail that made it an answer lived in the sentence before it. The art is landing in between, chunks each about roughly one thing and big enough to stand on their own."
    },
    {
      "type": "h2",
      "text": "Walk the handbook fix"
    },
    {
      "type": "p",
      "text": "Go back to the parental-leave problem. The naive setup chopped the handbook every 500 characters regardless of meaning, which is what sliced the policy in half."
    },
    {
      "type": "p",
      "text": "The fix is to cut along the document's natural boundaries instead: by section and paragraph, so the whole parental-leave policy lands in one coherent chunk that begins and ends where the topic does. To protect against ideas that straddle a boundary anyway, you add a little overlap, repeating a sentence or two between adjacent chunks, so a thought split at the seam still shows up whole in one of them. Re-chunked that way, the parental-leave question now retrieves a single clean passage with the number of weeks in it. Nothing about the model changed. The cut did."
    },
    {
      "type": "h2",
      "text": "Chunking, term by term"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Chunk",
          "def": "a piece of a document that gets embedded and retrieved as a single unit. The smallest thing your retriever can find."
        },
        {
          "term": "Overlap",
          "def": "repeating a little text between adjacent chunks so an idea split across a boundary is still retrievable in one piece."
        },
        {
          "term": "Chunking strategy",
          "def": "the rule for where to cut: by fixed size, by sentence, by paragraph, or by the document's own structure."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Practical guidance"
    },
    {
      "type": "ul",
      "items": [
        "**Cut along natural boundaries** like paragraphs and sections, not blindly by character count, so a chunk is a coherent unit of meaning.",
        "**Keep each chunk about roughly one idea,** so its embedding is a sharp match for questions on that idea rather than a blur.",
        "**Add a little overlap** between adjacent chunks so a thought split at a boundary still appears whole somewhere.",
        "**Test retrieval on real questions** and adjust chunk size from what you actually see come back, rather than guessing once and forgetting it."
      ]
    },
    {
      "type": "h2",
      "text": "Why this is the unglamorous high-leverage work"
    },
    {
      "type": "p",
      "text": "Chunking gets ignored because it is boring next to choosing a fancy embedding model, and that is exactly backwards. The embedding model can only work with the pieces you give it, so a great model fed badly cut chunks still fails, while a modest model fed clean, coherent chunks does well. This is one of those places where the dull, upstream decision dominates the flashy, downstream one. Teams that struggle with RAG quality have, more often than not, a chunking problem they have not noticed, because the symptom, half-answers and near-misses, looks like a model problem when it is really a cutting problem."
    },
    {
      "type": "h2",
      "text": "Different documents want different cuts"
    },
    {
      "type": "p",
      "text": "There is no single chunk size right for everything, because documents differ in structure. A handbook of prose chunks nicely by paragraph and section. Code does not, because slicing a function in half destroys it in a way a paragraph break never would. A table is meaningless once you separate its rows from the header that labels them."
    },
    {
      "type": "p",
      "text": "A long conversation transcript chunks better by speaker turn or topic shift than by raw character count. The practical upshot is that chunking is not a setting you copy from a tutorial and forget. It is a decision you make per kind of document, by asking what a coherent, self-contained piece of that specific content actually is. The fixed-size chopper is a fine starting point and a poor finishing one, and the distance between them is often the distance between a RAG demo and a RAG product."
    },
    {
      "type": "h2",
      "text": "How to debug a chunking problem"
    },
    {
      "type": "p",
      "text": "The reason chunking problems are so often missed is that they masquerade as model problems, so the debugging move is to look one step earlier than you want to. When an answer is wrong or half-right, do not immediately blame the model. First look at the exact chunks the retriever pulled for that question. Very often you will see the issue plainly: the answer was split across two chunks, or the retrieved chunk is mostly about a neighboring topic, or the key sentence got stranded without its context. Reading the retrieved chunks for a handful of failing questions tells you in minutes whether you have a chunking problem or a genuine model problem, and it saves you from tuning prompts to fix something a better cut would have solved."
    },
    {
      "type": "h2",
      "text": "Cut where the meaning cuts"
    },
    {
      "type": "p",
      "text": "Spend time on chunking before you fuss over embedding models, because the cleanest retriever in the world cannot find an answer your chunking scattered across two pieces. Cut along natural boundaries, match the strategy to the kind of document, keep each chunk about one thing, add a little overlap, and test on real questions by reading the chunks that actually come back. It is the least glamorous step in building RAG and frequently the one that decides whether the whole thing works."
    }
  ]
};
