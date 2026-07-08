export const POST = {
  id: 'vector-databases-explained',
  title: 'Vector Databases, Explained: What They Are and Why RAG Needs One',
  excerpt: 'A docs search that answered in a blink at ten thousand pages ground to a halt at two million. The fix was not a bigger server. It was giving up on comparing the query to every chunk.',
  category: 'AI',
  tags: ['RAG', 'Vector Databases', 'Embeddings'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A support team built a docs search that everyone loved. You typed a question, it found the three or four help articles that actually answered it, and it fed those to a model that wrote a tidy reply. At launch the knowledge base held about ten thousand chunks of text, and answers came back before you finished reading the loading spinner. Then the company grew. Two years of new products, migrated forums, and old ticket transcripts pushed the corpus to roughly two million chunks. The same search that once felt instant now took eight to twelve seconds per query, and under load it fell over completely. Nobody had changed the search code. They had only added text.'
    },
    {
      type: 'p',
      text: 'The reason for the slowdown is the whole point of this post. The original search worked by comparing your question to every single chunk in the corpus, one at a time, and keeping the closest matches. That is fine at ten thousand items. At two million it means two million comparisons for every query, and it scales straight up as the corpus grows. What the team needed was a way to find the nearest matches without looking at everything. That is exactly the job a **vector database** is built for.'
    },
    {
      type: 'h2',
      text: 'Why finding relevant text turns into finding nearby points'
    },
    {
      type: 'p',
      text: 'Before a search like this can run, every chunk of text gets turned into a list of numbers called an **embedding**. You can picture each embedding as a point sitting in a space with many dimensions. Text that means similar things lands close together, and text about unrelated topics lands far apart. A chunk about resetting your password and a chunk about recovering a locked account end up as neighbors, even if they share almost no words, because a good embedding model captures meaning rather than spelling.'
    },
    {
      type: 'p',
      text: 'Once your documents live as points, search stops being about matching words and becomes a question of distance. You embed the user question the same way, which gives you one more point in the same space. The best answers are the document points sitting closest to that question point. So the search problem reduces to something almost physical: given this one new point, which of my stored points are its nearest neighbors? Everything else in this post is about answering that question quickly when you have millions of stored points.'
    },
    {
      type: 'h2',
      text: 'Walking one query through the corpus, step by step'
    },
    {
      type: 'p',
      text: 'Say a user types "I got logged out and can\'t sign back in." The system sends that sentence to an embedding model, which returns a vector, maybe 768 numbers long. Now the naive approach kicks in. It takes that query vector and measures the distance to chunk one, then chunk two, then chunk three, all the way to chunk two million. It sorts by distance and keeps the top five. Those five chunks go to the language model as context, and the model writes the answer.'
    },
    {
      type: 'p',
      text: 'The expensive part is the middle. Two million distance calculations, each across hundreds of numbers, happen on every keystroke-driven search. Doubling the corpus doubles the work. This is what people mean by brute-force or exact search: you check everything, so your answer is perfectly correct, but the cost climbs with the size of the collection. The team\'s eight-second delay was not a bug. It was the honest price of comparing against all two million chunks every time.'
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'Raw text chunk', detail: 'a paragraph from the docs' },
        { label: 'Embed', detail: 'model turns text into a vector' },
        { label: 'Index', detail: 'vector DB stores it in an ANN structure' },
        { label: 'Query vector', detail: 'the user question, embedded the same way' },
        { label: 'Nearest neighbors', detail: 'top matches returned in milliseconds' }
      ],
      caption: 'Text becomes vectors once, gets indexed, and every later query is answered by finding nearby points instead of scanning the whole corpus.'
    },
    {
      type: 'h2',
      text: 'What a vector database actually holds'
    },
    {
      type: 'p',
      text: 'It helps to be concrete about what sits inside one of these systems. For each chunk, the database keeps three things. First is the vector itself, the row of numbers from the embedding model. Second is the original text, or a pointer to it, so you can hand the real words back to the language model once you find a match. Third is metadata: any extra fields you attach, such as the product area, the language, the source URL, or the date the article was written. The vector answers the nearest-neighbor question, the text is the payload you return, and the metadata lets you slice the collection. A search that mixes all three is far more useful than one that only knows about points in space.'
    },
    {
      type: 'p',
      text: 'The team in our story got a second win once they added that metadata. Many of their two million chunks were old forum posts in languages the current customer did not speak, or notes about products that had been retired. By tagging each chunk and filtering at query time, they shrank the effective search space and stopped surfacing answers that were technically similar but practically useless. The vector database made the search fast. The metadata made the results relevant.'
    },
    {
      type: 'h2',
      text: 'The words you need: embedding, ANN, HNSW, and the rest'
    },
    {
      type: 'terms',
      items: [
        { term: 'Embedding', def: 'A list of numbers that represents the meaning of a piece of text as a point in high-dimensional space. Similar meanings produce nearby points.' },
        { term: 'Vector database', def: 'A store built to hold millions of embeddings and answer the question "which stored vectors are closest to this query vector?" quickly.' },
        { term: 'Approximate nearest neighbor (ANN)', def: 'A search method that returns very likely nearest matches without checking every stored vector, trading a tiny bit of accuracy for a large speed gain.' },
        { term: 'HNSW', def: 'Hierarchical Navigable Small World, a popular ANN index that arranges vectors into layered graphs so a search can hop toward the answer instead of scanning.' },
        { term: 'Cosine similarity', def: 'A way to measure how close two vectors point in the same direction. Higher means more similar. It ignores length and cares only about direction.' },
        { term: 'Metadata filter', def: 'A condition on stored fields, like product = "billing" or language = "en", applied alongside the vector search to narrow results.' }
      ]
    },
    {
      type: 'h2',
      text: 'How HNSW skips most of the work'
    },
    {
      type: 'p',
      text: 'A vector database does not compare your query to every point. Instead it builds an index ahead of time that lets it navigate toward the answer. HNSW, the most common one, connects vectors into a graph where each point links to a handful of near neighbors. On top of that base graph it stacks sparser layers, like an express lane. A search starts at the top layer, takes big jumps across the space to get roughly close, then drops to denser layers to refine, landing on the true neighbors after visiting only a small fraction of the collection.'
    },
    {
      type: 'p',
      text: 'The payoff is dramatic. Where brute force did two million comparisons, HNSW might do a few thousand and still return the right neighbors almost every time. That "almost" is the trade. ANN indexes are approximate, so once in a while they miss a match that exact search would have caught. For document retrieval that is a fine deal, because the fifth-best chunk being swapped for the sixth-best rarely changes the final answer. When you need every match guaranteed, you use exact search and pay the full cost. Most search-and-answer systems happily take the speed.'
    },
    {
      type: 'p',
      text: 'Similarity metric matters here too. Most text embeddings are compared with **cosine similarity**, which looks at the angle between two vectors rather than their raw distance. Two chunks that point the same direction score as similar even if one vector happens to be longer. You pick the metric when you build the index, and it should match how your embedding model was trained. Mixing a model that expects cosine with an index configured for plain Euclidean distance is a quiet way to get worse results.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'Embed a question and pull the nearest chunks',
      code: `from openai import OpenAI
import chromadb

client = OpenAI()
store = chromadb.PersistentClient(path="./kb")
docs = store.get_collection("help_center")

question = "I got logged out and can't sign back in"

# Turn the question into a vector, same model used to index the docs
resp = client.embeddings.create(
    model="text-embedding-3-small",
    input=question,
)
query_vec = resp.data[0].embedding

# Ask the vector DB for the 5 nearest chunks, filtered to English billing docs
hits = docs.query(
    query_embeddings=[query_vec],
    n_results=5,
    where={"product": "account", "language": "en"},
)

for text in hits["documents"][0]:
    print(text[:120])`
    },
    {
      type: 'h2',
      text: 'Mistakes that quietly wreck retrieval'
    },
    {
      type: 'p',
      text: 'The first common trap is embedding your documents with one model and your queries with another. The two sets of vectors end up in different spaces, and the distances become meaningless. Always embed queries and documents with the same model and version. A second trap is skipping **metadata filters**. If a user asks a billing question, there is no reason to search shipping and legal docs at the same time. Storing a product tag or a language field next to each vector lets the database narrow the field before or during the search, which improves both speed and relevance.'
    },
    {
      type: 'p',
      text: 'A third mistake is reaching for a heavyweight vector database when you do not have the scale to justify one. If your corpus is a few thousand chunks, brute-force search over an in-memory array finishes in a couple of milliseconds, and adding a separate service just gives you more to run and monitor. The team in our story did not need a vector database at ten thousand chunks. They needed one at two million. The break-even point depends on your hardware and latency budget, but the shape is clear: dedicated ANN infrastructure earns its keep when exact search stops being fast enough.'
    },
    {
      type: 'callout',
      title: 'The rule of thumb',
      text: 'Under roughly a hundred thousand chunks, a plain array and exact search is often simpler and plenty fast. Past that, an ANN index like HNSW is what keeps queries under a second as the corpus grows.'
    },
    {
      type: 'h2',
      text: 'What to carry away'
    },
    {
      type: 'p',
      text: 'RAG works by finding the handful of chunks most relevant to a question and handing them to a model. Once text is stored as embeddings, "most relevant" means "nearest in vector space," and a vector database exists to answer that nearest-neighbor question fast. It does so with an approximate index such as HNSW that navigates toward the answer instead of scanning everything, and it lets you attach metadata so you search only the slice that matters. The two-million-chunk slowdown was not a sign the idea was wrong. It was a sign the team had outgrown exact search and was ready for the tool built for the next order of magnitude.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Malkov & Yashunin, Efficient and robust approximate nearest neighbor search using HNSW graphs (arXiv:1603.09320)', url: 'https://arxiv.org/abs/1603.09320' },
        { title: 'pgvector: open-source vector similarity search for Postgres', url: 'https://github.com/pgvector/pgvector' },
        { title: 'FAISS: a library for efficient similarity search', url: 'https://faiss.ai/' }
      ]
    }
  ]
};
