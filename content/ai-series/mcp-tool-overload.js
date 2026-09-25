// Every factual claim below is taken from the numbered sources at the end.
// The MCP-Zero needle-in-a-haystack figure is reproduced under CC BY 4.0
// (arXiv 2506.01056). The charts are redrawn from table values in RAG-MCP
// (CC BY-NC-ND), MCP-Zero, and Gorilla. Token arithmetic is the author's.
export const POST = {
  id: 'mcp-tool-overload',
  title: 'More Tools, Worse Picks: What the Tool Selection Papers Measured',
  excerpt: 'When RAG-MCP buried one correct MCP server among thousands of distractors, success held above 90% for small pools and collapsed past about 100. Here is the curve, the reasons the papers give for it, and what retrieval, two-stage routing, and fine-tuning on API docs actually recovered.',
  category: 'AI',
  tags: ['MCP', 'Agents', 'Tools'],
  body: [
    {
      type: 'p',
      text: "In May 2025 Tiantian Gan and Qiyao Sun ran what they called an MCP stress test. Each trial handed a model N MCP server descriptions. Exactly one of them could do the job, a web search server, and the other N minus 1 were distractors drawn at random from more than 4,400 servers publicly listed on mcp.so. The model had to pick the right server, send it a valid query, and return the result, across 20 web-search tasks. They varied N from 1 to 11,100 in 26 steps.[^1]",
    },
    {
      type: 'p',
      text: "Their Figure 3 shows the result as a grid of successes and failures. Read in bands, it says three things. With fewer than 30 servers in view, success was above 90%. Between 31 and 70, failures began to appear in clusters, which the authors tie to growing semantic overlap among the server descriptions. Past about 100, failures dominated.[^1] The paper does not publish the per-N numbers behind the grid, so the bands are as exact as this curve gets. Its text is also muddled about which method the grid shows: the results paragraph describes it as the retrieval method degrading at scale.[^1] The shape, though, is plain. More candidate tools, fewer correct picks.",
    },
    {
      type: 'p',
      text: "The same paper then compared three ways of choosing a server on the web search subset of MCPBench, with qwen-max-0125 as the model, 20 trials per method and up to 10 rounds of interaction per trial.[^1] Putting every description in the prompt got the right server 13.62% of the time. Pre-filtering by keyword match got 18.20%. Retrieving the best match by embedding similarity and showing the model only that one got 43.13%, with about half the prompt tokens.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Tool selection accuracy, RAG-MCP web search test',
      yLabel: 'Accuracy (%)',
      series: [{ label: 'Accuracy', key: 'a' }],
      data: [
        { label: 'All tools in prompt', values: { a: 13.62 } },
        { label: 'Keyword pre-filter', values: { a: 18.2 } },
        { label: 'Retrieve top tool first', values: { a: 43.13 } },
      ],
      caption: 'Redrawn from Table 1 of Gan and Sun, 2025.[^1] Average prompt size was 2,133.84 tokens with every description included, 1,646 with the keyword filter, and 1,084 with retrieval. Model: qwen-max-0125.',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Tool schema', def: 'The text that describes one tool to the model: its name, a description in plain words, and a JSON Schema for its parameters. An MCP server exposes a list of these.' },
        { term: 'Distractor', def: 'A tool in the prompt that cannot do the current task. Stress tests add distractors on purpose to see when the model starts picking them.' },
        { term: 'Retriever', def: 'A search step that runs before the model. It scores every tool description against the request and passes along only the best few.' },
        { term: 'Top-k', def: 'Keeping the k highest-scoring results from a retriever. RAG-MCP and MCP-Zero both report their main results with k = 1.' },
        { term: 'Oracle retriever', def: 'A fake retriever that always returns the correct tool. Papers use it to measure the ceiling: how well the model does when retrieval is perfect.' },
      ],
    },
    {
      type: 'h2',
      text: 'A cleaner picture of the curve, and why it depends on the model',
    },
    {
      type: 'p',
      text: "A month later Xiang Fei, Xiawu Zheng and Hao Feng ran a similar needle-in-a-haystack test on MCP-tools, a dataset they built from the official MCP servers repository: 308 servers and 2,797 tools. They placed between 1 and 2,797 tools in context, took task descriptions from different positions in the list, and asked the model to retrieve the target tool.[^2] Their figure publishes every cell.",
    },
    {
      type: 'image',
      src: '/blog-images/mcp-tool-overload/mcp-zero-needle-haystack.webp',
      alt: 'A three by three grid of heat maps. Rows are Claude-3.5-Sonnet, Gemini-2.5-Flash and GPT-4.1. Columns are standard tool calling, MCP-Zero, and MCP-Zero with one example. The x-axis is the number of tools on a log scale from 1 to 2,797; the y-axis is the position of the target tool. In the standard tool calling column, Claude fails in a dense red block at the largest tool counts and Gemini fails in scattered columns from mid-size pools on. GPT-4.1 is almost all blue.',
      width: 2040,
      height: 1140,
      caption: "Each cell is one trial: blue succeeded, red failed. The x-axis is the number of tools in context; the y-axis is where the target sat in the list. Figure 5 from Fei et al., 2025,[^2] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).",
    },
    {
      type: 'p',
      text: "Look at the left column. Claude-3.5-Sonnet with all schemas in context fails in a solid block at the right edge, where the pool is largest. Gemini-2.5-Flash fails in scattered columns starting at much smaller pools. GPT-4.1 barely fails at all, and the authors say their own method gave it no improvement because its baseline was already strong across all collection sizes.[^2] So the degradation curve is real, but its shape belongs to a particular model. A threshold measured on one model does not transfer to another.",
    },
    {
      type: 'p',
      text: "The same paper ran a smaller test on API-Bank, a conversational tool benchmark: 48 tools in total, compared against a hand-picked subset of tools relevant to each domain.[^2] Moving from the subset to all 48 with standard schema injection took Claude-3.5-Sonnet from 97.60% to 69.23% on single-turn conversations and from 100.00% to 60.22% on multi-turn ones. GPT-4.1 went from 98.08% to 94.71% single-turn. Gemini-2.5-Flash went from 92.79% to 94.23%, a small rise.[^2] Average prompt size grew from 312.4 tokens to 6,308.2.[^2]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'API-Bank single-turn accuracy, all schemas in the prompt',
      yLabel: 'Top-1 accuracy (%)',
      series: [
        { label: 'Domain subset', key: 'd', baseline: true },
        { label: 'All 48 tools', key: 'f' },
      ],
      data: [
        { label: 'Claude-3.5-Sonnet', values: { d: 97.6, f: 69.23 } },
        { label: 'GPT-4.1', values: { d: 98.08, f: 94.71 } },
        { label: 'Gemini-2.5-Flash', values: { d: 92.79, f: 94.23 } },
      ],
      caption: 'Redrawn from Table 1 of Fei et al., 2025,[^2] standard tool calling rows only. The drop is large for one model, small for another, and absent for the third.',
    },
    {
      type: 'h2',
      text: 'Three reasons the papers give for the drop',
    },
    {
      type: 'p',
      text: "The first is plain length. Gan and Sun call it prompt bloat: every tool's description competes for the same context window, and the window fills with distractors that make the correct tool harder to tell apart and recall.[^1] Fei and colleagues give a concrete size. One tool from the GitHub MCP server, a repository search, takes 143 tokens to describe, and the full server takes over 4,600 tokens for 26 tools. Their whole 2,797-tool collection comes to 248.1k tokens.[^2]",
    },
    {
      type: 'p',
      text: "The second is similarity. Many APIs overlap in what they do and differ only in nuanced limits, Patil and colleagues wrote in the Gorilla paper, and it is no longer possible to describe a full set of them in one context.[^3] Gan and Sun blame the failures that start between 31 and 70 servers on exactly this overlap among descriptions.[^1] When two tools both say they search something, the model has little to separate them by.",
    },
    {
      type: 'p',
      text: "The third is position, and the evidence here is indirect. Gan and Sun modeled their test on needle-in-a-haystack evaluations, which bury one fact in a long context, and moved the correct server from the top of the list to the bottom.[^1] They do not report accuracy by position. The clearest measurement comes from Liu and colleagues' study of documents rather than tools: with 20 retrieved documents, GPT-3.5-Turbo did best when the answer sat at the start or end of the context, and when it sat in the middle, accuracy fell below the 56.1% the model scored with no documents at all.[^5] Whether tool lists show the same U shape is not something these tool papers isolate. My reading of the MCP-Zero grid is that list size mattered much more than position.[^2]",
    },
    {
      type: 'p',
      text: "Small models make all three worse. Paramanayakam and colleagues ran a 4-bit quantized Llama 3.1 8B on an Nvidia Jetson AGX Orin against a GeoEngine query that came with 46 tools. It chose the wrong tool, even though its 16K context window could hold all of them. Given 19 tools it succeeded, and the run took 20 seconds instead of 30.[^6] That is one query, not a benchmark, but it is the same effect on hardware where every token costs time and power.",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} T_{\\text{tools}} = N \\times \\bar{d} \\\\[4pt] T_{\\text{session}} \\approx R \\times N \\times \\bar{d} \\end{gathered}',
      caption: 'My arithmetic, not a formula from the papers. \\(N\\) is the number of tools in the prompt, \\(\\bar{d}\\) the average tokens per tool description, and \\(R\\) the number of model calls that each resend the tool list.',
    },
    {
      type: 'p',
      text: "Plugging the papers' numbers into that equation gives rough averages. The GitHub server works out to about 177 tokens per tool (4,600 divided by 26). The full MCP-tools collection averages about 89 (248.1k divided by 2,797). The API-Bank prompt with all 48 tools averaged 6,308.2 tokens, which is at most about 131 per tool, since that figure includes the rest of the prompt.[^2] At 177 tokens a tool, 100 tools is about 17,700 tokens before the user has said anything. An agent that calls the model 10 times in a task and resends the list each time spends about 177,000 tokens on descriptions. Those totals are my extrapolation, but each input comes from a measured figure.",
    },
    {
      type: 'h2',
      text: 'Fix one: retrieve the tools before the model sees them',
    },
    {
      type: 'p',
      text: "RAG-MCP stores every server's description in a vector index. When a request arrives, a retriever encodes it, runs a semantic search, and returns the closest match, and only that server's schema goes into the prompt.[^1] The paper also describes an optional check that sends each retrieved server a generated test query before using it.[^1] That design is what produced the jump from 13.62% to 43.13% in the chart above. Two caveats come with the number. Even the winning method missed the right server more often than it found it. And the paper names two different graders for answer correctness, DeepSeek-V3 in the setup and a Llama-based judge in the metrics section, without saying how they were combined.[^1]",
    },
    {
      type: 'p',
      text: "Retrieval is only as good as the retriever, and Gorilla measured how much that matters. Its APIBench covers 1,645 machine learning model APIs from Torch Hub, TensorFlow Hub and HuggingFace, chosen partly because their functions are so similar.[^3] The team gave each model the top-1 document from one of three retrievers: BM25 (a classic keyword ranking method), a GPT embedding index, or an oracle.[^3] On HuggingFace, GPT-4's accuracy went from 19.80% with no retrieval to 16.48% with BM25, 44.58% with the GPT index, and 85.07% with the oracle.[^3]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'HuggingFace API accuracy by retriever',
      yLabel: 'Overall accuracy (%)',
      series: [
        { label: 'GPT-4', key: 'g' },
        { label: 'Gorilla (LLaMA-7B, fine-tuned)', key: 'o' },
      ],
      data: [
        { label: 'No retriever', values: { g: 19.8, o: 71.68 } },
        { label: 'BM25', values: { g: 16.48, o: 17.03 } },
        { label: 'GPT index', values: { g: 44.58, o: 47.46 } },
        { label: 'Oracle', values: { g: 85.07, o: 91.26 } },
      ],
      caption: 'Redrawn from Table 1 of Patil et al., 2023.[^3] Each Gorilla bar is the version trained for that setting: zero-shot for no retriever, retrieval-aware for the rest. A weak retriever pulled both models far below a perfect one.',
    },
    {
      type: 'p',
      text: "ToolLLM, from Qin and colleagues, shows that a retriever trained for the job closes much of that gap. They collected 16,464 REST APIs across 49 categories from RapidAPI and trained a dense retriever on Sentence-BERT, using the APIs tied to each generated instruction as positive examples.[^4] Averaged over their three instruction types, it scored an NDCG@5 of 84.9, against 45.4 for OpenAI's text-embedding-ada-002 and 17.0 for BM25. NDCG@5 measures how well the right APIs are ranked within the top five, where 100 is perfect.[^4] When the top 5 retrieved APIs replaced the ground-truth set, their model's average pass rate went from 66.7% to 67.3%. The authors explain this by saying many ground-truth APIs have similar alternatives that work better, and the retriever found them.[^4]",
    },
    {
      type: 'h2',
      text: 'Fix two: choose a server first, then a tool inside it',
    },
    {
      type: 'p',
      text: "MCP-Zero changes two things. First, the model writes the search query itself. When it notices a capability it lacks, it emits a short block naming the server domain it needs and the operation it wants, and it can do this again at every step of a task.[^2] Second, the search runs in two stages. It picks candidate servers by comparing the request to server descriptions and to longer summaries generated for each server, then ranks tools inside those servers, using OpenAI's text-embedding-3-large embeddings.[^2] The final score combines both levels:",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\text{score} = (s_{\\text{server}} \\times s_{\\text{tool}}) \\\\ \\times \\max(s_{\\text{server}}, s_{\\text{tool}}) \\end{gathered}',
      caption: 'Equation 1 of Fei et al., 2025.[^2] Each \\(s\\) is a cosine similarity. A strong match at either level lifts the score.',
    },
    {
      type: 'p',
      text: "On API-Bank with all tools available, MCP-Zero reached 95.19% on Claude-3.5-Sonnet, 95.19% on GPT-4.1 and 96.63% on Gemini-2.5-Flash in single-turn conversations, using an average of 111.0 tokens instead of 6,308.2, a cut of 98.24%.[^2] Retrieving with the user's raw query instead of the model's own request reached only 71.63% single-turn and 65.05% multi-turn.[^2] The paper counts that gap as evidence for letting the model write the request.",
    },
    {
      type: 'p',
      text: "The conditions matter here. API-Bank has no server level, so the authors skipped the server stage and retrieved tools directly.[^2] Those numbers test the model-written request, not the two-stage routing. And on the small domain subsets, MCP-Zero was sometimes worse than just showing all schemas: Claude-3.5-Sonnet scored 96.15% against 97.60% single-turn, and 91.40% against 100.00% multi-turn.[^2] Routing pays off when the pool is big. When the pool is already small and curated, it can cost a few points.",
    },
    {
      type: 'h2',
      text: 'Fix three: train the model on the API documentation',
    },
    {
      type: 'p',
      text: "Gorilla is LLaMA-7B fine-tuned on about 16,450 instruction and API pairs, generated by GPT-4 from the 1,645 API documents using self-instruct.[^3] With no retriever at all, it beat every prompted model on all three hubs. On HuggingFace it scored 71.68% against GPT-4's 19.80%, and on TensorFlow Hub 83.79% against 18.20%.[^3] Its hallucination rate, meaning calls to APIs that do not exist, was 10.95% on HuggingFace where GPT-4's was 37.16%.[^3] A second version, trained with the correct document appended to each example, reached 91.26% on HuggingFace when an oracle supplied the document at test time.[^3]",
    },
    {
      type: 'p',
      text: "That second version is also where fine-tuning gets fragile. Paired with BM25 at test time, the retrieval-trained Gorilla fell to about 17% on HuggingFace, well below the zero-shot version's 71.68%.[^3] The authors conclude that a non-optimal retriever can misguide the model, and that when no good retriever is available, zero-shot fine-tuning may be the better choice.[^3] The paper also notes that API documents change faster than models get retrained, which makes a model that memorized them brittle. Its answer is retriever-aware training, and it shows the model switching to a new backbone or repository when the retrieved document changes.[^3]",
    },
    {
      type: 'p',
      text: "ToolLLM fine-tuned LLaMA-2 7B on 126,486 instruction and solution pairs. It found those solutions with DFSDT, a depth-first search over a tree of reasoning paths that can abandon a failing branch and try another, where the common ReAct method follows a single path.[^4] With ground-truth APIs supplied, ToolLLaMA with DFSDT averaged a 66.7% pass rate, above ChatGPT with DFSDT at 64.8% and below GPT-4 with DFSDT at 71.1%. Vicuna and Alpaca, general chat fine-tunes of LLaMA, passed nothing.[^4] Fine-tuning here raises the ceiling on using the tools a model is given. It does not by itself shrink the list the model has to read.",
    },
    {
      type: 'callout',
      title: 'Reading these numbers against your own setup',
      text: "Each result above comes from one task family and one or a few models: web search on qwen-max-0125,[^1] API-Bank and MCP-tools on three commercial models,[^2] machine learning model hubs,[^3] RapidAPI REST endpoints.[^4] The MCP-Zero grid shows GPT-4.1 barely degrading where Claude-3.5-Sonnet collapsed.[^2] The only threshold worth trusting is one measured on your model, with your tool descriptions.",
    },
    {
      type: 'h2',
      text: 'The retriever has a curve of its own',
    },
    {
      type: 'p',
      text: "Retrieval takes the long list out of the prompt, but it does not make the list go away. The search step still has to pick one server out of thousands, and Gan and Sun say so directly. Their method curbs prompt bloat and keeps accuracy high in small to moderate pools, they write, but retrieval precision problems arise as the total number of MCPs grows, and past about 100 servers failures dominate their grid.[^1] Gorilla puts a number on the same weakness from the other side: for its retrieval-trained model, swapping the oracle for the GPT index at evaluation time cost 29.20% accuracy, and swapping it for BM25 cost 52.27%.[^3] Gan and Sun leave the fix to future work on hierarchical or adaptive retrieval.[^1]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Gan and Sun, RAG-MCP: Mitigating Prompt Bloat in LLM Tool Selection via Retrieval-Augmented Generation, 2025', url: 'https://arxiv.org/abs/2505.03275' },
        { title: 'Fei, Zheng, and Feng, MCP-Zero: Active Tool Discovery for Autonomous LLM Agents, 2025', url: 'https://arxiv.org/abs/2506.01056' },
        { title: 'Patil, Zhang, Wang, and Gonzalez, Gorilla: Large Language Model Connected with Massive APIs, 2023', url: 'https://arxiv.org/abs/2305.15334' },
        { title: 'Qin et al., ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs, 2023', url: 'https://arxiv.org/abs/2307.16789' },
        { title: 'Liu et al., Lost in the Middle: How Language Models Use Long Contexts, 2023', url: 'https://arxiv.org/abs/2307.03172' },
        { title: 'Paramanayakam et al., Less is More: Optimizing Function Calling for LLM Execution on Edge Devices, 2024', url: 'https://arxiv.org/abs/2411.15399' },
      ],
    },
  ],
};
