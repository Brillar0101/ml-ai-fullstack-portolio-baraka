// Every factual claim below is taken from the numbered sources at the end.
// The round-level cost figure is reproduced under CC BY 4.0 (arXiv 2604.22750).
// The Pareto chart is redrawn from Table A1 of Kapoor et al. 2024 and the bar
// chart from Table 3 of Chen et al. 2023; neither paper's arXiv license allows reuse.
export const POST = {
  id: 'cost-token-observability',
  title: 'The Cost Ledger of an LLM Task, Line by Line',
  excerpt: 'In 2024 a Princeton team re-ran published coding agents and found that a simple retry loop was as accurate as the best of them and far cheaper than most. Here is the cost of one task built up term by term from papers, then the cascades, routers and caches that measurably cut it.',
  category: 'AI',
  tags: ['Observability', 'Cost', 'Tokens', 'Agents'],
  body: [
    {
      type: 'p',
      text: "In July 2024, Sayash Kapoor and colleagues at Princeton re-ran published agents for the HumanEval coding benchmark, five times each, and kept track of the bill.[^1] A simple baseline they called warming, which just retries GPT-4 up to five times and raises the sampling temperature from 0 to 0.5 along the way, solved 93.2% of the 164 problems for $2.45 in total. LATS, a published agent that searches over many candidate programs, solved 88.0% with GPT-4 and cost $134.50.[^1] The authors found no significant accuracy difference between warming and the best agent architecture. They also wrote that for substantially similar accuracy, cost could differ by almost two orders of magnitude, and that none of the papers proposing these agents reported cost as a top-line number.[^1]",
    },
    {
      type: 'p',
      text: "That result is why this post is set up like a ledger. If a team cannot say what one task costs, it cannot tell a smarter agent from a more expensive one. The sections below build the cost of one task one term at a time, using the formulas and measurements the papers give. After that comes the accuracy-versus-cost chart that Kapoor's team argued every evaluation should include, then the three cost-cutting methods that have published numbers, and finally what those papers say they could not solve.",
    },
    {
      type: 'h2',
      text: 'Line 1: tokens in, tokens out',
    },
    {
      type: 'p',
      text: "A **token** is the unit of text a model reads or writes, usually a word or part of a word, and API providers bill by counting them. FrugalGPT, a 2023 Stanford paper by Lingjiao Chen, Matei Zaharia and James Zou, writes the price of one call to model \\(i\\) with prompt \\(p\\) as three parts: a charge per generated token, a charge per prompt token, and sometimes a flat fee per request.[^2]",
    },
    {
      type: 'eq',
      tex: 'c_i(p) = \\tilde{c}_{i,2}\\,\\lVert f_i(p) \\rVert + \\tilde{c}_{i,1}\\,\\lVert p \\rVert + \\tilde{c}_{i,0}',
      caption: 'Cost of one API call, from section 2 of Chen et al., 2023.[^2] \\(\\lVert p \\rVert\\) is the prompt length in tokens, \\(\\lVert f_i(p) \\rVert\\) the length of the answer, and \\(\\tilde{c}_{i,0}\\) the per-request fee.',
    },
    {
      type: 'p',
      text: "The paper works through an example. A small business runs customer service on GPT-4 and gets 360,000 questions a month. Each prompt averages 1,800 tokens and each answer about 80. At GPT-4's prices at the time, $0.03 per thousand input tokens and $0.06 per thousand output tokens, that comes to about $21,200 a month.[^2] My own split of their numbers: $54 of every $58.80 per thousand questions pays for input, so input is about 92% of the bill, even though output tokens cost twice as much each. The prompt is 22 times longer than the answer, and that outweighs the higher output rate.",
    },
    {
      type: 'h2',
      text: 'Line 2: the price column is not one number',
    },
    {
      type: 'p',
      text: "Price per token varies a lot between vendors. FrugalGPT surveyed 12 commercial models from 5 providers in March 2023. Processing 10 million input tokens cost $30 on GPT-4 and $0.20 on GPT-J hosted by Textsynth.[^2] Pricing schemes differed too. AI21's J1 models charged nothing for input, a high rate for output, and a fee on every request, so the cost ranking changed with the dataset. On one dataset J1 was the second most expensive model; on the other two, GPT-3 was.[^2]",
    },
    {
      type: 'p',
      text: "The rate for a single model is not fixed either. A 2026 study of coding agents by Longju Bai and colleagues lists the token types most providers now price separately. Output is the most expensive. Fresh input costs less. Cached input, meaning context the provider has processed before and can reuse, costs least. Providers with explicit caching also charge for cache creation, the first write of context into the cache.[^3] So each round of an agent is billed as four separate items:",
    },
    {
      type: 'eq',
      tex: '\\begin{aligned} \\text{Cost}_{\\text{round}} ={}& I_{\\text{nc}}\\, r_{\\text{in}} + O\\, r_{\\text{out}} \\\\ &+ C_{\\text{create}}\\, r_{\\text{create}} \\\\ &+ C_{\\text{read}}\\, r_{\\text{read}} \\end{aligned}',
      caption: 'Per-round cost with explicit caching, equation 2 in Appendix B of Bai et al., 2026.[^3] \\(I_{\\text{nc}}\\) is non-cached input, \\(O\\) output, and \\(C_{\\text{create}}\\), \\(C_{\\text{read}}\\) the cache-write and cache-read tokens, each with its own rate \\(r\\).',
    },
    {
      type: 'h2',
      text: 'Line 3: how many calls one task makes',
    },
    {
      type: 'p',
      text: "A chat feature makes one call per question. An agent makes a call, runs a tool, reads the result and calls again, and it keeps going until it decides it is done. Bai's team ran eight frontier models inside the OpenHands agent on the 500 problems of SWE-bench Verified, a set of real GitHub issues, with four runs per problem. In their setup, the whole conversation history, every earlier prompt and completion, was carried forward unchanged into each new round.[^3] So the cost of a task is the per-round cost summed over every round:",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} C_{\\text{task}} = \\sum_{k=1}^{N} \\text{Cost}_{\\text{round}}(k) \\\\[4pt] I_k \\approx I_1 + \\sum_{j<k} \\big( O_j + \\text{obs}_j \\big) \\end{gathered}',
      caption: 'This post\'s summary, not an equation from any one paper. \\(N\\) is the number of calls, retries included. The second line is my reading of the carried-forward history: the input for round \\(k\\) is the first prompt plus every earlier output \\(O_j\\) and tool result \\(\\text{obs}_j\\).',
    },
    {
      type: 'p',
      text: "The second line explains most of what follows. Each round resends everything before it, so the input in round \\(k\\) grows with \\(k\\), and the total over \\(N\\) rounds grows faster than \\(N\\). (If every round added the same amount, the total would grow with \\(N^2\\). That is simple arithmetic; the papers do not state it.) Bai's team measured the effect. A SWE-bench task used 4.17 million tokens on average, about 3,500 times a single-turn code reasoning question and 1,200 times a multi-turn coding chat. The ratio of input to output tokens was about 154 to 1, and an average task cost $1.857.[^3] The authors trace the gap to input: agentic workflows feed the same context into the model again and again, and that makes them expensive even with caching.[^3]",
    },
    {
      type: 'p',
      text: "Caching makes each resent token cheaper, but the resent volume is still there. For Claude Sonnet 4.5, output tokens cost roughly 80 times as much as cache reads. Even so, cache reads were the largest cost in every phase of the task, from setup to closeout. There was simply that much accumulated context.[^3] The figure below breaks down one real trajectory round by round.",
    },
    {
      type: 'image',
      src: '/blog-images/cost-token-observability/agent-round-cost-breakdown.webp',
      alt: 'Stacked bar chart of cost per round for 31 rounds of one Claude Sonnet 4.5 agent run, split into cache read, non-cached input, cache creation and output tokens, with phases Setup, Explore, Fix, Validate and Closeout marked. The cache-read base grows steadily; spikes at rounds 9, 10, 22, 23 and 28 come from file views and test runs.',
      width: 1620,
      height: 645,
      caption: 'Cost of each round, in hundredths of a dollar, for one agent run on the astropy-7336 task. The dark cache-read base grows as context builds up, and the spikes come from actions that bring in new content, such as file views and test output. Figure 9 from Bai et al., 2026,[^3] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: "The authors read it this way: reusing context costs a steady, predictable amount each round, and what makes a particular round expensive is what the agent adds to the context that round.[^3] That tells you where to look. A spike in one round points to a tool that returned too much text. A base that keeps rising points to a long history that nobody trims.",
    },
    {
      type: 'p',
      text: "Kapoor's team found the same pattern outside agents. On NovelQA, a benchmark of questions about whole novels, all the questions for a book are asked at once, straight after the book is loaded. A real user would ask one question at a time, and the book would be re-processed every time.[^1] Priced that way, retrieval-augmented generation (RAG), which sends only relevant snippets, and sending the full novel were about equally accurate (67.89 and 67.81), but RAG cost about 22 times less. The benchmark's all-at-once format made RAG look only half as expensive.[^1]",
    },
    {
      type: 'h2',
      text: 'Line 4: retries, and runs that burn tokens for nothing',
    },
    {
      type: 'p',
      text: "The \\(N\\) in the sum is not the same from run to run. Bai's team ran each model four times on each problem. On average, the most expensive run cost about twice as much as the cheapest, and for some tasks the gap reached 30 times the tokens.[^3] Spending more did not buy accuracy. Within the four runs of a problem, accuracy was highest at a middle level of spending and stopped improving at higher levels. The costliest runs viewed and edited the same files over and over.[^3] Failure was expensive too. On the 100 problems that every model failed, models generally used more tokens than on the 230 that every model solved. For GPT-5 the increase was under 0.5 million tokens. For Kimi-K2 it was about 2 million, which the authors attribute to models having no reliable way to recognize a hopeless task and stop.[^3]",
    },
    {
      type: 'p',
      text: "Which model you pick changes the count as well. On the same tasks, Kimi-K2 and Claude Sonnet 4.5 used over 1.5 million more tokens on average than GPT-5, and the ranking stayed the same on the easy subset every model solved.[^3] Human estimates of difficulty were a poor guide. The rank correlation between expert-rated difficulty and actual tokens was only 0.32, and 6.7% of tasks labeled \"under 15 minutes\" used more tokens than the average task labeled \"over an hour.\"[^3]",
    },
    {
      type: 'h2',
      text: 'Adding up the ledger: accuracy against cost',
    },
    {
      type: 'p',
      text: "Once every task has a cost, you can plot each system as one point: accuracy on one axis, total cost on the other. A system is on the **Pareto frontier** if no other system is both cheaper and more accurate. Kapoor's team also required the frontier to be convex. Their reasoning: you can always build a new agent that runs agent A with probability \\(p\\) and agent B otherwise, which puts every point on the straight line between A and B within reach. That is why zero-shot GPT-4 does not make their frontier.[^1] The chart redraws their HumanEval numbers.",
    },
    {
      type: 'image',
      src: '/blog-images/cost-token-observability/humaneval-cost-accuracy-pareto.webp',
      alt: 'Scatter plot of HumanEval accuracy (70 to 95 percent) against total cost for 164 problems on a log scale from 3 cents to 300 dollars. A dashed blue line runs from GPT-3.5 alone (73.9%, $0.05) through Escalation (85.0%, $0.27) to Warming with GPT-4 (93.2%, $2.45). Gray points for LDB, Reflexion, Retry and GPT-4 alone cluster between $2 and $8; LATS with GPT-4 sits far right at $134.50 and 88.0%.',
      width: 1600,
      height: 900,
      caption: 'Redrawn from Table A1 of Kapoor et al., 2024.[^1] Each point is the mean of five runs over the 164 problems, at April 2024 prices. I drew the blue path from the table means using the paper\'s convex-frontier rule. LDB (GPT-4) scores 0.1 points above warming at 2.6 times the cost, and the paper reports no significant accuracy difference between warming and the best agent.',
    },
    {
      type: 'p',
      text: "Warming does well for a simple reason. Model output varies from run to run even at temperature zero, and HumanEval problems come with example tests, so rerunning the model until the tests pass gains accuracy without any planning or reflection.[^1] The authors take this further: if accuracy can be bought with retries, which they call scientifically meaningless, then accuracy alone cannot show whether an agent design is actually better.[^1] Their numbers also show the fixed side of the ledger. Tuning an agent's prompts costs money once, and running it costs money every time. On HotPotQA, spending more upfront to find shorter prompts cut the per-run cost by 53% with GPT-3.5 and by 41% with Llama-3-70B at similar accuracy, and it paid for itself after about 1,350 tasks.[^1]",
    },
    {
      type: 'h2',
      text: 'Lever: a cascade that stops early',
    },
    {
      type: 'p',
      text: "The middle blue point on the chart is a **cascade**: send the query to the cheapest model first and pass it up a chain of pricier models only when the answer fails a check. Kapoor's escalation baseline went from Llama-3 8B to GPT-3.5, Llama-3 70B and GPT-4 whenever a solution failed an example test. It scored 85.0% for $0.27, higher and cheaper than LDB on GPT-3.5 (80.2% for $0.63).[^1] It fell short of GPT-4 alone because some cheap-model solutions passed the example tests but failed the hidden ones.[^1] That is the weak point of any cascade: it can only be as good as the check that decides when to stop.",
    },
    {
      type: 'p',
      text: "FrugalGPT learns that check. A small DistilBERT regression model scores each answer from 0 to 1, and the cascade learns which models to chain and the score threshold for each.[^2] On HEADLINES, a financial news dataset, with a budget set to one fifth of GPT-4's cost, it learned to ask GPT-J, then J1-L, then GPT-4. GPT-J's answer was kept if it scored above 0.96 and J1-L's if above 0.37. The cascade scored 0.872 accuracy for $6.50, against GPT-4's 0.857 for $33.10.[^2] Set to match the best single model's accuracy rather than a budget, it saved between 59% and 98% across three datasets.",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Cost to reach the best single model\'s accuracy',
      yLabel: 'Cost (USD)',
      series: [
        { label: 'Best single model', key: 'best', baseline: true },
        { label: 'FrugalGPT cascade', key: 'frugal' },
      ],
      data: [
        { label: 'HEADLINES (vs GPT-4)', values: { best: 33.1, frugal: 0.6 } },
        { label: 'OVERRULING (vs GPT-4)', values: { best: 9.7, frugal: 2.6 } },
        { label: 'COQA (vs GPT-3)', values: { best: 72.5, frugal: 29.6 } },
      ],
      caption: 'Redrawn from Table 3 of Chen et al., 2023.[^2] Reported savings: 98.3%, 73.3% and 59.2%. Costs in US dollars as the paper reports them, with API prices retrieved in March 2023.',
    },
    {
      type: 'p',
      text: "The paper lists the conditions. Training the cascade needs labeled examples, and those examples must come from the same or a similar distribution as the real queries. Learning the cascade is itself an upfront cost, which pays off only when the real query volume is larger than the training set.[^2] It also shows a failure case: on one COQA question all three models gave the same answer, but the scorer was not confident in the early ones, so the query went through the whole chain and paid for all three calls.[^2]",
    },
    {
      type: 'h2',
      text: 'Lever: a router that picks before calling',
    },
    {
      type: 'p',
      text: "A **router** chooses one model before any call is made, so each query costs exactly one call. RouteLLM, from Isaac Ong and colleagues at UC Berkeley and Anyscale, trains a model to predict the probability that a strong model's answer would beat a weak model's on a given query. It sends the query to the strong model only when that probability is at or above a threshold \\(\\alpha\\).[^4] The authors note that cascades like FrugalGPT may query several models per question, which adds latency.[^4]",
    },
    {
      type: 'p',
      text: "The routers were trained mostly on human votes from Chatbot Arena and tested routing between GPT-4 and Mixtral 8x7B. The authors estimate GPT-4 at $24.7 per million tokens and Mixtral at $0.24.[^4] The best routers reached 95% of GPT-4's MT Bench score at 3.66 times lower cost. On MMLU (92% of GPT-4's score) the saving was 1.41 times, and on GSM8K math (87%) it was 1.49 times.[^4] The paper computes these savings from how many GPT-4 calls the best router made compared with a random router, since GPT-4 accounts for nearly all of the cost.[^4] Routing itself was cheap: the most expensive router added no more than 0.4% on top of GPT-4's generation cost.[^4]",
    },
    {
      type: 'p',
      text: "The main condition is the training data. Routers trained only on Arena votes did no better than random on MMLU and GSM8K, which the authors attribute to those questions being unlike the training data. About 1,500 labeled MMLU examples, under 2% of the training set, lifted every router above random on MMLU.[^4] Without retraining, the same routers still worked on two model pairs they had never seen, Claude 3 Opus with Sonnet and Llama 3.1 70B with 8B.[^4] The authors also note that routers trained on the same data sometimes performed very differently on the same benchmark, and they could not explain why.[^4]",
    },
    {
      type: 'h2',
      text: 'Lever: caching the prefix you keep resending',
    },
    {
      type: 'p',
      text: "The ledger showed that the biggest item is context sent again and again. Prompt Cache, from In Gim and colleagues at Yale, targets that repetition inside the serving system. While reading a prompt, a model computes intermediate values called attention states (the key-value, or KV, cache). Prompt Cache computes these once for text segments that repeat across prompts, such as system messages, templates and shared documents, and reuses them.[^5] Attention states depend on a token's position in the prompt, so the authors declare the reusable segments in a schema that gives each one fixed position IDs. Every prompt that uses the cache has to be built from that schema.[^5]",
    },
    {
      type: 'p',
      text: "They measured time, not dollars. On LongBench prompts averaging 5,000 tokens, time to first token fell 5 to 10 times on GPUs when the cached states were in GPU memory, and 1.5 to 3 times when they were loaded from CPU memory. On CPU inference the speedup reached 70 times on an Intel chip and 20 times on an AMD one, and accuracy stayed comparable to the uncached baseline.[^5] There are costs. Storing the cache takes about 0.5 MB per token for Llama 7B and 2.5 MB per token for Llama 70B. The speedup applies only to the first token: in their RTX 4090 test, generation after that ran at about 32 ms per token with or without the cache.[^5] Provider-side prompt caching is how the Sonnet 4.5 runs above got their cheap cache reads, and Bai's figures show that it lowers the price of the resent context without removing it.[^3]",
    },
    {
      type: 'callout',
      title: 'What to record for each call',
      text: "Kapoor's team recommends reporting input and output token counts alongside dollar costs, because prices change and differ by provider. With the counts, anyone can recompute the cost at current prices.[^1] Bai's team went further and logged the four billed token types for each round, which is what made the phase and round breakdowns above possible.[^3] Counts per round, per token type and per task are enough to rebuild every line of this ledger.",
    },
    {
      type: 'h2',
      text: 'The line no one can fill in ahead of time',
    },
    {
      type: 'p',
      text: "The ledger can only be filled in after the task runs. Bai's team asked each agent to estimate its own token use before starting a task. The best correlation between the estimates and the real counts was 0.39. Every model underestimated, and input tokens most of all: the predictions stayed small while the real totals ran into the millions.[^3] The authors conclude that predicting cost before execution remains an open problem for current models. They expect consumption-based pricing to stay the most practical option until it is solved, and they say the self-estimates are useful only as a rough flag for tasks likely to be expensive.[^3] They also note a limit of their own study: it covers eight models, because collecting full agent trajectories was expensive.[^3]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Kapoor, Stroebl, Siegel, Nadgir, and Narayanan, AI Agents That Matter, 2024', url: 'https://arxiv.org/abs/2407.01502' },
        { title: 'Chen, Zaharia, and Zou, FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance, 2023', url: 'https://arxiv.org/abs/2305.05176' },
        { title: 'Bai et al., How Do AI Agents Spend Your Money? Analyzing and Predicting Token Consumption in Agentic Coding Tasks, 2026', url: 'https://arxiv.org/abs/2604.22750' },
        { title: 'Ong et al., RouteLLM: Learning to Route LLMs with Preference Data, ICLR 2025', url: 'https://arxiv.org/abs/2406.18665' },
        { title: 'Gim et al., Prompt Cache: Modular Attention Reuse for Low-Latency Inference, MLSys 2024', url: 'https://arxiv.org/abs/2311.04934' },
      ],
    },
  ],
};
