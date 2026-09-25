// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "kv-cache",
  "title": "The KV cache: why generation speeds up as it goes",
  "excerpt": "A small trick that makes text generation practical. What the model would otherwise recompute, and why it does not have to.",
  "category": "ML",
  "chapter": "Chapter 9",
  "tags": [
    "Inference",
    "KV Cache",
    "Optimization"
  ],
  "seriesNum": 30,
  "publishAt": "2026-06-24T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "You have seen the pattern every time you use a chatbot. You send a message, there is a short pause where nothing happens, and then the reply streams out quickly, word after word. That little rhythm, a beat of waiting followed by a fast stream, is not a quirk of the interface. It is the direct, visible fingerprint of a trick called the KV cache, and understanding it explains both why the first word is slow and why your long conversations eventually get expensive."
    },
    {
      "type": "p",
      "text": "The trick exists because generating text one token at a time sounds wasteful, and done naively it really is. The cache is what makes it practical."
    },
    {
      "type": "h2",
      "text": "Remembering instead of recomputing"
    },
    {
      "type": "p",
      "text": "To produce each new token, the model looks back at everything written so far, the prompt plus all the words it has generated, and uses that to decide what comes next. The naive way would be to redo that entire look-back from scratch at every single step. To write the tenth word it would re-examine the first nine, to write the eleventh it would re-examine all ten, and so on, repeating almost all of the same work over and over. That is the difference between rereading the whole page before writing each new word and simply remembering what you already read. The KV cache is the remembering."
    },
    {
      "type": "h2",
      "text": "Walk the two phases"
    },
    {
      "type": "p",
      "text": "Generation splits into two phases, and the chatbot pause is the seam between them. First comes **prefill**: the model processes your entire prompt in one big pass and stores the intermediate results for every token into the cache. This is the heavy, all-at-once work, and it is the pause you see before the first word appears."
    },
    {
      "type": "p",
      "text": "Then comes **decode**: the model generates new tokens one at a time, and for each one it reuses everything already in the cache and only computes the small new piece for the latest token. Decode is cheap per token, which is why, once it starts, the words stream out fast. Pause, then stream. Prefill, then decode. The cache is what turns the second phase from \"redo everything\" into \"add one small thing.\""
    },
    {
      "type": "h2",
      "text": "The cache, piece by piece"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "KV cache",
          "def": "stored intermediate values for the tokens already processed, so the model does not recompute them at every step."
        },
        {
          "term": "Prefill",
          "def": "the first pass that processes the whole prompt at once and fills the cache. This is the initial pause."
        },
        {
          "term": "Decode",
          "def": "generating new tokens one at a time, reusing the cache, which is why output streams quickly."
        }
      ]
    },
    {
      "type": "h2",
      "text": "The catch: the cache eats memory"
    },
    {
      "type": "p",
      "text": "Nothing is free, and the cost of the KV cache is memory. It holds an entry for every token in the context, so it grows as the conversation or document gets longer. A short chat uses a little, a very long one uses a lot, and that memory has to live on the same expensive hardware running the model."
    },
    {
      "type": "p",
      "text": "This is one of the real reasons long contexts cost more and why there are limits on how long your conversations and documents can be. The model has more to read, and remembering all of it takes room as well. When you read about serving optimizations with names like paged or compressed caches, they are almost always about taming this exact growth so a server can hold more conversations at once."
    },
    {
      "type": "h2",
      "text": "Put a number on the savings"
    },
    {
      "type": "p",
      "text": "A rough example makes the win concrete. Imagine a reply that is 500 tokens long. Without a cache, generating token number 500 means re-processing the 499 tokens before it, token 499 means re-processing 498, and so on down the line. The total work piles up with the square of the length, so a 500-token answer costs on the order of a hundred thousand token-processings instead of 500. That is the naive cost, and it is why early, uncached generation felt impractically slow."
    },
    {
      "type": "p",
      "text": "With the KV cache, each new token reuses the stored work from all the tokens before it and adds only its own small step. The cost now grows in a roughly straight line with the length of the output instead of exploding. That single change is the difference between text generation being a shippable product feature and being too slow and expensive to bother with. The cache does not make the model smarter or change a word of what it produces. It removes a mountain of repeated arithmetic that the naive approach would redo on every single token, and that removal is what lets a model answer you in real time."
    },
    {
      "type": "h2",
      "text": "Why this is worth knowing"
    },
    {
      "type": "p",
      "text": "The KV cache connects a few things that otherwise seem unrelated. It is why time-to-first-token and time-per-token are two different numbers worth measuring separately: prefill controls the first, decode controls the rest. It is why a long prompt makes you wait longer before anything appears, since prefill has more to chew through. And it is why memory, not just raw speed, is often the thing that limits how many users a server can handle. If you ever tune a serving setup, the cache is one of the first levers and one of the biggest costs."
    },
    {
      "type": "h2",
      "text": "Why the cache changes your bill"
    },
    {
      "type": "p",
      "text": "Generation is fast because the model remembers its own past work instead of redoing it from scratch, and the pause-then-stream rhythm you feel in every chatbot is that cache being filled and then reused. The price of the remembering is memory that grows with context length. So when you hear about context limits, serving memory, or why long chats get pricey, the KV cache is usually the thing being managed underneath. Once you can see it, a lot of otherwise mysterious behavior falls into place at once: the initial pause is prefill, the steady stream is decode, the creeping cost of a long conversation is the cache growing, and the limit a provider puts on context length is partly a limit on how much of this cache a server can afford to hold for you."
    }
  ]
};
