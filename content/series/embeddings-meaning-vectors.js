// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "embeddings-meaning-vectors",
  "title": "Embeddings: turning meaning into numbers",
  "excerpt": "The quiet workhorse behind search, RAG, and recommendations. What an embedding is and why similarity works.",
  "category": "ML",
  "chapter": "Chapter 3",
  "tags": [
    "Embeddings",
    "Similarity",
    "RAG"
  ],
  "seriesNum": 24,
  "publishAt": "2026-05-13T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Type \"how do I cancel\" into a good search box and it finds the page titled \"ending your subscription,\" even though the two share not a single important word. Old keyword search could never do that, because it matched letters, and \"cancel\" and \"subscription\" do not overlap. Modern search understands that the two mean roughly the same thing. The trick that makes this possible is called an embedding, and it quietly powers search, recommendations, and every retrieval system behind RAG. It sounds abstract and is actually simple once you see the picture."
    },
    {
      "type": "h2",
      "text": "The intuition: meaning becomes a place"
    },
    {
      "type": "p",
      "text": "Computers are good at comparing numbers and bad at comparing meaning, so the move is to turn meaning into numbers. An embedding is a list of numbers that stands in for a piece of text, arranged so that things with similar meaning end up near each other. Picture every word or sentence as a dot in space."
    },
    {
      "type": "p",
      "text": "\"Car\" and \"automobile\" land right next to each other. \"Carpet,\" despite sharing letters with \"car,\" lands far away, because it means something unrelated. Once meaning is a location, the fuzzy question \"do these two texts mean similar things\" becomes the concrete question \"are these two dots close together,\" which a computer answers instantly."
    },
    {
      "type": "h2",
      "text": "Walk the cancel example"
    },
    {
      "type": "p",
      "text": "Trace the search from before. Every help-doc title is run through an embedding model once and turned into a dot in this meaning-space, so \"ending your subscription\" sits somewhere specific. When you type \"how do I cancel,\" your query gets embedded into a dot too, and because canceling and ending a subscription mean nearly the same thing, your dot lands close to that title's dot."
    },
    {
      "type": "p",
      "text": "The system simply looks for the nearest dots to your query and returns them. It never matched a single word. It matched positions in meaning-space, which is why it found the right page despite zero shared keywords. That same move, embed everything, then find the nearest dots, is exactly the retrieval step inside RAG."
    },
    {
      "type": "h2",
      "text": "Words for turning words into numbers"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Embedding",
          "def": "a list of numbers that represents the meaning of a piece of text, learned so that similar meanings sit close together."
        },
        {
          "term": "Vector",
          "def": "just a list of numbers, treated here as the coordinates of a point in space."
        },
        {
          "term": "Cosine similarity",
          "def": "the usual way to score how close two embeddings are in meaning, by measuring how aligned their directions are."
        }
      ]
    },
    {
      "type": "h2",
      "text": "How \"close\" is actually measured"
    },
    {
      "type": "p",
      "text": "When people say two embeddings are close, they usually mean cosine similarity is high. The intuition is direction: think of each embedding as an arrow pointing from the origin, and cosine similarity asks how nearly the two arrows point the same way, ignoring how long they are. Two texts about the same topic point in nearly the same direction and score near one."
    },
    {
      "type": "p",
      "text": "Two unrelated texts point in different directions and score near zero. You do not need the trigonometry to use it. Just hold the picture that meaning is a direction, and similarity is how closely two directions line up. That single score is what ranks results in nearly every semantic search and RAG system you will build."
    },
    {
      "type": "lab",
      "height": 460,
      "title": "Meaning as coordinates, and the distance between them",
      "caption": "The top match shares no important word with the query. That is the whole difference between matching letters and matching meaning, and you can watch it happen here.",
      "code": "import math\n\n# Meaning as a place. Each phrase gets coordinates over five\n# made-up traits, written by hand so you can read them. A\n# real embedding model learns hundreds or thousands of\n# these, but the geometry underneath is exactly this. [\n# ending, money, account, urgency, greeting ]\nSPACE = {\n    \"how do I cancel\":            [0.9, 0.2, 0.6, 0.4, 0.0],\n    \"ending your subscription\":   [0.95, 0.3, 0.6, 0.2, 0.0],\n    \"close my account\":           [0.9, 0.0, 0.9, 0.3, 0.0],\n    \"update my card\":             [0.0, 0.9, 0.7, 0.2, 0.0],\n    \"carpet cleaning tips\":       [0.0, 0.0, 0.0, 0.0, 0.0],\n    \"hello there\":                [0.0, 0.0, 0.0, 0.0, 0.9],\n}\n\ndef cosine(a, b):\n    dot = sum(x * y for x, y in zip(a, b))\n    na = math.sqrt(sum(x * x for x in a))\n    nb = math.sqrt(sum(y * y for y in b))\n    return dot / (na * nb + 1e-9)\n\nquery = \"how do I cancel\"\nprint('query: \"%s\"\\n' % query)\nprint(\"%-28s %-8s %s\" % (\"phrase\", \"cosine\", \"shares a word?\"))\nqwords = set(query.split())\nfor phrase, vec in SPACE.items():\n    if phrase == query:\n        continue\n    shared = qwords & set(phrase.split())\n    print(\"%-28s %-8.3f %s\"\n          % (phrase, cosine(SPACE[query], vec), \", \".join(shared) if shared else \"no\"))\n\nprint()\nprint(\"'ending your subscription' scores highest, and it shares not one\")\nprint(\"important word with the query. Keyword search would never have found it.\")\nprint(\"'carpet cleaning tips' and 'hello there' sit at zero, because nothing\")\nprint(\"about them points the same direction. That gap between matching letters\")\nprint(\"and matching meaning is the whole reason embeddings exist.\")\n\n# Try it: add a phrase of your own with coordinates you\n# choose, and see where it lands. Then try giving two\n# unrelated phrases similar coordinates and watch the score\n# lie to you. The vectors are only as good as the model that\n# made them.\n"
    },
    {
      "type": "h2",
      "text": "What it powers"
    },
    {
      "type": "p",
      "text": "Once text is a vector, a surprising amount falls out for free, all of it the same operation in disguise. Semantic search is \"find the nearest vectors to my query.\" Retrieval for RAG is exactly that step, feeding the nearest chunks to a model. Recommendations work by finding items whose vectors sit near things you liked. Clustering and deduplication group texts whose vectors huddle together."
    },
    {
      "type": "p",
      "text": "In every case the embedding model does the genuinely hard part, capturing meaning as position, and everything after it is geometry, measuring which dots are near which. That is why embeddings are one of the most reused ideas in the whole field."
    },
    {
      "type": "h2",
      "text": "A caveat worth carrying"
    },
    {
      "type": "p",
      "text": "Two honest limits keep you out of trouble. First, embeddings are only as good as the model that made them, and different embedding models capture meaning with different quality, so the choice of embedding model genuinely affects search quality. Second, \"similar in meaning\" is not always \"the answer you want.\" An embedding will happily rank a passage that is on-topic but unhelpful as highly similar, because it is judging aboutness, not correctness. That is why retrieval is a first step that feeds a model to read the results, not a final answer on its own. Closeness in meaning-space is a strong signal, and it is still a signal, not a guarantee."
    },
    {
      "type": "h2",
      "text": "Where the vectors come from"
    },
    {
      "type": "p",
      "text": "A natural question is who decides where each dot goes, and the answer is a dedicated embedding model, a close relative of the language models in this series, trained specifically to place similar meanings near each other. You feed it text and it returns the vector. You can embed a single word, a sentence, or a whole paragraph, and longer text comes back as one vector that summarizes the meaning of the lot."
    },
    {
      "type": "p",
      "text": "The important practical detail is that both sides of a search must use the same embedding model, so the query and the documents land in the same space and can actually be compared. Swap in a different embedding model and every position shifts, which is why upgrading your embedding model can meaningfully improve a search system, or quietly break it if you re-embed one side and not the other. The vectors are not hand-placed or obvious. They are learned, and the model that learns them is a real component worth choosing with care rather than treating as an afterthought."
    },
    {
      "type": "h2",
      "text": "Meaning you can do math on"
    },
    {
      "type": "p",
      "text": "Embeddings turn the fuzzy idea of meaning into coordinates you can measure, so that comparing meaning becomes comparing positions. The cancel-versus-subscription magic is just two dots landing close together. Almost every system that seems to \"understand\" text under the hood is doing this one thing: embedding it into vectors and checking which ones are near. Once you see meaning as a place and similarity as distance, a huge slice of modern AI plumbing stops being mysterious."
    }
  ]
};
