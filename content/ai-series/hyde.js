export const POST = {
  id: 'hyde',
  title: 'HyDE: Retrieve With a Made-Up Answer Instead of the Question',
  excerpt: 'Short questions and long answer passages live in different neighborhoods of embedding space. HyDE closes that gap by drafting a fake answer first, then searching with it.',
  category: 'AI',
  tags: ['RAG', 'Retrieval', 'Embeddings'],
  readTime: '7 min read',
  body: [
    {
      type: 'p',
      text: 'Picture a support engineer typing into your internal knowledge base: **"how do I rotate my API keys"**. Somewhere in your docs sits the exact passage that answers this. It is titled "Credential lifecycle management" and it walks through generating a replacement secret, updating the dependent services, and revoking the old value after a grace window. The answer is right there. But your retrieval system returns three unrelated pages about rate limiting, and the engineer walks away thinking the docs are useless.'
    },
    {
      type: 'p',
      text: 'Nothing is broken in the usual sense. The embedding model works, the vector index works, the similarity search works. The failure is quieter than that. The question and its own answer barely share any words, and that mismatch is enough to sink the search.'
    },
    {
      type: 'p',
      text: 'I want to sit with this failure for a moment because it is easy to blame the wrong thing. When retrieval misses, the reflex is to swap embedding models, re-chunk the documents, or bolt on a reranker. Those steps sometimes help. But if the root cause is that your query and your answer are shaped differently, none of them touch it directly. You can buy a better map of the city and still be standing in the wrong neighborhood. HyDE is one of the cleaner ways to walk to a better starting point before you even open the map.'
    },
    {
      type: 'h2',
      text: 'Why a good question can point at the wrong passage'
    },
    {
      type: 'p',
      text: 'Standard retrieval-augmented generation embeds the user question into a vector, then looks for stored document chunks whose vectors sit nearby. The quiet assumption is that a question lands close to its answer in that space. Often it does. But questions and answers are different kinds of text. A question is short, uses casual verbs, and names the goal. An answer passage is longer, uses precise nouns, and describes a procedure. "How do I rotate my API keys" and "Credential lifecycle management: generating a replacement secret and revoking the prior value" are talking about the same thing, yet they look almost nothing alike on the surface.'
    },
    {
      type: 'p',
      text: 'Embedding models pick up on that surface difference. The question drifts toward other short, casual, question-shaped text. The answer sits with other formal, procedural text. Even a strong model leaves a real gap between the two. When you search using only the raw question vector, you are searching from the wrong neighborhood, and the passage you need is a street over.'
    },
    {
      type: 'p',
      text: 'It helps to name the effect. Embeddings are trained to place text with similar meaning close together, but "similar meaning" is learned from data, and most of that signal comes from words and phrasing. Two texts about the same topic that use different words can still end up far apart, especially when one is a terse request and the other is a detailed writeup. The shorter the query, the fewer anchors the model has to work with, so a five-word question is unusually fragile. This is why a search that works fine for a paragraph-long query can quietly fall apart for a quick one-liner from a rushed engineer.'
    },
    {
      type: 'p',
      text: 'This is the core problem HyDE was built to solve. If the question is a bad probe, maybe the fix is to stop searching with the question at all.'
    },
    {
      type: 'p',
      text: 'Before we get to the technique, it is worth being honest about scope. HyDE does not fix bad documents, missing content, or a poorly tuned index. If the answer simply is not written down anywhere, no amount of clever probing will conjure it. What HyDE addresses is a specific and common failure: the answer exists, it is indexed, and the search still walks past it because the query does not resemble it. Keep that boundary in mind so you reach for the tool when it actually applies.'
    },
    {
      type: 'h2',
      text: 'The trick: answer the question badly on purpose, then search with that'
    },
    {
      type: 'p',
      text: 'HyDE stands for Hypothetical Document Embeddings. The idea is almost cheeky. Before touching your document store, you hand the question to a language model and ask it to write an answer. Not a correct answer necessarily, just a plausible one that reads like the kind of passage that would live in your docs.'
    },
    {
      type: 'p',
      text: 'For our key-rotation question, the model might produce something like: "To rotate your API keys, generate a new key from the credentials dashboard, update every service that references the old key, then revoke the previous key after confirming traffic has moved over. Keep a short overlap window so nothing breaks during the switch." The model may have invented the exact button name. It may be wrong about the overlap window. That does not matter yet.'
    },
    {
      type: 'p',
      text: 'What matters is the shape. This drafted paragraph is long, procedural, and full of the same nouns your real documentation uses: generate, revoke, credentials, services, overlap window. It reads like an answer because it is trying to be one. So when you embed this draft instead of the bare question, its vector lands in the answer neighborhood, right next to your genuine "Credential lifecycle management" page. You search from there and finally pull back the real passage.'
    },
    {
      type: 'p',
      text: 'Notice the sleight of hand. The language model does not need to know your specific product to be useful here. It has read enough documentation in its training to know roughly how a key-rotation answer is worded, even if it has never seen yours. That general sense of "what an answer looks like" is exactly what you borrow. You are not asking the model to be correct. You are asking it to be shaped like the target, and models are good at that even when they are shaky on the facts.'
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'User question', detail: '"how do I rotate my API keys"' },
        { label: 'LLM drafts a fake answer', detail: 'plausible passage, maybe wrong facts' },
        { label: 'Embed the draft', detail: 'vector lands in answer-space' },
        { label: 'Retrieve real docs', detail: 'nearest genuine passages' },
        { label: 'Generate grounded answer', detail: 'facts come from real docs, not the draft' }
      ],
      caption: 'The draft is a search probe, not the final answer. Real retrieved docs supply the facts.'
    },
    {
      type: 'p',
      text: 'The made-up answer is discarded once retrieval finishes. It never reaches the user. Its only job was to point the search in a better direction. The final response is written from the real documents you pulled back, so any errors in the draft get washed out by grounded, factual sources.'
    },
    {
      type: 'terms',
      items: [
        { term: 'HyDE', def: 'Hypothetical Document Embeddings. Draft a fake answer to the query with an LLM, embed that draft, and retrieve documents similar to it rather than to the raw question.' },
        { term: 'Query-document mismatch', def: 'The gap in embedding space between a short question and the longer passage that answers it, caused by their different length, tone, and vocabulary.' },
        { term: 'Hypothetical document', def: 'The throwaway answer the LLM writes before retrieval. It supplies answer-shaped vocabulary for the search and is never shown to the user.' }
      ]
    },
    {
      type: 'h2',
      text: 'Wiring it up in about twenty lines'
    },
    {
      type: 'p',
      text: 'Mechanically, HyDE adds one model call in front of your normal retrieval loop. You generate a draft, embed the draft, and feed that vector to the same vector search you already run. Everything downstream stays the same.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'HyDE retrieval in front of an existing vector store',
      code: `def hyde_retrieve(question, llm, embed, store, k=5):
    # 1. Ask the LLM for a plausible answer passage.
    prompt = (
        "Write a short factual passage that answers "
        f"this question, as if from documentation:\\n{question}"
    )
    draft = llm.generate(prompt)

    # 2. Embed the draft, not the question.
    query_vector = embed(draft)

    # 3. Search the real store with that vector.
    docs = store.nearest(query_vector, k=k)
    return docs

# The draft is a probe. The final answer is grounded
# only in the real docs we just retrieved.
docs = hyde_retrieve("how do I rotate my API keys", llm, embed, store)
answer = llm.generate(build_prompt(question, docs))`
    },
    {
      type: 'p',
      text: 'The original HyDE paper pushed this further and averaged the vectors of several drafts to smooth out any single bad generation. In practice a single draft already helps a lot, and you can add more drafts later if one weird generation ever throws off a search.'
    },
    {
      type: 'p',
      text: 'One design choice worth thinking about is whether to keep the original question in the mix. A common variation embeds both the draft and the raw question, then blends the two vectors or runs two searches and merges the results. This gives you the vocabulary boost from the draft while keeping a tether to what the user literally asked. If your drafts occasionally wander, this hybrid is a gentle safety net that costs almost nothing to add.'
    },
    {
      type: 'h2',
      text: 'Where teams trip over their own HyDE'
    },
    {
      type: 'p',
      text: 'The mistake I see most is treating the draft as the answer. Someone reads the hypothetical passage, notices it looks fluent, and pipes it straight to the user. Now you are shipping a hallucination. The draft exists to move the search, nothing more. The user should only ever see text written from retrieved documents. A useful habit is to log the draft separately from the final answer during development so you never confuse the two, then drop it from the response payload entirely once you ship.'
    },
    {
      type: 'ul',
      items: [
        'Skipping the grounding step and returning the draft directly, which serves confident made-up facts.',
        'Running HyDE on queries that already match well, such as exact error strings or product names, where the extra model call only adds latency.',
        'Letting the draft run long. A rambling three-paragraph draft can drift off topic and pull the search vector away from the real answer.',
        'Forgetting the added cost. Every query now includes an extra LLM call, so cache drafts for repeated questions and measure whether recall actually improved.'
      ]
    },
    {
      type: 'callout',
      title: 'A quick gut check',
      text: 'Before adding HyDE, look at your failing queries. If they are short and phrased nothing like the documents that answer them, HyDE will likely help. If they already share vocabulary with your docs, plain retrieval is cheaper and just as good.'
    },
    {
      type: 'p',
      text: 'The reason HyDE works is worth holding onto even if you never ship it. Retrieval quality depends on the two things you compare living in the same kind of space. When your probe and your target are different kinds of text, you can transform the probe until it resembles the target. HyDE does that by borrowing the language model to imagine what an answer looks like, then searching with that imagination instead of the raw question. The facts come later, from real sources. The draft just gets you into the right room.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Gao et al., Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE), 2022', url: 'https://arxiv.org/abs/2212.10496' },
        { title: 'LangChain documentation: Hypothetical Document Embeddings', url: 'https://python.langchain.com/docs/how_to/hypothetical_document_embeddings/' }
      ]
    }
  ]
};
