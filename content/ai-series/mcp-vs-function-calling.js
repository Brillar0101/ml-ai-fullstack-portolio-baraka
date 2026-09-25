// Every factual claim below is taken from the numbered sources at the end.
// Both charts are redrawn from Table 1 of the BFCL paper (PMLR, ICML 2025),
// whose license does not allow figure reuse. The MCP specification is cited
// only for method and field names.
export const POST = {
  id: 'mcp-vs-function-calling',
  title: 'Function Calling, MCP and the API Underneath: A Stack Read Bottom Up',
  excerpt: 'In the Berkeley Function Calling Leaderboard paper, o1 scored 91.5 on parallel calls when the tools were described in its prompt and 0.0 when they went through its native tools field. Same model, same functions. That gap only makes sense once you see function calling, MCP and a plain API as separate layers.',
  category: 'AI',
  tags: ['MCP', 'Function Calling', 'Tools'],
  body: [
    {
      type: 'p',
      text: "The Berkeley Function Calling Leaderboard (BFCL) paper, presented at ICML 2025, has a category called Parallel: one tool is available and the right answer is to call it several times in a single turn.[^1] OpenAI's o1-2024-12-17 scored 91.5 on it when the function definitions were pasted into its system prompt. With the same definitions supplied through the model's native tools field, it scored 0.0. Claude-3.5-Sonnet-20241022 went from 70.5 to 3.5 the same way.[^1] The authors' reading is that the parallel call feature \"appears to have regressed or even removed\" in those flagship versions, and they guess why: parallel calls can hurt accuracy when each call depends on the result of the previous one.[^1]",
    },
    {
      type: 'p',
      text: "The model did not get worse at knowing what to call. On the Multiple category, where it has to pick one function out of several, o1 scored 93.5 in prompt mode and 93.0 in native mode.[^1] What changed was the channel the call went through. That is a useful way into a question people ask a lot: should I use MCP, function calling or just call the API? The three are not competing answers to one question. They are layers stacked on top of each other, and each one has its own way of failing.",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'BFCL single-turn Parallel category, AST accuracy',
      yLabel: 'Accuracy (%)',
      series: [
        { label: 'Native tools field (FC)', key: 'fc' },
        { label: 'Functions in system prompt', key: 'pr', baseline: true },
      ],
      data: [
        { label: 'o1-2024-12-17', values: { fc: 0.0, pr: 91.5 } },
        { label: 'Claude-3.5-Sonnet', values: { fc: 3.5, pr: 70.5 } },
        { label: 'Claude-3.5-Haiku', values: { fc: 2.5, pr: 84.0 } },
        { label: 'gpt-4o-2024-11-20', values: { fc: 93.0, pr: 94.0 } },
      ],
      caption: 'Redrawn from Table 1 of Patil et al., 2025.[^1] Each model was tested with the same functions in both modes. The gap is a property of the interface, not of what the model understands.',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Plain API', def: 'An ordinary endpoint, usually HTTP, that does the actual work: reads a database, converts a currency, runs a search. It has no idea a model exists.' },
        { term: 'Function calling', def: 'The model writes a structured request, a function name plus arguments, instead of prose. The model does not run anything. Some other code does.' },
        { term: 'JSON Schema', def: 'A standard way to describe the shape of a JSON object: which fields exist, their types, which are required. Tool definitions use it to describe arguments.' },
        { term: 'MCP', def: 'The Model Context Protocol. A client asks a server which tools it has and then asks it to run one, using JSON-RPC messages.[^5,6]' },
        { term: 'Application loop', def: 'The code around the model that runs each call, puts the result back into the conversation and asks the model what to do next, until the task ends.' },
      ],
    },
    {
      type: 'diagram',
      rows: [
        [{ label: 'Application loop', detail: 'runs calls, feeds results back, decides when to stop' }],
        [{ label: 'Protocol (MCP)', detail: 'tools/list to discover, tools/call to route' }],
        [{ label: 'Structured call', detail: 'model emits a name and JSON arguments' }],
        [{ label: 'Plain HTTP API', detail: 'does the work, returns data or an error' }],
      ],
      caption: 'The stack this post walks through, drawn top down. Read it from the bottom: each layer uses the one below it and adds one job.',
    },
    {
      type: 'h2',
      text: 'The HTTP API does the work and knows nothing about models',
    },
    {
      type: 'p',
      text: "At the bottom sits code that already existed before anyone attached a language model to it. When BFCL built its executable test category, part of it was Python functions that wrap public REST services such as ExchangeRate API, OMDb API and a geocoding API. They stuck to GET requests because those are the most common kind in real use.[^1] Nothing in those endpoints changes when a model is the caller. They get a URL and parameters and return a response.",
    },
    {
      type: 'p',
      text: "This layer adds the only thing that actually touches the world. It also has a demand of its own. Toolformer, the 2023 Meta paper that taught a model to insert its own API calls, put exactly two constraints on its tools: their inputs and outputs have to be representable as text, and the authors need a few demonstrations of how each tool is used.[^2] Whatever the API returns has to become a string the model can read. The response for each call, in their words, needs to be \"a single text sequence.\"[^2]",
    },
    {
      type: 'p',
      text: "What this layer returns also puts a ceiling on everything above it. Toolformer answered open questions with a Wikipedia search tool and still trailed the much larger GPT-3. The authors blame the simplicity of their search engine, which in many cases returned results that were clearly not a good match for the query.[^2] ReAct gave its models a deliberately weak Wikipedia API with three actions, search, lookup and finish, which the authors describe as \"significantly weaker\" than modern retrievers.[^3] They then hand-labeled 200 HotpotQA trajectories. In the ReAct failures it sampled, 23% were search result errors, where the search came back empty or held nothing useful. The authors note this \"derails the model reasoning\" and makes it hard to recover.[^3] The API answered correctly by its own standards. It just had nothing useful to say.",
    },
    {
      type: 'h2',
      text: 'The structured call: a name and some arguments, nothing more',
    },
    {
      type: 'p',
      text: "One layer up, the model's job is to turn a sentence into a request the API layer can run. Toolformer did this with special tokens: the model learned to write something like [Calculator(400 / 1400) → 0.29] inside ordinary text. During decoding, when the model produced the arrow token, the system paused, called the API, pasted the result in and let the model continue.[^2] The model was a 6.7B GPT-J, fine-tuned on text where calls had been kept only if their results lowered the loss on the tokens that followed.[^2] The ability showed up late. In their scaling experiment with smaller GPT-2 models, useful tool use only emerged at around 775M parameters.[^2]",
    },
    {
      type: 'p',
      text: "Current APIs ask for a JSON object instead of inline tokens, but the idea is the same. The model's entire output at this layer is small:",
    },
    {
      type: 'code',
      essential: true,
      lang: 'json',
      title: 'A structured call, as the model emits it',
      code: '{ "name": "get_exchange_rate",\n  "arguments": { "base": "USD", "target": "EUR" } }',
    },
    {
      type: 'p',
      text: "That object is not an HTTP request. Some other code has to map it to one. That split is also what makes this layer testable without the layer below. BFCL scores most calls without running them at all. It parses the model's output into an abstract syntax tree (a tree of the call's name and arguments) and checks that the function name matches exactly and that every argument falls within a set of accepted values. Strings are compared case-insensitively after stripping whitespace and some punctuation, so \"NYC\" and \"New York City\" can both pass.[^1] On a subset of the data, those scores tracked scores from actually running the calls closely.[^1]",
    },
    {
      type: 'p',
      text: "By this measure, single calls are close to solved for strong models. gpt-4o-2024-11-20 in native mode scored 93.5 on Multiple and 83.1 on Irrelevance, the category where tools are offered but the right move is to call none of them.[^1] The failures that remain look like the opening chart. When a model supports both modes, native function-calling output is more rigidly structured, which reduces parsing errors. The paper says prompted models had on average three times more decoding problems. Its own figures, 412.93 versus 182.5 out of 4,251 entries, work out to about 2.3 times.[^1] But among outputs that did decode, native mode got the number of calls wrong more often on the Multiple category, 77.5 versus 21 on average, and the authors conclude that prompted models are \"generally more flexible in complex scenarios.\"[^1] The structure that makes the output easy to parse also limits what the model will produce.",
    },
    {
      type: 'h2',
      text: 'The protocol: listing tools and routing calls',
    },
    {
      type: 'p',
      text: "A structured call assumes the model was told which functions exist. In a single app, a developer writes those definitions by hand. MCP moves that job into a protocol. A client sends a tools/list request, and the server answers with each tool's name, description and an inputSchema written in JSON Schema. To run one, the client sends tools/call with the name and an arguments object.[^5] Messages are JSON-RPC, carried over one of two standard transports: stdio for a local subprocess, or Streamable HTTP for a server running as its own process.[^6] A server can also send notifications/tools/list_changed when its set of tools changes.[^5]",
    },
    {
      type: 'p',
      text: "Note what is missing from that list. MCP does not choose a tool. The model still produces the same structured call as before, and the client passes it on. The protocol adds discovery at run time and a single envelope for calls and results, including two kinds of errors: protocol errors such as an unknown tool, and tool execution errors reported with isError set to true, such as a failed upstream API.[^5] That second kind is the HTTP failure from the bottom layer, packaged so the model can read it.",
    },
    {
      type: 'p',
      text: "Discovery brings its own failure: the model now sees tools it has never seen before, and more of them. BFCL measures tool choice under distractors. Its Multiple category adds unrelated function documents to a query to check the model is not misled.[^1] Its crowd-sourced set, built from 64,517 real queries sent to the team's hosted endpoint, averaged 3 function choices per entry, with one entry offering 37. Real users asked for choosing between functions much more often than for parallel calls.[^1]",
    },
    {
      type: 'p',
      text: "MCP-Universe, a 2025 Salesforce benchmark built on 11 real MCP servers, measured both problems directly.[^4] The authors call the first the unknown-tools challenge. For example, a Yahoo Finance server needs different start and end dates to fetch a stock price, and models often set them to the same day, which caused execution errors.[^4] Letting the model explore the tools first helped in some domains and not others. GPT-4.1 gained 7.69 points in browser automation, while Claude-4.0-Sonnet got worse in that domain.[^4] Then they connected 7 servers with 94 tools in total, most unrelated to the task. Claude-4.0-Sonnet's success rate in location navigation fell from 22.22% to 11.11%, and GPT-4.1's in browser automation fell from 23.08% to 15.38%.[^4] Nothing in the protocol went wrong. The protocol did its job, and the model had a longer menu to choose from.",
    },
    {
      type: 'h2',
      text: 'The application loop: where single calls turn into tasks',
    },
    {
      type: 'p',
      text: "The top layer is the code that runs a call, reads the result and goes back to the model. ReAct gave this loop a common shape: the model alternates a written thought, an action and an observation from the environment.[^3] On ALFWorld, a text-based household game, the best ReAct run reached a 71% success rate against 45% for the same prompting without thoughts. Without thoughts, the authors saw the model fail to break goals into subgoals or lose track of the environment's state.[^3] The loop is also where ReAct's most common failure lived. Reasoning errors made up 47% of its sampled HotpotQA failures, including one pattern specific to ReAct: the model repeats its previous thoughts and actions and cannot get out of the loop.[^3]",
    },
    {
      type: 'p',
      text: "BFCL's multi-turn categories test this layer, and the scores drop sharply. The same gpt-4o-2024-11-20 that scored 93.5 on picking a single function scored 62.5 on basic multi-turn tasks in native mode. On Missing Parameters, where it should ask the user for a detail instead of guessing, it scored 37.5. On Missing Functions, where it should notice that no available tool can do the job, it scored 6.0.[^1] In the memory category even the leader, o1 in native mode, reached only 12%. The paper describes models guessing keys instead of listing them first, and many giving up after one failed lookup.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'gpt-4o-2024-11-20 on BFCL, one call versus a conversation',
      yLabel: 'Accuracy (%)',
      series: [
        { label: 'Native tools field (FC)', key: 'fc' },
        { label: 'Functions in system prompt', key: 'pr', baseline: true },
      ],
      data: [
        { label: 'Single: Multiple', values: { fc: 93.5, pr: 95.5 } },
        { label: 'Single: Irrelevance', values: { fc: 83.1, pr: 83.8 } },
        { label: 'Multi-turn: Base', values: { fc: 62.5, pr: 59.0 } },
        { label: 'Multi-turn: Miss Param', values: { fc: 37.5, pr: 35.5 } },
        { label: 'Multi-turn: Miss Func', values: { fc: 6.0, pr: 41.0 } },
        { label: 'Agentic: Memory', values: { fc: 0.0, pr: 6.0 } },
      ],
      caption: 'Redrawn from Table 1 of Patil et al., 2025.[^1] Single-turn scores use AST matching; multi-turn scores require both the final state and the call sequence to match the labeled answer.',
    },
    {
      type: 'p',
      text: "When the BFCL authors had GPT-4o act as a judge and classify the root cause of multi-turn failures, the most common was failing to understand the environment state: assuming or hallucinating a state that was not there.[^1] One of the few-shot examples in their judge prompt shows it plainly. The user asks for just enough fuel to reach a town. The model calls fillFuelTank with 50 gallons, and the labeled answer first calls displayCarStatus to check the fuel level, then adds 44.[^1] Each individual call there was well formed and would have passed a single-turn check. The mistake was at the loop layer, in the decision not to look before acting.",
    },
    {
      type: 'p',
      text: "MCP-Universe ran almost every model through a ReAct loop over real MCP servers, and the best result was GPT-5 at 43.72% overall.[^4] The authors also report that input tokens grow quickly with the number of interaction steps.[^4] That growth is a cost only the loop pays. Neither the API, nor a single structured call, nor the protocol keeps the history. The loop does, and it resends the whole history on every step.",
    },
    {
      type: 'callout',
      title: 'Reading the stack as a debugger',
      text: "An empty search result is a bottom-layer problem even if the model is blamed for the bad answer.[^3] A call that parses but uses the wrong argument format is the structured-call layer.[^1] A correct call to the wrong one of 94 tools is the protocol handing the model more than it can sort through.[^4] Filling a tank without checking the gauge first is the loop.[^1] Each one needs a different fix.",
    },
    {
      type: 'h2',
      text: 'What Toolformer said it could not do',
    },
    {
      type: 'p',
      text: "The layers above the structured call exist mostly to handle work that a single call cannot. Toolformer's authors said this about their own method in its limitations section. Toolformer could not use tools in a chain, where one tool's output becomes another tool's input, because every API call in its training data was generated independently and so no chained example ever appeared.[^2] It also could not use a tool interactively, for example browsing through a search engine's results or refining a query, which they say certain applications need.[^2] Their own TempLAMA result showed the cost. The best approach there would have been to ask the calendar for today's date and then ask the question-answering tool with that date. Their limit of one API call per input prohibited that, and it was hard for Toolformer to learn anyway.[^2]",
    },
    {
      type: 'p',
      text: "A protocol that lists tools and a loop that feeds results back were built for those two gaps. BFCL's multi-turn scores, measured on the model versions in its table, show the gaps are narrower but still open. And the paper that first stated them added one more limitation that none of these layers has addressed yet: when Toolformer decides whether to make an API call, it \"does not take into account the tool-dependent, computational cost incurred from making an API call.\"[^2]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Patil, Mao, Yan, Ji, Suresh, Stoica and Gonzalez. The Berkeley Function Calling Leaderboard (BFCL): From Tool Use to Agentic Evaluation of Large Language Models. ICML 2025, PMLR 267.', url: 'https://proceedings.mlr.press/v267/patil25a.html' },
        { title: 'Schick et al. Toolformer: Language Models Can Teach Themselves to Use Tools. NeurIPS 2023 (arXiv 2302.04761).', url: 'https://arxiv.org/abs/2302.04761' },
        { title: 'Yao et al. ReAct: Synergizing Reasoning and Acting in Language Models. ICLR 2023 (arXiv 2210.03629).', url: 'https://arxiv.org/abs/2210.03629' },
        { title: 'Luo et al. MCP-Universe: Benchmarking Large Language Models with Real-World Model Context Protocol Servers. arXiv 2508.14704, 2025.', url: 'https://arxiv.org/abs/2508.14704' },
        { title: 'Model Context Protocol specification (2025-06-18): Tools.', url: 'https://modelcontextprotocol.io/specification/2025-06-18/server/tools' },
        { title: 'Model Context Protocol specification (2025-06-18): Transports.', url: 'https://modelcontextprotocol.io/specification/2025-06-18/basic/transports' },
      ],
    },
  ],
};
