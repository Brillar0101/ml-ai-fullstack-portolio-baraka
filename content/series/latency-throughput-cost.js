// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "latency-throughput-cost",
  "title": "Latency, throughput, and cost without the jargon",
  "excerpt": "The three numbers that decide whether your AI feature is usable and affordable, and how they trade against each other.",
  "category": "ML",
  "chapter": "Chapter 9",
  "tags": [
    "Inference",
    "Latency",
    "Cost"
  ],
  "seriesNum": 15,
  "publishAt": "2026-03-11T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Imagine a team shipping an AI chat feature that works on launch day but feels sluggish: you type a question and stare at a blank box for several seconds before anything appears. Users hate it, even though the answers are good. In a panic, the team does what sounds responsible and switches to a bigger, smarter model, and the feature gets slower and more expensive while the complaint stays exactly the same."
    },
    {
      "type": "p",
      "text": "The mistake was not the model. It was optimizing the wrong number. A model can be brilliant and still fail in production because it is too slow or too costly, and avoiding that comes down to understanding three numbers and how they pull against each other."
    },
    {
      "type": "h2",
      "text": "The three numbers, in plain terms"
    },
    {
      "type": "p",
      "text": "Latency is how long one person waits for their answer. Throughput is how many requests the system can serve per second across everyone. Cost is what you pay to run it. The reason this is a real engineering problem and not just \"make it fast\" is that the three trade off against each other."
    },
    {
      "type": "p",
      "text": "The most common lever, batching, is the perfect example: bundling several users' requests and running them together uses the expensive hardware far more efficiently, which raises throughput and lowers cost per request. But a bundled request can wait for the bundle to fill, so any single user might wait a little longer. You cannot maximize all three at once. You choose which one matters most for this feature."
    },
    {
      "type": "h2",
      "text": "Walk the chat example"
    },
    {
      "type": "p",
      "text": "Go back to the sluggish chat. The number that matters there is latency, and specifically the time until the first word appears, because a person watching a blank box is judging responsiveness, not total length. The right moves are the opposite of what the team did: use a smaller or quantized model that responds faster, stream the answer so words show up as they are generated instead of all at once at the end, and cache anything you would otherwise recompute."
    },
    {
      "type": "p",
      "text": "A bigger model made every one of those worse. Now picture the opposite job: a nightly pipeline that summarizes ten thousand documents. No human is waiting, so latency per document barely matters. There you batch aggressively and pick whatever model gives the best cost per document, optimizing throughput and cost precisely because nobody is staring at a screen."
    },
    {
      "type": "h2",
      "text": "The three numbers, defined"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Latency",
          "def": "the time from request to response for a single call, often split into time-to-first-token and total time."
        },
        {
          "term": "Throughput",
          "def": "how many requests or tokens the whole system handles per second, across all users."
        },
        {
          "term": "Batching",
          "def": "processing several requests together to use the hardware more efficiently, raising throughput at some cost to single-request latency."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Where the wins come from"
    },
    {
      "type": "p",
      "text": "The big levers are a handful, and they are the same ones earlier posts in this series touched. A smaller or quantized model is faster and cheaper for a small quality cost. Caching, including the KV cache and caching repeated requests, avoids redoing work. Batching trades latency for throughput. Streaming does not change the total time but changes how fast it feels, which for a chat is most of the battle."
    },
    {
      "type": "p",
      "text": "The art is not applying all of them. It is knowing which number you are paying down and choosing the levers that move it."
    },
    {
      "type": "h2",
      "text": "Two flavors of fast"
    },
    {
      "type": "p",
      "text": "Latency is not one number, and the distinction matters for chat. There is the time until the first word appears, and the time until the whole answer is done. For a person watching a screen, the first one dominates the feeling of speed, because once words start flowing they read along and barely notice the rest. This is why streaming is such a cheap win: it does not make the total time shorter, it just moves the first word much earlier, so a response that takes the same six seconds feels fast instead of broken. If you measure only total time, you can miss that your feature feels slow for a reason a single average hides."
    },
    {
      "type": "h2",
      "text": "Where the bill comes from"
    },
    {
      "type": "p",
      "text": "Cost deserves the same plain look, because it is easy to be surprised by it. You generally pay per token, both for the tokens you send in and the tokens the model generates. That means two things quietly inflate your bill."
    },
    {
      "type": "p",
      "text": "A model that rambles produces more output tokens for the same question, so a more concise model can be cheaper at identical quality. And a long context, all those documents you pasted in, is a lot of input tokens on every single call, which is part of why the context-length post argued for sending only what you need. Batching is the main lever on the other side: running many requests together uses the hardware more fully, which lowers the cost of each one, at the price of a little waiting. Put together, the cost picture is simple to reason about once you remember you are paying by the word, coming and going."
    },
    {
      "type": "h2",
      "text": "A quick gut check"
    },
    {
      "type": "p",
      "text": "Before reaching for any optimization, ask one question: is a human waiting on this answer right now. If yes, you are in latency territory, and the moves are a smaller model, streaming, and caching, with special attention to how fast the first token appears. If no human is waiting, an overnight report, a backfill, a bulk classification job, then you are in throughput-and-cost territory, and the moves are batching hard and choosing the cheapest model that clears your quality bar. That single question, is anyone watching, sorts most of the decisions for you, because it tells you which of the three numbers you are allowed to sacrifice. The teams that get this wrong make the same mistake the chat team did: they optimized a number nobody was feeling, tuning away at cost while users quietly suffered the wait."
    },
    {
      "type": "h2",
      "text": "Pick your number first"
    },
    {
      "type": "p",
      "text": "Decide which of the three you are optimizing for before you tune anything, because you cannot have the best of all three. Most user-facing features live or die on latency, especially time-to-first-token, so a smaller model and streaming usually beat a bigger, smarter one. Most batch pipelines live or die on cost, so batching and a concise, cheap model win. The team with the sluggish chat did not have a model problem. They had a \"we never said which number mattered\" problem, and that is the one to solve first."
    }
  ]
};
