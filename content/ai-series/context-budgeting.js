export const POST = {
  id: 'context-budgeting',
  title: 'Context Budgeting: What to Keep, Drop, or Compress',
  excerpt: 'A support chat runs long and suddenly the model forgets the order number. Here is how to treat the context window as a fixed budget and spend it well.',
  category: 'AI',
  tags: ['Context Engineering', 'Tokens', 'Cost'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'Picture a support agent built on a language model. A customer opens a chat about a delayed order. The conversation goes back and forth for forty minutes. The customer pastes a shipping confirmation, then a screenshot description, then their full address, then three follow up questions. Around the thirtieth message, the bot suddenly asks for the order number again. The customer already gave it, near the top of the chat. Nothing crashed. No error appeared. The bot simply stopped seeing the early part of the conversation.'
    },
    {
      type: 'p',
      text: 'This is one of the most common failures in production language model apps, and it almost never shows up in a quick demo. It only appears once real users have long sessions. The cause is not a bug in your code. It is that you ran out of room, and the system quietly threw away the part of the conversation that mattered.'
    },
    {
      type: 'p',
      text: 'The reason this catches people off guard is that everything works fine right up until it does not. A short chat leaves plenty of room, so during testing you never hit the ceiling. Then a real customer has a messy, forty message session with pasted logs and long questions, and the ceiling arrives in the middle of a live conversation. If you have not planned for that moment, the platform makes the decision for you, and it usually makes a bad one.'
    },
    {
      type: 'h2',
      text: 'The window is a fixed shelf, and everything wants a spot'
    },
    {
      type: 'p',
      text: 'A model reads and writes in **tokens**, which are chunks of text roughly the size of a short word or a piece of one. Every model has a maximum number of tokens it can hold at once. That limit covers everything at the same time: your system instructions, the tools you describe, the retrieved documents, the full chat history, and the reply the model is about to generate. Think of it as a shelf of fixed width. You can put anything on it you like, but the moment you push past the edge, something falls off the other end.'
    },
    {
      type: 'p',
      text: 'In the support chat, the shelf filled up slowly. Each new message added tokens. The system prompt sat at the front the whole time. The tool definitions took a fixed slice. By message thirty, the early messages had been pushed off to make room, and the order number went with them. The model was not being careless. It never received those tokens at all.'
    },
    {
      type: 'callout',
      title: 'The mental model that fixes most of this',
      text: 'Stop thinking "the model remembers our chat." Start thinking "on every single turn, I hand the model a fresh packet of text, and I decide what goes in that packet." Memory is something you build, not something you get for free.'
    },
    {
      type: 'h2',
      text: 'First measure, because you cannot budget what you never counted'
    },
    {
      type: 'p',
      text: 'Before you fix anything, find out where the tokens actually go. People guess wrong here all the time. They assume the chat history is the problem when the real hog is a giant system prompt or a set of retrieved documents that nobody trimmed. Break the packet into named parts and count each one. Most provider libraries ship a tokenizer, so you can measure a string exactly rather than eyeballing it.'
    },
    {
      type: 'diagram',
      rows: [
        [
          { label: 'System prompt', detail: 'rules, persona, policy' },
          { label: 'Tool definitions', detail: 'names, params, schemas' }
        ],
        [
          { label: 'Retrieved chunks', detail: 'docs pulled for this turn' },
          { label: 'Chat history', detail: 'every earlier message' }
        ],
        [
          { label: 'Current user message', detail: 'what they just asked' },
          { label: 'Reply headroom', detail: 'space the model writes into' }
        ]
      ],
      caption: 'The six things sharing one token budget. If the top rows grow unchecked, the reply headroom at the bottom shrinks, and eventually the oldest history falls off.'
    },
    {
      type: 'p',
      text: 'Once you have real numbers, the decisions get easy. Maybe your tool definitions eat four thousand tokens because you attached every tool to every request. Maybe retrieval pulls ten chunks when three would do. You cannot see any of that until you count. A rough breakdown per request, logged next to the response, pays for itself the first time a session misbehaves.'
    },
    {
      type: 'p',
      text: 'Measuring also changes how you think about cost, not just correctness. You pay per token on both the input and the output side, so a bloated packet is a bill that grows with every turn of every conversation at once. A system prompt that is a thousand tokens heavier than it needs to be does not cost you once. It costs you on every request for the life of the product. Counting tokens is the same habit whether your goal is fitting the window or holding down the invoice, which is a nice thing about doing it early.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Context window', def: 'The total number of tokens a model can process in one request, covering the input you send and the output it generates.' },
        { term: 'Token', def: 'The unit a model reads and writes in. A common rule of thumb in English is that one token is about four characters, but always measure with the real tokenizer for anything that matters.' },
        { term: 'Overflow', def: 'What happens when the assembled packet exceeds the window. Depending on your setup, the request either errors or silently drops the oldest content.' }
      ]
    },
    {
      type: 'h2',
      text: 'Four moves for making big content fit'
    },
    {
      type: 'p',
      text: 'When a component is too large, you have a small set of tools. Each trades something away, so match the move to the content.'
    },
    {
      type: 'ul',
      items: [
        '**Trim old turns.** Keep the most recent exchanges in full and drop the oldest ones. Cheap and fast, and it works because recent messages usually carry the live thread of the conversation. The risk is losing an early fact, like our order number.',
        '**Summarize the middle.** Replace a long stretch of old messages with a short recap the model writes for you. You lose exact wording but keep the gist, and you reclaim most of the tokens. Good for long sessions where the early context still matters in spirit.',
        '**Retrieve fewer, better chunks.** For document search, do not stuff ten passages in when three answer the question. Rank hard, cut deep, and quality usually goes up rather than down because the model is not wading through noise.',
        '**Move stable facts to the system prompt.** Things that never change, like the customer name or the policy that applies, belong in one fixed place near the front instead of being repeated in every message.'
      ]
    },
    {
      type: 'p',
      text: 'There is a fifth move that people reach for too late: offloading to external memory. Instead of carrying the full order details in every turn, store them in a database or a small key value store and fetch them back only on the turn that needs them. The conversation stays lean, and the durable facts live somewhere that does not compete for the token budget at all.'
    },
    {
      type: 'p',
      text: 'These moves are not mutually exclusive, and the strongest setups mix them. A real support system might pin the customer identity to the system prompt, keep the last six turns verbatim, summarize everything older than that, and fetch order records from a database only when the customer asks about an order. Each part of the packet gets the treatment that fits it. The point is that you are making these choices on purpose rather than letting an overflow rule pick for you at the worst possible moment.'
    },
    {
      type: 'h2',
      text: 'A decision tree you can run in your head'
    },
    {
      type: 'p',
      text: 'When a piece of content is too big to keep in full, ask two questions in order. First, is this needed on every single turn? Second, does the model need the exact text or just the meaning? Those two answers point straight at the right move.'
    },
    {
      type: 'diagram',
      title: 'This content is too big. Now what?',
      root: {
        label: 'Too big to keep in full',
        color: 'purple',
        children: [
          {
            edge: 'needed every turn',
            node: {
              label: 'Keep it, but compress',
              color: 'blue'
            }
          },
          {
            edge: 'needed sometimes',
            node: {
              label: 'Offload and re-fetch on demand',
              color: 'yellow'
            }
          },
          {
            edge: 'not needed again',
            node: {
              label: 'Drop it',
              color: 'green'
            }
          }
        ]
      },
      caption: 'Start at the top with any oversized component. Content you truly need each turn gets summarized in place. Content you need now and then gets stored outside the window and pulled back when relevant. Content that has served its purpose just goes.'
    },
    {
      type: 'p',
      text: 'Run our support chat through this. The order number is needed on many turns, so it gets pinned to the system prompt or held in external memory rather than left to drift in the history. The forty messages of back and forth are needed in spirit but not word for word, so the older half gets summarized. The customer greeting and the small talk at the start are not needed again, so they get dropped without a second thought. Notice that no single rule handled the whole conversation. Different content took different exits from the same tree, and that is exactly what you want.'
    },
    {
      type: 'h2',
      text: 'Trimming a message list to a budget'
    },
    {
      type: 'p',
      text: 'Here is the shape of a function that keeps the packet under a token limit. It always keeps the system message, always keeps the most recent turns in full, and when there is still too much it folds the middle into a single summary. The token counter is a stand in for whatever your provider gives you.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'fit_to_budget.py',
      code: `def fit_to_budget(system, history, budget, count, summarize):
    # system message is non-negotiable, reserve its cost first
    remaining = budget - count(system)

    # walk newest to oldest, keeping full turns while they fit
    kept = []
    idx = len(history) - 1
    while idx >= 0 and count(history[idx]) <= remaining:
        remaining -= count(history[idx])
        kept.append(history[idx])
        idx -= 1
    kept.reverse()

    # anything older than what we kept becomes one short recap
    middle = history[: idx + 1]
    if middle:
        recap = summarize(middle)          # your model call goes here
        if count(recap) <= remaining:
            kept = [recap] + kept

    return [system] + kept`
    },
    {
      type: 'p',
      text: 'The logic is deliberately plain. Reserve the system message, fill from the newest end while turns fit, and compress whatever is left over. You can make it smarter later, and most teams do, adding pinned facts or smarter ranking. But even this basic version stops the silent overflow that lost our order number in the first place.'
    },
    {
      type: 'h2',
      text: 'Where teams trip, and one last thing to remember'
    },
    {
      type: 'p',
      text: 'A few mistakes show up again and again. The first is trusting the model to remember instead of assembling the packet yourself. The second is skipping measurement and tuning blind. The third is a subtle one worth naming: even when content fits, models pay less attention to material buried in the middle of a long input than to material at the very start or the very end. Researchers have documented this, and it means a fact placed in the exact center of a huge context can be technically present yet functionally ignored. So do not just fit everything in and relax. Put the things that matter near the edges, and keep the whole packet lean enough that the middle does not swallow them.'
    },
    {
      type: 'p',
      text: 'Treat the context window as a budget with a hard ceiling. Measure what each part costs, decide on every turn what earns its place, and use trimming, summaries, tighter retrieval, and external memory to stay under the line. Do that, and your support bot will still know the order number at message thirty, because you made sure it was there.'
    },
    {
      type: 'sources',
      items: [
        { title: 'OpenAI Platform: Models and context length', url: 'https://platform.openai.com/docs/models' },
        { title: 'Anthropic: Effective context engineering for AI agents', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents' },
        { title: 'Liu et al., Lost in the Middle: How Language Models Use Long Contexts (2023)', url: 'https://arxiv.org/abs/2307.03172' }
      ]
    }
  ]
};
