// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "context-length",
  "title": "Context length and why more is not always better",
  "excerpt": "The context window is the model's working memory. Bigger windows help, but stuffing them has real costs.",
  "category": "AI",
  "chapter": "Chapter 5",
  "tags": [
    "Context",
    "Prompting",
    "Cost"
  ],
  "seriesNum": 27,
  "publishAt": "2026-06-03T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In 2023, researchers ran a clean experiment. They gave models a long list of documents and a question whose answer sat in exactly one of them, then moved that one document around. When the answer was near the start or the end of the long context, the models found it. When the very same answer sat in the middle, accuracy dropped, sometimes sharply. They called it [lost in the middle](https://arxiv.org/abs/2307.03172), and it punctured a comforting assumption: that a bigger context window means the model actually reads all of it equally."
    },
    {
      "type": "p",
      "text": "That finding is the reason \"just paste everything in\" is bad advice, even when the window is huge. More context is a tool with a bill and a blind spot attached."
    },
    {
      "type": "h2",
      "text": "The desk, not the library"
    },
    {
      "type": "p",
      "text": "The context window is everything the model can see at once: your instructions, the conversation so far, and any documents you include. It is working memory, not long-term memory, and like a person skimming a long document, the model attends most to the beginning and the end and skims the middle. A larger window lets you include more, but it does not guarantee the model weighs the middle as carefully as the edges, and every extra token still costs money and time."
    },
    {
      "type": "h2",
      "text": "Watching the window fill up"
    },
    {
      "type": "p",
      "text": "Say you build a tool that answers questions from a contract. The tempting move is to paste all forty pages into the prompt and ask. If the relevant clause happens to be on page twenty, the [lost-in-the-middle](https://arxiv.org/abs/2307.03172) effect means the model may glide right past it, even though it was technically \"in context.\" Now do it the careful way: retrieve the two or three passages most likely to contain the answer and put only those in the window, near the top. The model has less to read, the key clause is where it attends best, and you pay for a fraction of the tokens. Same model, far better odds, because you curated instead of dumped."
    },
    {
      "type": "h2",
      "text": "Terms for the model's working memory"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Context window",
          "def": "the maximum amount of text a model can take in for a single response."
        },
        {
          "term": "Context efficiency",
          "def": "getting the needed information into the window with as few tokens as possible."
        },
        {
          "term": "Lost in the middle",
          "def": "the tendency for models to use the start and end of a long context more reliably than the middle."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Why the middle gets skimmed"
    },
    {
      "type": "p",
      "text": "It helps to know roughly why the dip happens. To decide what matters, a model weighs every token in the context against the others, and in a very long context that attention is spread thin across an enormous number of comparisons. The beginning and the end of a long passage tend to act as anchors the model leans on, partly because of how these models are trained and how positions in the text are encoded, while the middle has to compete with everything around it. You do not need the underlying math to use the result. Assume the model reads the edges carefully and the middle loosely, and place your most important text where it actually looks."
    },
    {
      "type": "h2",
      "text": "A second cost, paid in money and time"
    },
    {
      "type": "p",
      "text": "Lost in the middle is the quality cost. Stacked on top of it is a money cost. You are billed per token, and a long context is a lot of tokens on every single call. Paste forty pages of contract into the prompt for every question and you pay for forty pages every time, even when the answer lived in one clause. It is slower, too, because the model has to read the whole thing before it can begin to answer, which pushes up the time before the first word appears."
    },
    {
      "type": "p",
      "text": "So a stuffed context window quietly hurts on three fronts at once: the model may miss the middle, you pay more, and the user waits longer. None of those show up in a quick demo, and all of them show up on the bill and the latency dashboards in production."
    },
    {
      "type": "h2",
      "text": "The common mistake"
    },
    {
      "type": "p",
      "text": "The mistake the big windows encourage is \"I have a huge window, so I will paste everything and let the model sort it out.\" That feels efficient and is usually the worst option. You are asking the model to find a needle while you bury it in hay, paying for the hay, and waiting while it reads the hay. The fix is almost always to narrow before you ask: pull the few relevant passages first with retrieval, and hand the model a tight, well-ordered context. The large window is insurance for the rare cases you genuinely cannot pre-filter, not a reason to stop filtering."
    },
    {
      "type": "h2",
      "text": "How to use it well"
    },
    {
      "type": "p",
      "text": "Put only what the task needs in the window, and place the most important material where the model attends best, near the top or bottom. This is exactly why **retrieval** matters: instead of flooding the model with a whole knowledge base and hoping, you fetch the few relevant passages and lead with them. A long context window is a convenience for when you cannot pre-filter, not a license to stop filtering."
    },
    {
      "type": "h2",
      "text": "A rule of thumb"
    },
    {
      "type": "p",
      "text": "When you are deciding how much to put in the window, ask one plain question: would a careful person need this paragraph to answer the question. If not, leave it out."
    },
    {
      "type": "p",
      "text": "The model is not helped by context it does not need, and it is actively hurt by the cost and the noise. Aim to give it the smallest set of passages that fully covers the answer, ordered with the most important first. That single discipline, give it what it needs and nothing more, is most of what separates a cheap, accurate retrieval system from an expensive, flaky one. The teams that struggle with long-context apps are usually the ones treating the window as a place to dump everything, and the teams that do well are the ones treating it as a small stage they carefully set."
    },
    {
      "type": "h2",
      "text": "Working memory is a budget"
    },
    {
      "type": "p",
      "text": "Treat context as scarce even when the window is large, because the model does not read a long context as evenly as you would hope, and every extra token costs money and time. The goal is the right information, placed well, not the most information crammed in. Curate the window, and you get better answers for less money and lower latency all at once. A bigger window raises the ceiling on what you can include. It does not lower the value of including only what matters."
    }
  ]
};
