// AI Series. Block-array format matching seriesPosts.js.
// Registered in src/data/aiPosts.js and rendered by SeriesPost.jsx.

export const POST = {
  id: 'six-types-of-agent-context',
  title: 'The six types of context an AI agent needs on every request',
  excerpt: 'Your coding assistant gets one shot at a request, and everything it knows has to fit in one window. Here is how that window splits into six jobs, where each one comes from, and how each one fails.',
  category: 'AI',
  tags: ['Context Engineering', 'Agents', 'Memory'],
  readTime: '8 min read',
  publishAt: '2026-07-10T12:00:00Z',
  body: [
    { type: 'p', text: 'You are pairing with a coding assistant inside your editor. You type: "Add rate limiting to the login endpoint, and follow the pattern we already use." The agent thinks for a second, opens two files, writes a middleware function, wires it into the route, and runs the tests. It got the pattern right without you spelling it out. It also remembered that your team uses Redis and not an in-memory counter, even though you never said so in this chat. That felt like magic. It was not. Before the model produced a single token, something assembled a package of text and handed the whole thing to it at once. That package is the **context**, and getting it right is most of what separates an agent that helps from one that flails.' },
    { type: 'p', text: 'Here is the intuition. A language model has no memory between calls and no eyes on your machine. On each request it sees exactly one thing: a block of text called the context window. Everything the agent "knows" in that moment has to be written into that block first. So the real work of building an agent is not the model. It is deciding what goes into the window, in what order, and what gets left out when space runs low. The window is small and the world is large, so you are always packing a suitcase.' },
    { type: 'p', text: 'What surprises people is that the window is not one undifferentiated blob. It holds at least six different kinds of content, each doing a separate job, each arriving from a different source, and each failing in its own way. Confuse them and you get an agent that forgets your rules, hallucinates a function that does not exist, or loops forever. Name them clearly and you can debug your agent the way you debug code.' },
    { type: 'h2', text: 'Tracing one login-endpoint request through all six' },
    { type: 'p', text: 'Let me replay that rate-limiting request and freeze the frame right before the model runs. Six distinct chunks of text are sitting in the window. First, a block of standing instructions telling the agent it is a coding assistant, that it should run tests before claiming success, and that it must never invent APIs. Second, a machine-readable list of the tools it can call: read a file, edit a file, run a shell command, each with the exact arguments they accept. Third, the actual contents of the two files it pulled in, fetched by searching your repository for the login route. Fourth, a short note recalled from a store outside this chat: "this team uses Redis for counters." Fifth, the running transcript of your conversation, including your original request and the messages so far. Sixth, and this one grows as it works, the agent\'s own step-by-step notes plus the raw output of each tool call it has already made.' },
    { type: 'p', text: 'Those six are not my invention for this post. They are the natural seams in almost every agent you will build or use. Let me give each one a name and a definition before going further, because the rest of the post leans on the vocabulary.' },
    { type: 'terms', items: [
      { term: 'Instructions (system prompt)', def: 'The standing rules and role. Who the agent is, what it must always or never do, the output format. Written by you, the developer, and usually fixed for the whole session.' },
      { term: 'Tool definitions', def: 'The menu of actions the agent can take, each described as a name, a purpose, and a schema of arguments. This is how the model learns what it is allowed to do and how to phrase the call.' },
      { term: 'Retrieved knowledge (RAG)', def: 'Documents, code, or facts fetched on demand for this specific request, usually by search over an external store. Short for retrieval-augmented generation.' },
      { term: 'Long-term memory', def: 'Facts the agent learned in earlier sessions and saved outside the window, then loaded back when relevant. Your Redis preference lived here.' },
      { term: 'Short-term memory (working memory)', def: 'The conversation history for the current session: your messages, the agent\'s replies, the thread so far.' },
      { term: 'Scratchpad', def: 'The agent\'s own intermediate reasoning plus the results of tool calls it has already run this turn. It grows as the agent works and is the record of what it has tried.' },
    ]},
    { type: 'p', text: 'The first two are set before the agent ever runs. The middle two are pulled in from outside based on what you asked. The last two are produced live, during the turn, by the conversation and by the agent\'s own actions. That grouping is worth holding onto, because it tells you who is responsible when each one goes wrong.' },
    { type: 'h2', text: 'How the six share one crowded window' },
    { type: 'p', text: 'Picture the window as a fixed-height container. Everything below competes for the same vertical space, measured in tokens. When the job is small the container is roomy. When the agent has read ten files and made twenty tool calls, the bottom two layers swell and start crowding out the rest.' },
    { type: 'diagram', rows: [
      [{ label: 'Context window', detail: 'one fixed token budget, shared by all six' }],
      [{ label: '1. Instructions', detail: 'role and rules, set once' }, { label: '2. Tool definitions', detail: 'the action menu' }],
      [{ label: '3. Retrieved knowledge', detail: 'files and docs for this task' }, { label: '4. Long-term memory', detail: 'facts from past sessions' }],
      [{ label: '5. Short-term memory', detail: 'this conversation so far' }, { label: '6. Scratchpad', detail: 'reasoning + tool results, grows fastest' }],
    ], caption: 'The six layers occupy one budget. The top two are fixed, the middle two are fetched, the bottom two grow during the turn and squeeze everything above them.' },
    { type: 'p', text: 'Because they all draw from one budget, assembling context is a packing problem with a hard ceiling. You cannot dump your entire codebase, every past chat, and a novel of reasoning into the window. You choose. A sane assembler reserves room for the fixed layers first, gives retrieval and memory a capped slice, and lets the scratchpad use what remains, trimming the oldest tool output when it overflows. Here is that logic as a small function.' },
    { type: 'code', lang: 'python', title: 'assemble_context.py', code: `def assemble_context(request, budget=8000):
    # Fixed layers get first claim on the budget.
    ctx = {
        "instructions":    load_system_prompt(),      # 1
        "tools":           list_tool_schemas(),        # 2
        "long_term_memory": recall_facts(request.user),# 4
    }
    used = sum(count_tokens(v) for v in ctx.values())

    # Retrieval gets a capped slice of what is left.
    remaining = budget - used
    ctx["retrieved"] = search_repo(request.text, limit=remaining // 3)  # 3

    # Conversation and scratchpad take the rest, newest first.
    ctx["short_term"] = recent_messages(request.session)   # 5
    ctx["scratchpad"] = request.tool_results               # 6

    return trim_oldest(ctx, budget)  # drop stale tool output if over budget`, },
    { type: 'p', text: 'Notice that the six are named fields, not a single string. Keeping them separate in code is the point. It lets you cache the fixed layers, cap the fetched ones, and evict from the growing ones without touching the others. An agent that concatenates everything into one prompt loses the ability to reason about any of this.' },
    { type: 'p', text: 'The ordering matters as much as the split. Models pay closest attention to text near the start and near the end of the window, and least to whatever sits in the deep middle. So the fixed rules go up top where they anchor everything, the live conversation and the freshest tool results sit near the bottom where they stay salient, and bulky retrieved documents go in between where a little inattention costs the least. When you assemble context, you are not just choosing what to include. You are choosing where in the window each piece lands, and that placement quietly shapes how much the model actually uses it.' },
    { type: 'h2', text: 'The failure that hides in each layer' },
    { type: 'p', text: 'Each type breaks in a way that is specific to it, and knowing the pattern tells you which layer to inspect. Walk through them.' },
    { type: 'ul', items: [
      'Instructions fail by being vague, contradictory, or buried. If the system prompt says "be concise" and also "explain your reasoning in full," the agent will pick one at random. If a rule sits at the very bottom under thousands of tokens of history, the model may weight it lightly. Fix: keep rules short, non-conflicting, and near the top.',
      'Tool definitions fail when the description is fuzzy or the schema is loose. A tool called "search" with a free-form string argument invites the model to pass garbage. The agent then calls it wrong, gets an error, and often does not recover. Fix: name tools for what they do and constrain arguments tightly.',
      'Retrieved knowledge fails two ways. It fetches the wrong documents, so the agent answers from irrelevant text, or it fetches too many, drowning the real answer in noise. Both look like the model being dumb. Usually the retriever is the culprit, not the model.',
      'Long-term memory fails by remembering the wrong thing or never being consulted. Save "the user prefers tabs" from one offhand comment and it haunts every future session. Or the fact exists but nothing loads it when it matters. Fix: be deliberate about what earns a permanent slot.',
      'Short-term memory fails by overflowing. A long conversation eventually exceeds the window, and the oldest turns, often the ones with the original goal, get dropped. The agent drifts from what you actually asked. Fix: summarize old turns instead of hard-cutting them.',
      'Scratchpad fails by bloating. Each tool call dumps its full raw output back into the window, so after twenty calls the reasoning is buried under logs. The agent starts repeating steps it already did. Fix: compress or discard old tool results once they have been used.',
    ]},
    { type: 'p', text: 'The through-line is that most "the model is being stupid" moments are really context moments. The model can only work with what it was handed. When it fails, the first question is which of the six layers was wrong, missing, or crowded out, not whether you need a smarter model.' },
    { type: 'callout', title: 'The one habit that prevents most agent bugs', text: 'When your agent misbehaves, print the full context it received before blaming the model. Nine times out of ten you will see the answer: a rule that got buried, a document that never got fetched, a memory that loaded when it should not have, or a scratchpad that ate the window.' },
    { type: 'h2', text: 'Common mistakes when you build this yourself' },
    { type: 'p', text: 'A few traps catch almost everyone the first time. The most common is treating memory as a dumping ground: saving every exchange into long-term storage until retrieval returns a wall of stale, half-relevant text. Long-term memory should hold durable facts and preferences, not a chat log. A second trap is letting the scratchpad grow without bound, which is comfortable in a demo with three tool calls and fatal in a real task with forty. A third is mixing retrieved documents into the system prompt, which blurs the line between your standing rules and this-request data and makes both harder to debug. Keep the layers physically separate, give each a budget, and decide up front what to drop when you run out of room.' },
    { type: 'p', text: 'One more. People assume a bigger window makes all of this go away. It helps, but it changes the problem rather than removing it. A larger budget still fills up on a long task, models still attend less carefully to text buried in the middle of a huge window, and cost scales with every token you pack in. The discipline of choosing what belongs in each layer matters at every window size.' },
    { type: 'h2', text: 'What to carry away' },
    { type: 'p', text: 'An agent is a model plus the context you feed it, and that context is not one thing. It is six: the rules you set, the tools you expose, the knowledge you fetch, the facts you remember, the conversation you are in, and the notes the agent takes as it works. Two are fixed before the run, two are pulled in from outside, and two are written live during the turn. They share a single crowded budget, so building an agent is mostly deciding what goes in each slot and what gets evicted when space runs short. Learn to name the six, keep them separate in your code, give each one a budget, and read the assembled window whenever things break. Do that and the agent stops feeling like magic and starts feeling like a plain system you can actually reason about, inspect, and fix.' },
    { type: 'sources', items: [
      { title: 'Anthropic, "Effective context engineering for AI agents"', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents' },
      { title: 'LangGraph, Memory concepts and how-to docs', url: 'https://langchain-ai.github.io/langgraph/concepts/memory/' },
      { title: 'Yao et al., "ReAct: Synergizing Reasoning and Acting in Language Models" (2022), arXiv:2210.03629', url: 'https://arxiv.org/abs/2210.03629' },
    ]},
  ],
};
