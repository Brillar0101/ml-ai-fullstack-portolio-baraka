export const POST = {
  id: 'cag-vs-rag',
  title: 'CAG vs RAG: When to Preload the Whole Knowledge Base Instead of Retrieving',
  excerpt: 'A small HR policy bot kept answering with half the story because retrieval fetched the wrong paragraph. The fix was not a better retriever. It was skipping retrieval and loading every policy into the model at once.',
  category: 'AI',
  tags: ['RAG', 'CAG', 'KV Cache'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'An employee asks the internal HR bot a simple question. "How many days of paternity leave do I get, and does it change if I have been here less than a year?" The bot answers with the paternity number, sounds confident, and stops. It never mentions the tenure rule, which lives one paragraph down in the same policy. The employee takes the answer at face value, plans around it, and later finds out the real number was different for someone in their first year. The policy document had the full answer the whole time. The bot just never saw the part that mattered.'
    },
    {
      type: 'p',
      text: 'This is a retrieval problem, and it shows up constantly in small bots built on top of a fixed set of documents. The system was built with **RAG**, so before answering it searched the policy library, pulled back the chunks it judged most relevant, and fed only those chunks to the model. The search ranked the paragraph about leave length above the paragraph about tenure. The model answered well given what it was handed. The failure happened before generation, in the step that decided what the model got to read.'
    },
    {
      type: 'h2',
      text: 'The whole binder is on the desk, not in the archive'
    },
    {
      type: 'p',
      text: 'Here is the intuition that fixes it. Imagine a new hire at a help desk. In one setup, every policy sits in a filing cabinet down the hall, and for each question the hire runs to the cabinet, grabs the two or three pages they think are relevant, and answers from those. If they grab the wrong pages, they answer wrong, even though the right page exists. In the other setup, the entire policy binder is open flat on the desk in front of them. Every question gets answered against the full binder. No trip to the cabinet, no guessing which pages to pull, no chance of leaving the tenure rule in the drawer.'
    },
    {
      type: 'p',
      text: 'The second setup is **CAG**, Cache-Augmented Generation. Instead of retrieving a slice of your knowledge for each query, you load the entire knowledge base into the model\'s context one time, and every question is answered against all of it. There is no retrieval step to get wrong. The tradeoff is obvious the moment you say it out loud. This only works if the whole binder actually fits on the desk. For a company handbook that is a few dozen pages, it fits. For a legal database of ten million documents, it does not, and you are back to the filing cabinet.'
    },
    {
      type: 'h2',
      text: 'Walking one question through both systems'
    },
    {
      type: 'p',
      text: 'Take the paternity leave question and run it through each. In the RAG version, the query is turned into a vector, compared against the stored policy chunks, and the top matches come back. Say the retriever returns the three highest-scoring chunks. If the tenure clause ranks fourth, it is silently dropped. The model receives the question plus three chunks and writes a fluent, incomplete answer. Nothing errored. The context was just missing a piece.'
    },
    {
      type: 'p',
      text: 'In the CAG version, there is no ranking and no top-three cutoff. At startup the system takes the full policy set, maybe forty pages of text, and places all of it in the context ahead of the question. When the paternity question arrives, the model reads the leave paragraph and the tenure paragraph together, because both are sitting in front of it, and answers with the full picture. The thing that made the RAG bot fail, deciding what to include, simply does not happen. That is the win for a small, stable corpus like an HR handbook.'
    },
    {
      type: 'p',
      text: 'It helps to be precise about what changed between the two runs. The model is identical. The prompt template is nearly identical. The only real difference is the set of documents the model is allowed to read at answer time. RAG narrows that set with a search it might get wrong. CAG hands over the whole set and lets the model do the narrowing internally, using its own attention over the full text rather than a separate ranking model that was never trained on your exact question. When the corpus is small enough that the model can hold all of it comfortably, moving the narrowing job inside the model tends to be more reliable than doing it outside with a retriever that only sees a query and some vectors.'
    },
    {
      type: 'terms',
      items: [
        { term: 'CAG (Cache-Augmented Generation)', def: 'A pattern where the entire knowledge base is loaded into the model\'s context once and every query is answered against it, with no per-query retrieval step.' },
        { term: 'Context window', def: 'The maximum amount of text, measured in tokens, a model can hold and attend to at once. It sets the hard ceiling on how big a knowledge base CAG can preload.' },
        { term: 'KV cache preloading', def: 'Running the model over the loaded documents one time and saving the intermediate key and value tensors, so later queries reuse that work instead of reprocessing every document from scratch.' },
        { term: 'Retrieval latency', def: 'The time spent on the search step in RAG: embedding the query, scanning the index, and fetching chunks, all before the model starts generating.' }
      ]
    },
    {
      type: 'h2',
      text: 'Where the KV cache does the heavy lifting'
    },
    {
      type: 'p',
      text: 'A fair objection to CAG is that stuffing forty pages in front of every question sounds slow and wasteful. If the model had to reread all forty pages from scratch on every query, it would be. This is where the cache in the name earns its place. When a transformer reads text, it computes a set of key and value vectors for each token, and that computation is the expensive part. CAG runs the documents through the model once, captures that **KV cache**, and holds onto it. Every later question reuses the cached vectors for the documents and only computes fresh work for the new question and the answer.'
    },
    {
      type: 'p',
      text: 'So the cost of reading the whole binder is paid a single time, up front, not once per query. This is the same KV cache idea that makes long chat sessions feel responsive, applied on purpose to a fixed body of reference text. You pay a one-time preload, then answers come back without a retrieval round trip and without reprocessing the corpus. The latency you would have spent searching an index on every question is gone, because there is no search.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'The two request shapes, side by side',
      code: `# RAG: search first, then answer against a slice
def answer_rag(question, index, model):
    chunks = index.search(question, top_k=3)   # retrieval step
    context = "\\n".join(chunks)                 # only the top matches
    return model.generate(context, question)

# CAG: preload everything once, answer against all of it
POLICIES = load_all_policies()                 # the full binder
KV = model.preload(POLICIES)                    # KV cache, built one time

def answer_cag(question, model, kv=KV):
    # no search, no top_k, nothing dropped
    return model.generate_with_cache(kv, question)`
    },
    {
      type: 'p',
      text: 'The difference is small in code and large in behavior. The RAG function has a decision baked into it, top_k=3, and that number is exactly where the HR bot lost the tenure clause. The CAG function has no such knob because it never chooses. Notice too that the preload happens outside the request path, so the per-question path is shorter.'
    },
    {
      type: 'diagram',
      title: 'Which one should this corpus use?',
      root: {
        label: 'Does the whole corpus fit in the context window?',
        color: 'purple',
        children: [
          {
            edge: 'No',
            node: { label: 'Use RAG (retrieve per query)', color: 'yellow' }
          },
          {
            edge: 'Yes, and it rarely changes',
            node: { label: 'Use CAG (preload the KV cache)', color: 'yellow' }
          },
          {
            edge: 'Yes, but it changes constantly',
            node: { label: 'Use RAG (rebuilding the cache too often)', color: 'yellow' }
          }
        ]
      },
      caption: 'CAG wins only when both conditions hold: the corpus fits, and it is stable. Fail either one and RAG is the safer default.'
    },
    {
      type: 'h2',
      text: 'The mistakes people make reaching for CAG'
    },
    {
      type: 'p',
      text: 'The first mistake is using corpus size as the only test. A knowledge base can be small enough to fit and still be a bad fit for CAG if it changes hourly. Every change means rebuilding the KV cache, and if you rebuild constantly you have traded a search step for a reprocessing step that may cost more. Pricing tables, live inventory, and anything with a daily edit cadence lean back toward RAG, where you update one chunk in an index instead of reheating the whole cache.'
    },
    {
      type: 'p',
      text: 'The second mistake is ignoring the per-call token cost. CAG carries the full corpus in context on every request, so each answer is billed against all those tokens, not just the handful RAG would have retrieved. For a forty-page handbook answered a few thousand times a day, that is cheap and worth it. Scale the corpus up or the traffic up and the math flips, because you are paying to ship the entire binder through the model on every single question. The third mistake is assuming CAG removes the need to think about what the model reads. It does not remove that concern, it front-loads it. If the corpus is noisy or contradictory, CAG hands the model all the noise at once instead of a filtered slice.'
    },
    {
      type: 'callout',
      title: 'The decision rule in one line',
      text: 'If your knowledge base fits in the context window and rarely changes, preload it with CAG and skip retrieval. If it is large or updates often, retrieve per query with RAG. The HR handbook fit both conditions, which is exactly why CAG closed the gap that a better retriever never would have.'
    },
    {
      type: 'p',
      text: 'Back to the HR bot. Swapping it from RAG to CAG did not make the model smarter. It removed the step that was throwing away the answer. Forty pages of policy fit inside a long context window with room to spare, and the handbook is updated a few times a year, not a few times an hour. Both conditions held, so preloading was the right call. The takeaway is not that CAG beats RAG. It is that retrieval is a tool you can choose to skip, and for a small, stable body of knowledge, skipping it removes an entire class of failure for free.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Chan et al., Don\'t Do RAG: When Cache-Augmented Generation is Enough for Knowledge Tasks (2024)', url: 'https://arxiv.org/abs/2412.15605' },
        { title: 'Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (2020)', url: 'https://arxiv.org/abs/2005.11401' }
      ]
    }
  ]
};
