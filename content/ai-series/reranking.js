export const POST = {
  id: 'reranking',
  title: 'Reranking: The Cheap Second Pass That Fixes Retrieval',
  excerpt: 'Your right answer keeps landing at rank 8, never in the top 3 you send the model. A reranker reads the query and each chunk together and pulls the good ones up.',
  category: 'AI',
  tags: ['RAG', 'Reranking', 'Retrieval'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A support team shipped a RAG assistant that answered questions about their product docs. It worked, mostly. Then a specific complaint kept coming back: for a whole class of questions about billing edge cases, the assistant gave vague or wrong answers even though the correct paragraph was sitting right there in the knowledge base. Someone finally logged the raw retrieval output instead of just the final answer. The correct passage was being retrieved every single time. It was landing at rank 8. The system only fed the top 3 chunks to the model, so the one paragraph that actually held the answer never made it into the prompt.'
    },
    {
      type: 'p',
      text: 'Nothing was broken in the usual sense. The database was fine, the embeddings were fine, the passage existed and was findable. The problem was ordering. The first pass of retrieval knew the answer was somewhere in the top ten, but it could not tell that rank 8 was better than rank 2. Fixing that gap is what reranking does, and it usually costs you almost nothing to add.'
    },
    {
      type: 'p',
      text: 'This is worth sitting with for a second, because it changes how you debug a RAG system. Most people, when the answer is wrong, assume the answer was not found. They go widen the index, re-chunk the documents, or swap the embedding model. All of that is expensive and often beside the point. The billing team spent two weeks convinced their embeddings were bad. The moment they logged raw ranks instead of final answers, the real shape of the problem showed up: retrieval was doing its job, the ranking was not, and those are two different failures with two different fixes.'
    },
    {
      type: 'h2',
      text: 'Why fast retrieval is only roughly right'
    },
    {
      type: 'p',
      text: 'Here is the intuition. When you build a vector search system, you turn every chunk of your documents into a fixed list of numbers, an embedding, and store it ahead of time. At query time you turn the question into numbers the same way and grab the chunks whose numbers sit closest. This is fast because all the document math is done in advance. You are just measuring distances against vectors that already exist, and specialized indexes let you do that across millions of chunks in a few milliseconds.'
    },
    {
      type: 'p',
      text: 'The speed comes from a compromise. The document got compressed into its vector before anyone knew what question you would ask. That single vector has to stand in for the passage against every possible query. So the match is approximate. It reliably pulls relevant material into a rough shortlist, but the exact order inside that shortlist is noisy. The genuinely best passage might sit at rank 8 while three shallower matches sit above it. For the billing team, that noise was the whole bug.'
    },
    {
      type: 'p',
      text: 'It helps to picture what actually confuses the first pass. A question about being charged twice on an annual plan shares a lot of surface vocabulary with passages about annual plans, about charges, and about billing in general. Those neighbors look close in vector space because they talk about the same things. The one passage that explains the double-charge scenario might use slightly different words and end up looking a touch farther away, even though it is the only one that answers the question. The bi-encoder cannot weigh which topical overlap actually resolves the question, because it never got to read the question and the passage in the same breath. It only compared two summaries.'
    },
    {
      type: 'h2',
      text: 'Two ways to compare a question and a passage'
    },
    {
      type: 'p',
      text: 'The reason the first pass is approximate comes down to how it does the comparison. There are two designs, and the difference matters.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Bi-encoder', def: 'A model that encodes the query and each passage separately, into two independent vectors, then scores them by how close those vectors are. Because passages are encoded ahead of time, one query can be matched against millions of them almost instantly.' },
        { term: 'Cross-encoder', def: 'A model that takes the query and one passage together as a single input and reads them jointly, letting every word in the question attend to every word in the passage. It outputs one relevance score. It is far more accurate and far too slow to run over a whole corpus.' },
        { term: 'Reranking', def: 'A second pass that takes a shortlist of candidates from the first retrieval and reorders it with a more accurate model, usually a cross-encoder, so the strongest passages move to the top few.' },
        { term: 'Two-stage retrieval', def: 'The pattern of retrieving a wide shortlist cheaply, then rescoring only that shortlist with an expensive model. You get broad recall from stage one and sharp precision from stage two.' }
      ]
    },
    {
      type: 'p',
      text: 'A bi-encoder is what your vector database uses. It never sees the query and the passage side by side. It only compares two summaries that were each written in isolation. A cross-encoder reads them together, so it can notice that the passage answers this exact question rather than merely sharing a topic with it. That joint reading is what makes it accurate, and it is also why you cannot use it for the first pass. To score a query against a million passages, a cross-encoder would have to run a million times per query, once for each pair. That is minutes of compute for one search. So you keep it out of the hot path and only let it look at a short list.'
    },
    {
      type: 'h2',
      text: 'The retrieve-then-rerank pipeline'
    },
    {
      type: 'p',
      text: 'Put the two together and you get the standard shape. The bi-encoder casts a wide net and pulls in the top 50 or so candidates fast. The cross-encoder then reads all 50 against the query and rescores them. You keep the top 5 of that reordered list and send only those to the language model. Stage one buys you recall, the near certainty that the right passage is somewhere in the 50. Stage two buys you precision, the confidence that the right passage is now near the top.'
    },
    {
      type: 'p',
      text: 'The split of labor is the clever part. You never ask the slow model to do the impossible job of reading a million passages, and you never ask the fast model to do the delicate job of fine ordering. Each model does the thing it is good at. The bi-encoder is a coarse filter that turns a million candidates into fifty. The cross-encoder is a precise judge that turns fifty into a ranked five. The wider you make that shortlist, the less likely you are to lose the right answer before the judge ever sees it, but the more the judge has to read. Fifty is a common sweet spot. It is wide enough to almost always contain the answer and small enough that the rescoring stays cheap.'
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'Query', detail: 'the user question' },
        { label: 'Retrieve top 50', detail: 'bi-encoder over vector index, fast and approximate' },
        { label: 'Rerank', detail: 'cross-encoder reads query with each candidate' },
        { label: 'Top 5', detail: 'best passages after reordering' },
        { label: 'LLM', detail: 'answers from a tight, high-quality context' }
      ],
      caption: 'Wide and cheap first, narrow and accurate second. The cross-encoder only ever sees 50 candidates, never the full corpus.'
    },
    {
      type: 'p',
      text: 'For the billing bug, this was the entire fix. The correct passage was already in the top 50 from stage one, because recall was never the problem. When the cross-encoder read that passage together with the actual question, it scored it well above the shallow topic matches that had been crowding it out. It moved from rank 8 to rank 1, landed inside the top 5, and reached the model. No new documents, no re-embedding, no prompt rewrite. One rescoring step.'
    },
    {
      type: 'h2',
      text: 'Running a reranker over your candidates'
    },
    {
      type: 'p',
      text: 'In code this is smaller than people expect. You already have your shortlist from the vector search. You pair the query with each candidate, hand every pair to the cross-encoder, and sort by the scores it returns.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'Rerank a shortlist with a cross-encoder',
      code: `from sentence_transformers import CrossEncoder

# a small, fast cross-encoder trained for relevance scoring
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

query = "Why was I charged twice on an annual plan?"

# candidates came from your fast vector search (the top 50)
candidates = retrieve_top_k(query, k=50)  # list of passage strings

# score the query against each candidate, read jointly
pairs = [(query, passage) for passage in candidates]
scores = reranker.predict(pairs)

# sort candidates by the cross-encoder score, best first
ranked = sorted(zip(scores, candidates), reverse=True)

# keep only the few you will actually send to the LLM
top_passages = [passage for _, passage in ranked[:5]]`
    },
    {
      type: 'p',
      text: 'The shape stays the same whether you run a local model like this one or call a hosted rerank endpoint. You send a query and a list of candidates, you get back scores or an ordering, you slice off the top few. The cost is one model pass per candidate, so 50 passes per query, which lands in the tens of milliseconds for a small reranker and stays invisible next to the language model call that follows.'
    },
    {
      type: 'p',
      text: 'One thing worth noticing in that snippet is that the reranker score is not a probability you can compare across queries. It is a relative ranking signal. A score of 4 for one question and a score of 4 for another do not mean the same confidence. What you trust is the order within a single shortlist, not the raw number. If you want a threshold to drop weak candidates, calibrate it on your own data rather than assuming a fixed cutoff transfers between reranker models.'
    },
    {
      type: 'h2',
      text: 'Where teams get this wrong'
    },
    {
      type: 'p',
      text: 'A few mistakes show up again and again once people start adding a reranker.'
    },
    {
      type: 'ul',
      items: [
        'Reranking too few candidates. If stage one only hands over 5 and the answer sat at rank 8, the reranker never sees it and cannot save you. Pull a wide shortlist, then narrow. The reranker can only reorder what it receives.',
        'Treating it as a fix for bad recall. If the right passage is not in the top 50 at all, reranking does nothing. That is a retrieval or chunking problem, and no amount of rescoring invents a passage that was never fetched.',
        'Reranking the entire corpus. The whole point is that cross-encoders are too slow for that. Run the cheap bi-encoder first and only rerank its shortlist. If your rerank latency is climbing, your shortlist is probably too long.',
        'Ignoring chunk size. A reranker reads each candidate in full. If chunks are huge, the joint read gets slower and the relevant sentence gets diluted by surrounding filler. Sensible chunks help both stages.'
      ]
    },
    {
      type: 'callout',
      title: 'The one-line takeaway',
      text: 'First-stage vector search decides what is roughly relevant. A reranker decides what is actually best. When your right answer keeps showing up in retrieval logs but never in the final prompt, you almost certainly have an ordering problem, and a cross-encoder second pass over the top 50 is the cheapest fix you will find.'
    },
    {
      type: 'p',
      text: 'Reranking is not glamorous and it does not need to be. It is a small, well-understood step that sits between the search you already have and the model you already call. If your RAG system retrieves the right material but keeps answering as if it did not, log the raw ranks before you touch anything else. The answer is often already there, just a few positions too low, waiting for a second pass to pull it up.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Nogueira & Cho, Passage Re-ranking with BERT (2019)', url: 'https://arxiv.org/abs/1901.04085' },
        { title: 'Sentence-Transformers: Cross-Encoders and Retrieve-then-Rerank', url: 'https://www.sbert.net/examples/applications/retrieve_rerank/README.html' }
      ]
    }
  ]
};
